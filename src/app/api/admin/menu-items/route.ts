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
  const location = searchParams.get('location') ?? 'header'

  const items = await prisma.menuItem.findMany({
    where: { menuLocation: location },
    orderBy: { sortOrder: 'asc' },
  })
  return NextResponse.json({ items })
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json()

  const maxSort = await prisma.menuItem.aggregate({
    where: { menuLocation: body.menuLocation, parentId: body.parentId ?? null },
    _max: { sortOrder: true },
  })

  const item = await prisma.menuItem.create({
    data: {
      menuLocation: body.menuLocation,
      parentId: body.parentId || null,
      label: body.label,
      url: body.url || null,
      categorySlug: body.categorySlug || null,
      imageUrl: body.imageUrl || null,
      sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
    },
  })
  return NextResponse.json({ item })
}
