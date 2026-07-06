'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const LOCAL_IMAGES = [
  '/images/products/p-sq-1.jpg', '/images/products/p-sq-2.jpg', '/images/products/p-sq-3.jpg',
  '/images/products/p-sq-25.jpg', '/images/products/p-sq-26.jpg', '/images/products/p-sq-73.jpg',
  '/images/products/p-brown.jpg', '/images/products/p-blkgre.jpg',
]

interface Category { id: string; name: string }
interface Variant { id: string; sku: string; price: string; wholesalePrice: string; stock: string }

export default function AdminProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [image, setImage] = useState('')
  const [customImg, setCustomImg] = useState('')
  const [variants, setVariants] = useState<Variant[]>([])

  const [form, setForm] = useState({
    name: '', slug: '', shortDesc: '', description: '',
    categoryId: '', isFeatured: false, isOnSale: false, gstRate: '12', status: 'ACTIVE',
  })

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories ?? [])).catch(() => {})
    fetch(`/api/admin/products/${id}`)
      .then(async r => {
        if (!r.ok) { setNotFound(true); return null }
        return r.json()
      })
      .then(data => {
        if (!data?.product) return
        const p = data.product
        setForm({
          name: p.name ?? '', slug: p.slug ?? '', shortDesc: p.shortDesc ?? '',
          description: p.description ?? '', categoryId: p.categoryId ?? '',
          isFeatured: !!p.isFeatured, isOnSale: !!p.isOnSale,
          gstRate: String(p.taxRate ?? 12), status: p.status ?? 'ACTIVE',
        })
        const primary = p.images?.find((i: any) => i.isPrimary) ?? p.images?.[0]
        setImage(primary?.url ?? LOCAL_IMAGES[0])
        setVariants((p.variants ?? []).map((v: any) => ({
          id: v.id, sku: v.sku,
          price: String(Number(v.price)), wholesalePrice: String(Number(v.wholesalePrice ?? 0)), stock: String(v.stock ?? 0),
        })))
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  const updateVariant = (i: number, key: keyof Variant, value: string) =>
    setVariants(prev => prev.map((v, idx) => idx === i ? { ...v, [key]: value } : v))

  const handleSave = async () => {
    if (!form.name || !form.categoryId) { setError('Name and category are required'); return }
    setSaving(true); setError('')
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form, taxRate: parseFloat(form.gstRate),
        image: customImg || image,
        variants,
      }),
    })
    const data = await res.json()
    if (res.ok) { router.push('/admin/products'); router.refresh() }
    else { setError(data.error ?? 'Failed to save'); setSaving(false) }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this product permanently?')) return
    setSaving(true)
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    if (res.ok) { router.push('/admin/products'); router.refresh() }
    else { setError('Failed to delete'); setSaving(false) }
  }

  if (loading) return <div className="p-8 text-sm text-[var(--ink-soft)]">Loading product…</div>
  if (notFound) return (
    <div className="p-8">
      <p className="text-sm text-[var(--ink-soft)] mb-4">Product not found.</p>
      <Link href="/admin/products" className="text-sm font-medium text-[var(--green)] hover:underline">← Back to products</Link>
    </div>
  )

  const field = 'w-full border border-[var(--line)] rounded-none px-3 py-2 text-sm focus:outline-none focus:border-[var(--green)]'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--ink)]">Edit Product</h1>
          <p className="text-sm text-[var(--ink-soft)] mt-1">Update details, pricing and image</p>
        </div>
        <Link href="/admin/products" className="px-4 py-2 border border-[var(--line)] rounded-none text-sm text-[var(--ink-soft)] hover:bg-[var(--surface)]">← Back</Link>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-none text-sm text-red-600">{error}</div>}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-none border border-[var(--line)] p-6">
            <h2 className="font-semibold text-[var(--ink)] mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1">Product Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} className={field} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1">URL Slug</label>
                <input type="text" value={form.slug} onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))} className={`${field} font-mono text-xs`} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1">Short Description</label>
                <input type="text" value={form.shortDesc} onChange={(e) => setForm(f => ({ ...f, shortDesc: e.target.value }))} className={field} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1">Full Description</label>
                <textarea rows={4} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} className={`${field} resize-none`} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-none border border-[var(--line)] p-6">
            <h2 className="font-semibold text-[var(--ink)] mb-4">Variants & Pricing</h2>
            <div className="space-y-3">
              {variants.length === 0 && <p className="text-sm text-[var(--ink-soft)]">No variants.</p>}
              {variants.map((v, i) => (
                <div key={v.id} className="p-4 border border-[var(--line)] rounded-none bg-[var(--surface)]">
                  <p className="text-xs font-mono text-[var(--ink-soft)] mb-3">{v.sku}</p>
                  <div className="grid grid-cols-3 gap-3">
                    {([['Retail ₹', 'price'], ['Wholesale ₹', 'wholesalePrice'], ['Stock', 'stock']] as const).map(([label, key]) => (
                      <div key={key}>
                        <label className="block text-xs text-[var(--ink-soft)] mb-1">{label}</label>
                        <input type="text" value={v[key]} onChange={(e) => updateVariant(i, key, e.target.value)} className="w-full border border-[var(--line)] rounded px-2 py-1.5 text-xs focus:outline-none bg-white" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-none border border-[var(--line)] p-5">
            <h2 className="font-semibold text-[var(--ink)] mb-4">Settings</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1">Category *</label>
                <select value={form.categoryId} onChange={(e) => setForm(f => ({ ...f, categoryId: e.target.value }))} className={field}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))} className={field}>
                  <option value="ACTIVE">Active</option>
                  <option value="DRAFT">Draft</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1">GST Rate (%)</label>
                <select value={form.gstRate} onChange={(e) => setForm(f => ({ ...f, gstRate: e.target.value }))} className={field}>
                  <option value="5">5%</option><option value="12">12%</option><option value="18">18%</option>
                </select>
              </div>
              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm(f => ({ ...f, isFeatured: e.target.checked }))} />
                  <span className="text-[var(--ink-soft)]">Featured</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.isOnSale} onChange={(e) => setForm(f => ({ ...f, isOnSale: e.target.checked }))} />
                  <span className="text-[var(--ink-soft)]">On Sale</span>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-none border border-[var(--line)] p-5">
            <h2 className="font-semibold text-[var(--ink)] mb-3">Product Image</h2>
            <div className="mb-3 rounded-none overflow-hidden bg-[var(--surface)] aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={customImg || image} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <div className="grid grid-cols-4 gap-1.5 mb-3">
              {LOCAL_IMAGES.map((img) => (
                <button key={img} onClick={() => { setImage(img); setCustomImg('') }}
                  className={`rounded overflow-hidden border-2 transition-all ${image === img && !customImg ? 'border-[var(--green)]' : 'border-transparent'}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="w-full aspect-square object-cover" />
                </button>
              ))}
            </div>
            <input type="url" value={customImg} onChange={(e) => setCustomImg(e.target.value)} placeholder="Or paste image URL" className="w-full border border-[var(--line)] rounded px-2 py-1.5 text-xs focus:outline-none" />
          </div>

          <button onClick={handleSave} disabled={saving} className="w-full py-3 text-white rounded-none font-semibold text-sm disabled:opacity-60" style={{ backgroundColor: 'var(--green)' }}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <button onClick={handleDelete} disabled={saving} className="w-full py-2.5 rounded-none font-medium text-sm border border-red-200 text-red-600 hover:bg-red-50">
            Delete Product
          </button>
        </div>
      </div>
    </div>
  )
}
