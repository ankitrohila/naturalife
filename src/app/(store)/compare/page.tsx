'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { readCompareList } from '@/components/shop/CompareButton'

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`

interface CompareProduct {
  id: string
  name: string
  slug: string
  material: string
  taxRate: number
  images: { url: string; isPrimary: boolean }[]
  category: { name: string }
  variants: { price: number; stock: number }[]
  attributeValues: { attribute: { name: string; displayName: string }; value: { label: string } }[]
}

export default function ComparePage() {
  const [products, setProducts] = useState<CompareProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ids = readCompareList()
    if (ids.length === 0) { setLoading(false); return }
    Promise.all(
      ids.map((id) => fetch(`/api/products/by-id/${id}`).then((r) => (r.ok ? r.json() : null)))
    ).then((results) => {
      setProducts(results.filter(Boolean))
      setLoading(false)
    })
  }, [])

  const remove = (id: string) => {
    const next = readCompareList().filter((x) => x !== id)
    localStorage.setItem('naturalife-compare', JSON.stringify(next))
    window.dispatchEvent(new Event('compare-updated'))
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  const attrNames = Array.from(
    new Set(products.flatMap((p) => p.attributeValues.map((av) => av.attribute.displayName)))
  )

  return (
    <main className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" style={{ backgroundColor: 'var(--ivory)' }}>
      <h1 className="text-2xl font-semibold mb-6" style={{ color: 'var(--ink)' }}>Compare Products</h1>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4">No products added to compare yet.</p>
          <Link href="/shop" className="text-sm font-medium hover:underline" style={{ color: 'var(--green)' }}>Browse products →</Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase p-3 w-32">Product</th>
                {products.map((p) => (
                  <th key={p.id} className="p-3 border-l border-[var(--line)] min-w-[200px]">
                    <div className="relative">
                      <button onClick={() => remove(p.id)} aria-label="Remove" className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-[var(--line)] flex items-center justify-center">
                        <X size={12} />
                      </button>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.images.find((i) => i.isPrimary)?.url ?? p.images[0]?.url} alt={p.name} className="w-full aspect-square object-cover border border-[var(--line)] mb-2" />
                      <Link href={`/shop/${p.slug}`} className="text-sm font-semibold hover:text-[var(--green)]">{p.name}</Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-t border-[var(--line)]">
                <td className="p-3 text-gray-500 font-medium">Price</td>
                {products.map((p) => {
                  const prices = p.variants.map((v) => Number(v.price))
                  const min = Math.min(...prices), max = Math.max(...prices)
                  return <td key={p.id} className="p-3 border-l border-[var(--line)] font-medium" style={{ color: 'var(--green)' }}>{min === max ? inr(min) : `${inr(min)} – ${inr(max)}`}</td>
                })}
              </tr>
              <tr className="border-t border-[var(--line)]">
                <td className="p-3 text-gray-500 font-medium">Category</td>
                {products.map((p) => <td key={p.id} className="p-3 border-l border-[var(--line)]">{p.category.name}</td>)}
              </tr>
              <tr className="border-t border-[var(--line)]">
                <td className="p-3 text-gray-500 font-medium">Material</td>
                {products.map((p) => <td key={p.id} className="p-3 border-l border-[var(--line)]">{p.material}</td>)}
              </tr>
              {attrNames.map((attrName) => (
                <tr key={attrName} className="border-t border-[var(--line)]">
                  <td className="p-3 text-gray-500 font-medium">{attrName}</td>
                  {products.map((p) => {
                    const values = p.attributeValues.filter((av) => av.attribute.displayName === attrName).map((av) => av.value.label)
                    return <td key={p.id} className="p-3 border-l border-[var(--line)]">{values.join(', ') || '—'}</td>
                  })}
                </tr>
              ))}
              <tr className="border-t border-[var(--line)]">
                <td className="p-3 text-gray-500 font-medium">Stock</td>
                {products.map((p) => {
                  const inStock = p.variants.some((v) => v.stock > 0)
                  return <td key={p.id} className="p-3 border-l border-[var(--line)]">{inStock ? <span className="text-[var(--green)]">In Stock</span> : <span className="text-red-500">Out of Stock</span>}</td>
                })}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
