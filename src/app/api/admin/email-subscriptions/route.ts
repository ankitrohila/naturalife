import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'MASTER_ADMIN'].includes((session.user as any).role)) return null
  return session
}

export async function GET(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search')

  const where: any = {}
  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
    ]
  }

  const subscriptions = await prisma.emailSubscription.findMany({ where, orderBy: { subscribedAt: 'desc' } })
  const activeCount = subscriptions.filter((s) => s.isActive).length

  return NextResponse.json({ subscriptions, total: subscriptions.length, activeCount })
}
