import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(8),
  preferredLanguage: z.enum(['EN', 'HI', 'BN', 'TA', 'TE', 'MR', 'GU']).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = schema.parse(body)

    const existingEmail = await prisma.user.findUnique({ where: { primaryEmail: data.email } })
    if (existingEmail) return NextResponse.json({ error: 'Email already registered' }, { status: 400 })

    const existingPhone = await prisma.user.findUnique({ where: { primaryPhone: data.phone } })
    if (existingPhone) return NextResponse.json({ error: 'Phone already registered' }, { status: 400 })

    const hashedPassword = await hash(data.password, 12)
    const user = await prisma.user.create({
      data: {
        name: data.name,
        primaryEmail: data.email,
        primaryPhone: data.phone,
        password: hashedPassword,
        preferredLanguage: data.preferredLanguage ?? 'HI',
        role: 'CUSTOMER',
      },
    })

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error(error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
