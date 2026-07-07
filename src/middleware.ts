import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedPaths = ['/account', '/admin', '/distributor', '/checkout']
const adminPaths = ['/admin']
const distributorPaths = ['/distributor']

const WINDOW_MS = 60_000
const RATE_LIMITS: { pattern: RegExp; max: number }[] = [
  { pattern: /^\/api\/auth\/(register|callback\/credentials)/, max: 10 },
  { pattern: /^\/api\/checkout\/create-order/, max: 15 },
  { pattern: /^\/api\/tickets$/, max: 10 },
  { pattern: /^\/api\/contact$/, max: 10 },
  { pattern: /^\/api\/subscribe$/, max: 10 },
]

const hits = new Map<string, { count: number; resetAt: number }>()

function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
}

function rateLimit(req: NextRequest): NextResponse | null {
  const { pathname } = req.nextUrl
  const rule = RATE_LIMITS.find((r) => r.pattern.test(pathname))
  if (!rule) return null

  const ip = getClientIp(req)
  const key = `${ip}:${pathname}`
  const now = Date.now()
  const entry = hits.get(key)

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return null
  }

  if (entry.count >= rule.max) {
    return NextResponse.json({ error: 'Too many requests — please slow down and try again shortly.' }, { status: 429 })
  }

  entry.count++
  return null
}

export default auth((req) => {
  const rateLimited = rateLimit(req as unknown as NextRequest)
  if (rateLimited) return rateLimited

  const { pathname } = req.nextUrl
  const session = req.auth

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))
  if (isProtected && !session) {
    return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url))
  }

  const isAdmin = adminPaths.some((p) => pathname.startsWith(p))
  if (isAdmin && session?.user && !['ADMIN', 'MASTER_ADMIN'].includes((session.user as any).role)) {
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
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|icons).*)'],
}
