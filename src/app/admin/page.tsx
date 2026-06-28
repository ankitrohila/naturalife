import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const metadata = { title: 'Admin Dashboard' }

export default async function AdminDashboard() {
  const [orderCount, productCount, customerCount, recentOrders, lowStockVariants] = await Promise.all([
    prisma.order.count().catch(() => 0),
    prisma.product.count({ where: { status: 'ACTIVE' } }).catch(() => 0),
    prisma.user.count({ where: { role: 'CUSTOMER' } }).catch(() => 0),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, primaryEmail: true } } },
    }).catch(() => []),
    prisma.productVariant.findMany({
      where: { stock: { lte: 5 } },
      include: { product: { select: { name: true } } },
      take: 5,
    }).catch(() => []),
  ])

  const todayStart = new Date(); todayStart.setHours(0,0,0,0)
  const todayOrders = await prisma.order.count({ where: { createdAt: { gte: todayStart } } }).catch(() => 0)
  const todayRevenue = await prisma.order.aggregate({
    where: { createdAt: { gte: todayStart }, paymentStatus: { in: ['PAID', 'COD'] } },
    _sum: { total: true },
  }).catch(() => ({ _sum: { total: 0 } }))

  const stats = [
    { label: "Today's Orders", value: todayOrders, href: '/admin/orders' },
    { label: "Today's Revenue", value: `₹${Number(todayRevenue._sum.total ?? 0).toLocaleString('en-IN')}`, href: '/admin/orders' },
    { label: 'Active Products', value: productCount, href: '/admin/products' },
    { label: 'Total Customers', value: customerCount, href: '/admin/customers' },
  ]

  const statusColors: Record<string, string> = {
    PLACED: '#f59e0b', CONFIRMED: '#3b82f6', PACKED: '#8b5cf6',
    DISPATCHED: '#06b6d4', DELIVERED: '#16a34a', CANCELLED: '#ef4444',
    RETURN_REQUESTED: '#f97316', RETURNED: '#9ca3af', REFUNDED: '#6b7280',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back! Here&apos;s what&apos;s happening today.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/products/new" className="px-4 py-2 text-sm text-white rounded-lg font-medium" style={{ backgroundColor: 'var(--green)' }}>
            Add Product
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="bg-white rounded-xl p-5 border border-[var(--line)] shadow-sm hover:shadow-md transition-shadow">
            <p className="text-2xl font-semibold text-[var(--ink)]">{s.value}</p>
            <p className="text-xs text-[var(--ink-soft)] mt-1">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs font-medium" style={{ color: 'var(--green)' }}>View all →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentOrders.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-gray-400">No orders yet</p>
            ) : recentOrders.map((o) => (
              <Link key={o.id} href={`/admin/orders/${o.id}`} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{o.orderNumber}</p>
                  <p className="text-xs text-gray-500 truncate">{o.user.name} · {o.user.primaryEmail}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-gray-900">₹{Number(o.total).toLocaleString('en-IN')}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: statusColors[o.status] ?? '#9ca3af' }}>
                    {o.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Low stock */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">Low Stock</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {lowStockVariants.length === 0 ? (
                <p className="px-5 py-6 text-center text-sm text-gray-400">All products well stocked</p>
              ) : lowStockVariants.map((v) => (
                <div key={v.id} className="px-5 py-3">
                  <p className="text-sm font-medium text-gray-800">{v.product.name}</p>
                  <p className="text-xs text-red-500 mt-0.5">{v.stock} units remaining · SKU: {v.sku}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-1">
              {[
                { label: 'Add New Product', href: '/admin/products/new' },
                { label: 'View All Orders', href: '/admin/orders' },
                { label: 'Manage Coupons', href: '/admin/coupons' },
                { label: 'Upload Media', href: '/admin/media' },
                { label: 'Test Notifications', href: '/admin/test-env' },
              ].map((a) => (
                <Link key={a.href} href={a.href} className="block text-sm text-[var(--ink-soft)] hover:text-[var(--ink)] py-1.5 rounded-lg hover:bg-[var(--surface)] px-2 -mx-2 transition-colors">
                  {a.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Global stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        {[
          { label: 'Total Orders', value: orderCount },
          { label: 'Active Products', value: productCount },
          { label: 'Total Customers', value: customerCount },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 text-center shadow-sm">
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
