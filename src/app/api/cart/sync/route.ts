import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { items, totalValue, itemCount } = body

  if (!items || items.length === 0) {
    await prisma.abandonedCart.deleteMany({ where: { userId: session.user.id!, isRecovered: false } })
    return NextResponse.json({ success: true })
  }

  const existing = await prisma.abandonedCart.findFirst({
    where: { userId: session.user.id!, isRecovered: false },
  })

  if (existing) {
    await prisma.abandonedCart.update({
      where: { id: existing.id },
      data: { items, totalValue, itemCount },
    })
  } else {
    await prisma.abandonedCart.create({
      data: { userId: session.user.id!, items, totalValue, itemCount },
    })
  }

  return NextResponse.json({ success: true })
}
