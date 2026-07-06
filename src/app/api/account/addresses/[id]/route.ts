import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

async function ownsAddress(userId: string, id: string) {
  const addr = await prisma.address.findUnique({ where: { id } })
  return addr?.userId === userId ? addr : null
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const existing = await ownsAddress(session.user.id!, id)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  if (body.isDefault) {
    await prisma.address.updateMany({ where: { userId: session.user.id! }, data: { isDefault: false } })
  }

  const address = await prisma.address.update({
    where: { id },
    data: {
      ...(body.line1 !== undefined && { line1: body.line1 }),
      ...(body.line2 !== undefined && { line2: body.line2 || null }),
      ...(body.city !== undefined && { city: body.city }),
      ...(body.state !== undefined && { state: body.state }),
      ...(body.pincode !== undefined && { pincode: body.pincode }),
      ...(body.phone !== undefined && { phone: body.phone }),
      ...(body.isDefault !== undefined && { isDefault: body.isDefault }),
    },
  })
  return NextResponse.json({ address })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const existing = await ownsAddress(session.user.id!, id)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.address.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
