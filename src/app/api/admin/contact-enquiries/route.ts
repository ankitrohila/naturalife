import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'MASTER_ADMIN'].includes((session.user as any).role)) return null
  return session
}

export async function GET(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const search = searchParams.get('search')

  const where: any = {}
  if (status) where.status = status
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { message: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [enquiries, statusCounts] = await Promise.all([
    prisma.contactEnquiry.findMany({ where, orderBy: { createdAt: 'desc' } }),
    prisma.contactEnquiry.groupBy({ by: ['status'], _count: true }),
  ])

  return NextResponse.json({
    enquiries,
    total: enquiries.length,
    statusCounts: Object.fromEntries(statusCounts.map((s) => [s.status, s._count])),
  })
}
