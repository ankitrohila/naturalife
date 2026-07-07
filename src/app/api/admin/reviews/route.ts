import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'MASTER_ADMIN'].includes((session.user as any).role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const [reviews, enquiries] = await Promise.all([
    prisma.review.findMany({ orderBy: { createdAt: 'desc' }, include: { product: { select: { name: true, slug: true } } } }).catch(() => []),
    prisma.contactEnquiry.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }).catch(() => []),
  ])
  return NextResponse.json({ reviews, enquiries })
}

// Live data endpoint — never prerender at build time.
export const dynamic = 'force-dynamic'
