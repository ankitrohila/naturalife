import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { generateInvoiceHTML } from '@/lib/invoicing'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await auth()
    const { orderId } = await params

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        address: true,
        items: {
          include: { variant: { include: { product: true } } },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check authorization - user can only access their own orders
    const userRole = (session.user as any).role
    if (session.user.id !== order.userId && userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Generate HTML invoice
    let htmlContent = await generateInvoiceHTML(order)

    // ?print=1 → auto-open the browser print dialog so the user can Save as PDF
    const url = new URL(req.url)
    if (url.searchParams.get('print') === '1') {
      htmlContent = htmlContent.replace(
        '</body>',
        '<script>window.addEventListener("load",function(){setTimeout(function(){window.print()},400)})</script></body>'
      )
    }

    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html;charset=utf-8',
        'Content-Disposition': `inline; filename="invoice-${order.orderNumber}.html"`,
      },
    })
  } catch (error: any) {
    console.error('Invoice generation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
