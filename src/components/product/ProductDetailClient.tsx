'use client'

import { useState } from 'react'
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
}

export function ProductDetailClient({ product }: { product: Product }) {
  const orderType = useCartStore((s) => s.orderType)
  const setOrderType = useCartStore((s) => s.setOrderType)
  const addItem = useCartStore((s) => s.addItem)

  const [mainImage, setMainImage] = useState(product.images.find((i) => i.isPrimary)?.url ?? product.images[0]?.url)
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>({})
  const [qty, setQty] = useState(1)
  const [addedMsg, setAddedMsg] = useState('')

  // Group attribute values by attribute
  const attrGroups = Object.values(
    product.attributeValues.reduce<Record<string, { attr: AttributeVal['attribute']; values: AttributeVal['value'][] }>>((acc, av) => {
      const key = av.attribute.id
      if (!acc[key]) acc[key] = { attr: av.attribute, values: [] }
      if (!acc[key].values.find((v) => v.id === av.value.id)) acc[key].values.push(av.value)
      return acc
    }, {})
  )

  // Find matching variant based on selected attrs
  const matchingVariant = product.variants.find((v) => {
    const avs = v.attributeValues as Array<{ attributeId: string; valueId: string }>
    return avs.every((av) => !selectedAttrs[av.attributeId] || selectedAttrs[av.attributeId] === av.valueId)
  }) ?? product.variants[0]

  const getUnitPrice = (variant: Variant) => {
    if (orderType === 'WHOLESALE' && qty >= variant.minWholesaleQty) {
      const rule = variant.bulkPricingRules
        .sort((a, b) => b.minQty - a.minQty)
        .find((r) => qty >= r.minQty && (!r.maxQty || qty <= r.maxQty))
      return rule ? Number(rule.pricePerUnit) : Number(variant.wholesalePrice)
    }
    return Number(variant.price)
  }

  const unitPrice = matchingVariant ? getUnitPrice(matchingVariant) : 0
  const subtotal = unitPrice * qty
  const taxAmount = (subtotal * Number(product.taxRate)) / 100
  const total = subtotal + taxAmount

  const handleAttrSelect = (attrId: string, valueId: string, imageUrl?: string | null) => {
    setSelectedAttrs((prev) => ({ ...prev, [attrId]: valueId }))
    if (imageUrl) setMainImage(imageUrl)
    else {
      const matched = product.images.find((img) => img.attributeValue === valueId)
      if (matched) setMainImage(matched.url)
    }
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

  return (
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
                className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${mainImage === img.url ? 'border-orange-400' : 'border-gray-200'}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.altText ?? ''} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
        {/* Main image */}
        <div className="flex-1 aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
          {mainImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl">🏠</div>
          )}
        </div>
      </div>

      {/* Details */}
      <div>
        <p className="text-sm text-gray-500 mb-1">{product.category.name} · SKU: {product.sku}</p>
        <h1 className="text-2xl md:text-3xl font-bold mb-3" style={{ fontFamily: 'var(--font-display)', color: 'var(--indigo)' }}>
          {product.name}
        </h1>
        {product.shortDesc && <p className="text-gray-600 mb-5 text-sm leading-relaxed">{product.shortDesc}</p>}

        {/* Order type */}
        <div className="flex rounded-lg overflow-hidden border border-gray-300 mb-5 w-fit">
          {(['RETAIL', 'WHOLESALE'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setOrderType(type)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${orderType === type ? 'text-white' : 'bg-white text-gray-700'}`}
              style={orderType === type ? { backgroundColor: type === 'RETAIL' ? 'var(--saffron)' : 'var(--indigo)' } : {}}
            >
              {type === 'RETAIL' ? 'Retail' : 'Wholesale'}
            </button>
          ))}
        </div>

        {/* Attribute selectors */}
        {attrGroups.map(({ attr, values }) => (
          <div key={attr.id} className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">{attr.displayName}</p>
            <div className="flex flex-wrap gap-2">
              {values.map((v) => {
                const isSelected = selectedAttrs[attr.id] === v.id
                return (
                  <button
                    key={v.id}
                    onClick={() => handleAttrSelect(attr.id, v.id, v.imageUrl)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-all ${isSelected ? 'border-orange-400 font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
                    style={isSelected ? { backgroundColor: 'rgba(232,131,42,0.1)', color: 'var(--saffron)' } : {}}
                  >
                    {v.hexColor && (
                      <span className="w-4 h-4 rounded-full border border-gray-200 shrink-0" style={{ backgroundColor: v.hexColor }} />
                    )}
                    {v.label}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        {/* Quantity */}
        <div className="mb-5">
          <p className="text-sm font-medium text-gray-700 mb-2">Quantity</p>
          <div className="flex items-center gap-3">
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50">
              <Minus size={14} />
            </button>
            <input
              type="number"
              value={qty}
              min={1}
              onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 text-center border border-gray-300 rounded-lg py-1.5 text-sm"
            />
            <button onClick={() => setQty(qty + 1)} className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50">
              <Plus size={14} />
            </button>
          </div>
          {orderType === 'WHOLESALE' && matchingVariant && qty < matchingVariant.minWholesaleQty && (
            <p className="text-xs mt-1" style={{ color: 'var(--crimson)' }}>
              Minimum {matchingVariant.minWholesaleQty} units for wholesale pricing
            </p>
          )}
        </div>

        {/* Bulk Pricing Table */}
        {orderType === 'WHOLESALE' && matchingVariant?.bulkPricingRules.length > 0 && (
          <div className="mb-5 border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-600">Bulk Pricing</div>
            <table className="w-full text-sm">
              <tbody>
                {matchingVariant.bulkPricingRules.map((rule, i) => (
                  <tr key={i} className={`border-t border-gray-100 ${qty >= rule.minQty && (!rule.maxQty || qty <= rule.maxQty) ? 'bg-orange-50' : ''}`}>
                    <td className="px-4 py-2 text-gray-600">{rule.label ?? `${rule.minQty}${rule.maxQty ? `–${rule.maxQty}` : '+'} units`}</td>
                    <td className="px-4 py-2 font-semibold text-right" style={{ color: 'var(--saffron)' }}>₹{Number(rule.pricePerUnit).toLocaleString('en-IN')}/unit</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Price breakdown */}
        {matchingVariant && (
          <div className="bg-amber-50 rounded-xl p-4 mb-5 border border-amber-100">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Unit price</span>
              <span className="font-medium">₹{unitPrice.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Quantity</span>
              <span className="font-medium">× {qty}</span>
            </div>
            <div className="flex justify-between text-sm mb-1 pb-2 border-b border-amber-200">
              <span className="text-gray-600">Subtotal (excl. GST)</span>
              <span className="font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">GST ({product.taxRate}%)</span>
              <span className="text-gray-500">₹{taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold mt-1">
              <span>Total (incl. GST)</span>
              <span className="text-lg" style={{ color: 'var(--saffron)' }}>₹{total.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={handleAddToCart}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90"
            style={{ backgroundColor: 'var(--saffron)' }}
          >
            <ShoppingCart size={18} />
            {addedMsg || 'Add to Cart'}
          </button>
          <a
            href="/checkout"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all hover:opacity-90 text-white"
            style={{ backgroundColor: 'var(--indigo)' }}
            onClick={handleAddToCart}
          >
            <Zap size={18} />
            Buy Now
          </a>
        </div>

        {/* Product details */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>✓ Free shipping on orders above ₹1,000</p>
          <p>✓ GST invoice included</p>
          <p>✓ 7-day easy returns</p>
          <p>✓ Pan-India delivery in 5-7 days</p>
        </div>

        {/* Description Tab */}
        {product.description && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3">Product Description</h3>
            <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</div>
          </div>
        )}
      </div>
    </div>
  )
}
