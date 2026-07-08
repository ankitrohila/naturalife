import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

async function adminCheck() {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'MASTER_ADMIN'].includes((session.user as any).role)) return false
  return true
}

export async function GET() {
  if (!await adminCheck()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const partners = await prisma.shippingPartner.findMany()
  return NextResponse.json(partners.map(p => ({
    ...p,
    apiKey: p.apiKey ? '••••••••' : '',
    apiSecret: p.apiSecret ? '••••••••' : '',
  })))
}

export async function POST(req: NextRequest) {
  if (!await adminCheck()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { name, label, isEnabled, apiKey, apiSecret, webhookUrl, extra } = body

  const existing = await prisma.shippingPartner.findUnique({ where: { name } })
  const data = {
    name, label, isEnabled,
    apiKey: apiKey === '••••••••' ? (existing?.apiKey ?? '') : (apiKey ?? ''),
    apiSecret: apiSecret === '••••••••' ? (existing?.apiSecret ?? '') : (apiSecret ?? ''),
    webhookUrl: webhookUrl ?? '',
    extra: extra ?? null,
  }

  await prisma.shippingPartner.upsert({
    where: { name },
    update: data,
    create: data,
  })
  return NextResponse.json({ ok: true })
}
