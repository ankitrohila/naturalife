import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendNotification } from '@/lib/notifications'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const formData = await req.formData()
    const status = formData.get('status') as string
    const note = formData.get('note') as string | null
    const notifyCustomer = formData.get('notifyCustomer') === 'true'

    // Update order status
    await prisma.$transaction([
      prisma.order.update({ where: { id }, data: { status: status as any } }),
      prisma.orderStatusHistory.create({
        data: { orderId: id, status: status as any, note: note || null, notifyCustomer },
      }),
    ])

    // Send notification if customer should be notified
    if (notifyCustomer) {
      const eventMap: Record<string, any> = {
        DISPATCHED: 'ORDER_DISPATCHED',
        DELIVERED: 'ORDER_DELIVERED',
        RETURN_REQUESTED: 'RETURN_REQUESTED',
        REFUNDED: 'REFUND_DONE',
      }

      const event = eventMap[status]
      if (event) {
        try {
          await sendNotification({ event, orderId: id })
        } catch (notifErr) {
          console.error('Notification send failed:', notifErr)
          // Don't fail the order update if notification fails
        }
      }
    }

    return NextResponse.redirect(new URL(`/admin/orders/${id}`, req.url))
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
