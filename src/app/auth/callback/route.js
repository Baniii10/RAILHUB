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
      const user = data?.user
      if (user?.id) {
        let profile = null
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id, email, role')
            .eq('id', user.id)
            .maybeSingle()
          profile = profileData || { id: user.id, email: user.email, role: 'passenger' }
        } catch {
          profile = { id: user.id, email: user.email, role: 'passenger' }
        }

        const role = getOperationalRole(profile, user.email)
        const destination = isSafeNextPath(next, role)
          ? next
          : getDashboardForProfile(profile, user.email)
        return NextResponse.redirect(`${origin}${destination}`)
      }

      return NextResponse.redirect(`${origin}/dashboard/passenger`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent('No code or session provided by authentication server.')}`)
}
