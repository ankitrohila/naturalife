import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { sendNotification, sendWhatsAppMessage, formatWhatsAppMessage } from '@/lib/notifications'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'MASTER_ADMIN'].includes((session.user as any).role)) return null
  return session
}

export async function POST(req: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json().catch(() => ({}))
  const { event, channel } = body as { event: string; channel: 'EMAIL' | 'WHATSAPP' }

  const order = await prisma.order.findFirst({
    where: { userId: session.user!.id! },
    orderBy: { createdAt: 'desc' },
    include: { user: true },
  })
  if (!order) return NextResponse.json({ error: 'No orders found — create a test order first' }, { status: 400 })

  try {
    if (channel === 'EMAIL') {
      await sendNotification({ event: event as any, orderId: order.id })
    } else {
      const testWA = process.env.NOTIFICATION_TEST_WHATSAPP || order.user.primaryPhone
      const message = formatWhatsAppMessage(event, order)
      const result = await sendWhatsAppMessage(testWA, message)
      return NextResponse.json({ ok: true, simulated: result.simulated, sent: result.sent })
    }
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
