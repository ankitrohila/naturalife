import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { writeFile } from 'fs/promises'
import path from 'path'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tickets = await prisma.ticket.findMany({
    where: { userId: session.user.id! },
    orderBy: { updatedAt: 'desc' },
    include: { _count: { select: { messages: true } } },
  })
  return NextResponse.json({ tickets })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const subject = formData.get('subject') as string
  const category = formData.get('category') as string
  const priority = formData.get('priority') as string
  const description = formData.get('description') as string

  if (!subject || !description) return NextResponse.json({ error: 'Subject and description are required' }, { status: 400 })

  let attachmentUrl: string | null = null
  const file = formData.get('attachment') as File | null
  if (file && file.size > 0) {
    const buffer = Buffer.from(await file.arrayBuffer())
    const ext = file.name.split('.').pop() || 'jpg'
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const filepath = path.join(process.cwd(), 'public', 'uploads', 'tickets', filename)
    await writeFile(filepath, buffer)
    attachmentUrl = `/uploads/tickets/${filename}`
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id! } })

  const ticket = await prisma.ticket.create({
    data: {
      userId: session.user.id!,
      subject,
      category: category || 'General',
      priority: priority || 'MEDIUM',
      status: 'OPEN',
      attachmentUrl,
      messages: {
        create: { senderRole: 'CUSTOMER', senderName: user?.name ?? 'Customer', message: description },
      },
    },
  })

  return NextResponse.json({ ticket })
}
