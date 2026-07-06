import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const ticket = await prisma.ticket.findUnique({ where: { id } })
  if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const isAdmin = (session.user as any).role === 'ADMIN'
  if (ticket.userId !== session.user.id && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { message } = await req.json()
  if (!message?.trim()) return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { id: session.user.id! } })

  const created = await prisma.ticketMessage.create({
    data: {
      ticketId: id,
      senderRole: isAdmin ? 'ADMIN' : 'CUSTOMER',
      senderName: user?.name ?? 'User',
      message,
    },
  })

  // Reopen a resolved/closed ticket if the customer replies
  if (!isAdmin && (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED')) {
    await prisma.ticket.update({ where: { id }, data: { status: 'OPEN' } })
  } else {
    await prisma.ticket.update({ where: { id }, data: { updatedAt: new Date() } })
  }

  return NextResponse.json({ message: created })
}
