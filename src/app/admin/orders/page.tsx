import { prisma } from '@/lib/prisma'
import Link from 'next/link'

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

  const statusColors: Record<string, string> = {
    PLACED: '#f59e0b', CONFIRMED: '#3b82f6', PACKED: '#8b5cf6',
    DISPATCHED: '#06b6d4', DELIVERED: '#16a34a', CANCELLED: '#ef4444',
    RETURN_REQUESTED: '#f97316', RETURNED: '#9ca3af', REFUNDED: '#6b7280',
  }

  const statusList = ['PLACED', 'CONFIRMED', 'PACKED', 'DISPATCHED', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED', 'RETURNED', 'REFUNDED']

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500">{total} total orders</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5 flex flex-wrap gap-3 shadow-sm">
        <form className="flex flex-wrap gap-3 w-full">
          {sp.status && <input type="hidden" name="status" value={sp.status} />}
          {sp.type && <input type="hidden" name="type" value={sp.type} />}
          <input name="search" defaultValue={sp.search} placeholder="Search order number..." className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-40" />
          <select name="status" defaultValue={sp.status ?? ''} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">All Statuses</option>
            {statusList.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select name="type" defaultValue={sp.type ?? ''} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">All Types</option>
            <option value="RETAIL">Retail</option>
            <option value="WHOLESALE">Wholesale</option>
          </select>
          <button type="submit" className="px-4 py-2 text-sm text-white rounded-lg font-medium" style={{ backgroundColor: 'var(--saffron)' }}>Filter</button>
          <Link href="/admin/orders" className="px-4 py-2 text-sm border border-gray-300 rounded-lg font-medium text-gray-600 hover:bg-gray-50">Clear</Link>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Order #', 'Customer', 'Type', 'Total', 'Payment', 'Status', 'Date', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400 text-sm">No orders found</td></tr>
            ) : orders.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono font-medium text-gray-800">{o.orderNumber}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-800">{o.user.name}</p>
                  <p className="text-xs text-gray-500">{o.user.primaryEmail}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${o.orderType === 'WHOLESALE' ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-600'}`}>
                    {o.orderType}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold">₹{Number(o.total).toLocaleString('en-IN')}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${o.paymentStatus === 'PAID' ? 'bg-green-50 text-green-700' : o.paymentStatus === 'PENDING' ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-50 text-gray-600'}`}>
                    {o.paymentStatus}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: statusColors[o.status] ?? '#9ca3af' }}>
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${o.id}`} className="text-xs font-medium hover:underline" style={{ color: 'var(--saffron)' }}>View →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {Math.ceil(total / limit) > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
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
    </div>
  )
}
