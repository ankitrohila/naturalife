import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'MASTER_ADMIN'].includes((session.user as any).role)) return null
  return session
}

export async function GET(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = 20

  const where: any = { isRecovered: false }

  const [total, carts, stats] = await Promise.all([
    prisma.abandonedCart.count({ where }),
    prisma.abandonedCart.findMany({
      where,
      include: { user: { select: { name: true, primaryEmail: true, primaryPhone: true, whatsappNumber: true } } },
      orderBy: { lastUpdated: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.abandonedCart.aggregate({
      where: { isRecovered: false },
      _sum: { totalValue: true },
      _avg: { totalValue: true },
      _count: true,
    }),
  ])

  const recoveredCount = await prisma.abandonedCart.count({ where: { isRecovered: true } })
  const totalCarts = stats._count + recoveredCount
  const recoveryRate = totalCarts > 0 ? (recoveredCount / totalCarts) * 100 : 0

  return NextResponse.json({
    total,
    carts,
    page,
    totalPages: Math.ceil(total / limit),
    stats: {
      totalAbandonedValue: stats._sum.totalValue ?? 0,
      averageCartValue: stats._avg.totalValue ?? 0,
      abandonedCount: stats._count,
      recoveryRate,
    },
  })
}
