import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import nodemailer from 'nodemailer'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'MASTER_ADMIN'].includes((session.user as any).role))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { host, port, user, pass, from } = await req.json()
  if (!host || !user || !pass) return NextResponse.json({ error: 'host, user, pass required' }, { status: 400 })

  try {
    const transporter = nodemailer.createTransport({
      host, port: parseInt(port ?? '587'), secure: parseInt(port ?? '587') === 465,
      auth: { user, pass },
    })
    await transporter.verify()
    await transporter.sendMail({
      from: from || user,
      to: user,
      subject: 'Naturalife — SMTP Test',
      text: 'This is a test email from Naturalife admin settings. SMTP is configured correctly.',
      html: '<p>This is a test email from <strong>Naturalife</strong> admin settings. SMTP is configured correctly.</p>',
    })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 400 })
  }
}
