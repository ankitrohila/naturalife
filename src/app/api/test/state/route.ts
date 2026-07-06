import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'MASTER_ADMIN'].includes((session.user as any).role)) return null
  return session
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const notifMode = await prisma.siteSettings.findUnique({ where: { key: 'notification_mode' } }).catch(() => null)
  const mode = (notifMode?.value as any)?.mode ?? 'TEST'

  const logs = await prisma.notificationLog.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }).catch(() => [])

  return NextResponse.json({
    mode,
    testEmail: process.env.NOTIFICATION_TEST_EMAIL ?? 'not configured',
    testWA: process.env.NOTIFICATION_TEST_WHATSAPP ?? 'not configured',
    logs,
  })
}
