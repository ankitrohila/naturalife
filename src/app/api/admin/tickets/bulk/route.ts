import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'MASTER_ADMIN'].includes((session.user as any).role)) return null
  return session
}

export async function POST(req: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const ids: string[] = Array.isArray(body.ids) ? body.ids : []
  if (ids.length === 0) return NextResponse.json({ error: 'No tickets selected' }, { status: 400 })

  const where = { id: { in: ids } }

  switch (body.action) {
    case 'assign_me':
      await prisma.ticket.updateMany({ where, data: { assignedTo: session.user!.id! } })
      break
    case 'unassign':
      await prisma.ticket.updateMany({ where, data: { assignedTo: null } })
      break
    case 'resolve':
      await prisma.ticket.updateMany({ where, data: { status: 'RESOLVED' } })
      break
    case 'close':
      await prisma.ticket.updateMany({ where, data: { status: 'CLOSED' } })
      break
    case 'trash':
      await prisma.ticket.updateMany({ where, data: { isTrashed: true } })
      break
    case 'restore':
      await prisma.ticket.updateMany({ where, data: { isTrashed: false } })
      break
    case 'delete':
      await prisma.ticket.deleteMany({ where })
      break
    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  }

  return NextResponse.json({ ok: true, count: ids.length })
}
