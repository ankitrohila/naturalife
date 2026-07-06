import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'MASTER_ADMIN'].includes((session.user as any).role)) return null
  return session
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const body = await req.json()

  const coins = parseInt(body.coins)
  if (!coins || coins <= 0) return NextResponse.json({ error: 'Coins must be a positive number' }, { status: 400 })

  const type = body.action === 'deduct' ? 'REDEEMED' : 'EARNED'

  const entry = await prisma.coinLedger.create({
    data: {
      userId: id,
      type,
      coins,
      description: body.reason || (type === 'EARNED' ? 'Store credit added by admin' : 'Store credit deducted by admin'),
    },
  })

  return NextResponse.json({ entry })
}
