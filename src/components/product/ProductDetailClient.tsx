'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useCartStore } from '@/store/cart'
import {
  Minus, Plus, ShoppingCart, Zap, ChevronDown,
  Share2, Copy, Check, X, ChevronLeft, ChevronRight,
  Truck, RotateCcw, Shield, Phone, Mail,
} from 'lucide-react'

interface Variant {
  id: string
  sku: string
  price: number
  compareAtPrice: number | null
  wholesalePrice: number
  minWholesaleQty: number
  stock: number
  weight: number | null
  dimensions: { length?: number; width?: number; height?: number } | null
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
  material: string
  hsnCode: string | null
  images: ProductImage[]
  variants: Variant[]
  attributeValues: AttributeVal[]
  category: { name: string; slug: string }
  reviews?: Review[]
}

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`

const materialLabel: Record<string, string> = {
  PLASTIC: 'Plastic', RUBBER: 'Rubber', JUTE: 'Jute',
  COTTON: 'Cotton', POLYESTER: 'Polyester', WOOL: 'Wool', OTHER: '—',
}

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

const MailIcon2 = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
)

function Accordion({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-[var(--line)]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left group"
      >
        <span className="text-sm font-semibold tracking-wide uppercase text-[var(--ink)] group-hover:text-[var(--green)] transition-colors">
          {title}
        </span>
        <ChevronDown size={18} className={`text-gray-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-[2000px] pb-5' : 'max-h-0'}`}>
        {children}
      </div>
    </div>
  )
}

function Lightbox({ images, index, onClose, onNav }: { images: ProductImage[]; index: number; onClose: () => void; onNav: (i: number) => void }) {
  return (
    <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"><X size={20} /></button>
      {images.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); onNav((index - 1 + images.length) % images.length) }} className="absolute left-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"><ChevronLeft size={20} /></button>
          <button onClick={(e) => { e.stopPropagation(); onNav((index + 1) % images.length) }} className="absolute right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"><ChevronRight size={20} /></button>
        </>
      )}
      <div className="max-w-4xl max-h-[90vh] w-full p-4" onClick={(e) => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[index].url} alt={images[index].altText ?? ''} className="w-full h-full object-contain" />
      </div>
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, i) => (
            <button key={i} onClick={(e) => { e.stopPropagation(); onNav(i) }} className={`w-2 h-2 rounded-full transition-colors ${i === index ? 'bg-white' : 'bg-white/40'}`} />
          ))}
        </div>
      )}
    </div>
  )
}

export function ProductDetailClient({ product }: { product: Product }) {
  const orderType = useCartStore((s) => s.orderType)
  const setOrderType = useCartStore((s) => s.setOrderType)
  const addItem = useCartStore((s) => s.addItem)

  const primaryImage = product.images.find((i) => i.isPrimary)?.url ?? product.images[0]?.url
  const [mainImage, setMainImage] = useState(primaryImage)
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>({})
  const [qty, setQty] = useState(1)
  const [addedMsg, setAddedMsg] = useState('')
  const [zoom, setZoom] = useState(false)
  const [origin, setOrigin] = useState('50% 50%')
  const [copied, setCopied] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [pageUrl, setPageUrl] = useState('')
  const zoomRef = useRef<HTMLDivElement>(null)
  const thumbsRef = useRef<HTMLDivElement>(null)

  const [mounted, setMounted] = useState(false)
  useEffect(() => { setPageUrl(window.location.href); setMounted(true) }, [])

  const mainImageIndex = product.images.findIndex((i) => i.url === mainImage)

  const order: Record<string, number> = { SIZE: 0, COLOR: 1 }
  const attrGroups = Object.values(
    product.attributeValues.reduce<Record<string, { attr: AttributeVal['attribute']; values: AttributeVal['value'][] }>>((acc, av) => {
      const key = av.attribute.id
      if (!acc[key]) acc[key] = { attr: av.attribute, values: [] }
      if (!acc[key].values.find((v) => v.id === av.value.id)) acc[key].values.push(av.value)
      return acc
    }, {})
  ).sort((a, b) => (order[a.attr.name] ?? 9) - (order[b.attr.name] ?? 9))

  const matchingVariant =
    product.variants.find((v) => {
      const avs = v.attributeValues as Array<{ attributeId: string; valueId: string }>
      return avs.every((av) => !selectedAttrs[av.attributeId] || selectedAttrs[av.attributeId] === av.valueId)
    }) ?? product.variants[0]

  const allSelected = attrGroups.every((g) => selectedAttrs[g.attr.id])

  const getUnitPrice = useCallback((variant: Variant) => {
    if (orderType === 'WHOLESALE') {
      const rule = [...variant.bulkPricingRules]
        .sort((a, b) => b.minQty - a.minQty)
        .find((r) => qty >= r.minQty && (!r.maxQty || qty <= r.maxQty))
      if (rule) return Number(rule.pricePerUnit)
      return Number(variant.wholesalePrice)
    }
    return Number(variant.price)
  }, [orderType, qty])

  const allRetailPrices = product.variants.map((v) => Number(v.price))
  const allWholesalePrices = product.variants.map((v) => Number(v.wholesalePrice))
  const prices = orderType === 'WHOLESALE' ? allWholesalePrices : allRetailPrices
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)

  const unitPrice = matchingVariant ? getUnitPrice(matchingVariant) : 0
  const subtotal = unitPrice * qty
  const taxAmount = (subtotal * Number(product.taxRate)) / 100
  const total = subtotal + taxAmount

  const handleAttrSelect = (attrId: string, valueId: string, imageUrl?: string | null) => {
    setSelectedAttrs((prev) => ({ ...prev, [attrId]: valueId }))
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

  const handleMainImageWheel = (e: React.WheelEvent) => {
    if (!thumbsRef.current) return
    e.preventDefault()
    thumbsRef.current.scrollBy({ top: e.deltaY, behavior: 'smooth' })
  }

  const goToImage = (dir: 1 | -1) => {
    if (product.images.length === 0) return
    const currentIndex = mainImageIndex >= 0 ? mainImageIndex : 0
    const nextIndex = (currentIndex + dir + product.images.length) % product.images.length
    setMainImage(product.images[nextIndex].url)
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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(pageUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleWhatsAppOrder = () => {
    if (!matchingVariant) return
    let colorLabel: string | undefined
    let sizeLabel: string | undefined
    const attrLines = Object.entries(selectedAttrs).reduce<string[]>((acc, [attrId, valueId]) => {
      const av = product.attributeValues.find((a) => a.attribute.id === attrId && a.value.id === valueId)
      if (av) {
        acc.push(`${av.attribute.displayName}: ${av.value.label}`)
        if (av.attribute.name === 'COLOR') colorLabel = av.value.label
        if (av.attribute.name === 'SIZE') sizeLabel = av.value.label
      }
      return acc
    }, [])
    const lines = [
      `Hi, I'd like to order:`,
      `Product: ${product.name}`,
      `SKU: ${matchingVariant.sku}`,
      ...attrLines,
      `Quantity: ${qty}`,
      `Unit Price: ${inr(unitPrice)}`,
      `Total: ${inr(total)}`,
      pageUrl ? `Link: ${pageUrl}` : '',
    ].filter(Boolean)
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join('\n'))}`

    fetch('/api/whatsapp-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerPhone: 'Pending — initiated from product page',
        productName: product.name,
        productSku: matchingVariant.sku,
        selectedColor: colorLabel,
        selectedSize: sizeLabel,
        quantity: qty,
        unitPrice,
        totalValue: total,
      }),
    }).catch(() => {})

    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const shareUrl = encodeURIComponent(pageUrl)
  const shareText = encodeURIComponent(`Check out ${product.name}`)

  const inStock = matchingVariant ? matchingVariant.stock > 0 : false

  return (
    <>
      <div className="lg:grid lg:grid-cols-2 gap-6 lg:gap-10 lg:items-start">
        {/* ── Image Gallery (sticky on desktop) ── */}
        <div className="flex gap-3 lg:sticky lg:top-20 lg:self-start">
          {/* Vertical Thumbnails */}
          {product.images.length > 1 && (
            <div ref={thumbsRef} className="hidden sm:flex flex-col gap-2 w-[72px] shrink-0 max-h-[520px] overflow-y-auto scroll-smooth">
              {product.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setMainImage(img.url)}
                  className={`w-[72px] h-[90px] rounded-none overflow-hidden border-2 transition-all hover:opacity-90 ${mainImage === img.url ? 'border-[var(--green)] shadow-sm' : 'border-[var(--line)]'}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.altText ?? `View ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Main Image with Zoom */}
          <div className="flex-1 relative">
            <div
              ref={zoomRef}
              onMouseEnter={() => setZoom(true)}
              onMouseLeave={() => setZoom(false)}
              onMouseMove={handleMove}
              onWheel={handleMainImageWheel}
              onClick={() => { setLightboxIndex(mainImageIndex >= 0 ? mainImageIndex : 0); setLightboxOpen(true) }}
              className="aspect-square rounded-none overflow-hidden bg-[var(--surface)] border border-[var(--line)] cursor-zoom-in"
            >
              {mainImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mainImage}
                  alt={product.name}
                  className="w-full h-full object-contain transition-transform duration-200"
                  style={{ transform: zoom ? 'scale(2)' : 'scale(1)', transformOrigin: origin }}
                />
              ) : (
                <div className="w-full h-full bg-[var(--surface-2)] flex items-center justify-center text-gray-400">No image</div>
              )}
            </div>

            {/* Prev/Next arrows overlaid on main image */}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); goToImage(-1) }}
                  aria-label="Previous image"
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white border border-[var(--line)] flex items-center justify-center text-[var(--ink)] transition-colors shadow-sm"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); goToImage(1) }}
                  aria-label="Next image"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white border border-[var(--line)] flex items-center justify-center text-[var(--ink)] transition-colors shadow-sm"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            {/* Mobile thumbnail strip */}
            {product.images.length > 1 && (
              <div className="flex sm:hidden gap-2 mt-3 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setMainImage(img.url)}
                    className={`w-14 h-14 rounded-none overflow-hidden border-2 shrink-0 ${mainImage === img.url ? 'border-[var(--green)]' : 'border-[var(--line)]'}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.altText ?? `View ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Product Info ── */}
        <div>
          {/* Title & SKU */}
          <h1 className="text-2xl md:text-3xl font-semibold leading-tight mb-2" style={{ color: 'var(--ink)' }}>
            {product.name}
          </h1>
          <p className="text-sm text-gray-500 mb-4">
            Item Code: <span className="font-medium text-gray-700">{product.sku}</span>
            <span className="mx-2">·</span>
            {product.category.name}
          </p>

          {/* Price */}
          <div className="mb-5">
            <div className="flex items-baseline gap-3 flex-wrap">
              {orderType === 'RETAIL' && matchingVariant?.compareAtPrice && Number(matchingVariant.compareAtPrice) > unitPrice ? (
                <>
                  <span className="text-lg text-gray-400 line-through font-normal">{inr(Number(matchingVariant.compareAtPrice))}</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--green)' }}>{inr(unitPrice)}</span>
                </>
              ) : allSelected ? (
                <span className="text-sm font-normal" style={{ color: 'var(--green)' }}>{inr(unitPrice)}</span>
              ) : (
                <span className="text-sm font-normal" style={{ color: 'var(--green)' }}>
                  {minPrice === maxPrice ? inr(minPrice) : `${inr(minPrice)} – ${inr(maxPrice)}`}
                </span>
              )}
              {orderType === 'WHOLESALE' && allSelected && (
                <span className="text-xs line-through text-gray-400">{inr(Number(matchingVariant?.price ?? 0))}</span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>
          </div>

          {/* Short description */}
          {product.shortDesc && (
            <p className="text-sm text-gray-600 leading-relaxed mb-5">{product.shortDesc}</p>
          )}

          {/* Order type is set globally from cart — no inline toggle needed */}

          {/* Color Selector — Jaipur Rugs style (image thumbnails) */}
          {attrGroups.filter(g => g.attr.name === 'COLOR').map(({ attr, values }) => (
            <div key={attr.id} className="mb-6">
              <p className="text-xs font-semibold tracking-wide uppercase text-gray-500 mb-2">
                {attr.displayName}
                {selectedAttrs[attr.id] && (
                  <span className="ml-2 normal-case font-normal text-gray-700">
                    — {values.find(v => v.id === selectedAttrs[attr.id])?.label}
                  </span>
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {values.map((v) => {
                  const isSelected = selectedAttrs[attr.id] === v.id
                  const matchedImg = product.images.find((img) => img.attributeValue === v.id)
                  const thumbUrl = matchedImg?.url ?? v.imageUrl
                  return (
                    <button
                      key={v.id}
                      onClick={() => handleAttrSelect(attr.id, v.id, v.imageUrl)}
                      className={`relative rounded-none overflow-hidden border-2 transition-all hover:shadow-md ${isSelected ? 'border-[var(--green)] shadow-sm ring-1 ring-[var(--green)]' : 'border-[var(--line)] hover:border-gray-300'}`}
                      title={v.label}
                    >
                      {thumbUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={thumbUrl} alt={v.label} className="w-16 h-20 object-cover" />
                      ) : (
                        <div
                          className="w-16 h-20 flex items-center justify-center text-[10px] text-gray-500"
                          style={{ backgroundColor: v.hexColor ?? '#eee' }}
                        >
                          {v.label}
                        </div>
                      )}
                      {isSelected && (
                        <div className="absolute inset-0 bg-[var(--green)]/10 flex items-end justify-center pb-1">
                          <Check size={14} className="text-[var(--green)] bg-white rounded-full p-0.5" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Size & Other Attribute Selectors */}
          {attrGroups.filter(g => g.attr.name !== 'COLOR').map(({ attr, values }) => (
            <div key={attr.id} className="mb-6">
              <p className="text-xs font-semibold tracking-wide uppercase text-gray-500 mb-2">
                {attr.displayName}
                {selectedAttrs[attr.id] && (
                  <span className="ml-2 normal-case font-normal text-gray-700">
                    — {values.find(v => v.id === selectedAttrs[attr.id])?.label}
                  </span>
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {values.map((v) => {
                  const isSelected = selectedAttrs[attr.id] === v.id
                  return (
                    <button
                      key={v.id}
                      onClick={() => handleAttrSelect(attr.id, v.id, v.imageUrl)}
                      className={`px-4 py-2 rounded-none border text-sm transition-all ${isSelected
                        ? 'border-[var(--green)] text-[var(--green)] font-semibold bg-[var(--green-light)]'
                        : 'border-gray-200 text-gray-600 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      {v.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Quantity */}
          <div className="mb-5">
            <p className="text-xs font-semibold tracking-wide uppercase text-gray-500 mb-2">Quantity</p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-10 h-10 rounded-l-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <Minus size={14} />
              </button>
              <input
                type="number"
                value={qty}
                min={1}
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 h-10 text-center border-y border-gray-300 text-sm focus:outline-none"
              />
              <button
                onClick={() => setQty(qty + 1)}
                className="w-10 h-10 rounded-r-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Bulk Pricing Table (wholesale) */}
          {orderType === 'WHOLESALE' && matchingVariant && matchingVariant.bulkPricingRules.length > 0 && (
            <div className="mb-5 border border-[var(--line)] rounded-none overflow-hidden">
              <div className="bg-[var(--surface)] px-4 py-2.5 flex items-center justify-between flex-wrap gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">Bulk Pricing (per unit)</span>
                <span className="text-xs font-medium" style={{ color: 'var(--green)' }}>
                  Min. Order: {matchingVariant.minWholesaleQty} units
                </span>
              </div>
              <table className="w-full text-sm">
                <tbody>
                  <tr className={`border-t border-gray-100 ${qty < (matchingVariant.bulkPricingRules[0]?.minQty ?? 20) ? 'bg-[var(--green-light)]' : ''}`}>
                    <td className="px-4 py-2.5 text-gray-600">1 – {(matchingVariant.bulkPricingRules[0]?.minQty ?? 20) - 1} units</td>
                    <td className="px-4 py-2.5 font-semibold text-right" style={{ color: 'var(--green)' }}>{inr(Number(matchingVariant.wholesalePrice))}/unit</td>
                  </tr>
                  {matchingVariant.bulkPricingRules.map((rule, i) => (
                    <tr key={i} className={`border-t border-gray-100 ${qty >= rule.minQty && (!rule.maxQty || qty <= rule.maxQty) ? 'bg-[var(--green-light)]' : ''}`}>
                      <td className="px-4 py-2.5 text-gray-600">{rule.label ?? `${rule.minQty}${rule.maxQty ? ` – ${rule.maxQty}` : '+'} units`}</td>
                      <td className="px-4 py-2.5 font-semibold text-right" style={{ color: 'var(--green)' }}>{inr(Number(rule.pricePerUnit))}/unit</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Price Breakdown */}
          {matchingVariant && allSelected && (
            <div className="rounded-none p-4 mb-5 border" style={{ backgroundColor: 'var(--green-light)', borderColor: 'var(--line)' }}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Unit price{orderType === 'WHOLESALE' ? ` (for ${qty} units)` : ''}</span>
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

          {/* Stock status */}
          {matchingVariant && (
            <div className="mb-4">
              {inStock ? (
                <span className="inline-flex items-center gap-1.5 text-sm text-[var(--green)] font-medium">
                  <span className="w-2 h-2 rounded-full bg-[var(--green)]" /> In Stock
                  {matchingVariant.stock <= 10 && <span className="text-gray-500 font-normal">· Only {matchingVariant.stock} left</span>}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-sm text-[var(--crimson)] font-medium">
                  <span className="w-2 h-2 rounded-full bg-[var(--crimson)]" /> Out of Stock
                </span>
              )}
            </div>
          )}

          {/* CTA Buttons — Add to Cart, Buy Now, WhatsApp in one row */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-none text-white font-semibold text-sm transition-all ${inStock ? 'hover:opacity-90 active:scale-[0.98]' : 'opacity-50 cursor-not-allowed'}`}
              style={{ backgroundColor: 'var(--green)' }}
            >
              <ShoppingCart size={16} />
              <span className="hidden sm:inline">{addedMsg || 'Add to Cart'}</span>
            </button>
            <a
              href={inStock ? '/checkout' : undefined}
              onClick={inStock ? handleAddToCart : undefined}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-none font-semibold text-sm text-white transition-all ${inStock ? 'hover:opacity-90 active:scale-[0.98]' : 'opacity-50 cursor-not-allowed pointer-events-none'}`}
              style={{ backgroundColor: 'var(--ink)' }}
            >
              <Zap size={16} />
              <span className="hidden sm:inline">Buy Now</span>
            </a>
            {inStock && allSelected && (
              <button
                onClick={handleWhatsAppOrder}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 font-semibold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: '#25D366' }}
              >
                <WhatsAppIcon />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>
            )}
          </div>

          {/* Delivery & Policy icons */}
          <div className="grid grid-cols-3 gap-3 mb-5 py-4 border-y border-[var(--line)]">
            <div className="flex flex-col items-center text-center gap-1.5">
              <Truck size={20} className="text-[var(--green)]" />
              <span className="text-[11px] text-gray-600 leading-tight">Free Shipping<br />above ₹1,000</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1.5">
              <RotateCcw size={20} className="text-[var(--green)]" />
              <span className="text-[11px] text-gray-600 leading-tight">7-Day Easy<br />Returns</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1.5">
              <Shield size={20} className="text-[var(--green)]" />
              <span className="text-[11px] text-gray-600 leading-tight">GST Invoice<br />Included</span>
            </div>
          </div>

          {/* Share buttons — rendered only after mount to avoid hydration mismatch */}
          {mounted && (
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 flex items-center gap-1">
                <Share2 size={14} /> Share
              </span>
              <div className="flex gap-2">
                <a
                  href={`https://wa.me/?text=${shareText}%20${shareUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 border border-[var(--line)] flex items-center justify-center text-gray-500 hover:text-[#25D366] hover:border-[#25D366] transition-colors"
                  title="Share on WhatsApp"
                >
                  <WhatsAppIcon />
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 border border-[var(--line)] flex items-center justify-center text-gray-500 hover:text-[#1877F2] hover:border-[#1877F2] transition-colors"
                  title="Share on Facebook"
                >
                  <FacebookIcon />
                </a>
                <a
                  href={`mailto:?subject=${shareText}&body=${shareUrl}`}
                  className="w-9 h-9 border border-[var(--line)] flex items-center justify-center text-gray-500 hover:text-[var(--green)] hover:border-[var(--green)] transition-colors"
                  title="Share via Email"
                >
                  <MailIcon2 />
                </a>
                <button
                  onClick={handleCopyLink}
                  className="w-9 h-9 border border-[var(--line)] flex items-center justify-center text-gray-500 hover:text-[var(--green)] hover:border-[var(--green)] transition-colors"
                  title="Copy link"
                >
                  {copied ? <Check size={16} className="text-[var(--green)]" /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          )}

          {/* ── Accordion Sections (consolidated into right column) ── */}
          <div className="mt-8">
          {/* Product Details */}
          <Accordion title="Product Details" defaultOpen>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Material</span>
              <span className="text-gray-800 font-medium">{materialLabel[product.material] ?? product.material}</span>
            </div>
            {attrGroups.map(({ attr, values }) => (
              <div key={attr.id} className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">{attr.displayName}</span>
                <span className="text-gray-800 font-medium">{values.map((v) => v.label).join(', ')}</span>
              </div>
            ))}
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">SKU</span>
              <span className="text-gray-800 font-medium">{product.sku}</span>
            </div>
            {product.hsnCode && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">HSN Code</span>
                <span className="text-gray-800 font-medium">{product.hsnCode}</span>
              </div>
            )}
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Tax Rate</span>
              <span className="text-gray-800 font-medium">{product.taxRate}% GST</span>
            </div>
            {matchingVariant?.weight && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Weight</span>
                <span className="text-gray-800 font-medium">{Number(matchingVariant.weight)} kg</span>
              </div>
            )}
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Category</span>
              <span className="text-gray-800 font-medium">{product.category.name}</span>
            </div>
          </div>
        </Accordion>

        {/* Description */}
        {product.description && (
          <Accordion title="About This Product">
            <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {product.description}
            </div>
          </Accordion>
        )}

        {/* Washing & Care */}
        <Accordion title="Washing & Care">
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start gap-2"><span className="text-[var(--green)] mt-0.5">•</span> Shake or vacuum regularly to remove loose dirt and dust.</li>
            <li className="flex items-start gap-2"><span className="text-[var(--green)] mt-0.5">•</span> Blot spills immediately with a clean, dry cloth — do not rub.</li>
            <li className="flex items-start gap-2"><span className="text-[var(--green)] mt-0.5">•</span> Machine washable at 40°C on a gentle cycle (where applicable).</li>
            <li className="flex items-start gap-2"><span className="text-[var(--green)] mt-0.5">•</span> Do not bleach or use harsh chemical cleaners.</li>
            <li className="flex items-start gap-2"><span className="text-[var(--green)] mt-0.5">•</span> Air dry in shade. Avoid direct sunlight for extended periods.</li>
            <li className="flex items-start gap-2"><span className="text-[var(--green)] mt-0.5">•</span> Professional cleaning recommended for deep stains.</li>
            <li className="flex items-start gap-2"><span className="text-[var(--green)] mt-0.5">•</span> Rotate the product periodically for even wear.</li>
          </ul>
        </Accordion>

        {/* Shipping & Returns */}
        <Accordion title="Shipping & Returns">
          <div className="text-sm text-gray-600 space-y-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Shipping</h4>
              <ul className="space-y-1.5">
                <li className="flex items-start gap-2"><Truck size={14} className="text-[var(--green)] mt-0.5 shrink-0" /> Free shipping on all orders above ₹1,000 within India.</li>
                <li className="flex items-start gap-2"><Truck size={14} className="text-[var(--green)] mt-0.5 shrink-0" /> Standard delivery: 5–7 business days (Pan-India).</li>
                <li className="flex items-start gap-2"><Truck size={14} className="text-[var(--green)] mt-0.5 shrink-0" /> International shipping available at ₹200 flat rate.</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Returns & Exchange</h4>
              <ul className="space-y-1.5">
                <li className="flex items-start gap-2"><RotateCcw size={14} className="text-[var(--green)] mt-0.5 shrink-0" /> 7-day easy return policy from date of delivery.</li>
                <li className="flex items-start gap-2"><RotateCcw size={14} className="text-[var(--green)] mt-0.5 shrink-0" /> Product must be unused and in original packaging.</li>
                <li className="flex items-start gap-2"><RotateCcw size={14} className="text-[var(--green)] mt-0.5 shrink-0" /> Refund processed within 5–7 business days of pickup.</li>
              </ul>
            </div>
          </div>
        </Accordion>

        {/* Contact */}
        <Accordion title="Need Help?">
          <div className="flex flex-wrap gap-4 text-sm">
            <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-none border border-[var(--line)] hover:border-[#25D366] hover:text-[#25D366] transition-colors text-gray-600">
              <WhatsAppIcon /> WhatsApp Us
            </a>
            <a href="tel:+919999999999"
              className="flex items-center gap-2 px-4 py-2.5 rounded-none border border-[var(--line)] hover:border-[var(--green)] hover:text-[var(--green)] transition-colors text-gray-600">
              <Phone size={16} /> Call Us
            </a>
            <a href="mailto:support@naturalife.in"
              className="flex items-center gap-2 px-4 py-2.5 rounded-none border border-[var(--line)] hover:border-[var(--green)] hover:text-[var(--green)] transition-colors text-gray-600">
              <Mail size={16} /> Email Us
            </a>
          </div>
        </Accordion>

          {/* Reviews */}
          <Accordion title={`Reviews (${product.reviews?.length ?? 0})`}>
            <ReviewsTab productId={product.id} productName={product.name} reviews={product.reviews ?? []} />
          </Accordion>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          images={product.images}
          index={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onNav={(i) => setLightboxIndex(i)}
        />
      )}
    </>
  )
}

function VerifyEmailPrompt() {
  const [sent, setSent] = useState(false)
  const [code, setCode] = useState('')
  const [verified, setVerified] = useState(false)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const sendOtp = async () => {
    setBusy(true)
    setErr('')
    const res = await fetch('/api/account/verify-email', { method: 'POST' })
    setBusy(false)
    if (res.ok) setSent(true)
    else { const d = await res.json(); setErr(d.error ?? 'Failed to send code') }
  }

  const confirmOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setErr('')
    const res = await fetch('/api/account/verify-email', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }),
    })
    setBusy(false)
    if (res.ok) setVerified(true)
    else { const d = await res.json(); setErr(d.error ?? 'Invalid code') }
  }

  if (verified) {
    return (
      <div className="bg-[var(--green-light)] p-4">
        <p className="text-sm text-[var(--green)] font-medium">Email verified! Please reload the page to write your review.</p>
      </div>
    )
  }

  return (
    <div className="border border-[var(--line)] p-4">
      <p className="text-sm text-gray-600 mb-3">Only verified accounts can post reviews. Verify your email to continue.</p>
      {err && <p className="text-sm text-red-600 mb-2">{err}</p>}
      {!sent ? (
        <button onClick={sendOtp} disabled={busy} className="px-4 py-2 text-white text-sm font-semibold disabled:opacity-50" style={{ backgroundColor: 'var(--green)' }}>
          {busy ? 'Sending...' : 'Send Verification Code'}
        </button>
      ) : (
        <form onSubmit={confirmOtp} className="flex gap-2">
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter 6-digit code" className="border border-[var(--line)] px-3 py-2 text-sm flex-1" />
          <button type="submit" disabled={busy} className="px-4 py-2 text-white text-sm font-semibold disabled:opacity-50" style={{ backgroundColor: 'var(--green)' }}>Verify</button>
        </form>
      )}
    </div>
  )
}

function ReviewsTab({ productId, productName, reviews }: { productId: string; productName: string; reviews: Review[] }) {
  const { data: session, status } = useSession()
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const count = reviews.length
  const avg = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0
  const dist = [5, 4, 3, 2, 1].map((s) => ({ s, pct: count ? Math.round((reviews.filter(r => r.rating === s).length / count) * 100) : 0 }))

  const canReview = status === 'authenticated' && (session?.user as any)?.emailVerified

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const res = await fetch('/api/reviews', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, rating: rating || 5, text }),
    })
    if (res.ok) setSubmitted(true)
    else { const d = await res.json(); setError(d.error ?? 'Failed to submit') }
  }

  return (
    <div>
      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <p className="text-sm text-gray-500 mb-1">Based on {count} review{count === 1 ? '' : 's'}</p>
          <p className="text-4xl font-semibold mb-4" style={{ color: 'var(--green)' }}>
            {avg.toFixed(1)} <span className="text-base text-gray-400 font-normal">/ 5</span>
          </p>
          {dist.map(({ s, pct }) => (
            <div key={s} className="flex items-center gap-2 mb-1.5">
              <span className="text-[var(--green)] text-xs w-16">{'★'.repeat(s)}{'☆'.repeat(5 - s)}</span>
              <div className="flex-1 h-2 bg-[var(--surface-2)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--green)] rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs text-gray-400 w-10 text-right">{pct}%</span>
            </div>
          ))}
        </div>
        <div>
          <h4 className="font-semibold text-[var(--ink)] mb-3">{count ? 'Write a Review' : `Be the first to review "${productName}"`}</h4>
          {status === 'unauthenticated' ? (
            <div className="border border-[var(--line)] p-4">
              <p className="text-sm text-gray-600 mb-3">Only verified, logged-in customers can post a review.</p>
              <a href="/login" className="inline-block px-4 py-2 text-white text-sm font-semibold" style={{ backgroundColor: 'var(--green)' }}>Log In to Review</a>
            </div>
          ) : !canReview ? (
            <VerifyEmailPrompt />
          ) : submitted ? (
            <div className="bg-[var(--green-light)] rounded-none p-4">
              <p className="text-sm text-[var(--green)] font-medium">Thank you! Your review has been submitted and will appear once approved.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Your rating:</span>
                {[1, 2, 3, 4, 5].map((s) => (
                  <button type="button" key={s} onClick={() => setRating(s)} className={`text-xl transition-colors ${s <= rating ? 'text-[var(--green)]' : 'text-gray-300 hover:text-gray-400'}`}>★</button>
                ))}
              </div>
              <textarea required value={text} onChange={(e) => setText(e.target.value)} placeholder="Share your experience with this product..." rows={4} className="w-full border border-[var(--line)] rounded-none px-3 py-2 text-sm focus:outline-none focus:border-[var(--green)] focus:ring-1 focus:ring-[var(--green)]" />
              <button type="submit" className="px-6 py-2.5 rounded-none text-white text-sm font-semibold transition-all hover:opacity-90" style={{ backgroundColor: 'var(--green)' }}>Submit Review</button>
            </form>
          )}
        </div>
      </div>

      {count > 0 && (
        <div className="mt-8 space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="border border-[var(--line)] rounded-none p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-[var(--green-light)] flex items-center justify-center text-sm font-semibold text-[var(--green)]">
                  {r.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="font-semibold text-sm text-[var(--ink)]">{r.name}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[var(--green)] text-xs">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                    <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{r.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
