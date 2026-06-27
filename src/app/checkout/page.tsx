'use client'

import { useState, useEffect } from 'react'
import { useCartStore } from '@/store/cart'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import Link from 'next/link'

declare global {
  interface Window {
    Razorpay: any
  }
}

const COUNTRIES = [
  { code: 'IN', name: 'India', currency: 'INR', shippingFee: 0 },
  { code: 'US', name: 'United States', currency: 'USD', shippingFee: 200 },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', shippingFee: 200 },
  { code: 'AU', name: 'Australia', currency: 'AUD', shippingFee: 200 },
  { code: 'CA', name: 'Canada', currency: 'CAD', shippingFee: 200 },
  { code: 'DE', name: 'Germany', currency: 'EUR', shippingFee: 200 },
  { code: 'FR', name: 'France', currency: 'EUR', shippingFee: 200 },
]

interface AddressForm {
  name: string
  email: string
  phone: string
  whatsappNumber: string
  line1: string
  line2: string
  city: string
  state: string
  pincode: string
  country: string
}

interface PincodeData {
  state?: string
  stateName?: string
  distributor?: any
  taxInfo?: any
  message?: string
}

export default function CheckoutPage() {
  const { items, orderType, couponCode, setCoupon, coinsToRedeem, setCoins, getSubtotal, getTaxTotal, clearCart } = useCartStore()
  const [form, setForm] = useState<AddressForm>({
    name: '',
    email: '',
    phone: '',
    whatsappNumber: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'IN',
  })
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'COD'>('ONLINE')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pincodeLoading, setPincodeLoading] = useState(false)
  const [pincodeData, setPincodeData] = useState<PincodeData | null>(null)
  const [couponInput, setCouponInput] = useState('')
  const [availableCoins, setAvailableCoins] = useState(0)

  const subtotal = getSubtotal()
  const taxTotal = getTaxTotal()
  const selectedCountry = COUNTRIES.find((c) => c.code === form.country)
  const shipping =
    form.country !== 'IN'
      ? selectedCountry?.shippingFee ?? 0
      : orderType === 'RETAIL' && subtotal >= 1000
        ? 0
        : 100
  const total = subtotal + taxTotal + shipping

  // Auto-fill pincode
  useEffect(() => {
    if (form.pincode.length === 6 && form.country === 'IN') {
      handlePincodeChange(form.pincode)
    }
  }, [form.pincode])

  const handlePincodeChange = async (pincode: string) => {
    if (pincode.length !== 6 || !/^\d{6}$/.test(pincode)) return

    setPincodeLoading(true)
    try {
      const res = await fetch(`/api/pincode?pincode=${pincode}`)
      const data = await res.json()
      setPincodeData(data)

      if (data.state) {
        setForm((f) => ({
          ...f,
          state: data.stateName || data.state,
        }))
      }
    } catch (err) {
      console.error('Pincode lookup failed:', err)
    } finally {
      setPincodeLoading(false)
    }
  }

  const handlePlaceOrder = async () => {
    if (!form.line1 || !form.city || !form.pincode || !form.name || !form.email || !form.phone) {
      setError('Please fill in all required address fields')
      return
    }
    if (items.length === 0) {
      setError('Your cart is empty')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ variantId: i.variantId, qty: i.qty })),
          orderType,
          couponCode: couponInput || couponCode,
          coinsToRedeem,
          paymentMethod: paymentMethod === 'COD' ? 'COD' : 'RAZORPAY',
          address: form,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Order creation failed')

      if (paymentMethod === 'COD') {
        clearCart()
        window.location.href = `/order-success?id=${data.orderId}`
        return
      }

      // Load Razorpay
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      document.body.appendChild(script)
      script.onload = () => {
        const rzp = new window.Razorpay({
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: Math.round(total * 100),
          currency: 'INR',
          order_id: data.razorpayOrderId,
          name: 'Naturalife',
          description: 'Handcrafted Home Textiles',
          prefill: { name: form.name, email: form.email, contact: form.phone },
          handler: async (response: any) => {
            await fetch('/api/checkout/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...response, orderId: data.orderId }),
            })
            clearCart()
            window.location.href = `/order-success?id=${data.orderId}`
          },
          modal: { ondismiss: () => setLoading(false) },
        })
        rzp.open()
      }
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--ivory)' }}>
          <div className="text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-xl font-semibold text-gray-600 mb-4">Your cart is empty</h2>
            <Link href="/shop" className="px-6 py-3 text-white rounded-xl font-semibold inline-block" style={{ backgroundColor: 'var(--saffron)' }}>
              Shop Now
            </Link>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen py-10 px-4" style={{ backgroundColor: 'var(--ivory)' }}>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-8" style={{ fontFamily: 'var(--font-display)', color: 'var(--indigo)' }}>
            Checkout
          </h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Address + Payment */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Address */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-semibold text-gray-800 mb-5">Delivery Address</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Full Name *', key: 'name', type: 'text', colSpan: 'col-span-2' },
                    { label: 'Email *', key: 'email', type: 'email' },
                    { label: 'Phone *', key: 'phone', type: 'tel' },
                    { label: 'WhatsApp Number (for invoice)', key: 'whatsappNumber', type: 'tel' },
                    { label: 'Address Line 1 *', key: 'line1', type: 'text', colSpan: 'col-span-2' },
                    { label: 'Address Line 2', key: 'line2', type: 'text', colSpan: 'col-span-2' },
                    { label: 'Pincode *', key: 'pincode', type: 'text' },
                    { label: 'City *', key: 'city', type: 'text' },
                    { label: 'State *', key: 'state', type: 'text', disabled: form.country === 'IN' },
                    { label: 'Country *', key: 'country', type: 'select', colSpan: 'col-span-2' },
                  ].map(({ label, key, type, colSpan, disabled }) => (
                    <div key={key} className={colSpan ?? ''}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                      {type === 'select' ? (
                        <select
                          value={form[key as keyof AddressForm]}
                          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                        >
                          {COUNTRIES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={type}
                          disabled={disabled}
                          value={form[key as keyof AddressForm]}
                          onChange={(e) => {
                            const value = e.target.value
                            setForm((f) => ({ ...f, [key]: value }))
                          }}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none disabled:bg-gray-50"
                        />
                      )}
                      {key === 'pincode' && pincodeLoading && <p className="text-xs text-gray-400 mt-1">Looking up...</p>}
                      {key === 'pincode' && pincodeData && pincodeData.state && (
                        <p className="text-xs text-green-600 mt-1">✓ {pincodeData.stateName} found - Distributor available</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Coupon & Coins */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-semibold text-gray-800 mb-4">Promotions</h2>
                <div className="space-y-3">
                  {/* Coupon */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Apply Coupon Code</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                      />
                      <button className="px-4 py-2.5 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: 'var(--saffron)' }}>
                        Apply
                      </button>
                    </div>
                  </div>

                  {/* Coins */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Redeem Coins</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="0"
                        max={availableCoins}
                        value={coinsToRedeem}
                        onChange={(e) => setCoins(Math.max(0, parseInt(e.target.value) || 0))}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                        placeholder="0"
                      />
                      <span className="text-xs text-gray-500">Available: {availableCoins}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-semibold text-gray-800 mb-5">Payment Method</h2>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod('ONLINE')}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${paymentMethod === 'ONLINE' ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className="font-medium text-sm mb-1">💳 Online Payment</div>
                    <div className="text-xs text-gray-500">GPay, UPI, Cards, Net Banking</div>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${paymentMethod === 'COD' ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className="font-medium text-sm mb-1">💵 Cash on Delivery</div>
                    <div className="text-xs text-gray-500">Pay when order arrives</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-fit sticky top-24">
              <h2 className="font-bold text-lg mb-5" style={{ color: 'var(--indigo)' }}>
                Order Summary
              </h2>

              {/* Items */}
              <div className="space-y-3 mb-5 pb-5 border-b border-gray-100">
                {items.map((item) => {
                  const price = orderType === 'WHOLESALE' ? item.wholesalePrice : item.unitPrice
                  return (
                    <div key={item.variantId} className="flex justify-between text-sm">
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="font-medium text-gray-800 truncate">{item.name}</p>
                        <p className="text-xs text-gray-400">× {item.qty}</p>
                      </div>
                      <span className="font-medium shrink-0">₹{(price * item.qty).toLocaleString('en-IN')}</span>
                    </div>
                  )
                })}
              </div>

              <div className="space-y-2 text-sm mb-5">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span>₹{taxTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>{shipping === 0 ? <span className="text-green-600">FREE</span> : `₹${shipping}`}</span>
                </div>
                {couponInput && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹50</span>
                  </div>
                )}
                <div className="flex justify-between font-bold pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-lg" style={{ color: 'var(--saffron)' }}>
                    ₹{total.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-2">*Price exclusive of taxes</p>
              </div>

              {error && <p className="text-xs text-red-500 mb-3 p-2 bg-red-50 rounded-lg">{error}</p>}

              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full py-4 text-white rounded-xl font-semibold disabled:opacity-60 transition-opacity"
                style={{ backgroundColor: 'var(--saffron)' }}
              >
                {loading ? 'Processing...' : paymentMethod === 'COD' ? 'Place Order (COD)' : 'Pay Now'}
              </button>
              <p className="text-xs text-gray-400 text-center mt-3">🔒 Secure checkout powered by Razorpay</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
