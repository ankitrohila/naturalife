import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

// One-time endpoint to populate hexColor on AttributeValues and assign colors to products.
// Call once after deploy: GET /api/admin/fix-colors (must be logged in as admin)
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

  // 1. Update hexColor on all color AttributeValues
  for (const [id, hexColor] of Object.entries(colorMap)) {
    await prisma.attributeValue.updateMany({ where: { id }, data: { hexColor } })
  }

  // 2. Assign a color to each product that doesn't have one yet
  const colorIds = Object.keys(colorMap)
  const products = await prisma.product.findMany({ select: { id: true } })

  for (let i = 0; i < products.length; i++) {
    const colorId = colorIds[i % colorIds.length]
    const existing = await prisma.productAttributeValue.findFirst({
      where: { productId: products[i].id, attributeId: 'COLOR' },
    })
    if (!existing) {
      await prisma.productAttributeValue.create({
        data: { productId: products[i].id, attributeId: 'COLOR', valueId: colorId },
      })
    }
  }

  return NextResponse.json({
    ok: true,
    message: `Updated ${Object.keys(colorMap).length} color hex values and assigned colors to ${products.length} products.`,
  })
}
