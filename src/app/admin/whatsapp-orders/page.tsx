'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, X, QrCode } from 'lucide-react'
import { WhatsAppOrderQR } from '@/components/shared/WhatsAppOrderQR'

interface WhatsAppOrder {
  id: string
  customerName: string | null
  customerPhone: string
  productName: string
  productSku: string | null
  selectedColor: string | null
  selectedSize: string | null
  quantity: number
  unitPrice: string | null
  totalValue: string | null
  status: string
  notes: string | null
  createdAt: string
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b', CONFIRMED: '#3b82f6', FULFILLED: '#16a34a', CANCELLED: '#ef4444',
}
const STATUS_LIST = ['PENDING', 'CONFIRMED', 'FULFILLED', 'CANCELLED']

export default function WhatsAppOrdersPage() {
  const [orders, setOrders] = useState<WhatsAppOrder[]>([])
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [form, setForm] = useState({
    customerName: '', customerPhone: '', productName: '', productSku: '',
    selectedColor: '', selectedSize: '', quantity: '1', unitPrice: '', totalValue: '', notes: '',
  })

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    const qs = statusFilter ? `?status=${statusFilter}` : ''
    const res = await fetch(`/api/admin/whatsapp-orders${qs}`)
    const data = await res.json()
    setOrders(data.orders ?? [])
    setTotal(data.total ?? 0)
    setLoading(false)
  }, [statusFilter])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/admin/whatsapp-orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchOrders()
  }

  const submitNewOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/admin/whatsapp-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setShowAddForm(false)
    setForm({ customerName: '', customerPhone: '', productName: '', productSku: '', selectedColor: '', selectedSize: '', quantity: '1', unitPrice: '', totalValue: '', notes: '' })
    fetchOrders()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">WhatsApp Orders</h1>
          <p className="text-sm text-gray-500">{total} total orders</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowQR(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white font-medium"
            style={{ backgroundColor: '#25D366' }}
          >
            <QrCode size={16} /> Order QR Code
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white font-medium"
            style={{ backgroundColor: 'var(--saffron)' }}
          >
            <Plus size={16} /> Add WhatsApp Order
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-100 p-4 mb-5 flex flex-wrap gap-3 shadow-sm">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-300 px-3 py-2 text-sm">
          <option value="">All Statuses</option>
          {STATUS_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Customer', 'Phone', 'Product', 'Qty', 'Total', 'Status', 'Date'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">Loading...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">No WhatsApp orders yet</td></tr>
            ) : orders.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{o.customerName || '—'}</td>
                <td className="px-4 py-3 text-gray-600">{o.customerPhone}</td>
                <td className="px-4 py-3 text-gray-600">
                  {o.productName}
                  {(o.selectedColor || o.selectedSize) && (
                    <span className="text-xs text-gray-400 block">
                      {[o.selectedColor, o.selectedSize].filter(Boolean).join(' · ')}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-600">{o.quantity}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{o.totalValue ? `₹${Number(o.totalValue).toLocaleString('en-IN')}` : '—'}</td>
                <td className="px-4 py-3">
                  <select
                    value={o.status}
                    onChange={(e) => updateStatus(o.id, e.target.value)}
                    className="text-xs font-semibold px-2 py-1 border-0"
                    style={{ backgroundColor: `${STATUS_COLORS[o.status]}20`, color: STATUS_COLORS[o.status] }}
                  >
                    {STATUS_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add order modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4" onClick={() => setShowAddForm(false)}>
          <div className="bg-white w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Add WhatsApp Order</h2>
              <button onClick={() => setShowAddForm(false)} aria-label="Close"><X size={18} /></button>
            </div>
            <form onSubmit={submitNewOrder} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input required placeholder="Customer Name" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className="border border-gray-300 px-3 py-2 text-sm" />
                <input required placeholder="Phone Number" value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} className="border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <input required placeholder="Product Name" value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} className="w-full border border-gray-300 px-3 py-2 text-sm" />
              <div className="grid grid-cols-3 gap-3">
                <input placeholder="SKU" value={form.productSku} onChange={(e) => setForm({ ...form, productSku: e.target.value })} className="border border-gray-300 px-3 py-2 text-sm" />
                <input placeholder="Color" value={form.selectedColor} onChange={(e) => setForm({ ...form, selectedColor: e.target.value })} className="border border-gray-300 px-3 py-2 text-sm" />
                <input placeholder="Size" value={form.selectedSize} onChange={(e) => setForm({ ...form, selectedSize: e.target.value })} className="border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <input type="number" min="1" placeholder="Qty" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="border border-gray-300 px-3 py-2 text-sm" />
                <input type="number" placeholder="Unit Price" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} className="border border-gray-300 px-3 py-2 text-sm" />
                <input type="number" placeholder="Total Value" value={form.totalValue} onChange={(e) => setForm({ ...form, totalValue: e.target.value })} className="border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full border border-gray-300 px-3 py-2 text-sm" />
              <button type="submit" className="w-full py-2.5 text-white font-medium" style={{ backgroundColor: 'var(--green)' }}>Save Order</button>
            </form>
          </div>
        </div>
      )}

      {showQR && (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4" onClick={() => setShowQR(false)}>
          <div className="bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">WhatsApp Order QR Code</h2>
              <button onClick={() => setShowQR(false)} aria-label="Close"><X size={18} /></button>
            </div>
            <WhatsAppOrderQR size={240} />
          </div>
        </div>
      )}
    </div>
  )
}
