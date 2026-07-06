import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'MASTER_ADMIN'].includes((session.user as any).role)) return null
  return session
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const faqs = await prisma.chatbotFAQ.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ faqs })
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json()
  const faq = await prisma.chatbotFAQ.create({
    data: { question: body.question, answer: body.answer, category: body.category || 'General' },
  })
  return NextResponse.json({ faq })
}
