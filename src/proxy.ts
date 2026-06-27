import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedPaths = ['/account', '/admin', '/distributor', '/checkout']
const adminPaths = ['/admin']
const distributorPaths = ['/distributor']

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))
  if (isProtected && !session) {
    return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url))
  }

  const isAdmin = adminPaths.some((p) => pathname.startsWith(p))
  if (isAdmin && session?.user && (session.user as any).role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  const isDistributor = distributorPaths.some((p) => pathname.startsWith(p))
  if (isDistributor && session?.user) {
    const role = (session.user as any).role
    if (role !== 'DISTRIBUTOR' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|icons).*)'],
}
