import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isRealUserAccount } from '@/lib/utils/account-detector'

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
    console.warn('[Journey Manifest API] Admin sign in error:', err?.message)
  }
  return supabase
}

export async function GET(request) {
  try {
    const scheduleId = request.nextUrl ? request.nextUrl.searchParams.get('scheduleId') : new URL(request.url).searchParams.get('scheduleId')

    if (!scheduleId) {
      return NextResponse.json({ error: 'Parameter scheduleId wajib diisi.' }, { status: 400 })
    }

    const adminClient = await getAdminClient()

    // 1. Fetch schedule information
    const { data: schedule, error: schedError } = await adminClient
      .from('schedules')
      .select('id, departure_time, arrival_time, status, note, train_id, route_id, trains(id, name, train_number, service_class, description), routes(id, name, distance_km)')
      .eq('id', scheduleId)
      .maybeSingle()

    if (schedError || !schedule) {
      return NextResponse.json({ error: 'Jadwal perjalanan tidak ditemukan.' }, { status: 404 })
    }

    // 2. Fetch staff assignments for this schedule
    const { data: staffAssignments } = await adminClient
      .from('staff_assignments')
      .select('id, staff_id, profiles!staff_assignments_staff_id_fkey(id, full_name, email, role, staff_type)')
      .eq('schedule_id', scheduleId)

    const staffList = (staffAssignments || []).map(sa => {
      const p = sa.profiles || {}
      const isReal = isRealUserAccount(p.email)
      return {
        id: sa.id,
        staffId: sa.staff_id,
        fullName: p.full_name || 'Petugas Kondektur',
        email: p.email || '-',
        staffType: p.staff_type || 'conductor',
        isRealStaff: isReal,
      }
    })

    const hasRealStaff = staffList.some(s => s.isRealStaff)

    // 3. Fetch booked seats & passenger manifest
    const { data: bookedSeats, error: bsError } = await adminClient
      .from('booking_seats')
      .select(`
        id,
        schedule_id,
        seat_id,
        passenger_id,
        booking_id,
        seats (
          id,
          seat_number,
          carriage_id,
          carriages (
            id,
            carriage_number,
            carriage_class
          )
        ),
        passengers (
          id,
          full_name,
          id_card_number
        ),
        bookings (
          id,
          booking_code,
          status,
          user_id,
          total_amount,
          created_at
        )
      `)
      .eq('schedule_id', scheduleId)

    if (bsError) {
      console.error('[Manifest API] Error fetching booked seats:', bsError)
    }

    const bookingList = bookedSeats || []

    // 4. Collect user IDs to lookup booker accounts
    const userIds = Array.from(new Set(bookingList.map(b => b.bookings?.user_id).filter(Boolean)))
    let userProfilesMap = new Map()

    if (userIds.length > 0) {
      const { data: userProfiles } = await adminClient
        .from('profiles')
        .select('id, full_name, email, role, phone_number')
        .in('id', userIds)

      if (userProfiles) {
        userProfilesMap = new Map(userProfiles.map(u => [u.id, u]))
      }
    }

    // 5. Structure passenger manifest items
    let realAccountCount = 0
    let dummyAccountCount = 0

    const manifest = bookingList.map((item, idx) => {
      const booker = item.bookings?.user_id ? userProfilesMap.get(item.bookings.user_id) : null
      const isReal = isRealUserAccount(booker?.email)

      if (isReal) {
        realAccountCount += 1
      } else {
        dummyAccountCount += 1
      }

      return {
        index: idx + 1,
        id: item.id,
        bookingId: item.booking_id,
        bookingCode: item.bookings?.booking_code || 'RH-ONLINE',
        bookingStatus: item.bookings?.status || 'paid',
        passengerName: item.passengers?.full_name || 'Penumpang Kereta',
        idCardNumber: item.passengers?.id_card_number || '-',
        seatNumber: item.seats?.seat_number || '-',
        carriageNumber: item.seats?.carriages?.carriage_number || 1,
        carriageClass: item.seats?.carriages?.carriage_class || 'Eksekutif',
        bookerName: booker?.full_name || 'Akun Penumpang',
        bookerEmail: booker?.email || '-',
        bookerPhone: booker?.phone_number || '-',
        isRealAccount: isReal,
        createdAt: item.bookings?.created_at,
      }
    })

    const hasRealPassenger = realAccountCount > 0
    const hasRealAccountInvolvement = hasRealPassenger || hasRealStaff

    // 6. Total seats for this train
    const { count: totalCarriageSeats } = await adminClient
      .from('seats')
      .select('id, carriages!inner(train_id)', { count: 'exact', head: true })
      .eq('carriages.train_id', schedule.train_id)

    const capacity = totalCarriageSeats || 320

    return NextResponse.json({
      success: true,
      schedule: {
        id: schedule.id,
        trainName: schedule.trains?.name || 'Kereta Api',
        trainNumber: schedule.trains?.train_number || 'KA',
        serviceClass: schedule.trains?.service_class || 'Eksekutif',
        routeName: schedule.routes?.name || 'Rute KA',
        departureTime: schedule.departure_time,
        arrivalTime: schedule.arrival_time,
        status: schedule.status,
        note: schedule.note,
        capacity,
        bookedCount: manifest.length,
      },
      summary: {
        totalPassengers: manifest.length,
        realAccountPassengers: realAccountCount,
        dummyAccountPassengers: dummyAccountCount,
        hasRealPassenger,
        hasRealStaff,
        hasRealAccountInvolvement,
        staffCount: staffList.length,
      },
      staffList,
      manifest,
    })
  } catch (err) {
    if (err?.digest?.includes('NEXT_PRERENDER')) {
      throw err
    }
    console.error('[Journey Manifest API Error]:', err)
    return NextResponse.json({ error: err?.message || 'Gagal memuat manifest penumpang.' }, { status: 500 })
  }
}
