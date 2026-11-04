import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { getSupabaseEnv } from '@/lib/supabase/env'
import { getDashboardForProfile, getOperationalRole, isSafeNextPath } from '@/lib/auth/roles'

export async function proxy(request) {
  let supabaseResponse = NextResponse.next({ request })
  const { url, anonKey, isConfigured } = getSupabaseEnv()
  let user = null
  let supabase = null

  if (isConfigured) {
    supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value, options))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    })
    const { data } = await supabase.auth.getUser()
    user = data.user
  }

  const { pathname } = request.nextUrl
  const isProtectedBooking = pathname.startsWith('/booking/payment/')
  const requestedNext = request.nextUrl.searchParams.get('next')
  const safeNext = isSafeNextPath(requestedNext) ? requestedNext : null

  let profile = null
  if (user && supabase) {
    const result = await supabase
      .from('profiles')
      .select('role, staff_type, station_id')
      .eq('id', user.id)
      .maybeSingle()
    profile = result.data
  }

  if (user && (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register'))) {
    return NextResponse.redirect(new URL(safeNext || getDashboardForProfile(profile), request.url))
  }

  if (!user && (pathname.startsWith('/dashboard') || isProtectedBooking)) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('next', `${pathname}${request.nextUrl.search}`)
    return NextResponse.redirect(loginUrl)
  }

  if (user && supabase && pathname.startsWith('/dashboard')) {
    const role = getOperationalRole(profile)
    const allowed = role === 'admin'
      || (['conductor', 'gate'].includes(role) && ['/dashboard/staff', '/dashboard/orders', '/dashboard/reports'].some(path => pathname.startsWith(path)))
      || (role === 'passenger' && pathname.startsWith('/dashboard/passenger'))

    if (!allowed) {
      return NextResponse.redirect(new URL(getDashboardForProfile(profile), request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
