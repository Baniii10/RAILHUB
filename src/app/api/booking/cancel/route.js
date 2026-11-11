import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://youqixjjsdhgmkzdjjck.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_SuiQ5-bcUKMUiqQWZpBT-Q_iYYLydQD'

async function getAdminClient() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  })
  try {
    await supabase.auth.signInWithPassword({
      email: 'admin.operasional@railhub.id',
      password: 'DemoAdmin2026!',
    })
  } catch (err) {
    console.warn('[Cancel API] Admin auth notice:', err?.message)
  }
  return supabase
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { bookingId } = body || {}

    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId wajib diisi' }, { status: 400 })
    }

    const supabase = await getAdminClient()

    // 1. Try RPC first if available
    try {
      const { data: rpcData, error: rpcErr } = await supabase.rpc('cancel_own_paid_booking', {
        p_booking_id: bookingId,
      })
      if (!rpcErr && rpcData) {
        return NextResponse.json({
          success: true,
          method: 'rpc',
          refund_amount: rpcData.refund_amount || Math.round(Number(rpcData.refund_fare || 0)),
          message: 'Tiket berhasil dibatalkan.',
        })
      }
    } catch (rpcCatch) {
      console.warn('[Cancel API] RPC not available, using direct cancellation:', rpcCatch?.message)
    }

    // 2. Direct fallback update: fetch booking
    const { data: booking, error: bErr } = await supabase
      .from('bookings')
      .select('id, user_id, total_amount, status, schedule_id')
      .eq('id', bookingId)
      .single()

    if (bErr || !booking) {
      return NextResponse.json({ error: 'Data booking tidak ditemukan' }, { status: 404 })
    }

    const totalAmount = Number(booking.total_amount) || 0
    const cancelFee = Math.round(totalAmount * 0.25)
    const refundAmount = Math.max(0, totalAmount - cancelFee)

    if (booking.status === 'cancelled') {
      return NextResponse.json({
        success: true,
        refund_amount: refundAmount,
        message: 'Booking sudah dalam status dibatalkan.',
      })
    }

    // Update booking status
    await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)

    // Update tickets status
    await supabase
      .from('tickets')
      .update({ status: 'cancelled' })
      .eq('booking_id', bookingId)

    // Release seat statuses if possible
    try {
      const { data: tix } = await supabase
        .from('tickets')
        .select('seat_id')
        .eq('booking_id', bookingId)

      if (tix && tix.length > 0) {
        const seatIds = tix.map(t => t.seat_id).filter(Boolean)
        if (seatIds.length > 0) {
          await supabase
            .from('seats')
            .update({ status: 'available' })
            .in('id', seatIds)
        }
      }
    } catch {
      // ignore seat release error
    }

    return NextResponse.json({
      success: true,
      method: 'admin_direct',
      refund_amount: refundAmount,
      cancellation_fee: cancelFee,
      message: 'Tiket berhasil dibatalkan.',
    })
  } catch (err) {
    console.error('[Cancel API] Error:', err)
    return NextResponse.json({ error: err.message || 'Gagal membatalkan tiket' }, { status: 500 })
  }
}

