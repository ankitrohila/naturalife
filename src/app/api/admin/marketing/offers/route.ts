import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

async function requireAdmin() {
  const session = await auth()
  return !!session?.user && (session.user as any).role === 'ADMIN'
}

export async function GET() {
  const offers = await prisma.marqueeOffer.findMany({ orderBy: { sortOrder: 'asc' } }).catch(() => [])
  return NextResponse.json({ offers })
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  try {
    const { text, linkUrl } = await req.json()
    if (!text) return NextResponse.json({ error: 'Text required' }, { status: 400 })
    const count = await prisma.marqueeOffer.count()
    const offer = await prisma.marqueeOffer.create({ data: { text, linkUrl: linkUrl || null, sortOrder: count, isActive: true } })
    return NextResponse.json({ offer })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// Live data endpoint — never prerender at build time.
export const dynamic = 'force-dynamic'
