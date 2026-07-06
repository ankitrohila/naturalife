import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'MASTER_ADMIN'].includes((session.user as any).role)) return null
  return session
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const body = await req.json()

  const item = await prisma.menuItem.update({
    where: { id },
    data: {
      ...(body.label !== undefined && { label: body.label }),
      ...(body.url !== undefined && { url: body.url || null }),
      ...(body.categorySlug !== undefined && { categorySlug: body.categorySlug || null }),
      ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl || null }),
      ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
      ...(body.parentId !== undefined && { parentId: body.parentId || null }),
    },
  })
  return NextResponse.json({ item })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  await prisma.menuItem.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
