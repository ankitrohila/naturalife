'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, ChevronUp, ChevronDown, X } from 'lucide-react'

interface MenuItemRow {
  id: string
  parentId: string | null
  label: string
  url: string | null
  categorySlug: string | null
  imageUrl: string | null
  sortOrder: number
  isActive: boolean
}

export default function MenuManagerPage() {
  const [location, setLocation] = useState<'header' | 'footer'>('header')
  const [items, setItems] = useState<MenuItemRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [parentForNew, setParentForNew] = useState<string | null>(null)
  const [form, setForm] = useState({ label: '', url: '', categorySlug: '', imageUrl: '' })

  const fetchItems = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/menu-items?location=${location}`)
    const data = await res.json()
    setItems(data.items ?? [])
    setLoading(false)
  }, [location])

  useEffect(() => { fetchItems() }, [fetchItems])

  const topLevel = items.filter((i) => !i.parentId)
  const childrenOf = (id: string) => items.filter((i) => i.parentId === id)

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/admin/menu-items', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ menuLocation: location, parentId: parentForNew, ...form }),
    })
    setShowForm(false)
    setForm({ label: '', url: '', categorySlug: '', imageUrl: '' })
    fetchItems()
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this menu item (and its children)?')) return
    await fetch(`/api/admin/menu-items/${id}`, { method: 'DELETE' })
    fetchItems()
  }

  const move = async (item: MenuItemRow, dir: -1 | 1) => {
    const siblings = items.filter((i) => i.parentId === item.parentId).sort((a, b) => a.sortOrder - b.sortOrder)
    const idx = siblings.findIndex((s) => s.id === item.id)
    const swapWith = siblings[idx + dir]
    if (!swapWith) return
    await Promise.all([
      fetch(`/api/admin/menu-items/${item.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sortOrder: swapWith.sortOrder }) }),
      fetch(`/api/admin/menu-items/${swapWith.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sortOrder: item.sortOrder }) }),
    ])
    fetchItems()
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Menu Manager</h1>
        <p className="text-sm text-gray-500">Manage header and footer navigation structure, parent/child items, and mega-menu promo images.</p>
      </div>

      <div className="flex gap-2 mb-5">
        {(['header', 'footer'] as const).map((loc) => (
          <button key={loc} onClick={() => setLocation(loc)} className={`px-4 py-2 text-sm font-medium border ${location === loc ? 'text-white' : 'text-gray-600 bg-white'}`} style={location === loc ? { backgroundColor: 'var(--green)', borderColor: 'var(--green)' } : { borderColor: '#e5e5e5' }}>
            {loc === 'header' ? 'Header Menu' : 'Footer Menu'}
          </button>
        ))}
        <button onClick={() => { setParentForNew(null); setShowForm(true) }} className="ml-auto flex items-center gap-2 px-4 py-2 text-sm text-white font-medium" style={{ backgroundColor: 'var(--saffron)' }}>
          <Plus size={16} /> Add Top-Level Item
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : (
        <div className="bg-white border border-gray-100 shadow-sm divide-y divide-gray-50">
          {topLevel.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-gray-400">No menu items yet</p>
          ) : topLevel.sort((a, b) => a.sortOrder - b.sortOrder).map((item) => (
            <div key={item.id} className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <button onClick={() => move(item, -1)} className="text-gray-400 hover:text-gray-700"><ChevronUp size={14} /></button>
                  <button onClick={() => move(item, 1)} className="text-gray-400 hover:text-gray-700"><ChevronDown size={14} /></button>
                </div>
                {item.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt={item.label} className="w-10 h-10 object-cover border border-gray-200" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.categorySlug ? `Category: ${item.categorySlug}` : item.url || 'No link'}</p>
                </div>
                <button onClick={() => { setParentForNew(item.id); setShowForm(true) }} className="text-xs font-medium hover:underline" style={{ color: 'var(--green)' }}>+ Add Child</button>
                <button onClick={() => remove(item.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
              </div>

              {childrenOf(item.id).length > 0 && (
                <div className="ml-10 mt-2 space-y-1.5 border-l-2 border-gray-100 pl-4">
                  {childrenOf(item.id).sort((a, b) => a.sortOrder - b.sortOrder).map((child) => (
                    <div key={child.id} className="flex items-center gap-3 text-sm">
                      <div className="flex flex-col">
                        <button onClick={() => move(child, -1)} className="text-gray-400 hover:text-gray-700"><ChevronUp size={12} /></button>
                        <button onClick={() => move(child, 1)} className="text-gray-400 hover:text-gray-700"><ChevronDown size={12} /></button>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-700">{child.label}</p>
                        <p className="text-xs text-gray-400">{child.categorySlug ? `Category: ${child.categorySlug}` : child.url || 'No link'}</p>
                      </div>
                      <button onClick={() => remove(child.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={12} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{parentForNew ? 'Add Child Item' : 'Add Top-Level Item'}</h2>
              <button onClick={() => setShowForm(false)} aria-label="Close"><X size={18} /></button>
            </div>
            <form onSubmit={addItem} className="space-y-3">
              <input required placeholder="Label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="w-full border border-gray-300 px-3 py-2 text-sm" />
              <input placeholder="Category slug (optional)" value={form.categorySlug} onChange={(e) => setForm({ ...form, categorySlug: e.target.value })} className="w-full border border-gray-300 px-3 py-2 text-sm" />
              <input placeholder="Custom URL (optional)" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className="w-full border border-gray-300 px-3 py-2 text-sm" />
              {!parentForNew && (
                <input placeholder="Promo image URL (optional, for mega-menu)" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="w-full border border-gray-300 px-3 py-2 text-sm" />
              )}
              <button type="submit" className="w-full py-2.5 text-white font-medium text-sm" style={{ backgroundColor: 'var(--green)' }}>Save Item</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
