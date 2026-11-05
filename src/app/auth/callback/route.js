import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getDashboardForProfile, getOperationalRole, isSafeNextPath } from '@/lib/auth/roles'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  // Check if provider/Supabase returned an error directly in query params
  const queryError = searchParams.get('error_description') || searchParams.get('error')
  if (queryError) {
    console.error('[OAuth Callback] Provider error:', queryError)
    return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(queryError)}`)
  }

  if (code) {
    const supabase = await createClient()
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('[OAuth Callback] exchangeCodeForSession failed:', exchangeError)
      return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(exchangeError.message)}`)
    }

    if (data?.session) {
      const userId = data?.user?.id
      if (userId) {
        let profileResult = await supabase
          .from('profiles')
          .select('role, staff_type, station_id')
          .eq('id', userId)
          .maybeSingle()
        if (profileResult.error) {
          profileResult = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle()
        }

        const role = getOperationalRole(profileResult.data)
        const destination = isSafeNextPath(next, role)
          ? next
          : getDashboardForProfile(profileResult.data)
        return NextResponse.redirect(`${origin}${destination}`)
      }

      return NextResponse.redirect(`${origin}/`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent('No code or session provided by authentication server.')}`)
}
