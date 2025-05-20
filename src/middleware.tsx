import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { generateRandomHeroName } from '@/utils'

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/') {
    const word = generateRandomHeroName().toLowerCase()
    const newUrl = request.nextUrl.clone()
    newUrl.pathname = `/${word}`
    return NextResponse.redirect(newUrl)
  }

  return NextResponse.next()
}

// Apply only to root route
export const config = {
  matcher: ['/'],
}
