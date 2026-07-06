'use client'

import { useCartStore } from '@/store/cart'
import { Minus, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function CartPage() {
  const { items, orderType, removeItem, updateQty, getSubtotal, getTaxTotal } = useCartStore()

  const subtotal = getSubtotal()
  const taxTotal = getTaxTotal()
  const shipping = orderType === 'RETAIL' && subtotal >= 1000 ? 0 : 100
  const total = subtotal + taxTotal + shipping

  return (
    <main className="min-h-screen py-10 px-4" style={{ backgroundColor: 'var(--ivory)' }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8" style={{ fontFamily: 'var(--font-display)', color: 'var(--indigo)' }}>
          Shopping Cart
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-none border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-600 mb-2">Your cart is empty</h2>
            <p className="text-gray-400 mb-6 text-sm">Add some beautiful handcrafted products!</p>
            <Link href="/shop" className="inline-block px-6 py-3 text-white rounded-none font-semibold" style={{ backgroundColor: 'var(--saffron)' }}>
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const price = orderType === 'WHOLESALE' ? item.wholesalePrice : item.unitPrice
                return (
                  <div key={item.variantId} className="bg-white rounded-none p-4 border border-gray-100 flex gap-4">
                    <div className="w-20 h-20 rounded-none overflow-hidden bg-gray-50 shrink-0">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-[var(--surface-2)]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-gray-800 truncate">{item.name}</h3>
                      <p className="text-xs text-gray-500 mb-2">{Object.entries(item.attributes).map(([k, v]) => `${k}: ${v}`).join(', ')}</p>
                      <div className="flex items-center gap-3">
                        <button onClick={() => updateQty(item.variantId, item.qty - 1)} className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50"><Minus size={12} /></button>
                        <span className="text-sm font-medium w-6 text-center">{item.qty}</span>
                        <button onClick={() => updateQty(item.variantId, item.qty + 1)} className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50"><Plus size={12} /></button>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-sm" style={{ color: 'var(--saffron)' }}>₹{(price * item.qty).toLocaleString('en-IN')}</p>
                      <p className="text-xs text-gray-400">₹{price}/unit</p>
                      <button onClick={() => removeItem(item.variantId)} className="mt-2 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Summary */}
            <div className="bg-white rounded-none p-6 border border-gray-100 h-fit sticky top-24">
              <h2 className="font-bold text-lg mb-4" style={{ color: 'var(--indigo)' }}>Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Subtotal (excl. GST)</span><span>₹{subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">GST</span><span>₹{taxTotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Shipping</span><span>{shipping === 0 ? <span className="text-green-600 font-medium">FREE</span> : `₹${shipping}`}</span></div>
                {shipping > 0 && subtotal < 1000 && (
                  <p className="text-xs text-gray-400">Add ₹{(1000 - subtotal).toFixed(0)} more for free shipping</p>
                )}
                <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-lg" style={{ color: 'var(--saffron)' }}>₹{total.toFixed(2)}</span>
                </div>
              </div>
              <Link href="/checkout" className="mt-5 block w-full py-3 text-center text-white rounded-none font-semibold" style={{ backgroundColor: 'var(--saffron)' }}>
                Proceed to Checkout
              </Link>
              <Link href="/shop" className="mt-3 block text-center text-sm" style={{ color: 'var(--saffron)' }}>
                ← Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
