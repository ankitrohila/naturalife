import { prisma } from '@/lib/prisma'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import Link from 'next/link'

export default async function AdminCustomersPage({ searchParams }: { searchParams: Promise<{ search?: string; page?: string }> }) {
  const sp = await searchParams
  const page = parseInt(sp.page ?? '1')
  const limit = 20

  const where: any = { role: 'CUSTOMER' }
  if (sp.search) {
    where.OR = [
      { name: { contains: sp.search, mode: 'insensitive' } },
      { primaryEmail: { contains: sp.search, mode: 'insensitive' } },
      { primaryPhone: { contains: sp.search, mode: 'insensitive' } },
    ]
  }

  const [total, customers] = await Promise.all([
    prisma.user.count({ where }).catch(() => 0),
    prisma.user.findMany({
      where,
      include: {
        _count: { select: { orders: true } },
        coinLedger: { select: { coins: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }).catch(() => []),
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#F6F6F6' }}>
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
              <p className="text-sm text-gray-500 mt-1">{total} registered customers</p>
            </div>
          </div>

          <form method="get" className="mb-6 flex gap-3">
            <input type="text" name="search" defaultValue={sp.search} placeholder="Search by name, email or phone..." className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none max-w-sm" />
            <button type="submit" className="px-4 py-2 text-white rounded-lg text-sm font-medium" style={{ backgroundColor: 'var(--green)' }}>Search</button>
            {sp.search && <Link href="/admin/customers" className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Clear</Link>}
          </form>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead style={{ backgroundColor: '#F6F6F6' }}>
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">#</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Customer</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Phone</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Orders</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Coins</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Joined</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {customers.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-gray-400">No customers found</td></tr>
                ) : customers.map((c, i) => {
                  const coins = c.coinLedger.reduce((sum: number, l: { coins: number }) => sum + l.coins, 0)
                  return (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-400">{(page - 1) * limit + i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: 'var(--green)' }}>
                            {(c.name ?? c.primaryEmail)[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{c.name ?? '—'}</p>
                            <p className="text-xs text-gray-400">{c.primaryEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{c.primaryPhone ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold" style={{ color: 'var(--green)' }}>{c._count.orders}</span>
                      </td>
                      <td className="px-4 py-3 text-[var(--ink-soft)] font-medium">{coins} coins</td>
                      <td className="px-4 py-3 text-gray-400">{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/orders?userId=${c.id}`} className="text-xs px-2 py-1 rounded text-white" style={{ backgroundColor: 'var(--green)' }}>
                          View Orders
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex gap-2 justify-center mt-6">
              {[...Array(totalPages)].map((_, i) => (
                <Link key={i} href={`/admin/customers?page=${i + 1}${sp.search ? `&search=${sp.search}` : ''}`}
                  className="px-3 py-1.5 rounded-lg text-sm border transition-colors"
                  style={page === i + 1 ? { backgroundColor: 'var(--green)', color: 'white', borderColor: 'var(--green)' } : { borderColor: '#d1d5db' }}>
                  {i + 1}
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
