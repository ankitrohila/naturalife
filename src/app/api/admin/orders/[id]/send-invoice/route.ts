import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { sendWhatsAppMessage } from '@/lib/whatsapp'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const { id } = await params
    const order = await prisma.order.findUnique({
      where: { id },
      include: { user: { select: { name: true, primaryPhone: true, whatsappNumber: true } } },
    })
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    const base = process.env.NEXTAUTH_URL || 'http://localhost:3005'
    const invoiceUrl = `${base}/api/invoices/${order.id}`
    const to = order.user?.whatsappNumber || order.user?.primaryPhone || ''
    const message =
      `Namaste ${order.user?.name || 'Customer'}!\n\n` +
      `Your invoice for order ${order.orderNumber} (₹${Number(order.total).toLocaleString('en-IN')}) is ready.\n\n` +
      `View / download: ${invoiceUrl}\n\nThank you for shopping with Naturalife.`

    const sent = await sendWhatsAppMessage({ to, message, event: 'INVOICE' })
    return NextResponse.json({ sent, to, testMode: !sent, message: sent ? 'Invoice sent on WhatsApp' : 'WhatsApp not configured — message logged (test mode)' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
