import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.formData()
    await prisma.contactEnquiry.create({
      data: {
        name: body.get('name') as string,
        email: body.get('email') as string,
        phone: body.get('phone') as string | undefined ?? undefined,
        subject: body.get('subject') as string | undefined ?? undefined,
        message: body.get('message') as string,
      },
    })
    return NextResponse.redirect(new URL('/contact?sent=1', req.url))
  } catch {
    return NextResponse.redirect(new URL('/contact?error=1', req.url))
  }
}
