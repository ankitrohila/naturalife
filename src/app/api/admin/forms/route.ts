import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'MASTER_ADMIN'].includes((session.user as any).role)) return null
  return session
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const forms = await prisma.formDefinition.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { leads: true } } },
  })

  return NextResponse.json({ forms })
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { key, name, fields } = body

  if (!key || !name || !Array.isArray(fields)) {
    return NextResponse.json({ error: 'key, name, and fields are required' }, { status: 400 })
  }

  const existing = await prisma.formDefinition.findUnique({ where: { key } })
  if (existing) return NextResponse.json({ error: 'A form with this key already exists' }, { status: 400 })

  const form = await prisma.formDefinition.create({ data: { key, name, fields } })
  return NextResponse.json({ form })
}

// Live data endpoint — never prerender at build time.
export const dynamic = 'force-dynamic'
