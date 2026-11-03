import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { getSupabaseEnv } from '@/lib/supabase/env'

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({ request })
  const { url, anonKey, isConfigured } = getSupabaseEnv()

  let user = null

  if (isConfigured) {
    const supabase = createServerClient(
      url,
      anonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              request.cookies.set(name, value, options)
            )
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data } = await supabase.auth.getUser()
    user = data.user
  }

  const { pathname } = request.nextUrl
  const isAdminPreview = ['/dashboard/admin', '/dashboard/admin/journeys', '/dashboard/admin/staff', '/dashboard/reports', '/dashboard/orders'].includes(pathname)
    && request.nextUrl.searchParams.get('preview') === '1'

  const requestedNext = request.nextUrl.searchParams.get('next')
  const safeNext = requestedNext?.startsWith('/booking/')
    && !requestedNext.startsWith('//')
    ? requestedNext
    : null

  // Redirect authenticated users away from auth pages
  if (user && (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register'))) {
    return NextResponse.redirect(new URL(safeNext || '/dashboard/passenger', request.url))
  }

  // Protect authenticated application routes.
  if (!user && !isAdminPreview && (pathname.startsWith('/dashboard') || pathname.startsWith('/booking/'))) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('next', `${pathname}${request.nextUrl.search}`)
    return NextResponse.redirect(loginUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
