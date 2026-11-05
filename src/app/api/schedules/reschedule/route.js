import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateSchedulesForDateRoute } from '@/lib/data/scheduleGenerator'
import { STATIONS_CATALOG } from '@/lib/data/stationsCatalog'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://youqixjjsdhgmkzdjjck.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_SuiQ5-bcUKMUiqQWZpBT-Q_iYYLydQD'

async function getAdminSupabaseClient() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  })

  // Sign in as admin to bypass client RLS for schedule generation
  const { error } = await supabase.auth.signInWithPassword({
    email: 'admin.operasional@railhub.id',
    password: 'DemoAdmin2026!',
  })

  if (error) {
    console.error('[Reschedule API] Admin auth failed:', error.message)
  }

  return supabase
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { origin, destination, date, passengers = 1 } = body || {}

    if (!origin || !destination || !date) {
      return NextResponse.json({ error: 'Parameter origin, destination, dan date wajib diisi' }, { status: 400 })
    }

    const cleanOrigin = String(origin).trim().toUpperCase()
    const cleanDestination = String(destination).trim().toUpperCase()
    const cleanDate = String(date).trim()

    const supabase = await getAdminSupabaseClient()

    // 1. Check existing schedules first
    const { data: existingSchedules } = await supabase.rpc('search_train_schedules', {
      p_origin_code: cleanOrigin,
      p_destination_code: cleanDestination,
      p_departure_date: cleanDate,
      p_passengers: Number(passengers) || 1,
    })

    if (existingSchedules && existingSchedules.length >= 4) {
      return NextResponse.json({
        success: true,
        generated: false,
        count: existingSchedules.length,
        data: existingSchedules,
      })
    }

    // 2. Resolve Station IDs from Supabase
    const { data: stations } = await supabase
      .from('stations')
      .select('id, code, name, city')
      .in('code', [cleanOrigin, cleanDestination])

    const originStation = stations?.find(s => s.code === cleanOrigin)
    const destinationStation = stations?.find(s => s.code === cleanDestination)

    if (!originStation || !destinationStation) {
      return NextResponse.json({
        error: `Stasiun tidak ditemukan di database (${cleanOrigin} / ${cleanDestination})`,
      }, { status: 404 })
    }

    // 3. Resolve or Create Route
    let { data: routes } = await supabase
      .from('routes')
      .select('id, name, distance_km')
      .eq('origin_station_id', originStation.id)
      .eq('destination_station_id', destinationStation.id)
      .limit(1)

    let route = routes?.[0]
    if (!route) {
      // Create new route
      const originMeta = STATIONS_CATALOG.find(s => s.code === cleanOrigin)
      const destMeta = STATIONS_CATALOG.find(s => s.code === cleanDestination)
      const approxDist = 280

      const routeName = `${originStation.name} - ${destinationStation.name}`
      const { data: newRoute, error: routeErr } = await supabase
        .from('routes')
        .insert({
          name: routeName,
          origin_station_id: originStation.id,
          destination_station_id: destinationStation.id,
          distance_km: approxDist,
          is_active: true,
        })
        .select()
        .single()

      if (routeErr) {
        console.error('[Reschedule API] Error creating route:', routeErr)
      } else {
        route = newRoute
      }
    }

    if (!route) {
      return NextResponse.json({ error: 'Gagal menyiapkan rute' }, { status: 500 })
    }

    // 4. Procedurally generate real-time schedules
    const { schedules, fares } = generateSchedulesForDateRoute({
      routeId: route.id,
      originCode: cleanOrigin,
      destinationCode: cleanDestination,
      dateStr: cleanDate,
      distanceKm: route.distance_km || 250,
      targetCount: 7,
    })

    if (schedules.length > 0) {
      // Upsert schedules
      const { error: schErr } = await supabase
        .from('schedules')
        .upsert(schedules, { onConflict: 'id' })

      if (schErr) {
        console.error('[Reschedule API] Error inserting schedules:', schErr)
      }

      // Upsert fares
      const { error: fareErr } = await supabase
        .from('fares')
        .upsert(fares, { onConflict: 'id' })

      if (fareErr) {
        console.error('[Reschedule API] Error inserting fares:', fareErr)
      }
    }

    // 5. Query updated schedules via RPC
    const { data: updatedSchedules, error: fetchErr } = await supabase.rpc('search_train_schedules', {
      p_origin_code: cleanOrigin,
      p_destination_code: cleanDestination,
      p_departure_date: cleanDate,
      p_passengers: Number(passengers) || 1,
    })

    if (fetchErr) {
      console.error('[Reschedule API] Error fetching updated schedules:', fetchErr)
    }

    return NextResponse.json({
      success: true,
      generated: true,
      count: updatedSchedules ? updatedSchedules.length : 0,
      data: updatedSchedules || [],
    })
  } catch (err) {
    console.error('[Reschedule API] Uncaught error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

