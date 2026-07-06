import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

// Simulated UPI settlement window for test/dummy mode (no live payment gateway).
// A real gateway would push a webhook the instant the customer pays; here we
// resolve the payment the first time it's polled after this window elapses.
const SIMULATED_SETTLE_MS = 6000
const SIMULATED_SUCCESS_RATE = 0.9

export async function GET(req: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { orderId } = await params
  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  if (order.userId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Only simulate for orders that don't have a real gateway reference (no razorpayPaymentId)
  // and are still pending — real-gateway orders are resolved by /verify-payment instead.
  if (order.paymentStatus === 'PENDING' && !order.razorpayPaymentId) {
    const elapsed = Date.now() - order.updatedAt.getTime()
    if (elapsed >= SIMULATED_SETTLE_MS) {
      const success = Math.random() < SIMULATED_SUCCESS_RATE
      const updated = await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: success ? 'PAID' : 'FAILED',
          ...(success && { status: 'CONFIRMED' }),
          ...(success && {
            history: { create: { status: 'CONFIRMED', note: 'Payment confirmed via UPI (test mode)', notifyCustomer: false } },
          }),
        },
      })
      return NextResponse.json({ paymentStatus: updated.paymentStatus, orderStatus: updated.status })
    }
  }

  return NextResponse.json({ paymentStatus: order.paymentStatus, orderStatus: order.status })
}
