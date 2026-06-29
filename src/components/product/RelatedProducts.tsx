'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/store/cart'
import { ShoppingCart, Eye, X, Minus, Plus } from 'lucide-react'

interface Value { id: string; value: string; label: string; hexColor: string | null; imageUrl: string | null }
interface AttributeVal { attribute: { id: string; name: string; displayName: string }; value: Value }
interface Variant {
  id: string; sku: string; price: number; wholesalePrice: number; minWholesaleQty: number; stock: number
  attributeValues: Array<{ attributeId: string; valueId: string }>
  bulkPricingRules: Array<{ minQty: number; maxQty: number | null; pricePerUnit: number; label: string | null }>
}
export interface Item {
  id: string; name: string; slug: string; sku: string; taxRate: number; shortDesc: string | null; description: string | null
  category: { name: string; slug: string }
  images: Array<{ id: string; url: string; altText: string | null; isPrimary: boolean; attributeValue: string | null }>
  variants: Variant[]
  attributeValues: AttributeVal[]
}

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`

function groupAttrs(item: Item) {
  const order: Record<string, number> = { SIZE: 0, COLOR: 1 }
  return Object.values(
    item.attributeValues.reduce<Record<string, { attr: AttributeVal['attribute']; values: Value[] }>>((acc, av) => {
      const k = av.attribute.id
      if (!acc[k]) acc[k] = { attr: av.attribute, values: [] }
      if (!acc[k].values.find((v) => v.id === av.value.id)) acc[k].values.push(av.value)
      return acc
    }, {})
  ).sort((a, b) => (order[a.attr.name] ?? 9) - (order[b.attr.name] ?? 9))
}

export function RelatedProducts({ items }: { items: Item[] }) {
  const [quickView, setQuickView] = useState<Item | null>(null)
  const addItem = useCartStore((s) => s.addItem)

  const quickAdd = (item: Item) => {
    const v = item.variants[0]
    if (!v) return
    addItem({
      variantId: v.id, productId: item.id, productSlug: item.slug, name: item.name,
      image: item.images.find((i) => i.isPrimary)?.url ?? item.images[0]?.url ?? '',
      attributes: {}, qty: 1, unitPrice: Number(v.price), wholesalePrice: Number(v.wholesalePrice),
      taxRate: Number(item.taxRate), sku: v.sku,
    })
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {items.map((p) => {
          const image = p.images.find((i) => i.isPrimary)?.url ?? p.images[0]?.url
          const prices = p.variants.map((v) => Number(v.price))
          const min = Math.min(...prices), max = Math.max(...prices)
          const colors = groupAttrs(p).find((g) => g.attr.name === 'COLOR')?.values ?? []
          const sizes = groupAttrs(p).find((g) => g.attr.name === 'SIZE')?.values ?? []
          return (
            <div key={p.id} className="group bg-white rounded-xl overflow-hidden border border-[var(--line)] hover:shadow-md transition-all flex flex-col">
              <div className="relative aspect-square bg-[var(--surface)] overflow-hidden">
                <Link href={`/shop/${p.slug}`}>
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : <div className="w-full h-full bg-[var(--surface-2)]" />}
                </Link>
                {/* Quick view (appears on hover) */}
                <button
                  onClick={() => setQuickView(p)}
                  className="absolute top-2 right-2 w-9 h-9 rounded-full bg-white shadow flex items-center justify-center text-[var(--ink)] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--green)] hover:text-white"
                  aria-label="Quick view"
                >
                  <Eye size={16} />
                </button>
              </div>
              <div className="p-3 flex flex-col flex-1">
                <Link href={`/shop/${p.slug}`}>
                  <h3 className="text-sm font-semibold line-clamp-2 mb-1 uppercase hover:text-[var(--green)] transition-colors">{p.name}</h3>
                </Link>
                <p className="text-sm font-semibold mb-2" style={{ color: 'var(--green)' }}>
                  {min === max ? inr(min) : `${inr(min)} – ${inr(max)}`}
                </p>
                {colors.length > 0 && (
                  <div className="flex gap-1 mb-2">
                    {colors.slice(0, 6).map((c) => (
                      <span key={c.id} title={c.label} className="w-4 h-4 rounded-full border border-gray-200"
                        style={c.imageUrl ? { backgroundImage: `url(${c.imageUrl})`, backgroundSize: 'cover' } : { backgroundColor: c.hexColor ?? '#ddd' }} />
                    ))}
                  </div>
                )}
                {sizes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {sizes.slice(0, 3).map((s) => (
                      <span key={s.id} className="text-[10px] px-1.5 py-0.5 rounded border border-[var(--line)] text-gray-500">{s.label}</span>
                    ))}
                  </div>
                )}
                {/* Add to cart on hover */}
                <button
                  onClick={() => quickAdd(p)}
                  className="mt-auto w-full py-2 rounded-lg text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: 'var(--green)' }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {quickView && <QuickView item={quickView} onClose={() => setQuickView(null)} />}
    </>
  )
}

export function QuickView({ item, onClose }: { item: Item; onClose: () => void }) {
  const addItem = useCartStore((s) => s.addItem)
  const groups = groupAttrs(item)
  const [sel, setSel] = useState<Record<string, string>>({})
  const [qty, setQty] = useState(1)
  const [img, setImg] = useState(item.images.find((i) => i.isPrimary)?.url ?? item.images[0]?.url)
  const [added, setAdded] = useState(false)

  const match = item.variants.find((v) => v.attributeValues.every((av) => !sel[av.attributeId] || sel[av.attributeId] === av.valueId)) ?? item.variants[0]
  const allSel = groups.every((g) => sel[g.attr.id])
  const prices = item.variants.map((v) => Number(v.price))
  const min = Math.min(...prices), max = Math.max(...prices)

  const pick = (attrId: string, v: Value) => {
    setSel((p) => ({ ...p, [attrId]: v.id }))
    const m = item.images.find((i) => i.attributeValue === v.id)
    if (m) setImg(m.url)
  }

  const add = () => {
    if (!match) return
    addItem({
      variantId: match.id, productId: item.id, productSlug: item.slug, name: item.name, image: img ?? '',
      attributes: Object.entries(sel).reduce<Record<string, string>>((a, [aid, vid]) => {
        const av = item.attributeValues.find((x) => x.attribute.id === aid && x.value.id === vid)
        if (av) a[av.attribute.displayName] = av.value.label
        return a
      }, {}),
      qty, unitPrice: Number(match.price), wholesalePrice: Number(match.wholesalePrice), taxRate: Number(item.taxRate), sku: match.sku,
    })
    setAdded(true); setTimeout(() => setAdded(false), 2500)
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-3xl bg-white rounded-2xl overflow-hidden shadow-2xl grid md:grid-cols-2 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center" aria-label="Close"><X size={16} /></button>
        <div className="aspect-square bg-[var(--surface)]">
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} alt={item.name} className="w-full h-full object-cover" />
          ) : <div className="w-full h-full bg-[var(--surface-2)]" />}
        </div>
        <div className="p-6">
          <h3 className="text-xl font-semibold uppercase mb-2" style={{ color: 'var(--ink)' }}>{item.name}</h3>
          <p className="text-xl font-semibold mb-3" style={{ color: 'var(--green)' }}>
            {allSel ? inr(Number(match.price)) : (min === max ? inr(min) : `${inr(min)} – ${inr(max)}`)}
          </p>
          {item.shortDesc && <p className="text-sm text-gray-600 mb-4">{item.shortDesc}</p>}

          {groups.map(({ attr, values }) => (
            <div key={attr.id} className="mb-4">
              <p className="text-xs font-semibold uppercase text-gray-500 mb-2">{attr.displayName}</p>
              <div className="flex flex-wrap gap-2">
                {values.map((v) => {
                  const on = sel[attr.id] === v.id
                  return attr.name === 'COLOR' ? (
                    <span key={v.id} className="relative group/sw">
                      <button onClick={() => pick(attr.id, v)}
                        className={`w-7 h-7 rounded-full border transition-all ${on ? 'ring-2 ring-offset-2 ring-[var(--green)]' : 'border-gray-300 hover:scale-110'}`}
                        style={v.imageUrl ? { backgroundImage: `url(${v.imageUrl})`, backgroundSize: 'cover' } : { backgroundColor: v.hexColor ?? '#ddd' }} aria-label={v.label} />
                      <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-[var(--ink)] px-2 py-1 text-[11px] text-white opacity-0 group-hover/sw:opacity-100 transition-opacity z-10">{v.label}</span>
                    </span>
                  ) : (
                    <button key={v.id} onClick={() => pick(attr.id, v)}
                      className={`px-2.5 py-1 rounded-lg border text-sm ${on ? 'border-[var(--green)] text-[var(--green)] bg-[var(--green-light)]' : 'border-gray-200 text-gray-600'}`}>{v.label}</button>
                  )
                })}
              </div>
            </div>
          ))}

          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center"><Minus size={13} /></button>
            <input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))} className="w-16 text-center border border-gray-300 rounded-lg py-1.5 text-sm" />
            <button onClick={() => setQty(qty + 1)} className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center"><Plus size={13} /></button>
          </div>

          <div className="flex gap-2">
            <button onClick={add} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold" style={{ backgroundColor: 'var(--green)' }}>
              <ShoppingCart size={16} /> {added ? 'Added!' : 'Add to Cart'}
            </button>
            <Link href={`/shop/${item.slug}`} className="px-4 py-2.5 rounded-xl border border-[var(--line)] text-sm font-medium text-[var(--ink)] flex items-center" onClick={onClose}>Details</Link>
          </div>
          <p className="text-xs text-gray-400 mt-4">SKU: {item.sku} · {item.category.name}</p>
        </div>
      </div>
    </div>
  )
}
