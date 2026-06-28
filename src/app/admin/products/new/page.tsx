'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const NATURALIFE_IMAGES = [
  { url: '/images/products/p-sq-1.jpg', label: 'Doormat 1' },
  { url: '/images/products/p-sq-2.jpg', label: 'Doormat 2' },
  { url: '/images/products/p-sq-3.jpg', label: 'Doormat 3' },
  { url: '/images/products/p-sq-25.jpg', label: 'Doormat 25' },
  { url: '/images/products/p-sq-26.jpg', label: 'Doormat 26' },
  { url: '/images/products/p-sq-73.jpg', label: 'Shag 73' },
  { url: '/images/products/p-brown.jpg', label: 'Brown Carpet' },
  { url: '/images/products/p-blkgre.jpg', label: 'Black-Green' },
]

interface Category { id: string; name: string }

export default function AdminProductNewPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [selectedImg, setSelectedImg] = useState(NATURALIFE_IMAGES[0].url)
  const [customImgUrl, setCustomImgUrl] = useState('')

  const [form, setForm] = useState({
    name: '',
    slug: '',
    shortDesc: '',
    description: '',
    categoryId: '',
    isFeatured: false,
    isOnSale: false,
    gstRate: '12',
    status: 'ACTIVE',
  })

  const [variants, setVariants] = useState([
    { sku: '', size: '', color: '', price: '', wholesalePrice: '', mrp: '', stock: '100' }
  ])

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories ?? [])).catch(() => {})
  }, [])

  const autoSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const addVariant = () => setVariants(prev => [...prev, { sku: '', size: '', color: '', price: '', wholesalePrice: '', mrp: '', stock: '100' }])
  const removeVariant = (i: number) => setVariants(prev => prev.filter((_, idx) => idx !== i))
  const updateVariant = (i: number, key: string, value: string) => setVariants(prev => prev.map((v, idx) => idx === i ? { ...v, [key]: value } : v))

  const handleSave = async () => {
    if (!form.name || !form.categoryId) { setError('Name and category are required'); return }
    if (variants.some(v => !v.price)) { setError('All variants need a price'); return }
    setSaving(true)
    setError('')

    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        slug: form.slug || autoSlug(form.name),
        taxRate: parseFloat(form.gstRate),
        images: [{ url: customImgUrl || selectedImg, altText: form.name, isPrimary: true }],
        variants: variants.map((v, i) => ({
          ...v,
          sku: v.sku || `${autoSlug(form.name)}-${i + 1}`,
          price: parseFloat(v.price),
          wholesalePrice: v.wholesalePrice ? parseFloat(v.wholesalePrice) : null,
          mrp: v.mrp ? parseFloat(v.mrp) : null,
          stock: parseInt(v.stock),
        })),
      }),
    })

    const data = await res.json()
    if (res.ok) {
      router.push('/admin/products')
    } else {
      setError(data.error ?? 'Failed to create product')
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ backgroundColor: '#F6F6F6' }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
            <p className="text-sm text-gray-500 mt-1">Fill in the details below to create a new product</p>
          </div>
          <Link href="/admin/products" className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">← Back</Link>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main form */}
          <div className="lg:col-span-2 space-y-5">
            {/* Basic Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Product Name *</label>
                  <input type="text" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value, slug: autoSlug(e.target.value) }))}
                    placeholder="e.g. NATURALIFE DOORMAT BB-11" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">URL Slug</label>
                  <input type="text" value={form.slug} onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))}
                    placeholder="auto-generated from name" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none font-mono text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Short Description</label>
                  <input type="text" value={form.shortDesc} onChange={(e) => setForm(f => ({ ...f, shortDesc: e.target.value }))}
                    placeholder="Super Soft Feel. Water Absorbent. Anti Skid." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Full Description</label>
                  <textarea rows={4} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Detailed product description..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none" />
                </div>
              </div>
            </div>

            {/* Variants */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800">Variants & Pricing</h2>
                <button onClick={addVariant} className="text-xs px-3 py-1 rounded text-white" style={{ backgroundColor: 'var(--green)' }}>+ Add Variant</button>
              </div>
              <div className="space-y-4">
                {variants.map((v, i) => (
                  <div key={i} className="p-4 border border-gray-100 rounded-lg bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-semibold text-gray-600">Variant #{i + 1}</span>
                      {variants.length > 1 && (
                        <button onClick={() => removeVariant(i)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        { label: 'Size', key: 'size', placeholder: 'e.g. 40x60 CM' },
                        { label: 'Color', key: 'color', placeholder: 'e.g. BLACK-GREY' },
                        { label: 'SKU', key: 'sku', placeholder: 'auto-generated if blank' },
                        { label: 'Retail Price ₹ *', key: 'price', placeholder: '499' },
                        { label: 'Wholesale Price ₹', key: 'wholesalePrice', placeholder: '350' },
                        { label: 'Stock', key: 'stock', placeholder: '100' },
                      ].map(({ label, key, placeholder }) => (
                        <div key={key}>
                          <label className="block text-xs text-gray-500 mb-1">{label}</label>
                          <input type="text" value={v[key as keyof typeof v]} onChange={(e) => updateVariant(i, key, e.target.value)}
                            placeholder={placeholder} className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none bg-white" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-5">
            {/* Category & Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-800 mb-4">Settings</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Category *</label>
                  <select value={form.categoryId} onChange={(e) => setForm(f => ({ ...f, categoryId: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                  <select value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option value="ACTIVE">Active</option>
                    <option value="DRAFT">Draft</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">GST Rate (%)</label>
                  <select value={form.gstRate} onChange={(e) => setForm(f => ({ ...f, gstRate: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                  </select>
                </div>
                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm(f => ({ ...f, isFeatured: e.target.checked }))} className="rounded" />
                    <span className="text-gray-600">Featured</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={form.isOnSale} onChange={(e) => setForm(f => ({ ...f, isOnSale: e.target.checked }))} className="rounded" />
                    <span className="text-gray-600">On Sale</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-800 mb-3">Product Image</h2>
              <div className="mb-3 rounded-lg overflow-hidden bg-gray-50 aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={customImgUrl || selectedImg} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <div className="grid grid-cols-4 gap-1.5 mb-3">
                {NATURALIFE_IMAGES.map((img) => (
                  <button key={img.url} onClick={() => { setSelectedImg(img.url); setCustomImgUrl('') }}
                    className={`rounded overflow-hidden border-2 transition-all ${selectedImg === img.url && !customImgUrl ? 'border-green-500' : 'border-transparent'}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.label} className="w-full aspect-square object-cover" />
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Or paste image URL:</label>
                <input type="url" value={customImgUrl} onChange={(e) => setCustomImgUrl(e.target.value)}
                  placeholder="https://..." className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none" />
              </div>
            </div>

            {/* Save */}
            <button onClick={handleSave} disabled={saving} className="w-full py-3 text-white rounded-xl font-semibold text-sm disabled:opacity-60 transition-opacity"
              style={{ backgroundColor: 'var(--green)' }}>
              {saving ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
