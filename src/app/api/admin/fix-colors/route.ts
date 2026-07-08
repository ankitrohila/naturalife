import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

// One-time endpoint to populate hexColors, assign 3 colors + 3 sizes to every product.
// GET /api/admin/fix-colors  (must be logged in as admin)
export async function GET() {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'MASTER_ADMIN'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const colorMap: Record<string, string> = {
    'color-red':    '#C0392B',
    'color-blue':   '#2980B9',
    'color-green':  '#27AE60',
    'color-beige':  '#F5E6CA',
    'color-brown':  '#7B4F2E',
    'color-multi':  '#E8832A',
    'color-grey':   '#7F8C8D',
    'color-black':  '#2C2C2C',
    'color-ivory':  '#FAF7F0',
    'color-yellow': '#F1C40F',
  }

  // 1. Set hexColor on all color AttributeValues
  for (const [id, hexColor] of Object.entries(colorMap)) {
    await prisma.attributeValue.updateMany({ where: { id }, data: { hexColor } })
  }

  // 2. Assign 3 colors + 3 sizes to each product
  const colorPool = Object.keys(colorMap)
  const sizePool = ['size-16x24', 'size-18x30', 'size-24x36']

  const products = await prisma.product.findMany({ select: { id: true } })

  let colorCount = 0
  let sizeCount = 0

  for (let i = 0; i < products.length; i++) {
    const pid = products[i].id
    const assignedColors = [
      colorPool[i % colorPool.length],
      colorPool[(i + 3) % colorPool.length],
      colorPool[(i + 6) % colorPool.length],
    ]

    for (const colorId of assignedColors) {
      const existing = await prisma.productAttributeValue.findUnique({
        where: { productId_attributeId_valueId: { productId: pid, attributeId: 'COLOR', valueId: colorId } },
      })
      if (!existing) {
        await prisma.productAttributeValue.create({
          data: { productId: pid, attributeId: 'COLOR', valueId: colorId },
        })
        colorCount++
      }
    }

    for (const sizeId of sizePool) {
      const existing = await prisma.productAttributeValue.findUnique({
        where: { productId_attributeId_valueId: { productId: pid, attributeId: 'SIZE', valueId: sizeId } },
      })
      if (!existing) {
        await prisma.productAttributeValue.create({
          data: { productId: pid, attributeId: 'SIZE', valueId: sizeId },
        })
        sizeCount++
      }
    }
  }

  return NextResponse.json({
    ok: true,
    hexColorsUpdated: Object.keys(colorMap).length,
    colorRecordsAdded: colorCount,
    sizeRecordsAdded: sizeCount,
    productsProcessed: products.length,
  })
}
