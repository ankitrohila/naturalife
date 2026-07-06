import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { sendWhatsAppMessage } from '@/lib/whatsapp'
import nodemailer from 'nodemailer'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'MASTER_ADMIN'].includes((session.user as any).role)) return null
  return session
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
})

function generateCouponCode(): string {
  return `SAVE${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const body = await req.json()
  const { discountPercent = 10, expiresInDays = 7, channel = 'email' } = body

  const cart = await prisma.abandonedCart.findUnique({
    where: { id },
    include: { user: true },
  })
  if (!cart) return NextResponse.json({ error: 'Cart not found' }, { status: 404 })

  const code = generateCouponCode()
  const validFrom = new Date()
  const validUntil = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)

  const coupon = await prisma.coupon.create({
    data: {
      code,
      type: 'PERCENT',
      value: discountPercent,
      validFrom,
      validUntil,
      usageLimit: 1,
      isActive: true,
    },
  })

  const message = `Hi ${cart.user.name}, you left items in your cart! Use code ${code} for ${discountPercent}% off. Valid until ${validUntil.toLocaleDateString('en-IN')}. Shop now at Naturalife!`

  if (channel === 'whatsapp') {
    const phone = cart.user.whatsappNumber || cart.user.primaryPhone
    await sendWhatsAppMessage({ to: phone, message, event: 'INVOICE' }).catch(() => {})
  } else {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: cart.user.primaryEmail,
      subject: `Here's ${discountPercent}% off your cart!`,
      html: `<p>${message}</p>`,
    }).catch(() => {})
  }

  return NextResponse.json({ coupon })
}
