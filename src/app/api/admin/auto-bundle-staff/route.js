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
    console.warn('[Auto Bundle Staff API] Admin sign in notice:', err?.message)
  }

  return supabase
}

export async function POST(request) {
  try {
    const adminClient = await getAdminClient()

    // 1. Fetch staff profiles j01 - j20
    const { data: staffList } = await adminClient
      .from('profiles')
      .select('id, email, full_name')
      .like('email', 'j%@gmail.com')

    const staffByNum = {}
    for (const st of (staffList || [])) {
      const m = st.email.match(/^j(\d+)@gmail\.com$/)
      if (m) staffByNum[m[1]] = st.id
    }

    // 2. Fetch trains ordered by name
    const { data: trains } = await adminClient
      .from('trains')
      .select('id, name')
      .order('name')

    const staffByTrainId = {}
    ;(trains || []).forEach((t, i) => {
      const num = String(i + 1).padStart(2, '0')
      if (staffByNum[num]) staffByTrainId[t.id] = staffByNum[num]
    })

    // 3. Fetch upcoming unassigned schedules
    const { data: schs, error: schErr } = await adminClient
      .from('schedules')
      .select('id, train_id')
      .gt('departure_time', new Date().toISOString())
      .order('departure_time', { ascending: true })
      .limit(300)

    if (schErr) throw schErr

    let count = 0
    for (const sch of (schs || [])) {
      const staffId = staffByTrainId[sch.train_id]
      if (staffId) {
        try {
          const { error: assignErr } = await adminClient.rpc('admin_assign_staff', {
            p_staff_id: staffId,
            p_schedule_id: sch.id,
          })
          if (!assignErr) count++
        } catch {}
      }
    }

    return NextResponse.json({
      success: true,
      assignedCount: count,
      message: `Berhasil memaketkan ${count} jadwal perjalanan KA dengan kondektur operasional masing-masing!`,
    })
  } catch (err) {
    console.error('[Auto Bundle Staff API Error]:', err)
    return NextResponse.json({ error: err?.message || 'Terjadi kesalahan sistem.' }, { status: 500 })
  }
}

