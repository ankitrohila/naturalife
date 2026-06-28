import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      images: { orderBy: { sortOrder: 'asc' } },
      variants: { orderBy: { price: 'asc' } },
    },
  }).catch(() => null)
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  return NextResponse.json({ product })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { name, slug, shortDesc, description, categoryId, isFeatured, isOnSale, taxRate, status, image, variants } = body

    await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(shortDesc !== undefined && { shortDesc: shortDesc || null }),
        ...(description !== undefined && { description: description || null }),
        ...(categoryId !== undefined && { categoryId }),
        ...(isFeatured !== undefined && { isFeatured: !!isFeatured }),
        ...(isOnSale !== undefined && { isOnSale: !!isOnSale }),
        ...(taxRate !== undefined && { taxRate }),
        ...(status !== undefined && { status }),
      },
    })

    // Update / create the primary image
    if (image) {
      const existing = await prisma.productImage.findFirst({ where: { productId: id, isPrimary: true } })
      if (existing) {
        await prisma.productImage.update({ where: { id: existing.id }, data: { url: image } })
      } else {
        await prisma.productImage.create({
          data: { productId: id, url: image, altText: name ?? '', isPrimary: true, sortOrder: 0 },
        })
      }
    }

    // Update variant price / wholesale / stock
    if (Array.isArray(variants)) {
      for (const v of variants) {
        if (!v.id) continue
        await prisma.productVariant.update({
          where: { id: v.id },
          data: {
            ...(v.price !== undefined && v.price !== '' && { price: parseFloat(v.price) }),
            ...(v.wholesalePrice !== undefined && v.wholesalePrice !== '' && { wholesalePrice: parseFloat(v.wholesalePrice) }),
            ...(v.stock !== undefined && v.stock !== '' && { stock: parseInt(v.stock) }),
          },
        })
      }
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: true, variants: true },
    })
    return NextResponse.json({ product })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.productImage.deleteMany({ where: { productId: id } })
    await prisma.productVariant.deleteMany({ where: { productId: id } })
    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
