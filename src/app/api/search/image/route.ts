import { NextResponse } from 'next/server'
import sharp from 'sharp'
import { prisma } from '@/lib/prisma'

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace('#', '').match(/^([0-9a-f]{6})$/i)
  if (!m) return null
  const n = parseInt(m[1], 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function colorDistance(a: [number, number, number], b: [number, number, number]): number {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2)
}

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get('image') as File | null
  if (!file) return NextResponse.json({ error: 'No image provided' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())

  // Extract dominant color via a tiny 1x1 resize (average color)
  const { data } = await sharp(buffer)
    .resize(1, 1, { fit: 'fill' })
    .raw()
    .toBuffer({ resolveWithObject: true })

  const dominantRgb: [number, number, number] = [data[0], data[1], data[2]]

  // Find color attribute values with a hexColor, ranked by closeness
  const colorValues = await prisma.attributeValue.findMany({
    where: { attribute: { name: 'COLOR' }, hexColor: { not: null } },
  })

  const ranked = colorValues
    .map((cv) => {
      const rgb = hexToRgb(cv.hexColor!)
      if (!rgb) return null
      return { id: cv.id, label: cv.label, distance: colorDistance(dominantRgb, rgb) }
    })
    .filter((x): x is { id: string; label: string; distance: number } => x !== null)
    .sort((a, b) => a.distance - b.distance)

  const closestValueIds = ranked.slice(0, 5).map((r) => r.id)

  // If no color data, fall back to featured/active products
  if (closestValueIds.length === 0) {
    const fallback = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      include: {
        category: { select: { name: true } },
        images: { where: { isPrimary: true }, take: 1 },
        variants: { orderBy: { price: 'asc' }, take: 1 },
      },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      take: 20,
    })
    const results = fallback.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      image: p.images[0]?.url ?? null,
      categoryName: p.category.name,
      price: p.variants[0] ? Number(p.variants[0].price) : null,
      isOnSale: p.isOnSale,
      isFeatured: p.isFeatured,
    }))
    return NextResponse.json({ products: results, dominantColor: `rgb(${dominantRgb.join(',')})`, matchedColors: [] })
  }

  // Color-matched products first; if fewer than 6 results, supplement with other active products
  const products = await prisma.product.findMany({
    where: {
      status: 'ACTIVE',
      attributeValues: { some: { valueId: { in: closestValueIds } } },
    },
    include: {
      category: { select: { name: true } },
      images: { where: { isPrimary: true }, take: 1 },
      variants: { orderBy: { price: 'asc' }, take: 1 },
    },
    take: 20,
  })

  let finalProducts = products

  // If color match returned few results, supplement with other active products
  if (products.length < 6) {
    const matchedIds = products.map((p) => p.id)
    const supplemental = await prisma.product.findMany({
      where: { status: 'ACTIVE', id: { notIn: matchedIds } },
      include: {
        category: { select: { name: true } },
        images: { where: { isPrimary: true }, take: 1 },
        variants: { orderBy: { price: 'asc' }, take: 1 },
      },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      take: 20 - products.length,
    })
    finalProducts = [...products, ...supplemental]
  }

  const results = finalProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    image: p.images[0]?.url ?? null,
    categoryName: p.category.name,
    price: p.variants[0] ? Number(p.variants[0].price) : null,
    isOnSale: p.isOnSale,
    isFeatured: p.isFeatured,
  }))

  return NextResponse.json({
    products: results,
    dominantColor: `rgb(${dominantRgb.join(',')})`,
    matchedColors: ranked.slice(0, 5).map((r) => r.label),
  })
}
