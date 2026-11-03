import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  getMidtransTransactionStatus,
  isTerminalMidtransStatus,
  isValidNotificationSignature,
} from '@/lib/payments/midtrans'

function amountMatches(actualAmount, expectedAmount) {
  const actual = Number(actualAmount)
  const expected = Number(expectedAmount)
  return Number.isFinite(actual) && Number.isFinite(expected) && actual === expected
}

export async function POST(request) {
  let notification
  try {
    notification = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid notification payload.' }, { status: 400 })
  }

  const orderId = notification?.order_id
  if (typeof orderId !== 'string' || orderId.length > 50) {
    return NextResponse.json({ error: 'Invalid Midtrans order ID.' }, { status: 400 })
  }
  if (!isValidNotificationSignature(notification)) {
    return NextResponse.json({ error: 'Invalid Midtrans notification signature.' }, { status: 401 })
  }

  const isFoodOrder = orderId.startsWith('RH-F-')
  const isTicketOrder = orderId.startsWith('RH-T-')
  if (!isFoodOrder && !isTicketOrder) {
    return NextResponse.json({ error: 'Unknown Midtrans order.' }, { status: 404 })
  }

  const admin = createAdminClient()
  const table = isFoodOrder ? 'food_payment_intents' : 'payments'
  const { data: payment, error: paymentError } = await admin
    .from(table)
    .select(isFoodOrder
      ? 'id, total_amount, status, gateway_order_id'
      : 'id, amount, status, gateway_order_id, booking_id')
    .eq('gateway_order_id', orderId)
    .maybeSingle()

  if (paymentError) {
    console.error('Unable to look up Midtrans notification order:', paymentError)
    return NextResponse.json({ error: 'Unable to verify payment order.' }, { status: 500 })
  }
  if (!payment) return NextResponse.json({ error: 'Unknown Midtrans order.' }, { status: 404 })

  let transaction
  try {
    transaction = await getMidtransTransactionStatus(orderId)
  } catch (error) {
    console.error('Unable to verify the Midtrans transaction status:', error)
    return NextResponse.json({ error: 'Midtrans status verification failed.' }, { status: 502 })
  }

  const expectedAmount = isFoodOrder ? payment.total_amount : payment.amount
  if (transaction?.order_id !== orderId || !amountMatches(transaction?.gross_amount, expectedAmount)) {
    console.error('Midtrans transaction data did not match the stored order:', { orderId })
    return NextResponse.json({ error: 'Midtrans transaction details do not match the order.' }, { status: 400 })
  }

  const isPaid = (transaction.transaction_status === 'settlement' && transaction.fraud_status !== 'deny')
    || (transaction.transaction_status === 'capture' && transaction.fraud_status === 'accept')
  if (isPaid) {
    const { error: confirmError } = await admin.rpc(
      isFoodOrder ? 'confirm_midtrans_food_payment' : 'confirm_midtrans_booking_payment',
      {
        p_order_id: orderId,
        p_transaction_id: transaction.transaction_id,
        p_transaction_status: transaction.transaction_status,
      }
    )
    if (confirmError) {
      console.error('Unable to settle the verified Midtrans transaction:', confirmError)
      return NextResponse.json({ error: 'Verified payment could not be settled.' }, { status: 500 })
    }
  } else {
    const { error: statusError } = await admin
      .from(table)
      .update({
        gateway_transaction_id: transaction.transaction_id || null,
        gateway_transaction_status: transaction.transaction_status || 'unknown',
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id)
    if (statusError) {
      console.error('Unable to save the Midtrans transaction status:', statusError)
      return NextResponse.json({ error: 'Unable to save payment status.' }, { status: 500 })
    }
    if (isTerminalMidtransStatus(transaction.transaction_status)
      && payment.status === 'confirmed') {
      console.error('A previously confirmed Midtrans payment received a reversal status:', {
        orderId,
        status: transaction.transaction_status,
      })
    }
  }

  return NextResponse.json({ received: true })
}
