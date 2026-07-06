import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'You must be logged in to post a review.' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id! }, select: { emailVerified: true, name: true, primaryEmail: true } })
    if (!user?.emailVerified) {
      return NextResponse.json({ error: 'Only verified accounts can post reviews. Please verify your email first.' }, { status: 403 })
    }

    const { productId, rating, text } = await req.json()
    if (!productId || !text) return NextResponse.json({ error: 'Review text is required' }, { status: 400 })
    const review = await prisma.review.create({
      data: {
        productId,
        name: user.name,
        email: user.primaryEmail,
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
