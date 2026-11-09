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

  // Sign in as admin to ensure schedule generation permissions
  try {
    await supabase.auth.signInWithPassword({
      email: 'admin.operasional@railhub.id',
      password: 'DemoAdmin2026!',
    })
  } catch (authErr) {
    console.warn('[Schedule Search API] Admin sign in notice:', authErr?.message)
  }

  return supabase
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { origin, destination, date, passengers = 1 } = body || {}

    if (!origin || !destination || !date) {
      return NextResponse.json(
        { error: 'Parameter origin, destination, dan date wajib diisi' },
        { status: 400 }
      )
    }

    const cleanOrigin = String(origin).trim().toUpperCase()
    const cleanDestination = String(destination).trim().toUpperCase()
    const cleanDate = String(date).trim()
    const passengerCount = Math.max(1, Number(passengers) || 1)

    const supabase = await getAdminSupabaseClient()

    // 1. Direct query via RPC
    const { data: dbData, error: dbError } = await supabase.rpc('search_train_schedules', {
      p_origin_code: cleanOrigin,
      p_destination_code: cleanDestination,
      p_departure_date: cleanDate,
      p_passengers: passengerCount,
    })

    if (!dbError && dbData && dbData.length >= 3) {
      return NextResponse.json({
        success: true,
        source: 'database',
        count: dbData.length,
        data: dbData,
      })
    }

    // 2. If fewer than 3 departures found, trigger automatic procedural generation
    try {
      const { data: stations } = await supabase
        .from('stations')
        .select('id, code, name, city')
        .in('code', [cleanOrigin, cleanDestination])

      const originStation = stations?.find(s => s.code === cleanOrigin)
      const destinationStation = stations?.find(s => s.code === cleanDestination)

      if (originStation && destinationStation) {
        let { data: routes } = await supabase
          .from('routes')
          .select('id, name, distance_km')
          .eq('origin_station_id', originStation.id)
          .eq('destination_station_id', destinationStation.id)
          .limit(1)

        let route = routes?.[0]
        if (!route) {
          const originMeta = STATIONS_CATALOG.find(s => s.code === cleanOrigin)
          const destMeta = STATIONS_CATALOG.find(s => s.code === cleanDestination)
          const approxDist = 280

          const { data: newRoute } = await supabase
            .from('routes')
            .insert({
              name: `${originStation.name} - ${destinationStation.name}`,
              origin_station_id: originStation.id,
              destination_station_id: destinationStation.id,
              distance_km: approxDist,
              is_active: true,
            })
            .select()
            .single()

          route = newRoute
        }

        if (route) {
          const { schedules, fares } = generateSchedulesForDateRoute({
            routeId: route.id,
            originCode: cleanOrigin,
            destinationCode: cleanDestination,
            dateStr: cleanDate,
            distanceKm: route.distance_km || 250,
            targetCount: 7,
          })

          if (schedules && schedules.length > 0) {
            await supabase.from('schedules').upsert(schedules, { onConflict: 'id' })
            await supabase.from('fares').upsert(fares, { onConflict: 'id' })
          }
        }
      }
    } catch (genErr) {
      console.warn('[Schedule Search API] Auto-generation error:', genErr?.message)
    }

    // 3. Query final schedules
    const { data: finalData, error: finalError } = await supabase.rpc('search_train_schedules', {
      p_origin_code: cleanOrigin,
      p_destination_code: cleanDestination,
      p_departure_date: cleanDate,
      p_passengers: passengerCount,
    })

    if (finalError) {
      return NextResponse.json({
        success: false,
        error: finalError.message,
        data: dbData || [],
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      source: 'live-generated',
      count: (finalData || []).length,
      data: finalData || [],
    })
  } catch (err) {
    console.error('[Schedule Search API] Error:', err)
    return NextResponse.json({
      success: false,
      error: err.message || 'Server error',
      data: [],
    }, { status: 500 })
  }
}

