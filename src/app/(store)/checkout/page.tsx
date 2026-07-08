'use client'

import { useState, useEffect } from 'react'
import { useCartStore } from '@/store/cart'
import Link from 'next/link'
import QRCode from 'qrcode'

declare global {
  interface Window { Razorpay: any }
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

type PaymentMethod = 'UPI' | 'CARD' | 'NETBANKING' | 'WALLET' | 'COD'

interface AddressForm {
  name: string; email: string; phone: string; whatsappNumber: string
  line1: string; line2: string; city: string; state: string; pincode: string; country: string
}

interface GatewayInfo {
  provider: string; publicKey: string; isTestMode: boolean; upiVpa: string
}

const PAYMENT_METHODS: { id: PaymentMethod; label: string; desc: string; icon: string }[] = [
  { id: 'UPI', label: 'UPI / GPay', desc: 'PhonePe, Google Pay, Paytm, BHIM', icon: '📱' },
  { id: 'CARD', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, Rupay, Amex', icon: '💳' },
  { id: 'NETBANKING', label: 'Net Banking', desc: 'All major Indian banks', icon: '🏦' },
  { id: 'WALLET', label: 'Wallets', desc: 'Paytm, Mobikwik, Amazon Pay', icon: '👛' },
  { id: 'COD', label: 'Cash on Delivery', desc: 'Pay when order arrives', icon: '💵' },
]

// Map checkout method to Razorpay method string
const RZP_METHOD: Record<PaymentMethod, string | null> = {
  UPI: 'upi',
  CARD: 'card',
  NETBANKING: 'netbanking',
  WALLET: 'wallet',
  COD: null,
}

export default function CheckoutPage() {
  const { items, orderType, couponCode, setCoupon, coinsToRedeem, setCoins, getSubtotal, getTaxTotal, clearCart } = useCartStore()
  const [form, setForm] = useState<AddressForm>({
    name: '', email: '', phone: '', whatsappNumber: '',
    line1: '', line2: '', city: '', state: '', pincode: '', country: 'IN',
  })
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pincodeLoading, setPincodeLoading] = useState(false)
  const [couponInput, setCouponInput] = useState('')
  const [availableCoins, setAvailableCoins] = useState(0)
  const [upiData, setUpiData] = useState<{ orderId: string; upiString: string } | null>(null)
  const [qrUrl, setQrUrl] = useState('')
  const [paymentState, setPaymentState] = useState<'waiting' | 'success' | 'failed'>('waiting')
  const [isMobile, setIsMobile] = useState(false)
  const [gateway, setGateway] = useState<GatewayInfo>({ provider: 'NONE', publicKey: '', isTestMode: true, upiVpa: '' })

  useEffect(() => {
    setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent))
    fetch('/api/checkout/active-gateway').then(r => r.json()).then(setGateway).catch(() => {})
  }, [])

  // Poll payment status while UPI QR modal is open
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
      } catch { /* keep polling */ }
    }, 2000)
    return () => clearInterval(interval)
  }, [upiData, paymentState, clearCart])

  const retryPayment = async () => {
    if (!upiData) return
    await fetch(`/api/checkout/payment-status/${upiData.orderId}/retry`, { method: 'POST' })
    setPaymentState('waiting')
  }

  const subtotal = getSubtotal()
  const taxTotal = getTaxTotal()
  const selectedCountry = COUNTRIES.find((c) => c.code === form.country)
  const shipping = form.country !== 'IN'
    ? selectedCountry?.shippingFee ?? 0
    : orderType === 'RETAIL' && subtotal >= 1000 ? 0 : 100
  const total = subtotal + taxTotal + shipping

  useEffect(() => {
    if (form.pincode.length === 6 && form.country === 'IN') handlePincodeChange(form.pincode)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.pincode])

  const handlePincodeChange = async (pincode: string) => {
    if (!/^\d{6}$/.test(pincode)) return
    setPincodeLoading(true)
    try {
      const res = await fetch(`/api/pincode?pincode=${pincode}`)
      const data = await res.json()
      if (data.state) setForm(f => ({ ...f, state: data.stateName || data.state }))
    } catch { /* ignore */ } finally { setPincodeLoading(false) }
  }

  const openRazorpay = (orderId: string, razorpayOrderId: string) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    document.body.appendChild(script)
    script.onload = () => {
      const options: any = {
        key: gateway.publicKey,
        amount: Math.round(total * 100),
        currency: 'INR',
        order_id: razorpayOrderId,
        name: 'Naturalife',
        description: 'Handcrafted Home Textiles',
        image: '/images/logo/naturalife-logo.png',
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: '#2E7D32' },
        handler: async (response: any) => {
          await fetch('/api/checkout/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...response, orderId }),
          })
          clearCart()
          window.location.href = `/order-success?id=${orderId}`
        },
        modal: { ondismiss: () => setLoading(false) },
      }
      // Pre-select payment method if possible
      const rzpMethod = RZP_METHOD[paymentMethod]
      if (rzpMethod) options.method = { [rzpMethod]: true }
      new window.Razorpay(options).open()
    }
  }

  const handlePlaceOrder = async () => {
    if (!form.line1 || !form.city || !form.pincode || !form.name || !form.email || !form.phone) {
      setError('Please fill in all required address fields')
      return
    }
    if (items.length === 0) { setError('Your cart is empty'); return }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ variantId: i.variantId, qty: i.qty })),
          orderType,
          couponCode: couponInput || couponCode,
          coinsToRedeem,
          paymentMethod: paymentMethod === 'COD' ? 'COD' : 'RAZORPAY',
          address: form,
        }),
      })

      const data = await res.json()
      if (res.status === 401) { window.location.href = '/login?callbackUrl=/checkout'; return }
      if (!res.ok) throw new Error(data.error ?? 'Order creation failed')

      if (paymentMethod === 'COD') {
        clearCart()
        window.location.href = `/order-success?id=${data.orderId}`
        return
      }

      // Live Razorpay gateway configured
      if (!data.testMode && data.razorpayOrderId) {
        openRazorpay(data.orderId, data.razorpayOrderId)
        return
      }

      // Test/fallback mode: show UPI QR if VPA configured
      if (data.testMode) {
        if (data.upiString) {
          const url = await QRCode.toDataURL(data.upiString, { width: 280, margin: 1 })
          setQrUrl(url)
          setUpiData({ orderId: data.orderId, upiString: data.upiString })
          setLoading(false)
          return
        }
        // No UPI VPA configured either — auto-confirm in test mode
        clearCart()
        window.location.href = `/order-success?id=${data.orderId}`
        return
      }
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const hasGateway = gateway.provider !== 'NONE' && gateway.publicKey

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

          {/* Test mode banner */}
          {gateway.isTestMode && (
            <div className="mb-6 px-4 py-3 bg-orange-50 border border-orange-200 text-orange-800 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
              <span><strong>Test Mode</strong> — No real payment will be charged. Use test card <code className="font-mono text-xs bg-orange-100 px-1">4111 1111 1111 1111</code> or UPI ID <code className="font-mono text-xs bg-orange-100 px-1">success@razorpay</code></span>
            </div>
          )}

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
                          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                          className="w-full border border-gray-300 rounded-none px-3 py-2.5 text-sm focus:outline-none"
                        >
                          {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                        </select>
                      ) : (
                        <input
                          type={type}
                          disabled={disabled}
                          value={form[key as keyof AddressForm]}
                          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                          className="w-full border border-gray-300 rounded-none px-3 py-2.5 text-sm focus:outline-none disabled:bg-gray-50"
                        />
                      )}
                      {key === 'pincode' && pincodeLoading && <p className="text-xs text-gray-400 mt-1">Looking up...</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Promotions */}
              <div className="bg-white rounded-none border border-gray-100 shadow-sm p-6">
                <h2 className="font-semibold text-gray-800 mb-4">Promotions</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Coupon Code</label>
                    <div className="flex gap-2">
                      <input type="text" placeholder="Enter coupon code" value={couponInput}
                        onChange={e => setCouponInput(e.target.value.toUpperCase())}
                        className="flex-1 border border-gray-300 rounded-none px-3 py-2.5 text-sm focus:outline-none" />
                      <button className="px-4 py-2.5 rounded-none text-white text-sm font-medium" style={{ backgroundColor: 'var(--saffron)' }}>Apply</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Redeem Coins</label>
                    <div className="flex items-center gap-3">
                      <input type="number" min="0" max={availableCoins} value={coinsToRedeem}
                        onChange={e => setCoins(Math.max(0, parseInt(e.target.value) || 0))}
                        className="flex-1 border border-gray-300 rounded-none px-3 py-2.5 text-sm focus:outline-none" placeholder="0" />
                      <span className="text-xs text-gray-500">Available: {availableCoins}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-none border border-gray-100 shadow-sm p-6">
                <h2 className="font-semibold text-gray-800 mb-2">Payment Method</h2>
                {!hasGateway && (
                  <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 px-3 py-2 mb-4">
                    No payment gateway configured — payments will go through UPI QR or test mode. Configure Razorpay in Admin → Settings → Payment Gateways.
                  </p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PAYMENT_METHODS.map(pm => (
                    <button key={pm.id} onClick={() => setPaymentMethod(pm.id)}
                      className={`p-4 rounded-none border-2 text-left transition-all flex items-start gap-3 ${paymentMethod === pm.id ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <span className="text-2xl shrink-0 mt-0.5">{pm.icon}</span>
                      <div>
                        <div className="font-medium text-sm text-gray-800">{pm.label}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{pm.desc}</div>
                      </div>
                      {paymentMethod === pm.id && (
                        <span className="ml-auto shrink-0 w-5 h-5 rounded-full bg-green-600 flex items-center justify-center">
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><polyline points="1.5,5.5 4,8 8.5,2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {hasGateway && paymentMethod !== 'COD' && (
                  <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 border-t border-gray-100 pt-4">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                    Secured by {gateway.provider} {gateway.isTestMode ? '(test mode)' : '(live)'}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="bg-white rounded-none border border-gray-100 shadow-sm p-6 h-fit sticky top-24">
              <h2 className="font-bold text-lg mb-5" style={{ color: 'var(--indigo)' }}>Order Summary</h2>

              <div className="space-y-3 mb-5 pb-5 border-b border-gray-100">
                {items.map(item => {
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
                <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Tax (GST)</span><span>₹{taxTotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Shipping</span><span>{shipping === 0 ? <span className="text-green-600">FREE</span> : `₹${shipping}`}</span></div>
                {couponInput && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹50</span></div>}
                <div className="flex justify-between font-bold pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-lg" style={{ color: 'var(--saffron)' }}>₹{total.toFixed(2)}</span>
                </div>
              </div>

              {error && <p className="text-xs text-red-500 mb-3 p-2 bg-red-50 rounded-none">{error}</p>}

              <button onClick={handlePlaceOrder} disabled={loading}
                className="w-full py-4 text-white rounded-none font-semibold disabled:opacity-60 transition-opacity"
                style={{ backgroundColor: paymentMethod === 'COD' ? 'var(--green)' : 'var(--saffron)' }}>
                {loading ? 'Processing...' : paymentMethod === 'COD' ? 'Place Order (COD)' : `Pay ₹${total.toFixed(2)}`}
              </button>

              <div className="mt-3 flex items-center justify-center gap-4">
                {['UPI', 'VISA', 'MC', 'RuPay'].map(b => (
                  <span key={b} className="text-[10px] font-bold text-gray-400 border border-gray-200 px-1.5 py-0.5">{b}</span>
                ))}
              </div>
              <p className="text-xs text-gray-400 text-center mt-2">
                {hasGateway ? `Secured by ${gateway.provider}` : 'Test mode — no real charge'}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* UPI QR Modal (fallback when no gateway configured) */}
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
                <h3 className="text-lg font-semibold mb-1">Payment Failed</h3>
                <p className="text-sm text-gray-500 mb-4">UPI payment wasn't confirmed. It may have timed out.</p>
                <button onClick={retryPayment} className="w-full py-2.5 rounded-none text-white text-sm font-semibold mb-2" style={{ backgroundColor: 'var(--green)' }}>
                  Retry Payment
                </button>
                <button onClick={() => { setUpiData(null); setQrUrl(''); setPaymentState('waiting') }}
                  className="w-full py-2.5 rounded-none border border-gray-300 text-gray-600 text-sm font-semibold">
                  Choose Different Method
                </button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-[var(--ink)] mb-1">Scan &amp; Pay via UPI</h3>
                <p className="text-sm text-gray-500 mb-4">Pay <span className="font-semibold text-[var(--green)]">₹{total.toFixed(2)}</span> with GPay, PhonePe, Paytm or any UPI app</p>
                {qrUrl && <img src={qrUrl} alt="UPI QR code" className="w-56 h-56 mx-auto border border-[var(--line)]" />}
                {isMobile && (
                  <a href={upiData.upiString} className="mt-4 block w-full py-2.5 border border-[var(--green)] text-[var(--green)] text-sm font-semibold">
                    Open in UPI App
                  </a>
                )}
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 border-t-[var(--green)] animate-spin" />
                  Waiting for payment...
                </div>
                <button onClick={() => { setUpiData(null); setQrUrl('') }} className="mt-4 w-full py-2 text-xs text-gray-400 hover:text-gray-600">
                  Cancel
                </button>
                <p className="text-[11px] text-gray-400 mt-2">Auto-detected — no need to confirm manually.</p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
