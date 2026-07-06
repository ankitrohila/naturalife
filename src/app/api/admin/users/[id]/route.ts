import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

const ROLES = ['ADMIN', 'DISTRIBUTOR', 'CUSTOMER']

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'MASTER_ADMIN'].includes((session.user as any).role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  try {
    const { id } = await params
    const body = await req.json()

    // Role change
    if (body.role !== undefined) {
      if (!ROLES.includes(body.role)) return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
      // Prevent removing the last admin
      if (body.role !== 'ADMIN') {
        const target = await prisma.user.findUnique({ where: { id }, select: { role: true } })
        if (target?.role === 'ADMIN') {
          const admins = await prisma.user.count({ where: { role: 'ADMIN' } })
          if (admins <= 1) return NextResponse.json({ error: 'Cannot demote the last admin' }, { status: 400 })
        }
      }
      const user = await prisma.user.update({ where: { id }, data: { role: body.role }, select: { id: true, role: true } })
      return NextResponse.json({ user })
    }

    // Profile edit (name / email / phone)
    const data: any = {}
    if (body.name !== undefined) data.name = body.name
    if (body.primaryEmail !== undefined) data.primaryEmail = body.primaryEmail
    if (body.primaryPhone !== undefined) data.primaryPhone = body.primaryPhone
    if (Object.keys(data).length === 0) return NextResponse.json({ error: 'No fields to update' }, { status: 400 })

    const user = await prisma.user.update({ where: { id }, data, select: { id: true, name: true, primaryEmail: true, primaryPhone: true } })
    return NextResponse.json({ user })
  } catch (err: any) {
    if (err.code === 'P2002') return NextResponse.json({ error: 'Email or phone already in use by another account' }, { status: 400 })
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'MASTER_ADMIN'].includes((session.user as any).role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params

  if (id === session.user.id) {
    return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 })
  }

  const target = await prisma.user.findUnique({ where: { id }, select: { role: true } })
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  if (target.role === 'ADMIN') {
    const admins = await prisma.user.count({ where: { role: 'ADMIN' } })
    if (admins <= 1) return NextResponse.json({ error: 'Cannot delete the last admin' }, { status: 400 })
  }

  try {
    await prisma.$transaction(async (tx) => {
      const orders = await tx.order.findMany({ where: { userId: id }, select: { id: true } })
      const orderIds = orders.map((o) => o.id)
      if (orderIds.length > 0) {
        await tx.userCouponUsage.deleteMany({ where: { orderId: { in: orderIds } } })
        await tx.coinLedger.updateMany({ where: { orderId: { in: orderIds } }, data: { orderId: null } })
        await tx.order.deleteMany({ where: { id: { in: orderIds } } })
      }
      await tx.userCouponUsage.deleteMany({ where: { userId: id } })
      await tx.coinLedger.deleteMany({ where: { userId: id } })

      const distributor = await tx.distributor.findUnique({ where: { userId: id }, select: { id: true } })
      if (distributor) {
        await tx.order.updateMany({ where: { assignedDistributorId: distributor.id }, data: { assignedDistributorId: null } })
        await tx.statePincode.deleteMany({ where: { distributorId: distributor.id } })
        await tx.distributor.delete({ where: { id: distributor.id } })
      }

      await tx.user.delete({ where: { id } })
    })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Failed to delete user' }, { status: 500 })
  }
}
