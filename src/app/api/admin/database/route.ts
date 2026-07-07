import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { DB_MANAGER_MODELS } from '@/lib/dbManagerModels'

async function requireMasterAdmin() {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'MASTER_ADMIN') return null
  return session
}

// GET — list allow-listed models with row counts (Master Admin only)
export async function GET() {
  if (!(await requireMasterAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const results = await Promise.all(
    Object.entries(DB_MANAGER_MODELS).map(async ([key, cfg]) => {
      const count = await (prisma as any)[key].count().catch(() => 0)
      return { key, label: cfg.label, count }
    })
  )

  return NextResponse.json({ models: results })
}

// Live data endpoint — never prerender at build time.
export const dynamic = 'force-dynamic'
