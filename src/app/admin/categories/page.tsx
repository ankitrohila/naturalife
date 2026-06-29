'use client'

import { useEffect, useState } from 'react'

interface Category { id: string; name: string; slug: string; description: string | null; _count?: { products: number } }

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    fetch('/api/admin/categories').then(r => r.json()).then(d => setCategories(d.categories ?? [])).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true); setError('')
    const res = await fetch('/api/admin/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, description }) })
    const data = await res.json()
    if (res.ok) { setName(''); setDescription(''); load() } else setError(data.error ?? 'Failed to add')
    setSaving(false)
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this category?')) return
    const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (res.ok) load(); else alert(data.error ?? 'Failed to delete')
  }

  const field = 'w-full border border-[var(--line)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--green)]'

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[var(--ink)]">Categories</h1>
        <p className="text-sm text-[var(--ink-soft)] mt-1">Organise products into shop categories</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Add form */}
        <div className="bg-white rounded-xl border border-[var(--line)] p-5 h-fit">
          <h2 className="font-semibold text-[var(--ink)] mb-4">Add Category</h2>
          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
          <form onSubmit={add} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1">Name *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className={field} placeholder="e.g. Bath Mats" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={`${field} resize-none`} />
            </div>
            <button disabled={saving} className="w-full py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-60" style={{ backgroundColor: 'var(--green)' }}>
              {saving ? 'Adding…' : 'Add Category'}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="md:col-span-2 bg-white rounded-xl border border-[var(--line)] overflow-hidden">
          <div className="px-5 py-3 border-b border-[var(--line)] text-sm text-[var(--ink-soft)]">{categories.length} categories</div>
          {loading ? (
            <p className="p-8 text-center text-sm text-[var(--ink-soft)]">Loading…</p>
          ) : categories.length === 0 ? (
            <p className="p-8 text-center text-sm text-[var(--ink-soft)]">No categories yet</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-[var(--surface)] border-b border-[var(--line)]">
                <tr>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Name</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Slug</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Products</th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-[var(--surface)]">
                    <td className="px-4 py-3 font-medium text-[var(--ink)]">{c.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--ink-soft)]">{c.slug}</td>
                    <td className="px-4 py-3 text-[var(--ink-soft)]">{c._count?.products ?? 0}</td>
                    <td className="px-4 py-3 text-right">
                      <a href={`/shop?category=${c.slug}`} target="_blank" className="text-xs text-[var(--green)] hover:underline mr-3">View</a>
                      <button onClick={() => remove(c.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
