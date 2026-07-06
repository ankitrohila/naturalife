import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'MASTER_ADMIN'].includes((session.user as any).role)) return null
  return session
}

export async function GET(req: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const view = searchParams.get('view') ?? 'all' // all | mine | unassigned | trashed
  const statusGroup = searchParams.get('statusGroup') ?? 'all' // active | resolved | closed | all
  const priority = searchParams.get('priority')
  const category = searchParams.get('category')
  const agent = searchParams.get('agent')
  const search = searchParams.get('search')
  const sort = searchParams.get('sort') ?? 'newest' // newest | oldest | priority

  const where: any = {}

  if (view === 'trashed') {
    where.isTrashed = true
  } else {
    where.isTrashed = false
    if (view === 'mine') where.assignedTo = session.user!.id
    if (view === 'unassigned') where.assignedTo = null
  }

  if (statusGroup === 'active') where.status = { in: ['OPEN', 'PENDING'] }
  else if (statusGroup === 'resolved') where.status = 'RESOLVED'
  else if (statusGroup === 'closed') where.status = 'CLOSED'

  if (priority) where.priority = priority
  if (category) where.category = category
  if (agent) where.assignedTo = agent === 'unassigned' ? null : agent

  if (search) {
    where.OR = [
      { subject: { contains: search, mode: 'insensitive' } },
      { user: { name: { contains: search, mode: 'insensitive' } } },
      { user: { primaryEmail: { contains: search, mode: 'insensitive' } } },
    ]
  }

  const priorityRank: Record<string, number> = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }

  const orderBy: any =
    sort === 'oldest' ? { createdAt: 'asc' } : { updatedAt: 'desc' }

  const [tickets, statusCounts, viewCounts, admins] = await Promise.all([
    prisma.ticket.findMany({
      where,
      include: {
        user: { select: { name: true, primaryEmail: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        _count: { select: { messages: true } },
      },
      orderBy,
    }),
    prisma.ticket.groupBy({ by: ['status'], where: { isTrashed: false }, _count: true }),
    Promise.all([
      prisma.ticket.count({ where: { isTrashed: false } }),
      prisma.ticket.count({ where: { isTrashed: false, assignedTo: session.user!.id! } }),
      prisma.ticket.count({ where: { isTrashed: false, assignedTo: null } }),
      prisma.ticket.count({ where: { isTrashed: true } }),
    ]),
    prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'MASTER_ADMIN'] } },
      select: { id: true, name: true },
    }),
  ])

  if (sort === 'priority') {
    tickets.sort((a, b) => (priorityRank[a.priority] ?? 9) - (priorityRank[b.priority] ?? 9))
  }

  const [allCount, mineCount, unassignedCount, trashedCount] = viewCounts

  return NextResponse.json({
    tickets,
    statusCounts: Object.fromEntries(statusCounts.map((s) => [s.status, s._count])),
    viewCounts: { all: allCount, mine: mineCount, unassigned: unassignedCount, trashed: trashedCount },
    admins,
  })
}
