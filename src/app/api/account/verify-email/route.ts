import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
})

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// POST — request a new OTP to be emailed
export async function POST() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: session.user.id! } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  if (user.emailVerified) return NextResponse.json({ error: 'Already verified' }, { status: 400 })

  const otp = generateOtp()
  await prisma.otpToken.deleteMany({ where: { identifier: user.primaryEmail } })
  await prisma.otpToken.create({
    data: { identifier: user.primaryEmail, token: otp, expires: new Date(Date.now() + 10 * 60 * 1000) },
  })

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: user.primaryEmail,
    subject: 'Verify your Naturalife account',
    html: `<p>Your verification code is <strong>${otp}</strong>. It expires in 10 minutes.</p>`,
  }).catch((err) => console.error('OTP email send failed:', err))

  return NextResponse.json({ sent: true })
}

// PATCH — confirm the OTP
export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { code } = await req.json()
  const user = await prisma.user.findUnique({ where: { id: session.user.id! } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const record = await prisma.otpToken.findFirst({
    where: { identifier: user.primaryEmail, token: code, expires: { gte: new Date() } },
  })
  if (!record) return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 })

  await prisma.user.update({ where: { id: user.id }, data: { emailVerified: new Date() } })
  await prisma.otpToken.deleteMany({ where: { identifier: user.primaryEmail } })

  return NextResponse.json({ verified: true })
}
