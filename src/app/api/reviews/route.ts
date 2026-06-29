import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { productId, name, email, rating, text } = await req.json()
    if (!productId || !name || !text) return NextResponse.json({ error: 'Name and review are required' }, { status: 400 })
    const review = await prisma.review.create({
      data: {
        productId,
        name,
        email: email || null,
        rating: rating ? Math.max(1, Math.min(5, parseInt(rating))) : 5,
        text,
        isApproved: false, // held for admin moderation
      },
    })
    return NextResponse.json({ review })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
