import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const metadata = { title: 'Order Details' }

const statusColors: Record<string, string> = {
  PLACED: 'bg-yellow-50 text-yellow-700', CONFIRMED: 'bg-blue-50 text-blue-700',
  PACKED: 'bg-purple-50 text-purple-700', DISPATCHED: 'bg-cyan-50 text-cyan-700',
  DELIVERED: 'bg-green-50 text-green-700', CANCELLED: 'bg-red-50 text-red-600',
  RETURN_REQUESTED: 'bg-orange-50 text-orange-700',
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { variant: { include: { product: { select: { name: true }, } } } } },
      address: true,
      history: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!order || order.userId !== session.user.id) notFound()

  return (
    <div>
      <Link href="/account/orders" className="text-sm text-gray-500 hover:text-[var(--green)] mb-4 inline-block">← Back to Orders</Link>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--ink)' }}>{order.orderNumber}</h1>
        <span className={`text-xs px-3 py-1 font-medium ${statusColors[order.status] ?? 'bg-gray-50 text-gray-600'}`}>{order.status}</span>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white border border-[var(--line)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--line)]"><h2 className="font-semibold text-gray-800">Items</h2></div>
          <div className="divide-y divide-gray-50">
            {order.items.map((item) => (
              <div key={item.id} className="px-5 py-3 flex justify-between text-sm">
                <div>
                  <p className="font-medium text-gray-800">{item.variant.product.name}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{Number(item.unitPrice).toLocaleString('en-IN')}</p>
                </div>
                <p className="font-semibold">₹{Number(item.subtotal).toLocaleString('en-IN')}</p>
              </div>
            ))}
          </div>
          <div className="px-5 py-4 border-t border-[var(--line)] space-y-1 text-sm">
            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{Number(order.subtotal).toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between text-gray-600"><span>Tax</span><span>₹{Number(order.taxAmount).toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between text-gray-600"><span>Shipping</span><span>₹{Number(order.shippingCharge).toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between font-semibold text-base pt-1 border-t border-[var(--line)]"><span>Total</span><span style={{ color: 'var(--green)' }}>₹{Number(order.total).toLocaleString('en-IN')}</span></div>
          </div>
          <div className="px-5 py-3 border-t border-[var(--line)]">
            <a href={`/api/invoices/${order.id}?print=1`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:underline" style={{ color: 'var(--green)' }}>Download Invoice →</a>
          </div>
        </div>

        <div className="space-y-4">
          {order.address && (
            <div className="bg-white border border-[var(--line)] p-4">
              <h3 className="font-semibold text-gray-800 mb-2 text-sm">Shipping Address</h3>
              <p className="text-sm text-gray-600">{order.address.line1}</p>
              {order.address.line2 && <p className="text-sm text-gray-600">{order.address.line2}</p>}
              <p className="text-sm text-gray-600">{order.address.city}, {order.address.state} {order.address.pincode}</p>
              <p className="text-sm text-gray-600 mt-1">{order.address.phone}</p>
            </div>
          )}

          <div className="bg-white border border-[var(--line)] p-4">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm">Order Timeline</h3>
            <div className="space-y-2">
              {order.history.map((h) => (
                <div key={h.id} className="text-xs">
                  <p className="font-medium text-gray-800">{h.status}</p>
                  <p className="text-gray-400">{new Date(h.createdAt).toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
