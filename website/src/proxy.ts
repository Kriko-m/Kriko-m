import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Session vernieuwen (vereist voor Supabase SSR)
  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Beveiligde portaal-routes (alles behalve de login-root)
  if (pathname.startsWith('/portaal/') && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/portaal'
    return NextResponse.redirect(url)
  }

  // Ingelogd → login pagina overslaan
  if (pathname === '/portaal' && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/portaal/dashboard'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/portaal', '/portaal/:path*'],
}
