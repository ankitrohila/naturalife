'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import type { ProductCardData } from '@/components/shop/ProductCard'
import { useLanguage } from '@/components/providers/LanguageProvider'

interface Slide { image: string; products: ProductCardData[] }

const DURATION = 7000

function MiniProductRow({ product }: { product: ProductCardData }) {
  const { t } = useLanguage()
  const addItem = useCartStore((s) => s.addItem)
  const [added, setAdded] = useState(false)

  const addToCart = () => {
    if (!product.variantId || product.price == null) return
    addItem({
      variantId: product.variantId,
      productId: product.id,
      productSlug: product.slug,
      name: product.name,
      image: product.image ?? '',
      attributes: {},
      qty: 1,
      unitPrice: product.price,
      wholesalePrice: product.wholesalePrice ?? product.price,
      taxRate: product.taxRate ?? 0,
      sku: product.sku ?? '',
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="flex items-center gap-4 py-4">
      <Link href={`/shop/${product.slug}`} className="w-20 h-20 shrink-0 bg-[var(--surface)] overflow-hidden">
        {product.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        )}
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={`/shop/${product.slug}`} className="text-sm font-semibold text-[var(--ink)] hover:text-[var(--green)] transition-colors line-clamp-2">
          {product.name}
        </Link>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-base font-bold" style={{ color: 'var(--green)' }}>₹{product.price?.toLocaleString('en-IN')}</span>
          {product.compareAtPrice && (
            <span className="text-xs text-gray-400 line-through">₹{product.compareAtPrice.toLocaleString('en-IN')}</span>
          )}
        </div>
        <button
          onClick={addToCart}
          className="mt-2 inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-[var(--ink)]"
          style={{ backgroundColor: added ? 'var(--green)' : '#F4C430', color: added ? 'white' : 'var(--ink)' }}
        >
          {added ? '✓' : ''} {t('product_add_to_cart')} →
        </button>
      </div>
    </div>
  )
}

export function LifestyleCarousel({ slides }: { slides: Slide[] }) {
  const [current, setCurrent] = useState(0)

  const go = useCallback((i: number) => setCurrent((i + slides.length) % slides.length), [slides.length])

  useEffect(() => {
    if (slides.length <= 1) return
    const t = setInterval(() => go(current + 1), DURATION)
    return () => clearInterval(t)
  }, [current, go, slides.length])

  if (slides.length === 0) return null
  const slide = slides[current]

  return (
    <div>
      <div className="grid md:grid-cols-[2fr_1fr] gap-0 border border-[var(--line)] bg-white shadow-sm">
        {/* Room image — fixed height so every slide is identical */}
        <div className="relative overflow-hidden h-[280px] md:h-[460px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={slide.image} alt="Room styled with Naturalife products" className="w-full h-full object-cover" />
          <button onClick={() => go(current - 1)} aria-label="Previous" className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-white/90 hover:bg-white transition-colors">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => go(current + 1)} aria-label="Next" className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-white/90 hover:bg-white transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Product column */}
        <div className="p-6 flex flex-col justify-center divide-y divide-gray-100">
          {slide.products.map((p) => (
            <MiniProductRow key={p.id} product={p} />
          ))}
        </div>
      </div>

      {slides.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Slide ${i + 1}`}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{ width: i === current ? 24 : 8, backgroundColor: i === current ? 'var(--green)' : '#ddd' }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
