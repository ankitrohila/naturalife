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
  const settings = await prisma.siteSettings.findMany()
  const map: Record<string, any> = {}
  for (const s of settings) map[s.key] = s.value
  return NextResponse.json(map)
}

export async function POST(req: NextRequest) {
  if (!await adminCheck()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { key, value } = await req.json()
  if (!key) return NextResponse.json({ error: 'key required' }, { status: 400 })
  await prisma.siteSettings.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  })
  return NextResponse.json({ ok: true })
}
