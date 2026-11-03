import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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

  const { data: { user } } = await supabase.auth.getUser()

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
