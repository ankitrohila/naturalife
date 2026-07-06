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
  const ticket = await prisma.ticket.update({
    where: { id },
    data: {
      ...(body.status && { status: body.status }),
      ...(body.priority && { priority: body.priority }),
      ...(body.assignedTo !== undefined && { assignedTo: body.assignedTo }),
      ...(body.isTrashed !== undefined && { isTrashed: body.isTrashed }),
    },
  })
  return NextResponse.json({ ticket })
}
