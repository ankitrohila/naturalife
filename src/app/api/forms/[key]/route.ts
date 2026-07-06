import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params
  const form = await prisma.formDefinition.findUnique({ where: { key } })
  if (!form || !form.isActive) return NextResponse.json({ error: 'Form not found' }, { status: 404 })
  return NextResponse.json(form)
}
