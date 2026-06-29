'use client'

import { useState, useRef } from 'react'
import { useCartStore } from '@/store/cart'
import { Minus, Plus, ShoppingCart, Zap } from 'lucide-react'

interface Variant {
  id: string
  sku: string
  price: number
  wholesalePrice: number
  minWholesaleQty: number
  stock: number
  attributeValues: Array<{ attributeId: string; valueId: string }>
  bulkPricingRules: Array<{ minQty: number; maxQty: number | null; pricePerUnit: number; label: string | null }>
}

interface ProductImage {
  id: string
  url: string
  altText: string | null
  isPrimary: boolean
  attributeValue: string | null
}

interface AttributeVal {
  attribute: { id: string; name: string; displayName: string }
  value: { id: string; value: string; label: string; hexColor: string | null; imageUrl: string | null }
}

interface Review { id: string; name: string; rating: number; text: string; createdAt: string }

interface Product {
  id: string
  name: string
  slug: string
  shortDesc: string | null
  description: string | null
  sku: string
  taxRate: number
  images: ProductImage[]
  variants: Variant[]
  attributeValues: AttributeVal[]
  category: { name: string; slug: string }
  reviews?: Review[]
}

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`

export function ProductDetailClient({ product }: { product: Product }) {
  const orderType = useCartStore((s) => s.orderType)
  const setOrderType = useCartStore((s) => s.setOrderType)
  const addItem = useCartStore((s) => s.addItem)

  const [mainImage, setMainImage] = useState(product.images.find((i) => i.isPrimary)?.url ?? product.images[0]?.url)
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>({})
  const [qty, setQty] = useState(1)
  const [addedMsg, setAddedMsg] = useState('')
  const [tab, setTab] = useState<'info' | 'reviews'>('info')
  const [zoom, setZoom] = useState(false)
  const [origin, setOrigin] = useState('50% 50%')
  const zoomRef = useRef<HTMLDivElement>(null)

  // Group attribute values by attribute, SIZE first then COLOR (like the reference)
  const order: Record<string, number> = { SIZE: 0, COLOR: 1 }
  const attrGroups = Object.values(
    product.attributeValues.reduce<Record<string, { attr: AttributeVal['attribute']; values: AttributeVal['value'][] }>>((acc, av) => {
      const key = av.attribute.id
      if (!acc[key]) acc[key] = { attr: av.attribute, values: [] }
      if (!acc[key].values.find((v) => v.id === av.value.id)) acc[key].values.push(av.value)
      return acc
    }, {})
  ).sort((a, b) => (order[a.attr.name] ?? 9) - (order[b.attr.name] ?? 9))

  // Match a variant from the current selection
  const matchingVariant =
    product.variants.find((v) => {
      const avs = v.attributeValues as Array<{ attributeId: string; valueId: string }>
      return avs.every((av) => !selectedAttrs[av.attributeId] || selectedAttrs[av.attributeId] === av.valueId)
    }) ?? product.variants[0]

  const allSelected = attrGroups.every((g) => selectedAttrs[g.attr.id])

  const getUnitPrice = (variant: Variant) => {
    if (orderType === 'WHOLESALE') {
      const rule = [...variant.bulkPricingRules]
        .sort((a, b) => b.minQty - a.minQty)
        .find((r) => qty >= r.minQty && (!r.maxQty || qty <= r.maxQty))
      if (rule) return Number(rule.pricePerUnit)
      return Number(variant.wholesalePrice)
    }
    return Number(variant.price)
  }

  // Price RANGE across all variants for the current order type
  const allPrices = product.variants.map((v) => (orderType === 'WHOLESALE' ? Number(v.wholesalePrice) : Number(v.price)))
  const minPrice = Math.min(...allPrices)
  const maxPrice = Math.max(...allPrices)

  const unitPrice = matchingVariant ? getUnitPrice(matchingVariant) : 0
  const subtotal = unitPrice * qty
  const taxAmount = (subtotal * Number(product.taxRate)) / 100
  const total = subtotal + taxAmount

  const handleAttrSelect = (attrId: string, valueId: string, imageUrl?: string | null) => {
    setSelectedAttrs((prev) => ({ ...prev, [attrId]: valueId }))
    // Selecting a colour swaps the main image to that colour's photo
    const matched = product.images.find((img) => img.attributeValue === valueId)
    if (matched) setMainImage(matched.url)
    else if (imageUrl) setMainImage(imageUrl)
  }

  const handleMove = (e: React.MouseEvent) => {
    const el = zoomRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * 100
    const y = ((e.clientY - r.top) / r.height) * 100
    setOrigin(`${x}% ${y}%`)
  }

  const handleAddToCart = () => {
    if (!matchingVariant) return
    addItem({
      variantId: matchingVariant.id,
      productId: product.id,
      productSlug: product.slug,
      name: product.name,
      image: mainImage ?? '',
      attributes: Object.entries(selectedAttrs).reduce<Record<string, string>>((acc, [attrId, valueId]) => {
        const av = product.attributeValues.find((a) => a.attribute.id === attrId && a.value.id === valueId)
        if (av) acc[av.attribute.displayName] = av.value.label
        return acc
      }, {}),
      qty,
      unitPrice: Number(matchingVariant.price),
      wholesalePrice: Number(matchingVariant.wholesalePrice),
      taxRate: Number(product.taxRate),
      sku: matchingVariant.sku,
    })
    setAddedMsg('Added to cart!')
    setTimeout(() => setAddedMsg(''), 3000)
  }

  const features = ['Super Soft Feel', 'Water Absorbency', '40°C Machine Washable', '100% Micro Fiber', 'Anti-Skid Backing']

  return (
    <>
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div className="flex gap-3">
          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex flex-col gap-2 w-16 shrink-0">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setMainImage(img.url)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${mainImage === img.url ? 'border-[var(--green)]' : 'border-[var(--line)]'}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.altText ?? ''} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          {/* Main image with hover zoom */}
          <div
            ref={zoomRef}
            onMouseEnter={() => setZoom(true)}
            onMouseLeave={() => setZoom(false)}
            onMouseMove={handleMove}
            className="flex-1 aspect-square rounded-2xl overflow-hidden bg-[var(--surface)] border border-[var(--line)] cursor-zoom-in relative"
          >
            {mainImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-full object-contain transition-transform duration-150"
                style={{ transform: zoom ? 'scale(2)' : 'scale(1)', transformOrigin: origin }}
              />
            ) : (
              <div className="w-full h-full bg-[var(--surface-2)]" />
            )}
          </div>
        </div>

        {/* Details */}
        <div>
          <p className="text-sm text-gray-500 mb-1">{product.category.name} · SKU: {product.sku}</p>
          <h1 className="text-2xl md:text-3xl font-semibold mb-3" style={{ color: 'var(--ink)' }}>
            {product.name}
          </h1>

          {/* Price range / selected price */}
          <div className="mb-4">
            {allSelected ? (
              <span className="text-2xl font-semibold" style={{ color: 'var(--green)' }}>{inr(unitPrice)}</span>
            ) : (
              <span className="text-2xl font-semibold" style={{ color: 'var(--green)' }}>
                {minPrice === maxPrice ? inr(minPrice) : `${inr(minPrice)} – ${inr(maxPrice)}`}
              </span>
            )}
          </div>

          {/* Feature bullets */}
          <ul className="text-sm text-gray-600 space-y-1 mb-5 list-disc pl-5">
            {features.map((f) => <li key={f}>{f}.</li>)}
          </ul>

          {/* Order type */}
          <div className="flex rounded-lg overflow-hidden border border-[var(--line)] mb-5 w-fit">
            {(['RETAIL', 'WHOLESALE'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setOrderType(type)}
                className={`px-5 py-2 text-sm font-medium transition-colors ${orderType === type ? 'text-white' : 'bg-white text-gray-700'}`}
                style={orderType === type ? { backgroundColor: 'var(--green)' } : {}}
              >
                {type === 'RETAIL' ? 'Retail' : 'Wholesale'}
              </button>
            ))}
          </div>

          {/* Attribute selectors */}
          {attrGroups.map(({ attr, values }) => (
            <div key={attr.id} className="mb-5">
              <p className="text-xs font-semibold tracking-wide uppercase text-gray-500 mb-2">{attr.displayName}</p>
              <div className="flex flex-wrap gap-2.5">
                {values.map((v) => {
                  const isSelected = selectedAttrs[attr.id] === v.id
                  if (attr.name === 'COLOR') {
                    return (
                      <span key={v.id} className="relative group/swatch">
                        <button
                          onClick={() => handleAttrSelect(attr.id, v.id, v.imageUrl)}
                          className={`w-8 h-8 rounded-full border transition-all ${isSelected ? 'ring-2 ring-offset-2 ring-[var(--green)] border-transparent' : 'border-gray-300 hover:scale-110'}`}
                          style={
                            v.imageUrl
                              ? { backgroundImage: `url(${v.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                              : { backgroundColor: v.hexColor ?? '#ddd' }
                          }
                          aria-label={v.label}
                        />
                        <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-[var(--ink)] px-2 py-1 text-[11px] text-white opacity-0 group-hover/swatch:opacity-100 transition-opacity z-10">
                          {v.label}
                        </span>
                      </span>
                    )
                  }
                  return (
                    <button
                      key={v.id}
                      onClick={() => handleAttrSelect(attr.id, v.id, v.imageUrl)}
                      className={`px-3 py-1.5 rounded-lg border text-sm transition-all ${isSelected ? 'border-[var(--green)] text-[var(--green)] font-medium bg-[var(--green-light)]' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
                    >
                      {v.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Quantity — manual entry + steppers for BOTH retail and wholesale */}
          <div className="mb-5">
            <p className="text-xs font-semibold tracking-wide uppercase text-gray-500 mb-2">
              Quantity {orderType === 'WHOLESALE' && <span className="text-gray-400 normal-case">(enter number of units)</span>}
            </p>
            <div className="flex items-center gap-3">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50">
                <Minus size={14} />
              </button>
              <input
                type="number"
                value={qty}
                min={1}
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 text-center border border-gray-300 rounded-lg py-1.5 text-sm focus:outline-none focus:border-[var(--green)]"
              />
              <button onClick={() => setQty(qty + 1)} className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50">
                <Plus size={14} />
              </button>
              {orderType === 'WHOLESALE' && (
                <span className="text-xs text-gray-500">Min {matchingVariant?.minWholesaleQty ?? 5} units for wholesale rates</span>
              )}
            </div>
          </div>

          {/* Bulk Pricing Table (wholesale) */}
          {orderType === 'WHOLESALE' && matchingVariant?.bulkPricingRules.length > 0 && (
            <div className="mb-5 border border-[var(--line)] rounded-lg overflow-hidden">
              <div className="bg-[var(--surface)] px-4 py-2 text-xs font-semibold text-gray-600">Bulk Pricing (per unit)</div>
              <table className="w-full text-sm">
                <tbody>
                  <tr className={`border-t border-gray-100 ${qty < (matchingVariant.bulkPricingRules[0]?.minQty ?? 20) ? 'bg-[var(--green-light)]' : ''}`}>
                    <td className="px-4 py-2 text-gray-600">1–{(matchingVariant.bulkPricingRules[0]?.minQty ?? 20) - 1} units</td>
                    <td className="px-4 py-2 font-semibold text-right" style={{ color: 'var(--green)' }}>{inr(Number(matchingVariant.wholesalePrice))}/unit</td>
                  </tr>
                  {matchingVariant.bulkPricingRules.map((rule, i) => (
                    <tr key={i} className={`border-t border-gray-100 ${qty >= rule.minQty && (!rule.maxQty || qty <= rule.maxQty) ? 'bg-[var(--green-light)]' : ''}`}>
                      <td className="px-4 py-2 text-gray-600">{rule.label ?? `${rule.minQty}${rule.maxQty ? `–${rule.maxQty}` : '+'} units`}</td>
                      <td className="px-4 py-2 font-semibold text-right" style={{ color: 'var(--green)' }}>{inr(Number(rule.pricePerUnit))}/unit</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Price breakdown */}
          {matchingVariant && (
            <div className="rounded-xl p-4 mb-5 border" style={{ backgroundColor: 'var(--green-light)', borderColor: 'var(--line)' }}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Unit price{orderType === 'WHOLESALE' ? ' (for ' + qty + ' units)' : ''}</span>
                <span className="font-medium">{inr(unitPrice)}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Quantity</span>
                <span className="font-medium">× {qty}</span>
              </div>
              <div className="flex justify-between text-sm mb-1 pb-2 border-b border-[var(--line)]">
                <span className="text-gray-600">Subtotal (excl. GST)</span>
                <span className="font-medium">{inr(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">GST ({product.taxRate}%)</span>
                <span className="text-gray-500">₹{taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold mt-1">
                <span>Total (incl. GST)</span>
                <span className="text-lg" style={{ color: 'var(--green)' }}>₹{total.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="flex gap-3 mb-4">
            <button onClick={handleAddToCart} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90" style={{ backgroundColor: 'var(--green)' }}>
              <ShoppingCart size={18} />
              {addedMsg || 'Add to Cart'}
            </button>
            <a href="/checkout" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all hover:opacity-90 text-white" style={{ backgroundColor: 'var(--ink)' }} onClick={handleAddToCart}>
              <Zap size={18} />
              Buy Now
            </a>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>Free shipping on orders above ₹1,000</p>
            <p>GST invoice included · 7-day easy returns · Pan-India delivery in 5–7 days</p>
          </div>
        </div>
      </div>

      {/* Tabs: Additional Information / Reviews */}
      <div className="mt-14">
        <div className="flex gap-8 border-b border-[var(--line)] justify-center">
          {([['info', 'Additional Information'], ['reviews', 'Reviews']] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`pb-3 text-lg font-medium transition-colors -mb-px border-b-2 ${tab === key ? 'border-[var(--green)] text-[var(--ink)]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="py-8 max-w-3xl mx-auto">
          {tab === 'info' ? (
            <table className="w-full text-sm">
              <tbody>
                {attrGroups.map(({ attr, values }) => (
                  <tr key={attr.id} className="border-b border-[var(--line)]">
                    <td className="py-3 pr-6 font-semibold text-gray-700 w-32 align-top">{attr.displayName}</td>
                    <td className="py-3 text-gray-600">{values.map((v) => v.label).join(', ')}</td>
                  </tr>
                ))}
                <tr className="border-b border-[var(--line)]">
                  <td className="py-3 pr-6 font-semibold text-gray-700 align-top">SKU</td>
                  <td className="py-3 text-gray-600">{product.sku}</td>
                </tr>
                <tr className="border-b border-[var(--line)]">
                  <td className="py-3 pr-6 font-semibold text-gray-700 align-top">Category</td>
                  <td className="py-3 text-gray-600">{product.category.name}</td>
                </tr>
                {product.description && (
                  <tr className="border-b border-[var(--line)]">
                    <td className="py-3 pr-6 font-semibold text-gray-700 align-top">Description</td>
                    <td className="py-3 text-gray-600 whitespace-pre-line">{product.description}</td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <ReviewsTab productId={product.id} productName={product.name} reviews={product.reviews ?? []} />
          )}
        </div>
      </div>
    </>
  )
}

function ReviewsTab({ productId, productName, reviews }: { productId: string; productName: string; reviews: Review[] }) {
  const [rating, setRating] = useState(0)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [text, setText] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const count = reviews.length
  const avg = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0
  const dist = [5, 4, 3, 2, 1].map((s) => ({ s, pct: count ? Math.round((reviews.filter(r => r.rating === s).length / count) * 100) : 0 }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const res = await fetch('/api/reviews', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, name, email, rating: rating || 5, text }),
    })
    if (res.ok) setSubmitted(true)
    else { const d = await res.json(); setError(d.error ?? 'Failed to submit') }
  }

  return (
    <div>
      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <p className="text-sm text-gray-500 mb-1">Based on {count} review{count === 1 ? '' : 's'}</p>
          <p className="text-4xl font-semibold mb-4" style={{ color: 'var(--green)' }}>{avg.toFixed(2)} <span className="text-base text-gray-400 font-normal">Overall</span></p>
          {dist.map(({ s, pct }) => (
            <div key={s} className="flex items-center gap-2 mb-1">
              <span className="text-[var(--green)] text-xs w-16">{'★'.repeat(s)}</span>
              <div className="flex-1 h-1.5 bg-[var(--surface-2)] rounded overflow-hidden"><div className="h-full bg-[var(--green)]" style={{ width: `${pct}%` }} /></div>
              <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
            </div>
          ))}
        </div>
        <div>
          <h4 className="font-semibold text-[var(--ink)] mb-3">{count ? 'Write a review' : `Be the first to review “${productName}”`}</h4>
          {submitted ? (
            <p className="text-sm text-[var(--green)]">Thank you! Your review has been submitted and will appear once approved.</p>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Your rating:</span>
                {[1, 2, 3, 4, 5].map((s) => (
                  <button type="button" key={s} onClick={() => setRating(s)} className={`text-lg ${s <= rating ? 'text-[var(--green)]' : 'text-gray-300'}`}>★</button>
                ))}
              </div>
              <textarea required value={text} onChange={(e) => setText(e.target.value)} placeholder="Your review" rows={4} className="w-full border border-[var(--line)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--green)]" />
              <div className="grid grid-cols-2 gap-3">
                <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="border border-[var(--line)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--green)]" />
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email (optional)" className="border border-[var(--line)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--green)]" />
              </div>
              <button type="submit" className="px-6 py-2.5 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: 'var(--green)' }}>Submit Review</button>
            </form>
          )}
        </div>
      </div>

      {count > 0 && (
        <div className="mt-10 space-y-5 max-w-2xl">
          {reviews.map((r) => (
            <div key={r.id} className="border-b border-[var(--line)] pb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm text-[var(--ink)]">{r.name}</span>
                <span className="text-[var(--green)] text-xs">{'★'.repeat(r.rating)}</span>
                <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('en-IN')}</span>
              </div>
              <p className="text-sm text-gray-600">{r.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
