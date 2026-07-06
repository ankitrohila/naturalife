'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'

interface Customer { id: string; name: string; primaryEmail: string; primaryPhone: string }

export function CustomerRowActions({ customer }: { customer: Customer }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: customer.name, primaryEmail: customer.primaryEmail, primaryPhone: customer.primaryPhone })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const res = await fetch(`/api/admin/users/${customer.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error ?? 'Failed to save'); return }
    setEditing(false)
    router.refresh()
  }

  const remove = async () => {
    if (!confirm(`Delete ${customer.name}? This also deletes their orders, addresses, and other data. This cannot be undone.`)) return
    await fetch(`/api/admin/users/${customer.id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button onClick={() => setEditing(true)} className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50">Edit</button>
        <button onClick={remove} className="text-xs px-2 py-1 rounded border border-red-300 text-red-600 hover:bg-red-50">Delete</button>
      </div>

      {editing && (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4" onClick={() => setEditing(false)}>
          <div className="bg-white w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Edit Customer</h2>
              <button onClick={() => setEditing(false)} aria-label="Close"><X size={18} /></button>
            </div>
            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
            <form onSubmit={save} className="space-y-3">
              <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-300 px-3 py-2 text-sm" />
              <input required type="email" placeholder="Email" value={form.primaryEmail} onChange={(e) => setForm({ ...form, primaryEmail: e.target.value })} className="w-full border border-gray-300 px-3 py-2 text-sm" />
              <input required placeholder="Phone" value={form.primaryPhone} onChange={(e) => setForm({ ...form, primaryPhone: e.target.value })} className="w-full border border-gray-300 px-3 py-2 text-sm" />
              <button type="submit" disabled={saving} className="w-full py-2.5 text-white font-medium text-sm disabled:opacity-50" style={{ backgroundColor: 'var(--green)' }}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
