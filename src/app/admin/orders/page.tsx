import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { OrdersTable } from '@/components/admin/OrdersTable'

export const metadata = { title: 'Orders — Admin' }

interface SP { status?: string; type?: string; page?: string; search?: string }

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams
  const page = parseInt(sp.page ?? '1')
  const limit = 20

  const where: any = {}
  if (sp.status) where.status = sp.status
  if (sp.type) where.orderType = sp.type
  if (sp.search) where.orderNumber = { contains: sp.search, mode: 'insensitive' }

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }).catch(() => 0),
    prisma.order.findMany({
      where,
      include: { user: { select: { name: true, primaryEmail: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }).catch(() => []),
  ])

  const statusList = ['PLACED', 'CONFIRMED', 'PACKED', 'DISPATCHED', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED', 'RETURNED', 'REFUNDED']

  const orderRows = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    orderType: o.orderType,
    total: Number(o.total),
    paymentStatus: o.paymentStatus,
    status: o.status,
    createdAt: o.createdAt.toISOString(),
    user: { name: o.user.name, primaryEmail: o.user.primaryEmail },
  }))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500">{total} total orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-none border border-gray-100 p-4 mb-5 flex flex-wrap gap-3 shadow-sm">
        <form className="flex flex-wrap gap-3 w-full">
          {sp.status && <input type="hidden" name="status" value={sp.status} />}
          {sp.type && <input type="hidden" name="type" value={sp.type} />}
          <input name="search" defaultValue={sp.search} placeholder="Search order number..." className="border border-gray-300 rounded-none px-3 py-2 text-sm flex-1 min-w-40" />
          <select name="status" defaultValue={sp.status ?? ''} className="border border-gray-300 rounded-none px-3 py-2 text-sm">
            <option value="">All Statuses</option>
            {statusList.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select name="type" defaultValue={sp.type ?? ''} className="border border-gray-300 rounded-none px-3 py-2 text-sm">
            <option value="">All Types</option>
            <option value="RETAIL">Retail</option>
            <option value="WHOLESALE">Wholesale</option>
          </select>
          <button type="submit" className="px-4 py-2 text-sm text-white rounded-none font-medium" style={{ backgroundColor: 'var(--saffron)' }}>Filter</button>
          <Link href="/admin/orders" className="px-4 py-2 text-sm border border-gray-300 rounded-none font-medium text-gray-600 hover:bg-gray-50">Clear</Link>
        </form>
      </div>

      <OrdersTable orders={orderRows} />

      {/* Pagination */}
      {Math.ceil(total / limit) > 1 && (
        <div className="px-4 py-3 border-t border-gray-100 flex gap-2 bg-white border-x border-b border-gray-100">
          {[...Array(Math.ceil(total / limit))].map((_, i) => (
            <Link
              key={i}
              href={`/admin/orders?page=${i + 1}${sp.status ? `&status=${sp.status}` : ''}${sp.type ? `&type=${sp.type}` : ''}`}
              className="w-8 h-8 flex items-center justify-center rounded text-sm"
              style={page === i + 1 ? { backgroundColor: 'var(--saffron)', color: 'white' } : { color: '#6b7280' }}
            >
              {i + 1}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
