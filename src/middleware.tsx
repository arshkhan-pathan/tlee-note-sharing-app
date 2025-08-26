import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect admin routes
  if (pathname.startsWith('/admin/panel')) {
    // Check if user is authenticated by looking for adminToken in cookies
    const adminToken = request.cookies.get('adminToken')?.value

    if (!adminToken) {
      // Redirect to login page
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/panel/:path*'],
}
