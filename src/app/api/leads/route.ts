import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import nodemailer from 'nodemailer'
import { writeFile } from 'fs/promises'
import path from 'path'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
})

export async function POST(req: Request) {
  const formData = await req.formData()
  const formKey = formData.get('formKey') as string
  if (!formKey) return NextResponse.json({ error: 'Missing formKey' }, { status: 400 })

  const form = await prisma.formDefinition.findUnique({ where: { key: formKey } })
  if (!form || !form.isActive) return NextResponse.json({ error: 'Form not found' }, { status: 404 })

  const fields = form.fields as any[]
  const data: Record<string, string> = {}
  for (const f of fields) {
    const val = formData.get(f.name)
    if (val) data[f.name] = String(val)
  }

  let imageUrl: string | null = null
  const file = formData.get('image') as File | null
  if (file && file.size > 0) {
    const buffer = Buffer.from(await file.arrayBuffer())
    const ext = file.name.split('.').pop() || 'jpg'
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const filepath = path.join(process.cwd(), 'public', 'uploads', 'leads', filename)
    await writeFile(filepath, buffer)
    imageUrl = `/uploads/leads/${filename}`
  }

  const lead = await prisma.lead.create({
    data: {
      formKey,
      name: data.name || 'Unknown',
      email: data.email || null,
      phone: data.phone || null,
      data,
      imageUrl,
      status: 'NEW',
    },
  })

  // Notify admin — non-blocking
  transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: process.env.ADMIN_EMAIL,
    subject: `New ${form.name} submission from ${lead.name}`,
    html: `<p>New submission for <strong>${form.name}</strong></p><pre>${JSON.stringify(data, null, 2)}</pre>${imageUrl ? `<p>Image: ${imageUrl}</p>` : ''}`,
  }).catch((err) => console.error('Lead notification email failed:', err))

  // Auto-acknowledge customer — non-blocking
  if (lead.email) {
    transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: lead.email,
      subject: `We've received your ${form.name.toLowerCase()}`,
      html: `<p>Hi ${lead.name},</p><p>Thanks for reaching out — we've received your submission and will get back to you shortly.</p>`,
    }).catch((err) => console.error('Lead ack email failed:', err))
  }

  return NextResponse.json({ lead })
}
