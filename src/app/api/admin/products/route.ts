import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, slug, shortDesc, description, categoryId, isFeatured, isOnSale, taxRate, status, images, variants } = body

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        sku: slug, // use slug as base SKU
        shortDesc: shortDesc || null,
        description: description || null,
        categoryId,
        isFeatured: !!isFeatured,
        isOnSale: !!isOnSale,
        taxRate: taxRate ?? 12,
        status: status ?? 'ACTIVE',
        images: {
          create: (images ?? []).map((img: { url: string; altText?: string }, i: number) => ({
            url: img.url,
            altText: img.altText ?? name,
            isPrimary: i === 0,
            sortOrder: i,
          })),
        },
        variants: {
          create: (variants ?? []).map((v: { sku: string; price: number; wholesalePrice?: number; stock?: number; attributeValues?: object }) => ({
            sku: v.sku,
            price: v.price,
            wholesalePrice: v.wholesalePrice ?? 0,
            stock: v.stock ?? 100,
            attributeValues: v.attributeValues ?? {},
          })),
        },
      },
      include: { images: true, variants: true },
    })

    return NextResponse.json({ product })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET() {
  const products = await prisma.product.findMany({
    include: { category: true, images: { where: { isPrimary: true }, take: 1 }, variants: { take: 1 } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  }).catch(() => [])
  return NextResponse.json({ products })
}

// Live data endpoint — never prerender at build time.
export const dynamic = 'force-dynamic'
