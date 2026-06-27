import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { orderBy: { sortOrder: 'asc' } },
      variants: {
        include: { bulkPricingRules: { orderBy: { minQty: 'asc' } } },
        orderBy: { price: 'asc' },
      },
      attributeValues: {
        include: { attribute: true, value: true },
      },
    },
  })

  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

  return NextResponse.json(product)
}
