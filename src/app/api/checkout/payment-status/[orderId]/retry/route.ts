import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function POST(req: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { orderId } = await params
  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  if (order.userId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (order.paymentStatus !== 'FAILED') return NextResponse.json({ error: 'Order is not in a failed state' }, { status: 400 })

  // Bumping updatedAt (via the plain update) restarts the simulated settlement window
  const updated = await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: 'PENDING' } })
  return NextResponse.json({ paymentStatus: updated.paymentStatus })
}
