import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const body = await req.json()
  if (!body.customerPhone || !body.productName) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const order = await prisma.whatsAppOrder.create({
    data: {
      customerName: body.customerName || null,
      customerPhone: body.customerPhone,
      productName: body.productName,
      productSku: body.productSku || null,
      selectedColor: body.selectedColor || null,
      selectedSize: body.selectedSize || null,
      quantity: body.quantity ? parseInt(body.quantity) : 1,
      unitPrice: body.unitPrice ? parseFloat(body.unitPrice) : null,
      totalValue: body.totalValue ? parseFloat(body.totalValue) : null,
      status: 'PENDING',
    },
  })

  return NextResponse.json({ order })
}
