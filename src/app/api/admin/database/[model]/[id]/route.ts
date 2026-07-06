import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { isAllowedModel, stripSensitive } from '@/lib/dbManagerModels'

async function requireMasterAdmin() {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'MASTER_ADMIN') return null
  return session
}

export async function PATCH(req: Request, { params }: { params: Promise<{ model: string; id: string }> }) {
  if (!(await requireMasterAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { model, id } = await params
  if (!isAllowedModel(model)) return NextResponse.json({ error: 'Model not allowed' }, { status: 400 })

  const body = await req.json()
  delete body.id
  try {
    const updated = await (prisma as any)[model].update({ where: { id }, data: body })
    return NextResponse.json({ row: stripSensitive(model, updated) })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ model: string; id: string }> }) {
  if (!(await requireMasterAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { model, id } = await params
  if (!isAllowedModel(model)) return NextResponse.json({ error: 'Model not allowed' }, { status: 400 })

  try {
    await (prisma as any)[model].delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
