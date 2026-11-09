import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://youqixjjsdhgmkzdjjck.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_SuiQ5-bcUKMUiqQWZpBT-Q_iYYLydQD'

async function getAdminClient() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  // Sign in with administrative credentials
  try {
    await supabase.auth.signInWithPassword({
      email: 'admin.operasional@railhub.id',
      password: 'DemoAdmin2026!',
    })
  } catch (err) {
    console.warn('[Admin Staff API] Admin sign in error:', err?.message)
  }

  return supabase
}

export async function POST(request) {
  try {
    const body = await request.json()
    const {
      email,
      password = 'petugas123',
      fullName,
      staffType = 'conductor', // 'conductor' | 'gate'
      stationId = null,
      scheduleId = null,
    } = body || {}

    const cleanEmail = String(email || '').trim().toLowerCase()
    const cleanName = String(fullName || '').trim() || `Petugas ${cleanEmail.split('@')[0]}`

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return NextResponse.json({ error: 'Alamat email petugas tidak valid.' }, { status: 400 })
    }

    if (!['conductor', 'gate'].includes(staffType)) {
      return NextResponse.json({ error: 'Tipe penugasan harus conductor atau gate.' }, { status: 400 })
    }

    if (staffType === 'gate' && !stationId) {
      return NextResponse.json({ error: 'Petugas gerbang (gate) wajib ditugaskan ke stasiun tertentu.' }, { status: 400 })
    }

    const adminClient = await getAdminClient()

    // 1. Create or register auth user
    let userId = null
    const { data: signUpData, error: signUpError } = await adminClient.auth.signUp({
      email: cleanEmail,
      password: password || 'petugas123',
      options: {
        data: {
          full_name: cleanName,
          role: 'conductor',
          staff_type: staffType,
        },
      },
    })

    if (signUpError) {
      // If already registered, check if user exists in profiles
      if (signUpError.message?.toLowerCase().includes('already') || signUpError.code === 'user_already_exists') {
        const { data: existingProfile } = await adminClient
          .from('profiles')
          .select('id, full_name, email')
          .eq('email', cleanEmail)
          .maybeSingle()

        if (existingProfile?.id) {
          userId = existingProfile.id
        } else {
          return NextResponse.json({ error: `Pengguna ${cleanEmail} sudah ada di Auth namun belum aktif.` }, { status: 400 })
        }
      } else {
        return NextResponse.json({ error: `Gagal membuat akun auth: ${signUpError.message}` }, { status: 400 })
      }
    } else {
      userId = signUpData?.user?.id
    }

    if (!userId) {
      return NextResponse.json({ error: 'ID akun tidak ditemukan setelah pendaftaran.' }, { status: 500 })
    }

    // 2. Set staff role & station in profiles
    try {
      await adminClient.rpc('admin_set_staff_role', {
        p_user_id: userId,
        p_staff_type: staffType,
        p_station_id: staffType === 'gate' ? stationId : null,
      })
    } catch {
      // Fallback direct update on profiles
      await adminClient
        .from('profiles')
        .update({
          full_name: cleanName,
          role: 'conductor',
          staff_type: staffType,
          station_id: staffType === 'gate' ? stationId : null,
        })
        .eq('id', userId)
    }

    // 3. If conductor and scheduleId provided, assign to schedule
    let assignedSchedule = null
    if (staffType === 'conductor' && scheduleId) {
      const { data: assignId, error: assignError } = await adminClient.rpc('admin_assign_staff', {
        p_staff_id: userId,
        p_schedule_id: scheduleId,
      })
      if (!assignError) {
        assignedSchedule = assignId
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: cleanEmail,
        fullName: cleanName,
        staffType,
        stationId: staffType === 'gate' ? stationId : null,
        assignedSchedule,
        password: password || 'petugas123',
      },
      message: `Akun petugas ${cleanEmail} berhasil dibuat dan dikonfigurasi!`,
    })
  } catch (err) {
    console.error('[Create Staff API Error]:', err)
    return NextResponse.json({ error: err?.message || 'Terjadi kesalahan sistem saat membuat akun petugas.' }, { status: 500 })
  }
}

