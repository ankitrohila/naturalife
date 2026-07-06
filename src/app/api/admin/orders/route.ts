import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'MASTER_ADMIN'].includes((session.user as any).role)) return null
  return session
}

export async function DELETE(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json().catch(() => ({}))
  const ids: string[] | undefined = Array.isArray(body.ids) ? body.ids : undefined

  if (!ids && body.confirm !== 'DELETE_ALL') {
    return NextResponse.json({ error: 'Confirmation required to delete all orders' }, { status: 400 })
  }

  const where = ids ? { id: { in: ids } } : {}

  const result = await prisma.$transaction(async (tx) => {
    await tx.userCouponUsage.deleteMany({ where: ids ? { orderId: { in: ids } } : {} })
    await tx.coinLedger.updateMany({ where: ids ? { orderId: { in: ids } } : {}, data: { orderId: null } })
    return tx.order.deleteMany({ where })
  })

  return NextResponse.json({ ok: true, count: result.count })
}
