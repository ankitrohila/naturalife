import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { OrderInvoiceActions } from '@/components/admin/OrderInvoiceActions'

const STATUS_STEPS = ['PLACED', 'CONFIRMED', 'PACKED', 'DISPATCHED', 'DELIVERED']

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { variant: { include: { product: { select: { name: true, slug: true } } } } } },
      user: { select: { name: true, primaryEmail: true, primaryPhone: true } },
      distributor: { select: { companyName: true } },
      history: { orderBy: { createdAt: 'desc' } },
    },
  }).catch(() => null)

  if (!order) notFound()

  const currentStep = STATUS_STEPS.indexOf(order.status)

  const statusColors: Record<string, string> = {
    PLACED: '#C9A227', CONFIRMED: '#4CAF50', PACKED: '#2E7D32',
    DISPATCHED: '#1B5E20', DELIVERED: '#1B5E20', CANCELLED: '#B3261E', RETURNED: '#777',
  }

  return (
    <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3">
                <Link href="/admin/orders" className="text-gray-400 hover:text-gray-600 text-sm">← Orders</Link>
                <span className="text-gray-300">/</span>
                <span className="font-mono text-sm text-gray-600">#{order.orderNumber}</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mt-1">Order Detail</h1>
            </div>
            <span className="px-3 py-1.5 text-white text-sm font-semibold rounded-full" style={{ backgroundColor: statusColors[order.status] ?? '#888' }}>
              {order.status}
            </span>
          </div>

          {/* Progress */}
          {!['CANCELLED', 'RETURNED'].includes(order.status) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
              <div className="flex items-center justify-between relative">
                <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-200 z-0" />
                <div className="absolute left-0 top-4 h-0.5 bg-green-500 z-0 transition-all"
                  style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }} />
                {STATUS_STEPS.map((step, i) => (
                  <div key={step} className="relative z-10 flex flex-col items-center gap-1">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${i <= currentStep ? 'border-green-500 bg-green-500 text-white' : 'border-gray-200 bg-white text-gray-400'}`}>
                      {i < currentStep ? '✓' : i + 1}
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              {/* Items */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-800">Order Items ({order.items.length})</h2>
                </div>
                <table className="w-full text-sm">
                  <thead style={{ backgroundColor: '#F6F6F6' }}>
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Product</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">SKU</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Qty</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Price</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {order.items.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <Link href={`/shop/${item.variant.product.slug}`} className="font-medium text-gray-800 hover:underline text-xs">
                            {item.variant.product.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{item.variant.sku}</td>
                        <td className="px-4 py-3 text-gray-700">{item.quantity}</td>
                        <td className="px-4 py-3 text-gray-700">₹{Number(item.unitPrice).toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 font-semibold" style={{ color: 'var(--green)' }}>₹{Number(item.subtotal).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Update Status */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h2 className="font-semibold text-gray-800 mb-4">Update Order Status</h2>
                <form action={`/api/admin/orders/${id}/status`} method="post" className="flex gap-3">
                  <select name="status" defaultValue={order.status} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    {['PLACED', 'CONFIRMED', 'PACKED', 'DISPATCHED', 'DELIVERED', 'CANCELLED', 'RETURNED'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <input type="text" name="note" placeholder="Note (e.g. AWB number)" className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                  <button type="submit" className="px-4 py-2 text-white rounded-lg text-sm font-medium shrink-0" style={{ backgroundColor: 'var(--green)' }}>
                    Update
                  </button>
                </form>
              </div>

              {/* Status History */}
              {order.history.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <h2 className="font-semibold text-gray-800 mb-4">Status History</h2>
                  <div className="space-y-3">
                    {order.history.map((h) => (
                      <div key={h.id} className="flex gap-3 text-sm">
                        <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: statusColors[h.status] ?? '#888' }} />
                        <div>
                          <span className="font-medium text-gray-700">{h.status}</span>
                          {h.note && <p className="text-xs text-gray-400 mt-0.5">{h.note}</p>}
                          <p className="text-xs text-gray-400">{new Date(h.createdAt).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right */}
            <div className="space-y-5">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h2 className="font-semibold text-gray-800 mb-3">Customer</h2>
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-gray-800">{order.user?.name ?? 'Guest'}</p>
                  <p className="text-gray-500">{order.user?.primaryEmail}</p>
                  {order.user?.primaryPhone && <p className="text-gray-500">{order.user.primaryPhone}</p>}
                  {order.distributor && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-xs font-medium" style={{ color: 'var(--green)' }}>Distributor</p>
                      <p className="text-gray-700">{order.distributor.companyName}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h2 className="font-semibold text-gray-800 mb-3">Pricing</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{Number(order.subtotal).toLocaleString('en-IN')}</span></div>
                  <div className="flex justify-between text-gray-600"><span>Tax</span><span>₹{Number(order.taxAmount).toLocaleString('en-IN')}</span></div>
                  <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{Number(order.shippingCharge) === 0 ? <span className="text-green-600">FREE</span> : `₹${Number(order.shippingCharge)}`}</span></div>
                  {Number(order.discount) > 0 && <div className="flex justify-between text-red-500"><span>Discount</span><span>-₹{Number(order.discount).toLocaleString('en-IN')}</span></div>}
                  <div className="flex justify-between font-bold pt-2 border-t border-gray-100">
                    <span>Total</span>
                    <span style={{ color: 'var(--green)' }}>₹{Number(order.total).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 pt-1">
                    <span>Payment</span>
                    <span className={order.paymentStatus === 'PAID' ? 'text-green-600 font-medium' : 'text-yellow-600 font-medium'}>
                      {order.paymentStatus}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Method</span><span>{order.paymentMethod ?? '—'}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Type</span><span>{order.orderType}</span>
                  </div>
                </div>
              </div>

              <OrderInvoiceActions orderId={order.id} />
            </div>
          </div>
    </div>
  )
}
