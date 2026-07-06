import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body

  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  if (order.userId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const secret = process.env.RAZORPAY_KEY_SECRET ?? ''
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  if (expectedSignature !== razorpay_signature) {
    await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: 'FAILED' } })
    return NextResponse.json({ error: 'Payment signature verification failed' }, { status: 400 })
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: 'PAID',
      status: 'CONFIRMED',
      razorpayPaymentId: razorpay_payment_id,
      history: { create: { status: 'CONFIRMED', note: 'Payment verified via Razorpay', notifyCustomer: false } },
    },
  })

  return NextResponse.json({ paymentStatus: updated.paymentStatus, orderStatus: updated.status })
}
