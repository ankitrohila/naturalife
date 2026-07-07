import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'MASTER_ADMIN'].includes((session.user as any).role)) return null
  return session
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const [logs, total, unmatchedCount] = await Promise.all([
    prisma.chatLog.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
    prisma.chatLog.count(),
    prisma.chatLog.count({ where: { matchedFaqId: null } }),
  ])

  // Most common queries (rough grouping by first 3 words)
  const freqMap: Record<string, number> = {}
  for (const l of logs) {
    const key = l.userMessage.toLowerCase().split(/\s+/).slice(0, 4).join(' ')
    freqMap[key] = (freqMap[key] ?? 0) + 1
  }
  const topQueries = Object.entries(freqMap).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([q, c]) => ({ query: q, count: c }))

  return NextResponse.json({
    logs,
    total,
    unmatchedCount,
    matchRate: total > 0 ? Math.round(((total - unmatchedCount) / total) * 100) : 0,
    topQueries,
  })
}

// Live data endpoint — never prerender at build time.
export const dynamic = 'force-dynamic'
