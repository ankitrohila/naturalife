import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Download } from 'lucide-react'

export const metadata = { title: 'Downloads' }

export default async function DownloadsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login?callbackUrl=/account/downloads')

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id!, paymentStatus: { in: ['PAID', 'COD'] } },
    orderBy: { createdAt: 'desc' },
    select: { id: true, orderNumber: true, createdAt: true, total: true },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--ink)' }}>Downloads</h1>
      </div>

      <div className="bg-white border border-[var(--line)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--line)]">
          <h2 className="font-semibold text-gray-800">Invoices</h2>
          <p className="text-xs text-gray-500 mt-0.5">GST invoices for your paid orders</p>
        </div>
        {orders.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-gray-500">No downloads available yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {orders.map((o) => (
              <div key={o.id} className="px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{o.orderNumber}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · ₹{Number(o.total).toLocaleString('en-IN')}
                  </p>
                </div>
                <a
                  href={`/api/invoices/${o.id}?print=1`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 text-white"
                  style={{ backgroundColor: 'var(--green)' }}
                >
                  <Download size={13} /> Invoice
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
