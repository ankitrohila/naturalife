import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

async function requireAdmin() {
  const session = await auth()
  return !!session?.user && (session.user as any).role === 'ADMIN'
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  try {
    const { id } = await params
    const { isVisible, name, location, rating, text } = await req.json()
    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        ...(isVisible !== undefined && { isVisible }),
        ...(name !== undefined && { name }),
        ...(location !== undefined && { location: location || null }),
        ...(rating !== undefined && { rating: parseInt(rating) }),
        ...(text !== undefined && { text }),
      },
    })
    return NextResponse.json({ testimonial })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  try {
    const { id } = await params
    await prisma.testimonial.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
