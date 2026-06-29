'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/store/cart'
import { Eye } from 'lucide-react'
import { QuickView, type Item } from '@/components/product/RelatedProducts'

type HomeItem = Item & { isFeatured: boolean; isOnSale: boolean; createdAt: string }

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`
const TABS = [
  { key: 'all', label: 'All' },
  { key: 'featured', label: 'Best Seller' },
  { key: 'sale', label: 'On Sale' },
  { key: 'new', label: 'New Arrivals' },
] as const

export function HomeProducts({ products }: { products: HomeItem[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('all')
  const [quickView, setQuickView] = useState<Item | null>(null)
  const addItem = useCartStore((s) => s.addItem)

  const filtered = useMemo(() => {
    let list = [...products]
    if (tab === 'featured') list = list.filter((p) => p.isFeatured)
    else if (tab === 'sale') list = list.filter((p) => p.isOnSale)
    else if (tab === 'new') list = list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    return list
  }, [products, tab])

  const quickAdd = (p: HomeItem) => {
    const v = p.variants[0]
    if (!v) return
    addItem({
      variantId: v.id, productId: p.id, productSlug: p.slug, name: p.name,
      image: p.images.find((i) => i.isPrimary)?.url ?? p.images[0]?.url ?? '',
      attributes: {}, qty: 1, unitPrice: Number(v.price), wholesalePrice: Number(v.wholesalePrice),
      taxRate: Number(p.taxRate), sku: v.sku,
    })
  }

  return (
    <>
      <div className="flex gap-2 justify-center mb-8 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-4 py-1.5 text-sm font-medium rounded-full border transition-all"
            style={tab === t.key
              ? { backgroundColor: 'var(--green)', color: '#fff', borderColor: 'var(--green)' }
              : { borderColor: 'var(--green)', color: 'var(--green)' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-sm text-[var(--ink-soft)] py-10">No products in this filter.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filtered.map((p) => {
            const image = p.images.find((i) => i.isPrimary)?.url ?? p.images[0]?.url
            const prices = p.variants.map((v) => Number(v.price))
            const min = Math.min(...prices), max = Math.max(...prices)
            const colors = p.attributeValues.filter((a) => a.attribute.name === 'COLOR')
            return (
              <div key={p.id} className="product-card group bg-white rounded-xl overflow-hidden border border-[var(--line)] shadow-sm flex flex-col">
                <div className="relative overflow-hidden aspect-square bg-[var(--surface)]">
                  <Link href={`/shop/${p.slug}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400" />
                  </Link>
                  {p.isOnSale && <span className="absolute top-2 left-2 text-white text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--crimson)' }}>Sale</span>}
                  {p.isFeatured && <span className="absolute top-2 right-9 text-white text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--green)' }}>Featured</span>}
                  <button onClick={() => setQuickView(p)} aria-label="Quick view"
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-[var(--ink)] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--green)] hover:text-white">
                    <Eye size={15} />
                  </button>
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 mb-1.5 leading-snug">{p.name}</h3>
                  {colors.length > 0 && (
                    <div className="flex gap-1 mb-2">
                      {colors.slice(0, 5).map((c) => (
                        <span key={c.value.id} title={c.value.label} className="w-3.5 h-3.5 rounded-full border border-gray-200"
                          style={c.value.imageUrl ? { backgroundImage: `url(${c.value.imageUrl})`, backgroundSize: 'cover' } : { backgroundColor: c.value.hexColor ?? '#ddd' }} />
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-2 mt-auto">
                    <span className="text-sm font-bold" style={{ color: 'var(--green)' }}>{min === max ? inr(min) : `${inr(min)}+`}</span>
                  </div>
                  <button onClick={() => quickAdd(p)} className="w-full py-2 rounded-lg text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'var(--green)' }}>
                    Add to Cart
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {quickView && <QuickView item={quickView} onClose={() => setQuickView(null)} />}
    </>
  )
}
