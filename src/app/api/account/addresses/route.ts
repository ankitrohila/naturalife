import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const addresses = await prisma.address.findMany({ where: { userId: session.user.id! }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ addresses })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()

  if (body.isDefault) {
    await prisma.address.updateMany({ where: { userId: session.user.id! }, data: { isDefault: false } })
  }

  const address = await prisma.address.create({
    data: {
      userId: session.user.id!,
      line1: body.line1,
      line2: body.line2 || null,
      city: body.city,
      state: body.state,
      pincode: body.pincode,
      country: body.country || 'India',
      phone: body.phone,
      whatsappNumber: body.whatsappNumber || null,
      isDefault: !!body.isDefault,
    },
  })
  return NextResponse.json({ address })
}

// Live data endpoint — never prerender at build time.
export const dynamic = 'force-dynamic'
