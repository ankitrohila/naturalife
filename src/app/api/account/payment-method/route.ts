import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { id: session.user.id! }, select: { preferredPaymentMethod: true } })
  return NextResponse.json({ preferredPaymentMethod: user?.preferredPaymentMethod ?? null })
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const allowed = ['COD', 'CARD', 'UPI', 'NETBANKING']
  if (!allowed.includes(body.preferredPaymentMethod)) {
    return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 })
  }
  await prisma.user.update({
    where: { id: session.user.id! },
    data: { preferredPaymentMethod: body.preferredPaymentMethod },
  })
  return NextResponse.json({ ok: true })
}

// Live data endpoint — never prerender at build time.
export const dynamic = 'force-dynamic'
