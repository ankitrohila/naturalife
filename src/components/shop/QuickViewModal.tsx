'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, Minus, Plus, ShoppingCart, Loader2 } from 'lucide-react'
import { useCartStore } from '@/store/cart'

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

interface QuickViewProduct {
  id: string
  name: string
  slug: string
  shortDesc: string | null
  taxRate: number
  images: { url: string; isPrimary: boolean }[]
  variants: { id: string; sku: string; price: number; compareAtPrice: number | null; wholesalePrice: number; stock: number }[]
}

export function QuickViewModal({ productSlug, onClose }: { productSlug: string; onClose: () => void }) {
  const [product, setProduct] = useState<QuickViewProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/products/${productSlug}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setProduct(data)
          setLoading(false)
        }
      })
      .catch(() => setLoading(false))
    return () => { cancelled = true }
  }, [productSlug])

  const variant = product?.variants[0]
  const image = product?.images.find((i) => i.isPrimary)?.url ?? product?.images[0]?.url

  const handleAdd = () => {
    if (!product || !variant) return
    addItem({
      variantId: variant.id,
      productId: product.id,
      productSlug: product.slug,
      name: product.name,
      image: image ?? '',
      attributes: {},
      qty,
      unitPrice: Number(variant.price),
      wholesalePrice: Number(variant.wholesalePrice),
      taxRate: Number(product.taxRate),
      sku: variant.sku,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleWhatsApp = () => {
    if (!product || !variant) return
    const total = Number(variant.price) * qty
    const lines = [
      `Hi, I'd like to order:`,
      `Product: ${product.name}`,
      `SKU: ${variant.sku}`,
      `Quantity: ${qty}`,
      `Unit Price: ${inr(Number(variant.price))}`,
      `Total: ${inr(total)}`,
    ]
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-2xl bg-white overflow-hidden shadow-2xl grid sm:grid-cols-2 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 z-10 w-9 h-9 bg-white/90 shadow flex items-center justify-center" aria-label="Close">
          <X size={16} />
        </button>

        {loading ? (
          <div className="col-span-2 flex items-center justify-center py-24">
            <Loader2 size={24} className="animate-spin text-gray-400" />
          </div>
        ) : product && variant ? (
          <>
            <div className="aspect-square bg-[var(--surface)]">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt={product.name} className="w-full h-full object-cover" />
              ) : <div className="w-full h-full bg-[var(--surface-2)]" />}
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--ink)' }}>{product.name}</h3>

              <div className="flex items-baseline gap-3 mb-3">
                {variant.compareAtPrice && Number(variant.compareAtPrice) > Number(variant.price) ? (
                  <>
                    <span className="text-lg text-gray-400 line-through font-normal">{inr(Number(variant.compareAtPrice))}</span>
                    <span className="text-sm font-medium" style={{ color: 'var(--green)' }}>{inr(Number(variant.price))}</span>
                  </>
                ) : (
                  <span className="text-sm font-normal" style={{ color: 'var(--green)' }}>{inr(Number(variant.price))}</span>
                )}
              </div>

              {product.shortDesc && <p className="text-sm text-gray-600 mb-4">{product.shortDesc}</p>}

              <div className="flex items-center gap-3 mb-4">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-8 h-8 border border-gray-300 flex items-center justify-center"><Minus size={13} /></button>
                <input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))} className="w-16 text-center border border-gray-300 py-1.5 text-sm" />
                <button onClick={() => setQty(qty + 1)} className="w-8 h-8 border border-gray-300 flex items-center justify-center"><Plus size={13} /></button>
              </div>

              <div className="flex gap-2 mb-3">
                <button
                  onClick={handleAdd}
                  disabled={variant.stock <= 0}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 text-white text-sm font-semibold disabled:opacity-50"
                  style={{ backgroundColor: 'var(--green)' }}
                >
                  <ShoppingCart size={15} /> {added ? 'Added!' : 'Add to Cart'}
                </button>
                <button
                  onClick={handleWhatsApp}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 text-white text-sm font-semibold"
                  style={{ backgroundColor: '#25D366' }}
                >
                  <WhatsAppIcon /> WhatsApp
                </button>
              </div>

              <Link href={`/shop/${product.slug}`} className="text-sm font-medium hover:underline" style={{ color: 'var(--green)' }} onClick={onClose}>
                View Full Details →
              </Link>
            </div>
          </>
        ) : (
          <div className="col-span-2 py-24 text-center text-sm text-gray-500">Failed to load product.</div>
        )}
      </div>
    </div>
  )
}
