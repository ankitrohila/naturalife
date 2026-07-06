import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const FORM_KEY = 'chatbot-lead'

async function ensureFormDefinition() {
  const existing = await prisma.formDefinition.findUnique({ where: { key: FORM_KEY } })
  if (existing) return
  await prisma.formDefinition.create({
    data: {
      key: FORM_KEY,
      name: 'Chatbot Enquiry',
      fields: [
        { name: 'phone', label: 'Phone', type: 'tel', required: true },
        { name: 'email', label: 'Email', type: 'email', required: false },
        { name: 'requirement', label: 'Requirement', type: 'textarea', required: false },
      ],
    },
  })
}

export async function POST(req: Request) {
  const body = await req.json()
  const { name, phone, email, requirement, sessionId } = body
  if (!name?.trim() || !phone?.trim()) {
    return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 })
  }

  await ensureFormDefinition()

  const lead = await prisma.lead.create({
    data: {
      formKey: FORM_KEY,
      name,
      email: email || null,
      phone,
      data: { requirement: requirement || '', sessionId: sessionId || '' },
    },
  })

  return NextResponse.json({ id: lead.id })
}

export async function PATCH(req: Request) {
  const body = await req.json()
  const { id, sessionId, requirement } = body
  if (!id || !sessionId) return NextResponse.json({ error: 'id and sessionId required' }, { status: 400 })

  const lead = await prisma.lead.findUnique({ where: { id } })
  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

  const existingData = lead.data as Record<string, string>
  if (existingData.sessionId !== sessionId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await prisma.lead.update({
    where: { id },
    data: { data: { ...existingData, requirement: requirement ?? existingData.requirement } },
  })

  return NextResponse.json({ ok: true })
}
