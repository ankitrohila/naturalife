import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const count = await prisma.product.count({ where: { categoryId: id } })
    if (count > 0) return NextResponse.json({ error: `Cannot delete — ${count} product(s) use this category` }, { status: 400 })
    await prisma.category.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { name, description } = await req.json()
    const category = await prisma.category.update({
      where: { id },
      data: { ...(name && { name }), ...(description !== undefined && { description: description || null }) },
    })
    return NextResponse.json({ category })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
