import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'MASTER_ADMIN'].includes((session.user as any).role)) return null
  return session
}

export async function PATCH(req: Request, { params }: { params: Promise<{ key: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { key } = await params
  const body = await req.json()
  const form = await prisma.formDefinition.update({
    where: { key },
    data: {
      ...(body.name && { name: body.name }),
      ...(body.fields && { fields: body.fields }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    },
  })
  return NextResponse.json({ form })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ key: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { key } = await params

  const leadCount = await prisma.lead.count({ where: { formKey: key } })
  if (leadCount > 0) {
    return NextResponse.json({ error: `Cannot delete — ${leadCount} submission(s) exist for this form. Delete those submissions first.` }, { status: 400 })
  }

  await prisma.formDefinition.delete({ where: { key } })
  return NextResponse.json({ ok: true })
}
