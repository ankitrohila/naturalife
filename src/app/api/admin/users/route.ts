import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { hash } from 'bcryptjs'

const ROLES = ['ADMIN', 'DISTRIBUTOR', 'CUSTOMER']

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  try {
    const { name, email, phone, password, role } = await req.json()
    if (!name || !email || !phone || !password) return NextResponse.json({ error: 'Name, email, phone and password are required' }, { status: 400 })
    if (role && !ROLES.includes(role)) return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    const dupe = await prisma.user.findFirst({ where: { OR: [{ primaryEmail: email }, { primaryPhone: phone }] } })
    if (dupe) return NextResponse.json({ error: 'A user with this email or phone already exists' }, { status: 400 })
    const user = await prisma.user.create({
      data: { name, primaryEmail: email, primaryPhone: phone, password: await hash(password, 12), role: role ?? 'CUSTOMER' },
      select: { id: true, name: true, primaryEmail: true, primaryPhone: true, role: true },
    })
    return NextResponse.json({ user })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const url = new URL(req.url)
  const q = url.searchParams.get('q')?.trim()
  const where = q ? { OR: [{ name: { contains: q, mode: 'insensitive' as const } }, { primaryEmail: { contains: q, mode: 'insensitive' as const } }, { primaryPhone: { contains: q } }] } : {}
  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: { id: true, name: true, primaryEmail: true, primaryPhone: true, role: true, createdAt: true, _count: { select: { orders: true } } },
  }).catch(() => [])
  return NextResponse.json({ users })
}
