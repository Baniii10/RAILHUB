import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code  = searchParams.get('code')
  const next  = searchParams.get('next')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      if (next && next !== '/') {
        return NextResponse.redirect(`${origin}${next}`)
      }

      const userId = data?.user?.id
      if (userId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .maybeSingle()

        if (profile?.role === 'admin') {
          return NextResponse.redirect(`${origin}/dashboard/admin`)
        }
        if (profile?.role === 'conductor') {
          return NextResponse.redirect(`${origin}/dashboard/staff`)
        }
      }

      return NextResponse.redirect(`${origin}/dashboard/passenger`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`)
}
