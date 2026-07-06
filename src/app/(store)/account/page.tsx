import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const metadata = { title: 'My Account' }

const statusColors: Record<string, string> = {
  PLACED: 'bg-yellow-50 text-yellow-700', CONFIRMED: 'bg-blue-50 text-blue-700',
  PACKED: 'bg-purple-50 text-purple-700', DISPATCHED: 'bg-cyan-50 text-cyan-700',
  DELIVERED: 'bg-green-50 text-green-700', CANCELLED: 'bg-red-50 text-red-600',
  RETURN_REQUESTED: 'bg-orange-50 text-orange-700',
}

export default async function AccountDashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login?callbackUrl=/account')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id! },
    include: {
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: { items: { take: 1, include: { variant: { include: { product: { select: { name: true } } } } } } },
      },
      coinLedger: { orderBy: { createdAt: 'desc' }, take: 5 },
    },
  })

  if (!user) redirect('/login')

  const totalCoins = user.coinLedger.reduce((sum, l) => {
    return l.type === 'EARNED' ? sum + l.coins : l.type === 'REDEEMED' ? sum - l.coins : sum
  }, 0)
  const orderCount = await prisma.order.count({ where: { userId: user.id } })

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 flex items-center justify-center text-white text-2xl font-bold" style={{ backgroundColor: 'var(--green)' }}>
          {user.name[0]}
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--ink)' }}>Welcome, {user.name.split(' ')[0]}!</h1>
          <p className="text-sm text-gray-500">{user.primaryEmail} · Member since {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</p>
        </div>
        <div className="ml-auto text-center">
          <div className="text-2xl font-bold" style={{ color: 'var(--green)' }}>{totalCoins}</div>
          <div className="text-xs text-gray-500">Naturalife Coins</div>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-[var(--line)] p-4">
          <p className="text-2xl font-bold text-gray-900">{orderCount}</p>
          <p className="text-xs text-gray-500">Total Orders</p>
        </div>
        <div className="bg-white border border-[var(--line)] p-4">
          <p className="text-2xl font-bold text-gray-900">{totalCoins}</p>
          <p className="text-xs text-gray-500">Naturalife Coins</p>
        </div>
        <div className="bg-white border border-[var(--line)] p-4">
          <Link href="/custom-design" className="text-sm font-semibold hover:underline" style={{ color: 'var(--green)' }}>Request Custom Design →</Link>
        </div>
      </div>

      <div className="bg-white border border-[var(--line)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--line)] flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Recent Orders</h2>
          <Link href="/account/orders" className="text-xs font-medium hover:underline" style={{ color: 'var(--green)' }}>View all →</Link>
        </div>
        {user.orders.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-gray-500">No orders yet</p>
            <Link href="/shop" className="mt-3 inline-block text-sm font-medium hover:underline" style={{ color: 'var(--green)' }}>Start Shopping</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {user.orders.map((o) => {
              const firstItem = o.items[0]?.variant?.product?.name
              return (
                <div key={o.id} className="px-5 py-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{o.orderNumber}</p>
                    <p className="text-xs text-gray-500 truncate">{firstItem}{o.items.length > 1 ? ` +${o.items.length - 1} more` : ''}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(o.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">₹{Number(o.total).toLocaleString('en-IN')}</p>
                    <span className={`text-xs px-2 py-0.5 font-medium ${statusColors[o.status] ?? 'bg-gray-50 text-gray-600'}`}>{o.status}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
