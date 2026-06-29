import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

const ROLES = ['ADMIN', 'DISTRIBUTOR', 'CUSTOMER']

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  try {
    const { id } = await params
    const { role } = await req.json()
    if (!ROLES.includes(role)) return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    // Prevent removing the last admin
    if (role !== 'ADMIN') {
      const target = await prisma.user.findUnique({ where: { id }, select: { role: true } })
      if (target?.role === 'ADMIN') {
        const admins = await prisma.user.count({ where: { role: 'ADMIN' } })
        if (admins <= 1) return NextResponse.json({ error: 'Cannot demote the last admin' }, { status: 400 })
      }
    }
    const user = await prisma.user.update({ where: { id }, data: { role }, select: { id: true, role: true } })
    return NextResponse.json({ user })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
