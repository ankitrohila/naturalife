'use client'

import { useState, useEffect, useCallback, Fragment } from 'react'
import { ChevronDown, Send } from 'lucide-react'

interface CartItem {
  productSlug: string
  name: string
  image: string
  qty: number
  unitPrice: number
}

interface AbandonedCart {
  id: string
  items: CartItem[]
  totalValue: string
  itemCount: number
  lastUpdated: string
  user: { name: string; primaryEmail: string; primaryPhone: string; whatsappNumber: string | null }
}

interface Stats {
  totalAbandonedValue: number
  averageCartValue: number
  abandonedCount: number
  recoveryRate: number
}

export default function AbandonedCartsPage() {
  const [carts, setCarts] = useState<AbandonedCart[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [discountModal, setDiscountModal] = useState<AbandonedCart | null>(null)
  const [discountPercent, setDiscountPercent] = useState(10)
  const [channel, setChannel] = useState<'email' | 'whatsapp'>('email')
  const [sending, setSending] = useState(false)
  const [sentMsg, setSentMsg] = useState('')

  const fetchCarts = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/abandoned-carts')
    const data = await res.json()
    setCarts(data.carts ?? [])
    setStats(data.stats ?? null)
    setTotal(data.total ?? 0)
    setLoading(false)
  }, [])

  useEffect(() => { fetchCarts() }, [fetchCarts])

  const sendDiscount = async () => {
    if (!discountModal) return
    setSending(true)
    const res = await fetch(`/api/admin/abandoned-carts/${discountModal.id}/send-discount`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ discountPercent, expiresInDays: 7, channel }),
    })
    setSending(false)
    if (res.ok) {
      const data = await res.json()
      setSentMsg(`Coupon ${data.coupon.code} sent via ${channel}!`)
      setTimeout(() => { setSentMsg(''); setDiscountModal(null) }, 3000)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Abandoned Carts</h1>
        <p className="text-sm text-gray-500">{total} active abandoned carts</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Abandoned Value</p>
            <p className="text-xl font-bold text-gray-900">₹{Number(stats.totalAbandonedValue).toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Average Cart Value</p>
            <p className="text-xl font-bold text-gray-900">₹{Number(stats.averageCartValue).toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Active Abandoned Carts</p>
            <p className="text-xl font-bold text-gray-900">{stats.abandonedCount}</p>
          </div>
          <div className="bg-white border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Recovery Rate</p>
            <p className="text-xl font-bold text-gray-900">{stats.recoveryRate.toFixed(1)}%</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Customer', 'Email', 'Items', 'Cart Value', 'Last Active', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm">Loading...</td></tr>
            ) : carts.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm">No abandoned carts</td></tr>
            ) : carts.map((c) => (
              <Fragment key={c.id}>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{c.user.name}</td>
                  <td className="px-4 py-3 text-gray-600">{c.user.primaryEmail}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setExpanded(expanded === c.id ? null : c.id)} className="flex items-center gap-1 text-gray-600 hover:text-[var(--green)]">
                      {c.itemCount} items <ChevronDown size={14} className={`transition-transform ${expanded === c.id ? 'rotate-180' : ''}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">₹{Number(c.totalValue).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(c.lastUpdated).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setDiscountModal(c)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white"
                      style={{ backgroundColor: 'var(--saffron)' }}
                    >
                      <Send size={12} /> Send Discount
                    </button>
                  </td>
                </tr>
                {expanded === c.id && (
                  <tr>
                    <td colSpan={6} className="px-4 py-3 bg-gray-50">
                      <div className="space-y-1">
                        {c.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-xs text-gray-600">
                            <span>{item.name} × {item.qty}</span>
                            <span>₹{(item.unitPrice * item.qty).toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Send discount modal */}
      {discountModal && (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4" onClick={() => setDiscountModal(null)}>
          <div className="bg-white w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Send Discount to {discountModal.user.name}</h2>
            {sentMsg ? (
              <p className="text-sm text-green-600 font-medium">{sentMsg}</p>
            ) : (
              <>
                <div className="mb-4">
                  <label className="text-sm text-gray-600 block mb-1">Discount Percent</label>
                  <input type="number" min="1" max="100" value={discountPercent} onChange={(e) => setDiscountPercent(parseInt(e.target.value) || 10)} className="w-full border border-gray-300 px-3 py-2 text-sm" />
                </div>
                <div className="mb-4">
                  <label className="text-sm text-gray-600 block mb-1">Send via</label>
                  <select value={channel} onChange={(e) => setChannel(e.target.value as 'email' | 'whatsapp')} className="w-full border border-gray-300 px-3 py-2 text-sm">
                    <option value="email">Email</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>
                <button
                  onClick={sendDiscount}
                  disabled={sending}
                  className="w-full py-2.5 text-white font-medium disabled:opacity-50"
                  style={{ backgroundColor: 'var(--green)' }}
                >
                  {sending ? 'Sending...' : 'Send Discount'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
