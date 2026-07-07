import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const coupons = await prisma.coupon.findMany({ orderBy: { validFrom: 'desc' } }).catch(() => [])
  return NextResponse.json({ coupons })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const coupon = await prisma.coupon.create({
      data: {
        code: body.code,
        type: body.discountType === 'FLAT' ? 'FLAT' : 'PERCENT',
        value: body.discountValue,
        minOrderValue: body.minOrderValue ?? null,
        maxDiscount: null,
        validFrom: new Date(),
        validUntil: body.expiresAt ? new Date(body.expiresAt) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        usageLimit: body.maxUses ?? null,
        isActive: true,
      },
    })
    return NextResponse.json({ coupon })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, isActive } = await req.json()
    const coupon = await prisma.coupon.update({ where: { id }, data: { isActive } })
    return NextResponse.json({ coupon })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// Live data endpoint — never prerender at build time.
export const dynamic = 'force-dynamic'
