import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '12')
  const category = searchParams.get('category')
  const search = searchParams.get('search')
  const onSale = searchParams.get('onSale')
  const featured = searchParams.get('featured')
  const status = searchParams.get('status') ?? 'ACTIVE'
  const sort = searchParams.get('sort') ?? 'newest'
  const priceMin = searchParams.get('priceMin')
  const priceMax = searchParams.get('priceMax')

  const where: any = { status }
  if (category) where.category = { slug: category }
  if (onSale === 'true') where.isOnSale = true
  if (featured === 'true') where.isFeatured = true
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { shortDesc: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (priceMin || priceMax) {
    where.variants = {
      some: {
        price: {
          ...(priceMin ? { gte: parseFloat(priceMin) } : {}),
          ...(priceMax ? { lte: parseFloat(priceMax) } : {}),
        },
      },
    }
  }

  const orderBy: any =
    sort === 'price-asc' ? { variants: { _min: { price: 'asc' } } }
    : sort === 'price-desc' ? { variants: { _min: { price: 'desc' } } }
    : { createdAt: 'desc' }

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: {
        category: { select: { name: true, slug: true } },
        images: { where: { isPrimary: true }, take: 1 },
        variants: {
          select: { id: true, price: true, wholesalePrice: true, stock: true, attributeValues: true },
          orderBy: { price: 'asc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return NextResponse.json({
    products,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  })
}
