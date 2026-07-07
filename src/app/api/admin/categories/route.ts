import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { products: true } } },
  }).catch(() => [])
  return NextResponse.json({ categories })
}

export async function POST(req: Request) {
  try {
    const { name, description } = await req.json()
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })
    const slug = slugify(name)
    const exists = await prisma.category.findUnique({ where: { slug } })
    if (exists) return NextResponse.json({ error: 'A category with this name already exists' }, { status: 400 })
    const count = await prisma.category.count()
    const category = await prisma.category.create({
      data: { name, slug, description: description || null, seoTitle: `${name} - Naturalife`, seoDesc: description || `Browse our ${name}`, sortOrder: count },
    })
    return NextResponse.json({ category })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// Live data endpoint — never prerender at build time.
export const dynamic = 'force-dynamic'
