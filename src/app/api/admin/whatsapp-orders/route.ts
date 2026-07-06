import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'MASTER_ADMIN'].includes((session.user as any).role)) return null
  return session
}

export async function GET(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = 20

  const where: any = {}
  if (status) where.status = status

  const [total, orders] = await Promise.all([
    prisma.whatsAppOrder.count({ where }),
    prisma.whatsAppOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return NextResponse.json({ total, orders, page, totalPages: Math.ceil(total / limit) })
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
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
      status: body.status || 'PENDING',
      notes: body.notes || null,
    },
  })

  return NextResponse.json({ order })
}
