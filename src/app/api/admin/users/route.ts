import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const url = new URL(req.url)
  const q = url.searchParams.get('q')?.trim()
  const where = q ? { OR: [{ name: { contains: q, mode: 'insensitive' as const } }, { primaryEmail: { contains: q, mode: 'insensitive' as const } }, { primaryPhone: { contains: q } }] } : {}
  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: { id: true, name: true, primaryEmail: true, primaryPhone: true, role: true, createdAt: true, _count: { select: { orders: true } } },
  }).catch(() => [])
  return NextResponse.json({ users })
}
