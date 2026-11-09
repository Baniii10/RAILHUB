import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://youqixjjsdhgmkzdjjck.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_SuiQ5-bcUKMUiqQWZpBT-Q_iYYLydQD'

async function getAdminClient() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  try {
    await supabase.auth.signInWithPassword({
      email: 'admin.operasional@railhub.id',
      password: 'DemoAdmin2026!',
    })
  } catch (err) {
    console.warn('[Financial Report API] Admin sign in error:', err?.message)
  }
  return supabase
}

export async function GET(request) {
  try {
    const adminClient = await getAdminClient()

    // 1. Fetch bookings & payments
    const [bookingsRes, paymentsRes, foodRes] = await Promise.all([
      adminClient
        .from('bookings')
        .select('id, booking_code, user_id, total_amount, ticket_fare_amount, status, created_at, schedules(departure_time, trains(name, train_number), routes(name))')
        .order('created_at', { ascending: false })
        .limit(200),
      adminClient
        .from('payments')
        .select('id, booking_id, amount, status, method, created_at')
        .order('created_at', { ascending: false })
        .limit(200),
      adminClient
        .from('food_orders')
        .select('id, order_code, booking_id, schedule_id, status, total_amount, created_at')
        .order('created_at', { ascending: false })
        .limit(200),
    ])

    const bookings = bookingsRes.data || []
    const payments = paymentsRes.data || []
    const foodOrders = foodRes.data || []

    // 2. Fetch profiles for bookers
    const userIds = Array.from(new Set(bookings.map(b => b.user_id).filter(Boolean)))
    let userMap = new Map()
    if (userIds.length > 0) {
      const { data: profiles } = await adminClient
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds)
      if (profiles) {
        userMap = new Map(profiles.map(p => [p.id, p]))
      }
    }

    // 3. Calculate Totals
    let ticketRevenue = 0
    let refundDeductions = 0
    let transactions = []

    // Map payments to booking info
    const paymentsByBookingId = new Map(payments.map(p => [p.booking_id, p]))

    for (const b of bookings) {
      const pmt = paymentsByBookingId.get(b.id)
      const amt = Number(b.total_amount || pmt?.amount || 0)
      const booker = b.user_id ? userMap.get(b.user_id) : null
      const trainName = b.schedules?.trains?.name || 'KA Antarkota'
      const routeName = b.schedules?.routes?.name || '-'

      if (b.status === 'paid' || pmt?.status === 'confirmed') {
        ticketRevenue += amt
        transactions.push({
          id: b.id,
          date: b.created_at,
          type: 'ticket',
          typeLabel: 'Tiket Perjalanan',
          code: b.booking_code,
          description: `${trainName} · ${routeName} (${booker?.full_name || 'Penumpang'})`,
          method: pmt?.method || 'QRIS Online',
          amount: amt,
          status: 'paid',
          statusLabel: 'Terbayar',
        })
      } else if (b.status === 'refunded' || b.status === 'cancelled') {
        refundDeductions += amt
        transactions.push({
          id: b.id,
          date: b.created_at,
          type: 'refund',
          typeLabel: 'Refund Pembatalan',
          code: b.booking_code,
          description: `Pengembalian dana: ${trainName} (${booker?.full_name || 'Penumpang'})`,
          method: pmt?.method || 'Transfer Refund',
          amount: amt,
          status: 'refunded',
          statusLabel: 'Dikembalikan',
        })
      } else {
        transactions.push({
          id: b.id,
          date: b.created_at,
          type: 'ticket',
          typeLabel: 'Tiket Perjalanan',
          code: b.booking_code,
          description: `${trainName} · ${routeName}`,
          method: pmt?.method || 'Menunggu',
          amount: amt,
          status: b.status,
          statusLabel: b.status,
        })
      }
    }

    // 4. Calculate Food Sales
    let foodRevenue = 0
    for (const fo of foodOrders) {
      const fAmt = Number(fo.total_amount || 0)
      if (['confirmed', 'completed', 'preparing', 'on_the_way'].includes(fo.status)) {
        foodRevenue += fAmt
        transactions.push({
          id: fo.id,
          date: fo.created_at,
          type: 'food',
          typeLabel: 'Restorasi Di Atas KA',
          code: fo.order_code,
          description: `Pesanan Makanan & Minuman KA`,
          method: 'Onboard Cashless',
          amount: fAmt,
          status: fo.status,
          statusLabel: 'Selesai',
        })
      }
    }

    // Sort transactions chronologically descending
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date))

    const netRevenue = Math.max(0, ticketRevenue + foodRevenue - refundDeductions)

    return NextResponse.json({
      success: true,
      summary: {
        ticketRevenue,
        foodRevenue,
        refundDeductions,
        netRevenue,
        totalBookings: bookings.length,
        totalTransactions: transactions.length,
      },
      transactions,
    })
  } catch (err) {
    if (err?.digest?.includes('NEXT_PRERENDER')) {
      throw err
    }
    console.error('[Financial Report API Error]:', err)
    return NextResponse.json({ error: err?.message || 'Gagal memuat laporan keuangan.' }, { status: 500 })
  }
}
