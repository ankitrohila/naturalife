import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'MASTER_ADMIN'].includes((session.user as any).role)) return null
  return session
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json().catch(() => ({}))
  const mode = body.mode === 'LIVE' ? 'LIVE' : 'TEST'

  await prisma.siteSettings.upsert({
    where: { key: 'notification_mode' },
    create: { key: 'notification_mode', value: { mode } },
    update: { value: { mode } },
  })

  return NextResponse.json({ ok: true, mode })
}
