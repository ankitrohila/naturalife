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
  const faq = await prisma.chatbotFAQ.update({
    where: { id },
    data: {
      ...(body.question !== undefined && { question: body.question }),
      ...(body.answer !== undefined && { answer: body.answer }),
      ...(body.category !== undefined && { category: body.category }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    },
  })
  return NextResponse.json({ faq })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  await prisma.chatbotFAQ.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
