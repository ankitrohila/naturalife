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
  const formKey = searchParams.get('formKey')
  const status = searchParams.get('status')
  const search = searchParams.get('search')
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = 20

  const where: any = {}
  if (formKey) where.formKey = formKey
  if (status) where.status = status
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [total, leads, forms, statusCounts] = await Promise.all([
    prisma.lead.count({ where }),
    prisma.lead.findMany({
      where,
      include: { form: { select: { name: true, key: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.formDefinition.findMany({ select: { key: true, name: true } }),
    prisma.lead.groupBy({ by: ['status'], _count: true }),
  ])

  return NextResponse.json({
    total, leads, forms, page, totalPages: Math.ceil(total / limit),
    statusCounts: Object.fromEntries(statusCounts.map((s) => [s.status, s._count])),
  })
}
