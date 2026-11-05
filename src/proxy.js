import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { getSupabaseEnv } from '@/lib/supabase/env'
import { getDashboardForProfile, getOperationalRole, isPathAllowedForRole, isSafeNextPath } from '@/lib/auth/roles'

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
    try {
      const { data } = await supabase.auth.getUser()
      user = data?.user ?? null
    } catch {
      user = null
    }
  }

  const redirectWithCookies = (dest) => {
    const redirectResponse = NextResponse.redirect(new URL(dest, request.url))
    supabaseResponse.cookies.getAll().forEach(({ name, value, ...options }) => {
      redirectResponse.cookies.set(name, value, options)
    })
    return redirectResponse
  }

  const { pathname } = request.nextUrl
  const isProtectedBooking = pathname.startsWith('/booking/payment/')
  const requestedNext = request.nextUrl.searchParams.get('next')

  let profile = null
  if (user && supabase) {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, email, role')
        .eq('id', user.id)
        .maybeSingle()
      profile = data || { id: user.id, email: user.email, role: 'passenger' }
    } catch {
      profile = { id: user.id, email: user.email, role: 'passenger' }
    }
  }

  if (user && (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register'))) {
    const role = getOperationalRole(profile, user.email)
    const safeNext = isSafeNextPath(requestedNext, role) ? requestedNext : null
    return redirectWithCookies(safeNext || getDashboardForProfile(profile, user.email))
  }

  if (!user && (pathname.startsWith('/dashboard') || isProtectedBooking)) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('next', `${pathname}${request.nextUrl.search}`)
    return redirectWithCookies(loginUrl.pathname + loginUrl.search)
  }

  if (user && supabase) {
    const role = getOperationalRole(profile, user.email)
    if (!isPathAllowedForRole(pathname, role)) {
      return redirectWithCookies(getDashboardForProfile(profile, user.email))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
