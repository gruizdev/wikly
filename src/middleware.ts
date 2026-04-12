import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

function stripLocalePrefix(pathname: string): { pathname: string; hadLocalePrefix: boolean } {
  const localePrefixMatch = pathname.match(/^\/([a-zA-Z]{2}(?:-[a-zA-Z]{2})?)(?=\/|$)/)

  if (!localePrefixMatch) {
    return { pathname, hadLocalePrefix: false }
  }

  const withoutLocale = pathname.replace(/^\/[a-zA-Z]{2}(?:-[a-zA-Z]{2})?/, '') || '/'
  return { pathname: withoutLocale, hadLocalePrefix: true }
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  const { pathname, search } = req.nextUrl
  const { pathname: normalizedPathname, hadLocalePrefix } = stripLocalePrefix(pathname)

  // Normalize locale-prefixed paths (for example /en/login -> /login)
  // because this app does not define locale routes.
  if (hadLocalePrefix) {
    return NextResponse.redirect(new URL(`${normalizedPathname}${search}`, req.url))
  }

  // Redirect unauthenticated users to /login
  if (!session && normalizedPathname !== '/login' && normalizedPathname !== '/auth/callback') {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Redirect authenticated users away from /login
  if (session && normalizedPathname === '/login') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return res
}

export const config = {
  // Run middleware on all pages except static assets, API routes, and the auth callback
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/|auth/callback).*)'],
}
