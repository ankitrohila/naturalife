'use client'

import { ProductCard, type ProductCardData } from '@/components/shop/ProductCard'

export function ImageSearchResults({ products, matchedColors }: { products: ProductCardData[]; matchedColors: string[] }) {
  if (products.length === 0) {
    return (
      <div className="text-center py-10 border-t border-[var(--line)] mt-4">
        <p className="text-sm text-gray-500">No similar products found. Try a different photo.</p>
      </div>
    )
  }

  return (
    <div className="border-t border-[var(--line)] pt-4 mt-2">
      {matchedColors.length > 0 && (
        <p className="text-xs text-gray-500 mb-3">
          Matched colors: <span className="font-medium text-[var(--ink)]">{matchedColors.join(', ')}</span>
        </p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  )
}
