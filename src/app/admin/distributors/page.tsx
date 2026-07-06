import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function AdminDistributorsPage() {
  const distributors = await prisma.distributor.findMany({
    include: {
      user: { select: { name: true, primaryEmail: true, primaryPhone: true, createdAt: true } },
      statePincodes: { select: { stateName: true, stateCode: true } },
      _count: { select: { orders: true } },
    },
    orderBy: { user: { createdAt: 'desc' } },
  }).catch(() => [])

  return (
    <>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Distributors</h1>
              <p className="text-sm text-gray-500 mt-1">{distributors.length} active distributors across India</p>
            </div>
            <Link href="/admin/distributors/new" className="px-4 py-2 text-white rounded-none text-sm font-medium" style={{ backgroundColor: 'var(--green)' }}>
              + Add Distributor
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-none p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-2xl font-bold mt-1" style={{ color: 'var(--green)' }}>{distributors.length}</p>
            </div>
            <div className="bg-white rounded-none p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500">Active</p>
              <p className="text-2xl font-bold mt-1" style={{ color: 'var(--green)' }}>{distributors.filter(d => d.isActive).length}</p>
            </div>
            <div className="bg-white rounded-none p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500">States Covered</p>
              <p className="text-2xl font-bold mt-1" style={{ color: 'var(--green)' }}>{new Set(distributors.flatMap(d => d.statePincodes.map(p => p.stateCode))).size}</p>
            </div>
            <div className="bg-white rounded-none p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold mt-1" style={{ color: 'var(--green)' }}>{distributors.reduce((s, d) => s + d._count.orders, 0)}</p>
            </div>
          </div>

          <div className="bg-white rounded-none shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead style={{ backgroundColor: '#F6F6F6' }}>
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Distributor</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">States</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Orders</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {distributors.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-gray-400">No distributors added yet</td></tr>
                ) : distributors.map((d) => {
                  const states = [...new Set(d.statePincodes.map(p => p.stateName))].slice(0, 3)
                  return (
                    <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-gray-800">{d.companyName}</p>
                          <p className="text-xs text-gray-400">{d.user?.primaryEmail}</p>
                          <p className="text-xs text-gray-400">{d.phone}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {states.map(s => (
                            <span key={s} className="text-xs px-2 py-0.5  text-white" style={{ backgroundColor: 'var(--green)' }}>{s}</span>
                          ))}
                          {d.statePincodes.length > 3 && <span className="text-xs text-gray-400">+{d.statePincodes.length - 3}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold" style={{ color: 'var(--green)' }}>{d._count.orders}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1  font-medium ${d.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {d.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 flex gap-2">
                        <Link href={`/admin/orders?distributorId=${d.id}`} className="text-xs px-2 py-1 rounded text-white" style={{ backgroundColor: 'var(--green)' }}>Orders</Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
    </>
  )
}
