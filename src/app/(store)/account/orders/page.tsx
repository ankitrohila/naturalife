import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const metadata = { title: 'My Orders' }

const statusColors: Record<string, string> = {
  PLACED: 'bg-yellow-50 text-yellow-700', CONFIRMED: 'bg-blue-50 text-blue-700',
  PACKED: 'bg-purple-50 text-purple-700', DISPATCHED: 'bg-cyan-50 text-cyan-700',
  DELIVERED: 'bg-green-50 text-green-700', CANCELLED: 'bg-red-50 text-red-600',
  RETURN_REQUESTED: 'bg-orange-50 text-orange-700',
}

export default async function AccountOrdersPage() {
  const session = await auth()
  if (!session?.user) redirect('/login?callbackUrl=/account/orders')

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id! },
    orderBy: { createdAt: 'desc' },
    include: { items: { take: 1, include: { variant: { include: { product: { select: { name: true } } } } } } },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--ink)' }}>My Orders</h1>
      <div className="bg-white border border-[var(--line)] overflow-hidden">
        {orders.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-gray-500 mb-3">No orders yet</p>
            <Link href="/shop" className="text-sm font-medium hover:underline" style={{ color: 'var(--green)' }}>Start Shopping →</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {orders.map((o) => {
              const firstItem = o.items[0]?.variant?.product?.name
              return (
                <Link key={o.id} href={`/account/orders/${o.id}`} className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{o.orderNumber}</p>
                    <p className="text-xs text-gray-500 truncate">{firstItem}{o.items.length > 1 ? ` +${o.items.length - 1} more` : ''}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(o.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">₹{Number(o.total).toLocaleString('en-IN')}</p>
                    <span className={`text-xs px-2 py-0.5 font-medium ${statusColors[o.status] ?? 'bg-gray-50 text-gray-600'}`}>{o.status}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
