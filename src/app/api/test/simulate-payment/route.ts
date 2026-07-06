import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createTestOrder } from '@/lib/testOrders'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'MASTER_ADMIN'].includes((session.user as any).role)) return null
  return session
}

export async function POST(req: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json().catch(() => ({}))
  const method = body.method as 'UPI' | 'CARD' | 'COD'

  try {
    if (method === 'COD') {
      const order = await createTestOrder({ userId: session.user!.id!, orderType: 'RETAIL', paymentMethod: 'COD', paymentStatus: 'COD' })
      return NextResponse.json({ order, result: 'COD order placed' })
    }

    // Simulate the same 90/10 UPI/Card settlement odds used at real checkout
    const success = Math.random() < 0.9
    const order = await createTestOrder({
      userId: session.user!.id!,
      orderType: 'RETAIL',
      paymentMethod: 'RAZORPAY',
      paymentStatus: success ? 'PAID' : 'FAILED',
    })
    return NextResponse.json({ order, result: success ? `${method} payment succeeded` : `${method} payment failed (simulated decline)` })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
