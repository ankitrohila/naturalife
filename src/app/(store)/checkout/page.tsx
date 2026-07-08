'use client'

import { useState, useEffect } from 'react'
import { useCartStore } from '@/store/cart'
import Link from 'next/link'
import QRCode from 'qrcode'

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
  const [upiData, setUpiData] = useState<{ orderId: string; upiString: string } | null>(null)
  const [qrUrl, setQrUrl] = useState('')
  const [paymentState, setPaymentState] = useState<'waiting' | 'success' | 'failed'>('waiting')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent))
  }, [])

  // Poll the order's payment status while the UPI modal is open — no manual
  // "I've paid" button; the backend auto-resolves the simulated payment.
  useEffect(() => {
    if (!upiData || paymentState !== 'waiting') return
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/checkout/payment-status/${upiData.orderId}`)
        const data = await res.json()
        if (data.paymentStatus === 'PAID') {
          setPaymentState('success')
          clearInterval(interval)
          clearCart()
          setTimeout(() => { window.location.href = `/order-success?id=${upiData.orderId}` }, 1200)
        } else if (data.paymentStatus === 'FAILED') {
          setPaymentState('failed')
          clearInterval(interval)
        }
      } catch {
        // transient network error — keep polling
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [upiData, paymentState])

  const retryPayment = async () => {
    if (!upiData) return
    await fetch(`/api/checkout/payment-status/${upiData.orderId}/retry`, { method: 'POST' })
    setPaymentState('waiting')
  }

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
      if (res.status === 401) {
        window.location.href = '/login?callbackUrl=/checkout'
        return
      }
      if (!res.ok) throw new Error(data.error ?? 'Order creation failed')

      // COD → straight to success
      if (paymentMethod === 'COD') {
        clearCart()
        window.location.href = `/order-success?id=${data.orderId}`
        return
      }

      // Test/UPI mode (no live gateway): show a scannable UPI QR to pay
      if (data.testMode) {
        if (data.upiString) {
          const url = await QRCode.toDataURL(data.upiString, { width: 280, margin: 1 })
          setQrUrl(url)
          setUpiData({ orderId: data.orderId, upiString: data.upiString })
          setLoading(false)
          return
        }
        clearCart()
        window.location.href = `/order-success?id=${data.orderId}`
        return
      }

      // Load Razorpay (live gateway)
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--ivory)' }}>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-600 mb-4">Your cart is empty</h2>
          <Link href="/shop" className="px-6 py-3 text-white rounded-none font-semibold inline-block" style={{ backgroundColor: 'var(--saffron)' }}>
            Shop Now
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <main className="min-h-screen py-10 px-4" style={{ backgroundColor: 'var(--ivory)' }}>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-8" style={{ fontFamily: 'var(--font-display)', color: 'var(--indigo)' }}>
            Checkout
          </h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Address + Payment */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Address */}
              <div className="bg-white rounded-none border border-gray-100 shadow-sm p-6">
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
                          className="w-full border border-gray-300 rounded-none px-3 py-2.5 text-sm focus:outline-none"
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
                          className="w-full border border-gray-300 rounded-none px-3 py-2.5 text-sm focus:outline-none disabled:bg-gray-50"
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
              <div className="bg-white rounded-none border border-gray-100 shadow-sm p-6">
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
                        className="flex-1 border border-gray-300 rounded-none px-3 py-2.5 text-sm focus:outline-none"
                      />
                      <button className="px-4 py-2.5 rounded-none text-white text-sm font-medium" style={{ backgroundColor: 'var(--saffron)' }}>
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
                        className="flex-1 border border-gray-300 rounded-none px-3 py-2.5 text-sm focus:outline-none"
                        placeholder="0"
                      />
                      <span className="text-xs text-gray-500">Available: {availableCoins}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-none border border-gray-100 shadow-sm p-6">
                <h2 className="font-semibold text-gray-800 mb-5">Payment Method</h2>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod('ONLINE')}
                    className={`p-4 rounded-none border-2 text-left transition-all ${paymentMethod === 'ONLINE' ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className="font-medium text-sm mb-1">Online Payment</div>
                    <div className="text-xs text-gray-500">GPay, UPI, Cards, Net Banking</div>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-4 rounded-none border-2 text-left transition-all ${paymentMethod === 'COD' ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className="font-medium text-sm mb-1">Cash on Delivery</div>
                    <div className="text-xs text-gray-500">Pay when order arrives</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="bg-white rounded-none border border-gray-100 shadow-sm p-6 h-fit sticky top-24">
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

              {error && <p className="text-xs text-red-500 mb-3 p-2 bg-red-50 rounded-none">{error}</p>}

              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full py-4 text-white rounded-none font-semibold disabled:opacity-60 transition-opacity"
                style={{ backgroundColor: 'var(--saffron)' }}
              >
                {loading ? 'Processing...' : paymentMethod === 'COD' ? 'Place Order (COD)' : 'Pay Now'}
              </button>
              <p className="text-xs text-gray-400 text-center mt-3">Secure checkout powered by Razorpay</p>
            </div>
          </div>
        </div>
      </main>

      {/* UPI Scan & Pay modal */}
      {upiData && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm">
          <div className="bg-white rounded-none shadow-2xl w-full max-w-sm p-6 text-center">
            {paymentState === 'success' ? (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--green-light)' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <h3 className="text-lg font-semibold text-[var(--ink)] mb-1">Payment Confirmed!</h3>
                <p className="text-sm text-gray-500">Redirecting to your order...</p>
              </>
            ) : paymentState === 'failed' ? (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-red-50">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </div>
                <h3 className="text-lg font-semibold text-[var(--ink)] mb-1">Payment Failed</h3>
                <p className="text-sm text-gray-500 mb-4">Your UPI payment wasn&apos;t confirmed. It may have timed out or been declined.</p>
                <button onClick={retryPayment} className="w-full py-2.5 rounded-none text-white text-sm font-semibold" style={{ backgroundColor: 'var(--green)' }}>
                  Retry Payment
                </button>
                <button
                  onClick={() => { setUpiData(null); setQrUrl(''); setPaymentState('waiting') }}
                  className="mt-2 w-full py-2.5 rounded-none border border-gray-300 text-gray-600 text-sm font-semibold"
                >
                  Choose a Different Payment Method
                </button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-[var(--ink)] mb-1">Scan &amp; Pay via UPI</h3>
                <p className="text-sm text-gray-500 mb-4">Pay <span className="font-semibold text-[var(--green)]">₹{total.toFixed(2)}</span> with any UPI app (GPay, PhonePe, Paytm)</p>
                {qrUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qrUrl} alt="UPI QR code" className="w-56 h-56 mx-auto rounded-none border border-[var(--line)]" />
                )}
                {isMobile && (
                  <a href={upiData.upiString} className="mt-4 block w-full py-2.5 rounded-none border border-[var(--green)] text-[var(--green)] text-sm font-semibold">
                    Open in UPI app
                  </a>
                )}
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 border-t-[var(--green)] animate-spin" />
                  Waiting for payment confirmation...
                </div>
                <button onClick={() => { setUpiData(null); setQrUrl('') }} className="mt-4 w-full py-2 text-xs text-gray-400 hover:text-gray-600">
                  Cancel
                </button>
                <p className="text-[11px] text-gray-400 mt-3">This is auto-detected — no need to confirm manually once you pay.</p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
