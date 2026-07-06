'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, X, Star } from 'lucide-react'

interface Address {
  id: string
  line1: string
  line2: string | null
  city: string
  state: string
  pincode: string
  phone: string
  isDefault: boolean
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ line1: '', line2: '', city: '', state: '', pincode: '', phone: '', isDefault: false })

  const fetchAddresses = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/account/addresses')
    const data = await res.json()
    setAddresses(data.addresses ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchAddresses() }, [fetchAddresses])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/account/addresses', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    })
    setShowForm(false)
    setForm({ line1: '', line2: '', city: '', state: '', pincode: '', phone: '', isDefault: false })
    fetchAddresses()
  }

  const setDefault = async (id: string) => {
    await fetch(`/api/account/addresses/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isDefault: true }),
    })
    fetchAddresses()
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this address?')) return
    await fetch(`/api/account/addresses/${id}`, { method: 'DELETE' })
    fetchAddresses()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--ink)' }}>My Addresses</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 text-sm text-white font-medium" style={{ backgroundColor: 'var(--green)' }}>
          <Plus size={16} /> Add Address
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : addresses.length === 0 ? (
        <div className="bg-white border border-[var(--line)] py-16 text-center">
          <p className="text-sm text-gray-500">No addresses saved yet</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="bg-white border border-[var(--line)] p-4 relative">
              {addr.isDefault && <span className="absolute top-3 right-3 text-xs font-medium text-white px-2 py-0.5" style={{ backgroundColor: 'var(--green)' }}>Default</span>}
              <p className="font-medium text-gray-800">{addr.line1}</p>
              {addr.line2 && <p className="text-sm text-gray-600">{addr.line2}</p>}
              <p className="text-sm text-gray-600">{addr.city}, {addr.state} {addr.pincode}</p>
              <p className="text-sm text-gray-600 mt-1">{addr.phone}</p>
              <div className="flex gap-3 mt-3">
                {!addr.isDefault && (
                  <button onClick={() => setDefault(addr.id)} className="text-xs font-medium flex items-center gap-1 hover:underline" style={{ color: 'var(--green)' }}>
                    <Star size={12} /> Set Default
                  </button>
                )}
                <button onClick={() => remove(addr.id)} className="text-xs font-medium text-red-500 hover:underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Add Address</h2>
              <button onClick={() => setShowForm(false)} aria-label="Close"><X size={18} /></button>
            </div>
            <form onSubmit={submit} className="space-y-3">
              <input required placeholder="Address Line 1" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} className="w-full border border-gray-300 px-3 py-2 text-sm" />
              <input placeholder="Address Line 2 (optional)" value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} className="w-full border border-gray-300 px-3 py-2 text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input required placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="border border-gray-300 px-3 py-2 text-sm" />
                <input required placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input required placeholder="Pincode" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className="border border-gray-300 px-3 py-2 text-sm" />
                <input required placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
                Set as default address
              </label>
              <button type="submit" className="w-full py-2.5 text-white font-medium text-sm" style={{ backgroundColor: 'var(--green)' }}>Save Address</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
