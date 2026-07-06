import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { hash, compare } from 'bcryptjs'

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const user = await prisma.user.findUnique({ where: { id: session.user.id! } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const data: any = {}
  if (body.name) data.name = body.name
  if (body.whatsappNumber !== undefined) data.whatsappNumber = body.whatsappNumber || null

  if (body.newPassword) {
    if (!body.currentPassword || !user.password) {
      return NextResponse.json({ error: 'Current password is required' }, { status: 400 })
    }
    const valid = await compare(body.currentPassword, user.password)
    if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    data.password = await hash(body.newPassword, 12)
  }

  const updated = await prisma.user.update({ where: { id: user.id }, data })
  return NextResponse.json({ user: { name: updated.name, whatsappNumber: updated.whatsappNumber } })
}
