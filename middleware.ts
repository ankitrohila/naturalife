import { NextRequest, NextResponse } from 'next/server'

// Lightweight in-memory rate limiter for sensitive endpoints (login/register/checkout/tickets).
// NOTE: this state lives per server instance — fine for a single-server deploy, but for
// multi-instance/serverless production scaling, swap this for a shared store (e.g. Upstash
// Redis rate limiting) so limits apply across all instances.
const WINDOW_MS = 60_000
const LIMITS: { pattern: RegExp; max: number }[] = [
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

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const rule = LIMITS.find((r) => r.pattern.test(pathname))
  if (!rule) return NextResponse.next()

  const ip = getClientIp(req)
  const key = `${ip}:${pathname}`
  const now = Date.now()
  const entry = hits.get(key)

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return NextResponse.next()
  }

  if (entry.count >= rule.max) {
    return NextResponse.json({ error: 'Too many requests — please slow down and try again shortly.' }, { status: 429 })
  }

  entry.count++
  return NextResponse.next()
}

export const config = {
  matcher: ['/api/auth/:path*', '/api/checkout/create-order', '/api/tickets', '/api/contact', '/api/subscribe'],
}
