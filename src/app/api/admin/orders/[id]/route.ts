import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'MASTER_ADMIN'].includes((session.user as any).role)) return null
  return session
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const body = await (req as any).json()

  const allowed = [
    'paymentStatus', 'paymentMethod', 'gatewayName', 'gatewayTransactionId',
    'razorpayPaymentId', 'razorpayOrderId', 'paidAt', 'refundAmount', 'refundAt', 'refundId',
    'trackingNumber', 'trackingUrl', 'shippingPartnerName', 'shippingCourier', 'estimatedDelivery',
    'notes', 'status',
  ]
  const update: Record<string, any> = {}
  for (const f of allowed) if (f in body) update[f] = body[f]
  if (update.paidAt) update.paidAt = new Date(update.paidAt)
  if (update.refundAt) update.refundAt = new Date(update.refundAt)
  if (update.estimatedDelivery) update.estimatedDelivery = new Date(update.estimatedDelivery)
  if (update.refundAmount !== undefined) update.refundAmount = parseFloat(update.refundAmount) || null

  const order = await prisma.order.update({ where: { id }, data: update })
  if (body.status) {
    await prisma.orderStatusHistory.create({
      data: { orderId: id, status: body.status, note: body.note ?? null, notifyCustomer: true, createdBy: 'admin' },
    })
  }
  return NextResponse.json({ ok: true, order })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params

  await prisma.$transaction(async (tx) => {
    await tx.userCouponUsage.deleteMany({ where: { orderId: id } })
    await tx.coinLedger.updateMany({ where: { orderId: id }, data: { orderId: null } })
    await tx.order.delete({ where: { id } })
  })

  return NextResponse.json({ ok: true })
}
