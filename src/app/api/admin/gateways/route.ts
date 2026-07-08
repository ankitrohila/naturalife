import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

async function adminCheck() {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'MASTER_ADMIN'].includes((session.user as any).role))
    return false
  return true
}

export async function GET() {
  if (!await adminCheck()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const gateways = await prisma.gatewayConfig.findMany()
  // mask secrets in response
  return NextResponse.json(gateways.map(g => ({
    ...g,
    testSecret: g.testSecret ? '••••••••' : '',
    liveSecret: g.liveSecret ? '••••••••' : '',
  })))
}

export async function POST(req: NextRequest) {
  if (!await adminCheck()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { provider, label, isEnabled, isTestMode, testKeyId, testSecret, liveKeyId, liveSecret, extra } = body

  // Don't overwrite secret if masked
  const existing = await prisma.gatewayConfig.findUnique({ where: { provider } })
  const data = {
    provider, label, isEnabled, isTestMode,
    testKeyId: testKeyId ?? '',
    testSecret: testSecret === '••••••••' ? (existing?.testSecret ?? '') : (testSecret ?? ''),
    liveKeyId: liveKeyId ?? '',
    liveSecret: liveSecret === '••••••••' ? (existing?.liveSecret ?? '') : (liveSecret ?? ''),
    extra: extra ?? null,
  }

  await prisma.gatewayConfig.upsert({
    where: { provider },
    update: data,
    create: data,
  })
  return NextResponse.json({ ok: true })
}
