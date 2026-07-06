'use client'

import { useState, useEffect } from 'react'
import { ProductCard, type ProductCardData } from '@/components/shop/ProductCard'

export default function WishlistPage() {
  const [products, setProducts] = useState<ProductCardData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ids: string[] = []
    try {
      ids = JSON.parse(localStorage.getItem('naturalife-wishlist') ?? '[]')
    } catch {
      ids = []
    }
    if (ids.length === 0) { setLoading(false); return }

    Promise.all(
      ids.map((id) => fetch(`/api/products/by-id/${id}`).then((r) => (r.ok ? r.json() : null)))
    ).then((results) => {
      const mapped = results.filter(Boolean).map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        image: p.images.find((i: any) => i.isPrimary)?.url ?? p.images[0]?.url ?? null,
        categoryName: p.category?.name,
        price: p.variants[0] ? Number(p.variants[0].price) : null,
        isOnSale: p.isOnSale,
        isFeatured: p.isFeatured,
      }))
      setProducts(mapped)
      setLoading(false)
    })
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--ink)' }}>My Wishlist</h1>
      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : products.length === 0 ? (
        <div className="bg-white border border-[var(--line)] py-16 text-center">
          <p className="text-sm text-gray-500">Your wishlist is empty.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
