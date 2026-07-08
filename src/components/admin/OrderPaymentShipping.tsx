'use client'

import { useState } from 'react'

const PAYMENT_STATUSES = ['PENDING', 'PAID', 'COD', 'REFUNDED', 'FAILED']
const GATEWAYS = ['', 'RAZORPAY', 'STRIPE', 'PAYU', 'UPI', 'COD', 'MANUAL']
const SHIPPING_PARTNERS = ['', 'CUSTOM', 'SHIPROCKET', 'DELHIVERY', 'DTDC', 'BLUEDART', 'ECOMEXPRESS', 'INDIA_POST']

export function OrderPaymentShipping({
  orderId, paymentStatus, paymentMethod, gatewayName, gatewayTransactionId,
  paidAt, refundAmount, refundAt, refundId,
  trackingNumber, trackingUrl, shippingPartnerName, shippingCourier, estimatedDelivery,
  orderTotal,
}: {
  orderId: string; paymentStatus: string; paymentMethod: string
  gatewayName: string; gatewayTransactionId: string; paidAt: string
  refundAmount: string; refundAt: string; refundId: string
  trackingNumber: string; trackingUrl: string; shippingPartnerName: string
  shippingCourier: string; estimatedDelivery: string; orderTotal: number
}) {
  const [toast, setToast] = useState('')
  const [busy, setBusy] = useState('')

  // Payment fields
  const [pStatus, setPStatus] = useState(paymentStatus)
  const [pMethod, setPMethod] = useState(paymentMethod)
  const [gName, setGName] = useState(gatewayName)
  const [gTxId, setGTxId] = useState(gatewayTransactionId)
  const [paidAtV, setPaidAt] = useState(paidAt ? paidAt.slice(0, 16) : '')
  const [refAmt, setRefAmt] = useState(refundAmount)
  const [refAtV, setRefAt] = useState(refundAt ? refundAt.slice(0, 16) : '')
  const [refIdV, setRefId] = useState(refundId)

  // Shipping fields
  const [trackNum, setTrackNum] = useState(trackingNumber)
  const [trackUrl, setTrackUrl] = useState(trackingUrl)
  const [shPartner, setShPartner] = useState(shippingPartnerName)
  const [shCourier, setShCourier] = useState(shippingCourier)
  const [estDel, setEstDel] = useState(estimatedDelivery ? estimatedDelivery.slice(0, 10) : '')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 4000) }

  const save = async (section: 'payment' | 'shipping') => {
    setBusy(section)
    const body = section === 'payment'
      ? { paymentStatus: pStatus, paymentMethod: pMethod, gatewayName: gName, gatewayTransactionId: gTxId, paidAt: paidAtV || null, refundAmount: refAmt || null, refundAt: refAtV || null, refundId: refIdV || null }
      : { trackingNumber: trackNum, trackingUrl: trackUrl, shippingPartnerName: shPartner, shippingCourier: shCourier, estimatedDelivery: estDel || null }
    const res = await fetch(`/api/admin/orders/${orderId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setBusy('')
    showToast(res.ok ? `${section === 'payment' ? 'Payment' : 'Shipping'} details saved` : 'Save failed')
  }

  const markRefunded = async () => {
    if (!window.confirm(`Issue refund of ₹${refAmt || orderTotal}?`)) return
    setBusy('refund')
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentStatus: 'REFUNDED', refundAmount: refAmt || String(orderTotal), refundAt: new Date().toISOString(), status: 'REFUNDED' }),
    })
    setBusy('')
    showToast(res.ok ? 'Order marked as refunded' : 'Failed')
    if (res.ok) setPStatus('REFUNDED')
  }

  const pStatusColor: Record<string, string> = { PAID: 'text-green-600', PENDING: 'text-yellow-600', COD: 'text-blue-600', REFUNDED: 'text-purple-600', FAILED: 'text-red-600' }

  return (
    <div className="grid lg:grid-cols-2 gap-5">
      {toast && <div className="lg:col-span-2 bg-gray-900 text-white text-sm px-4 py-3">{toast}</div>}

      {/* Payment Management */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-none overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Payment Management</h2>
          <span className={`text-xs font-bold uppercase ${pStatusColor[pStatus] ?? 'text-gray-600'}`}>{pStatus}</span>
        </div>
        <div className="px-5 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Payment Status</label>
              <select value={pStatus} onChange={e => setPStatus(e.target.value)} className="w-full border border-gray-200 px-3 py-2 text-sm rounded-none">
                {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Payment Method</label>
              <input value={pMethod} onChange={e => setPMethod(e.target.value)} placeholder="ONLINE / COD / UPI"
                className="w-full border border-gray-200 px-3 py-2 text-sm rounded-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Gateway</label>
              <select value={gName} onChange={e => setGName(e.target.value)} className="w-full border border-gray-200 px-3 py-2 text-sm rounded-none">
                {GATEWAYS.map(g => <option key={g} value={g}>{g || '— Select —'}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Gateway Transaction ID</label>
              <input value={gTxId} onChange={e => setGTxId(e.target.value)} placeholder="pay_XXXXXXXXXX"
                className="w-full border border-gray-200 px-3 py-2 text-sm font-mono rounded-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Paid At</label>
              <input type="datetime-local" value={paidAtV} onChange={e => setPaidAt(e.target.value)}
                className="w-full border border-gray-200 px-3 py-2 text-sm rounded-none" />
            </div>
          </div>

          {/* Refund section */}
          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Refund Details</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Refund Amount (₹)</label>
                <input type="number" value={refAmt} onChange={e => setRefAmt(e.target.value)} placeholder={String(orderTotal)}
                  className="w-full border border-gray-200 px-3 py-2 text-sm rounded-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Refund ID</label>
                <input value={refIdV} onChange={e => setRefId(e.target.value)} placeholder="rfnd_XXXXXXX"
                  className="w-full border border-gray-200 px-3 py-2 text-sm font-mono rounded-none" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Refunded At</label>
                <input type="datetime-local" value={refAtV} onChange={e => setRefAt(e.target.value)}
                  className="w-full border border-gray-200 px-3 py-2 text-sm rounded-none" />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => save('payment')} disabled={busy === 'payment'}
              className="flex-1 py-2 text-sm text-white font-medium rounded-none disabled:opacity-50"
              style={{ backgroundColor: 'var(--green)' }}>
              {busy === 'payment' ? 'Saving...' : 'Save Payment'}
            </button>
            <button onClick={markRefunded} disabled={busy === 'refund' || pStatus === 'REFUNDED'}
              className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-none hover:bg-red-50 disabled:opacity-40">
              {busy === 'refund' ? '...' : 'Mark Refunded'}
            </button>
          </div>
        </div>
      </div>

      {/* Shipping Management */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-none overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Shipping & Tracking</h2>
          {trackNum && <span className="text-xs font-mono text-green-700 bg-green-50 px-2 py-1">{trackNum}</span>}
        </div>
        <div className="px-5 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Shipping Partner</label>
              <select value={shPartner} onChange={e => setShPartner(e.target.value)} className="w-full border border-gray-200 px-3 py-2 text-sm rounded-none">
                {SHIPPING_PARTNERS.map(p => <option key={p} value={p}>{p || '— Select —'}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Courier / Service</label>
              <input value={shCourier} onChange={e => setShCourier(e.target.value)} placeholder="Blue Dart / Express"
                className="w-full border border-gray-200 px-3 py-2 text-sm rounded-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Tracking Number / AWB</label>
              <input value={trackNum} onChange={e => setTrackNum(e.target.value)} placeholder="123456789012"
                className="w-full border border-gray-200 px-3 py-2 text-sm font-mono rounded-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Tracking URL</label>
              <input value={trackUrl} onChange={e => setTrackUrl(e.target.value)} placeholder="https://shiprocket.co/tracking/..."
                className="w-full border border-gray-200 px-3 py-2 text-sm font-mono rounded-none" />
              {trackUrl && (
                <a href={trackUrl} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline mt-1 block">Open tracking page →</a>
              )}
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Estimated Delivery Date</label>
              <input type="date" value={estDel} onChange={e => setEstDel(e.target.value)}
                className="w-full border border-gray-200 px-3 py-2 text-sm rounded-none" />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 p-3 text-xs text-blue-700">
            After saving, the tracking number and link are sent to the customer via email/WhatsApp when the order is marked DISPATCHED.
          </div>

          <button onClick={() => save('shipping')} disabled={busy === 'shipping'}
            className="w-full py-2 text-sm text-white font-medium rounded-none disabled:opacity-50"
            style={{ backgroundColor: 'var(--green)' }}>
            {busy === 'shipping' ? 'Saving...' : 'Save Shipping Details'}
          </button>
        </div>
      </div>
    </div>
  )
}
