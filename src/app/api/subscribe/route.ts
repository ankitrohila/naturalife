import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.formData()
    const email = body.get('email') as string
    if (!email) return NextResponse.redirect(new URL('/?subscribed=error', req.url))

    await prisma.emailSubscription.upsert({
      where: { email },
      update: { isActive: true },
      create: { email, isActive: true },
    })

    return NextResponse.redirect(new URL('/?subscribed=1', req.url))
  } catch {
    return NextResponse.redirect(new URL('/?subscribed=error', req.url))
  }
}
