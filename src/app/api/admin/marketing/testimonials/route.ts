import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

async function requireAdmin() {
  const session = await auth()
  return !!session?.user && (session.user as any).role === 'ADMIN'
}

export async function GET() {
  const testimonials = await prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' } }).catch(() => [])
  return NextResponse.json({ testimonials })
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  try {
    const { name, location, rating, text } = await req.json()
    if (!name || !text) return NextResponse.json({ error: 'Name and review text required' }, { status: 400 })
    const testimonial = await prisma.testimonial.create({
      data: { name, location: location || null, rating: rating ? parseInt(rating) : 5, text, isVisible: true },
    })
    return NextResponse.json({ testimonial })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
