import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  })
  if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const isAdmin = (session.user as any).role === 'ADMIN'
  if (ticket.userId !== session.user.id && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  return NextResponse.json({ ticket })
}
