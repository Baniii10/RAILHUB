import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createSnapTransaction, getMidtransExpiryMinutes } from '@/lib/payments/midtrans'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const TICKET_METHODS = new Set(['qr_payment', 'e_wallet', 'bank_transfer'])
const FOOD_METHODS = new Set(['qris', 'e_wallet', 'bank_transfer'])

function getMissingPaymentConfiguration() {
  return [
    ['SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY],
    ['MIDTRANS_SERVER_KEY', process.env.MIDTRANS_SERVER_KEY],
    ['NEXT_PUBLIC_APP_URL', process.env.NEXT_PUBLIC_APP_URL],
  ].filter(([, value]) => !value).map(([name]) => name)
}

function paymentConfigurationError(missingVariables) {
  return NextResponse.json({
    error: `Pembayaran belum dikonfigurasi. Tambahkan ${missingVariables.join(', ')} ke .env.local, lalu restart server Next.js.`,
  }, { status: 503 })
}

export async function GET(request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Silakan masuk untuk melihat status pembayaran.' }, { status: 401 })
  }
  const missingVariables = getMissingPaymentConfiguration()
  if (missingVariables.length) return paymentConfigurationError(missingVariables)

  const orderId = new URL(request.url).searchParams.get('orderId')
  if (!orderId || !orderId.startsWith('RH-F-') || orderId.length > 50) {
    return NextResponse.json({ error: 'ID pembayaran makanan tidak valid.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: intent, error } = await admin
    .from('food_payment_intents')
    .select('status, gateway_transaction_status')
    .eq('gateway_order_id', orderId)
    .eq('user_id', user.id)
    .maybeSingle()
  if (error) {
    console.error('Unable to load the passenger food payment status:', error)
    return NextResponse.json({ error: 'Status pembayaran makanan tidak dapat dimuat.' }, { status: 500 })
  }
  if (!intent) return NextResponse.json({ error: 'Pembayaran tidak ditemukan.' }, { status: 404 })

  return NextResponse.json({
    status: intent.status,
    transactionStatus: intent.gateway_transaction_status,
  })
}

function getFinishUrl(bookingId, kind, orderId) {
  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL
  if (!configuredOrigin) throw new Error('NEXT_PUBLIC_APP_URL must be configured for Midtrans callbacks.')
  const appUrl = new URL(configuredOrigin)
  if (process.env.NODE_ENV === 'production' && appUrl.protocol !== 'https:') {
    throw new Error('NEXT_PUBLIC_APP_URL must use HTTPS in production.')
  }
  return new URL(
    `/booking/payment/${bookingId}?payment=finished&kind=${kind}&order_id=${encodeURIComponent(orderId)}`,
    appUrl
  ).toString()
}

async function storeGatewayTransaction(admin, table, rowId, orderId) {
  const { data, error } = await admin
    .from(table)
    .update({
      gateway_order_id: orderId,
      payment_url: null,
      gateway_transaction_status: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', rowId)
    .is('gateway_order_id', null)
    .select('id')
    .maybeSingle()
  if (error) throw new Error(`Unable to save the Midtrans transaction: ${error.message}`)
  if (!data) throw new Error('A payment transaction is already being created for this order.')
}

export async function POST(request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Silakan masuk untuk melanjutkan pembayaran.' }, { status: 401 })
  }
  const missingVariables = getMissingPaymentConfiguration()
  if (missingVariables.length) return paymentConfigurationError(missingVariables)

  let input
  try {
    input = await request.json()
  } catch {
    return NextResponse.json({ error: 'Permintaan pembayaran tidak valid.' }, { status: 400 })
  }

  if (input?.type === 'ticket') {
    const { bookingId, paymentMethod } = input
    if (typeof bookingId !== 'string' || !UUID_PATTERN.test(bookingId)
      || !TICKET_METHODS.has(paymentMethod)) {
      return NextResponse.json({ error: 'Booking atau metode pembayaran tidak valid.' }, { status: 400 })
    }

    const { error: methodError } = await supabase.rpc('select_booking_payment_method', {
      p_booking_id: bookingId,
      p_payment_method: paymentMethod,
    })
    if (methodError) {
      return NextResponse.json({ error: `Metode pembayaran tidak dapat dipilih: ${methodError.message}` }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data: booking, error: bookingError } = await admin
      .from('bookings')
      .select('id, booking_code, user_id, status, total_amount, expires_at, payments(id, amount, status, gateway_order_id, gateway_transaction_status, payment_url)')
      .eq('id', bookingId)
      .eq('user_id', user.id)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking tidak ditemukan atau tidak dapat diakses.' }, { status: 404 })
    }
    const payment = Array.isArray(booking.payments) ? booking.payments[0] : booking.payments
    if (booking.status !== 'pending' || !payment || payment.status !== 'pending'
      || Number(payment.amount) !== Number(booking.total_amount)) {
      return NextResponse.json({ error: 'Booking tidak lagi dapat dibayar.' }, { status: 409 })
    }

    if (payment.gateway_order_id) {
      if (payment.payment_url && !['deny', 'cancel', 'expire', 'failure'].includes(payment.gateway_transaction_status)) {
        return NextResponse.json({
          redirectUrl: payment.payment_url,
          orderId: payment.gateway_order_id,
        })
      }
      if (!payment.payment_url) {
        return NextResponse.json({ error: 'Transaksi pembayaran sedang disiapkan. Coba lagi sebentar.' }, { status: 409 })
      }
      const { error: clearError } = await admin.from('payments')
        .update({
          gateway_order_id: null,
          payment_url: null,
          gateway_transaction_status: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.id)
        .eq('gateway_order_id', payment.gateway_order_id)
      if (clearError) {
        return NextResponse.json({ error: 'Transaksi sebelumnya belum dapat ditutup.' }, { status: 500 })
      }
    }

    const orderId = `RH-T-${booking.id.replaceAll('-', '').slice(0, 20)}-${randomUUID().slice(0, 8)}`
    try {
      const expiryMinutes = getMidtransExpiryMinutes(booking.expires_at)
      await storeGatewayTransaction(admin, 'payments', payment.id, orderId)
      const transaction = await createSnapTransaction({
        orderId,
        amount: Number(payment.amount),
        paymentMethod,
        finishUrl: getFinishUrl(booking.id, 'ticket', orderId),
        expiryMinutes,
      })
      const { error: updateError } = await admin
        .from('payments')
        .update({ payment_url: transaction.redirectUrl, updated_at: new Date().toISOString() })
        .eq('id', payment.id)
        .eq('gateway_order_id', orderId)
      if (updateError) throw new Error(`Unable to save the Midtrans payment URL: ${updateError.message}`)
      return NextResponse.json({ redirectUrl: transaction.redirectUrl, orderId })
    } catch (error) {
      console.error('Unable to create the Midtrans ticket transaction:', error)
      const { error: cleanupError } = await admin.from('payments')
        .update({ gateway_order_id: null, payment_url: null, gateway_transaction_status: null })
        .eq('id', payment.id)
        .eq('gateway_order_id', orderId)
      if (cleanupError) console.error('Unable to clear the failed ticket payment transaction:', cleanupError)
      return NextResponse.json({ error: error.message || 'Transaksi Midtrans gagal dibuat.' }, { status: 502 })
    }
  }

  if (input?.type === 'food') {
    const { bookingId, passengerId, seatId, items, note, paymentMethod } = input
    if (typeof bookingId !== 'string' || !UUID_PATTERN.test(bookingId)
      || typeof passengerId !== 'string' || !UUID_PATTERN.test(passengerId)
      || typeof seatId !== 'string' || !UUID_PATTERN.test(seatId)
      || !Array.isArray(items) || items.length < 1 || items.length > 10
      || typeof note !== 'string' || note.length > 300
      || !FOOD_METHODS.has(paymentMethod)) {
      return NextResponse.json({ error: 'Detail pesanan atau metode pembayaran tidak valid.' }, { status: 400 })
    }

    const { data: intentId, error: intentError } = await supabase.rpc('create_passenger_food_payment_intent', {
      p_booking_id: bookingId,
      p_passenger_id: passengerId,
      p_seat_id: seatId,
      p_items: items,
      p_note: note,
      p_payment_method: paymentMethod,
    })
    if (intentError || !intentId) {
      return NextResponse.json({ error: `Pesanan belum dapat disiapkan: ${intentError?.message || 'Data pesanan tidak valid.'}` }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data: intent, error: intentLoadError } = await admin
      .from('food_payment_intents')
      .select('id, total_amount, payment_method')
      .eq('id', intentId)
      .eq('user_id', user.id)
      .single()
    if (intentLoadError || !intent) {
      return NextResponse.json({ error: 'Rincian pembayaran pesanan tidak dapat dimuat.' }, { status: 500 })
    }

    try {
      const orderId = `RH-F-${intent.id.replaceAll('-', '').slice(0, 20)}-${randomUUID().slice(0, 8)}`
      const expiryMinutes = Math.min(getMidtransExpiryMinutes(new Date(Date.now() + 15 * 60_000)), 15)
      await storeGatewayTransaction(admin, 'food_payment_intents', intent.id, orderId)
      const transaction = await createSnapTransaction({
        orderId,
        amount: Number(intent.total_amount),
        paymentMethod: intent.payment_method,
        finishUrl: getFinishUrl(bookingId, 'food', orderId),
        expiryMinutes,
      })
      const { error: updateError } = await admin
        .from('food_payment_intents')
        .update({ payment_url: transaction.redirectUrl, updated_at: new Date().toISOString() })
        .eq('id', intent.id)
        .eq('gateway_order_id', orderId)
      if (updateError) throw new Error(`Unable to save the Midtrans payment URL: ${updateError.message}`)
      return NextResponse.json({ redirectUrl: transaction.redirectUrl, orderId })
    } catch (error) {
      console.error('Unable to create the Midtrans food transaction:', error)
      const { error: cleanupError } = await admin.from('food_payment_intents')
        .update({ gateway_order_id: null, payment_url: null, gateway_transaction_status: null })
        .eq('id', intent.id)
      if (cleanupError) console.error('Unable to clear the failed food payment transaction:', cleanupError)
      return NextResponse.json({ error: error.message || 'Transaksi Midtrans gagal dibuat.' }, { status: 502 })
    }
  }

  return NextResponse.json({ error: 'Jenis pembayaran tidak didukung.' }, { status: 400 })
}
