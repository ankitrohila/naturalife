'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Coupon {
  id: string
  code: string
  type: string
  value: number
  minOrderValue: number | null
  usageLimit: number | null
  usedCount: number
  isActive: boolean
  validUntil: string
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ code: '', discountType: 'PERCENTAGE', discountValue: '', minOrderValue: '', maxUses: '', expiresAt: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetch('/api/admin/coupons').then(r => r.json()).then(d => { setCoupons(d.coupons ?? []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    if (!form.code || !form.discountValue) { setMsg('Code and discount value required'); return }
    setSaving(true)
    const res = await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: form.code.toUpperCase(),
        discountType: form.discountType,
        discountValue: parseFloat(form.discountValue),
        minOrderValue: form.minOrderValue ? parseFloat(form.minOrderValue) : null,
        maxUses: form.maxUses ? parseInt(form.maxUses) : null,
        expiresAt: form.expiresAt || null,
      }),
    })
    const data = await res.json()
    if (res.ok) {
      setCoupons(prev => [data.coupon, ...prev])
      setShowForm(false)
      setForm({ code: '', discountType: 'PERCENTAGE', discountValue: '', minOrderValue: '', maxUses: '', expiresAt: '' })
      setMsg('Coupon created!')
    } else {
      setMsg(data.error ?? 'Error creating coupon')
    }
    setSaving(false)
  }

  const toggleActive = async (id: string, current: boolean) => {
    await fetch('/api/admin/coupons', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, isActive: !current }) })
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, isActive: !current } : c))
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#F6F6F6' }}>
      {/* Sidebar included via layout */}
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Coupons & Offers</h1>
              <p className="text-sm text-gray-500 mt-1">{coupons.length} coupons</p>
            </div>
            <div className="flex gap-2">
              <Link href="/admin" className="px-3 py-2 border border-gray-300 rounded-none text-sm text-gray-600 hover:bg-gray-50">← Back</Link>
              <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 text-white rounded-none text-sm font-medium" style={{ backgroundColor: 'var(--green)' }}>
                + New Coupon
              </button>
            </div>
          </div>

          {msg && <p className="mb-4 text-sm text-green-700 bg-green-50 px-4 py-2 rounded-none">{msg}</p>}

          {/* Create form */}
          {showForm && (
            <div className="bg-white rounded-none shadow-sm border border-gray-100 p-6 mb-6">
              <h2 className="font-semibold text-gray-800 mb-4">Create New Coupon</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: 'Coupon Code *', key: 'code', type: 'text', placeholder: 'e.g. SAVE20' },
                  { label: 'Discount Value *', key: 'discountValue', type: 'number', placeholder: 'e.g. 20' },
                  { label: 'Min Order Value (₹)', key: 'minOrderValue', type: 'number', placeholder: 'e.g. 500' },
                  { label: 'Max Uses', key: 'maxUses', type: 'number', placeholder: 'Leave blank = unlimited' },
                  { label: 'Expires At', key: 'expiresAt', type: 'date', placeholder: '' },
                ].map(({ label, key, type, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                    <input type={type} placeholder={placeholder} value={form[key as keyof typeof form]}
                      onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                      className="w-full border border-gray-300 rounded-none px-3 py-2 text-sm focus:outline-none" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Discount Type</label>
                  <select value={form.discountType} onChange={(e) => setForm(f => ({ ...f, discountType: e.target.value }))}
                    className="w-full border border-gray-300 rounded-none px-3 py-2 text-sm">
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={handleSave} disabled={saving} className="px-5 py-2 text-white rounded-none text-sm font-semibold disabled:opacity-60" style={{ backgroundColor: 'var(--green)' }}>
                  {saving ? 'Saving...' : 'Create Coupon'}
                </button>
                <button onClick={() => setShowForm(false)} className="px-5 py-2 border border-gray-300 rounded-none text-sm text-gray-600">Cancel</button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-none shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead style={{ backgroundColor: '#F6F6F6' }}>
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Code</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Discount</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Min Order</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Usage</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Expires</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-10 text-gray-400">Loading...</td></tr>
                ) : coupons.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-gray-400">No coupons yet. Create your first one above.</td></tr>
                ) : coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">{c.code}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold" style={{ color: 'var(--green)' }}>
                      {c.type === 'PERCENT' ? `${c.value}%` : `₹${c.value}`}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.minOrderValue ? `₹${c.minOrderValue}` : '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ''}</td>
                    <td className="px-4 py-3 text-gray-400">{c.validUntil ? new Date(c.validUntil).toLocaleDateString('en-IN') : 'Never'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1  font-medium ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(c.id, c.isActive)} className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50">
                        {c.isActive ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
