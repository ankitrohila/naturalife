import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createTestOrder } from '@/lib/testOrders'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'MASTER_ADMIN'].includes((session.user as any).role)) return null
  return session
}

export async function POST() {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const order = await createTestOrder({ userId: session.user!.id!, orderType: 'WHOLESALE', paymentMethod: 'COD', paymentStatus: 'COD' })
    return NextResponse.json({ order })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
