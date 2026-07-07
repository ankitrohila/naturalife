import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ledger = await prisma.coinLedger.findMany({
    where: { userId: session.user.id! },
    orderBy: { createdAt: 'desc' },
    include: { order: { select: { orderNumber: true } } },
  })

  const balance = ledger.reduce((sum, l) => {
    return l.type === 'EARNED' ? sum + l.coins : sum - l.coins
  }, 0)

  return NextResponse.json({ ledger, balance })
}

// Live data endpoint — never prerender at build time.
export const dynamic = 'force-dynamic'
