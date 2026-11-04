import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { normalizeProfile } from '@/lib/auth/roles'

const DEMO_CONFIG = {
  'gate.gambir@railhub.id': { role: 'conductor', staff_type: 'gate', stationCode: 'GMR' },
  'kondektur.parahyangan@railhub.id': { role: 'conductor', staff_type: 'conductor' },
  'admin.operasional@railhub.id': { role: 'admin', staff_type: null },
  'penumpang.demo@railhub.id': { role: 'passenger', staff_type: null },
}

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const email = user?.email?.toLowerCase()
  const config = DEMO_CONFIG[email]
  if (!user || !config) return NextResponse.json({ error: 'Akun demo tidak valid.' }, { status: 403 })

  try {
    const admin = createAdminClient()
    let stationId = null
    if (config.stationCode) {
      const { data: station } = await admin.from('stations').select('id').eq('code', config.stationCode).limit(1).maybeSingle()
      stationId = station?.id || null
    }

    const modern = await admin.from('profiles').update({
      role: config.role,
      staff_type: config.staff_type,
      station_id: stationId,
    }).eq('id', user.id).select('*').single()

    if (!modern.error) return NextResponse.json({ profile: normalizeProfile(modern.data, email) })

    const legacy = await admin.from('profiles').update({ role: config.role }).eq('id', user.id).select('*').single()
    if (legacy.error) throw legacy.error
    return NextResponse.json({ profile: normalizeProfile(legacy.data, email), legacySchema: true })
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Role demo gagal disinkronkan.' }, { status: 500 })
  }
}
