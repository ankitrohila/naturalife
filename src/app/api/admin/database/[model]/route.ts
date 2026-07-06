import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { isAllowedModel, stripSensitive } from '@/lib/dbManagerModels'

async function requireMasterAdmin() {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'MASTER_ADMIN') return null
  return session
}

export async function GET(req: Request, { params }: { params: Promise<{ model: string }> }) {
  if (!(await requireMasterAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { model } = await params
  if (!isAllowedModel(model)) return NextResponse.json({ error: 'Model not allowed' }, { status: 400 })

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = 25

  const [total, rows] = await Promise.all([
    (prisma as any)[model].count(),
    (prisma as any)[model].findMany({ take: limit, skip: (page - 1) * limit, orderBy: { id: 'desc' } }).catch(() =>
      (prisma as any)[model].findMany({ take: limit, skip: (page - 1) * limit })
    ),
  ])

  return NextResponse.json({
    rows: rows.map((r: any) => stripSensitive(model, r)),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  })
}

// POST — create a new row from a controlled JSON body (no raw SQL)
export async function POST(req: Request, { params }: { params: Promise<{ model: string }> }) {
  if (!(await requireMasterAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { model } = await params
  if (!isAllowedModel(model)) return NextResponse.json({ error: 'Model not allowed' }, { status: 400 })

  const body = await req.json()
  try {
    const created = await (prisma as any)[model].create({ data: body })
    return NextResponse.json({ row: stripSensitive(model, created) })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
