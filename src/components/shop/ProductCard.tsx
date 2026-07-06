'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, Eye, Plus } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { QuickViewModal } from './QuickViewModal'
import { CompareButton } from './CompareButton'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { translateCatalogTerm } from '@/lib/i18n/translations'

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

export interface ProductCardData {
  id: string
  name: string
  slug: string
  image: string | null
  categoryName?: string
  price: number | null
  compareAtPrice?: number | null
  isOnSale?: boolean
  isFeatured?: boolean
  colors?: { id: string; label: string; hexColor: string | null; imageUrl: string | null }[]
  wholesaleLabel?: boolean
  variantId?: string
  sku?: string
  wholesalePrice?: number
  taxRate?: number
}

const WISHLIST_KEY = 'naturalife-wishlist'

function readWishlist(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function ProductCard({ product, onQuickView }: { product: ProductCardData; onQuickView?: (id: string) => void }) {
  const { t, lang } = useLanguage()
  const [wishlisted, setWishlisted] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [quickViewOpen, setQuickViewOpen] = useState(false)
  const [added, setAdded] = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  useEffect(() => {
    setMounted(true)
    setWishlisted(readWishlist().includes(product.id))
  }, [product.id])

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const current = readWishlist()
    const next = current.includes(product.id)
      ? current.filter((id) => id !== product.id)
      : [...current, product.id]
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(next))
    setWishlisted(!wishlisted)
  }

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onQuickView) onQuickView(product.id)
    else setQuickViewOpen(true)
  }

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!product.variantId || product.price === null) return
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

  const handleQuickWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (product.price === null) return
    const lines = [
      `Hi, I'd like to order:`,
      `Product: ${product.name}`,
      product.sku ? `SKU: ${product.sku}` : '',
      `Unit Price: ${inr(product.price)}`,
    ].filter(Boolean)
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <>
    <Link
      href={`/shop/${product.slug}`}
      className="group relative bg-white border border-[var(--line)] overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col"
    >
      <div className="relative aspect-square bg-[var(--surface)] overflow-hidden">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-[var(--surface-2)]" />
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isOnSale && (
            <span className="text-white text-xs font-bold px-2 py-1" style={{ backgroundColor: 'var(--crimson)' }}>{t('product_sale_badge').toUpperCase()}</span>
          )}
          {product.isFeatured && (
            <span className="text-white text-xs font-semibold px-2 py-1" style={{ backgroundColor: 'var(--green)' }}>{t('product_featured_badge')}</span>
          )}
        </div>

        {/* Hover actions */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={toggleWishlist}
            aria-label={t('product_add_to_wishlist')}
            className="w-9 h-9 bg-white shadow flex items-center justify-center hover:bg-[var(--green)] hover:text-white transition-colors"
          >
            <Heart size={16} fill={mounted && wishlisted ? 'currentColor' : 'none'} className={mounted && wishlisted ? 'text-red-500' : 'text-[var(--ink)]'} />
          </button>
          <button
            onClick={handleQuickView}
            aria-label={t('product_quick_view')}
            className="w-9 h-9 bg-white shadow flex items-center justify-center text-[var(--ink)] hover:bg-[var(--green)] hover:text-white transition-colors"
          >
            <Eye size={16} />
          </button>
          <CompareButton productId={product.id} className="w-9 h-9 bg-white shadow flex items-center justify-center hover:bg-[var(--green)] hover:text-white transition-colors" />
        </div>
      </div>

      <div className="p-3 flex flex-col flex-1">
        {product.categoryName && (
          <p className="text-xs text-gray-400 mb-1">{translateCatalogTerm(product.categoryName, lang)}</p>
        )}
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2 group-hover:text-[var(--green)] transition-colors">
          {product.name}
        </h3>

        {product.colors && product.colors.length > 0 && (
          <div className="flex gap-1 mb-2">
            {product.colors.slice(0, 5).map((c) => (
              <span
                key={c.id}
                title={c.label}
                className="w-3.5 h-3.5 rounded-full border border-gray-200"
                style={c.imageUrl ? { backgroundImage: `url(${c.imageUrl})`, backgroundSize: 'cover' } : { backgroundColor: c.hexColor ?? '#ddd' }}
              />
            ))}
          </div>
        )}

        {product.price !== null && (
          <div className="mt-auto flex items-end justify-between gap-2">
            <div>
              {product.compareAtPrice && product.compareAtPrice > product.price ? (
                <p className="flex items-baseline gap-2">
                  <span className="text-base text-gray-400 line-through font-normal">₹{product.compareAtPrice.toLocaleString('en-IN')}</span>
                  <span className="text-xs font-medium" style={{ color: 'var(--green)' }}>₹{product.price.toLocaleString('en-IN')}</span>
                </p>
              ) : (
                <p className="text-xs font-normal" style={{ color: 'var(--green)' }}>
                  ₹{product.price.toLocaleString('en-IN')}
                </p>
              )}
              {product.wholesaleLabel && <p className="text-[10px] text-gray-400">{t('shop_wholesale_bulk')}</p>}
            </div>

            {product.variantId && (
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={handleQuickAdd}
                  aria-label={t('product_add_to_cart')}
                  title={t('product_add_to_cart')}
                  className="w-7 h-7 flex items-center justify-center text-white transition-colors"
                  style={{ backgroundColor: added ? 'var(--ink)' : 'var(--green)' }}
                >
                  <Plus size={14} />
                </button>
                <button
                  onClick={handleQuickWhatsApp}
                  aria-label={t('product_order_whatsapp')}
                  title={t('product_order_whatsapp')}
                  className="w-7 h-7 flex items-center justify-center text-white transition-colors"
                  style={{ backgroundColor: '#25D366' }}
                >
                  <WhatsAppIcon />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Link>

    {quickViewOpen && (
      <QuickViewModal productSlug={product.slug} onClose={() => setQuickViewOpen(false)} />
    )}
    </>
  )
}
