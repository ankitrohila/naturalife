'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface OrderRow {
  id: string
  orderNumber: string
  orderType: string
  total: number
  paymentStatus: string
  status: string
  createdAt: string
  user: { name: string; primaryEmail: string }
}

const STATUS_COLORS: Record<string, string> = {
  PLACED: '#f59e0b', CONFIRMED: '#3b82f6', PACKED: '#8b5cf6',
  DISPATCHED: '#06b6d4', DELIVERED: '#16a34a', CANCELLED: '#ef4444',
  RETURN_REQUESTED: '#f97316', RETURNED: '#9ca3af', REFUNDED: '#6b7280',
}

export function OrdersTable({ orders }: { orders: OrderRow[] }) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkAction, setBulkAction] = useState('')
  const [busy, setBusy] = useState(false)

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }
  const toggleSelectAll = () => {
    setSelected((prev) => (prev.size === orders.length ? new Set() : new Set(orders.map((o) => o.id))))
  }

  const applyBulkAction = async () => {
    if (!bulkAction || selected.size === 0) return
    if (bulkAction === 'delete') {
      if (!confirm(`Delete ${selected.size} selected order(s)? This cannot be undone.`)) return
      setBusy(true)
      await fetch('/api/admin/orders', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [...selected] }),
      })
      setBusy(false)
      setSelected(new Set())
      setBulkAction('')
      router.refresh()
    }
  }

  return (
    <div className="bg-white rounded-none border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 flex-wrap">
        <select value={bulkAction} onChange={(e) => setBulkAction(e.target.value)} className="border border-gray-300 px-3 py-2 text-sm">
          <option value="">Bulk Actions</option>
          <option value="delete">Delete Selected</option>
        </select>
        <button onClick={applyBulkAction} disabled={!bulkAction || selected.size === 0 || busy} className="px-4 py-2 text-white text-sm font-medium disabled:opacity-40" style={{ backgroundColor: 'var(--saffron)' }}>
          {busy ? 'Applying...' : 'Apply'}
        </button>
        <span className="text-xs text-gray-400 ml-auto">{selected.size > 0 ? `${selected.size} selected · ` : ''}{orders.length} order{orders.length !== 1 ? 's' : ''} shown</span>
      </div>

      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="px-4 py-3 w-8">
              <input type="checkbox" checked={orders.length > 0 && selected.size === orders.length} onChange={toggleSelectAll} />
            </th>
            {['Order #', 'Customer', 'Type', 'Total', 'Payment', 'Status', 'Date', ''].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {orders.length === 0 ? (
            <tr><td colSpan={9} className="px-4 py-10 text-center text-gray-400 text-sm">No orders found</td></tr>
          ) : orders.map((o) => (
            <tr key={o.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <input type="checkbox" checked={selected.has(o.id)} onChange={() => toggleSelect(o.id)} />
              </td>
              <td className="px-4 py-3 font-mono font-medium text-gray-800">{o.orderNumber}</td>
              <td className="px-4 py-3">
                <p className="font-medium text-gray-800">{o.user.name}</p>
                <p className="text-xs text-gray-500">{o.user.primaryEmail}</p>
              </td>
              <td className="px-4 py-3">
                <span className={`text-xs px-2 py-0.5 font-medium ${o.orderType === 'WHOLESALE' ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-600'}`}>
                  {o.orderType}
                </span>
              </td>
              <td className="px-4 py-3 font-semibold">₹{Number(o.total).toLocaleString('en-IN')}</td>
              <td className="px-4 py-3">
                <span className={`text-xs px-2 py-0.5 font-medium ${o.paymentStatus === 'PAID' ? 'bg-green-50 text-green-700' : o.paymentStatus === 'PENDING' ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-50 text-gray-600'}`}>
                  {o.paymentStatus}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="text-xs px-2 py-0.5 text-white" style={{ backgroundColor: STATUS_COLORS[o.status] ?? '#9ca3af' }}>
                  {o.status}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-500 text-xs">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
              <td className="px-4 py-3">
                <Link href={`/admin/orders/${o.id}`} className="text-xs font-medium hover:underline" style={{ color: 'var(--saffron)' }}>View →</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
