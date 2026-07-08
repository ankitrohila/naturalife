import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { sendNotification } from '@/lib/notifications'
import Razorpay from 'razorpay'

// Razorpay client is built lazily from DB config (admin settings) with env-var fallback.
async function getRazorpayClient(): Promise<{ client: Razorpay | null; keyId: string; isTestMode: boolean }> {
  try {
    const gw = await prisma.gatewayConfig.findFirst({ where: { provider: 'RAZORPAY', isEnabled: true } })
    if (gw) {
      const isTestMode = gw.isTestMode
      const keyId = isTestMode ? gw.testKeyId : gw.liveKeyId
      const keySecret = isTestMode ? gw.testSecret : gw.liveSecret
      if (keyId.startsWith('rzp_') && keySecret.length > 0) {
        return { client: new Razorpay({ key_id: keyId, key_secret: keySecret }), keyId, isTestMode }
      }
    }
  } catch { /* fall through to env fallback */ }

  // Env-var fallback
  const keyId = process.env.RAZORPAY_KEY_ID ?? ''
  const keySecret = process.env.RAZORPAY_KEY_SECRET ?? ''
  const isTestMode = keyId.startsWith('rzp_test_')
  if (keyId.startsWith('rzp_') && keySecret.length > 0) {
    return { client: new Razorpay({ key_id: keyId, key_secret: keySecret }), keyId, isTestMode }
  }
  return { client: null, keyId: '', isTestMode: true }
}

function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `NL-${ts}-${rand}`
}

export async function POST(req: NextRequest) {
  try {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { items, addressId, address, orderType = 'RETAIL', couponCode, coinsToRedeem = 0, paymentMethod } = body

  if (!items?.length) return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })

  // Handle address - either use existing addressId or create from inline address
  let resolvedAddressId: string | null = addressId || null
  if (!resolvedAddressId && address) {
    const createdAddress = await prisma.address.create({
      data: {
        userId: session.user.id!,
        line1: address.line1,
        line2: address.line2 || null,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        country: address.country || 'IN',
        isDefault: false,
        phone: address.phone,
        whatsappNumber: address.whatsappNumber || address.phone,
      },
    })
    resolvedAddressId = createdAddress.id
  }

  // Fetch variant details and calculate totals
  let subtotal = 0
  let taxAmount = 0
  const orderItems = []

  for (const item of items) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: item.variantId },
      include: { product: true, bulkPricingRules: true },
    })
    if (!variant) return NextResponse.json({ error: `Variant ${item.variantId} not found` }, { status: 400 })
    if (variant.stock < item.qty) return NextResponse.json({ error: `Insufficient stock for ${variant.product.name}` }, { status: 400 })

    let unitPrice = Number(variant.price)
    if (orderType === 'WHOLESALE' && item.qty >= variant.minWholesaleQty) {
      unitPrice = Number(variant.wholesalePrice)
      // Check bulk pricing rules
      const rule = variant.bulkPricingRules
        .sort((a, b) => b.minQty - a.minQty)
        .find((r) => item.qty >= r.minQty && (!r.maxQty || item.qty <= r.maxQty))
      if (rule) unitPrice = Number(rule.pricePerUnit)
    }

    const itemSubtotal = unitPrice * item.qty
    const itemTax = itemSubtotal * (Number(variant.product.taxRate) / 100)
    subtotal += itemSubtotal
    taxAmount += itemTax
    orderItems.push({ productVariantId: variant.id, quantity: item.qty, unitPrice, taxRate: Number(variant.product.taxRate), taxAmount: itemTax, subtotal: itemSubtotal })
  }

  // Shipping
  const settings = await prisma.siteSettings.findMany({ where: { key: { in: ['free_shipping_threshold', 'domestic_shipping_fee'] } } })
  const threshold = (settings.find((s) => s.key === 'free_shipping_threshold')?.value as any)?.amount ?? 1000
  const shippingFee = (settings.find((s) => s.key === 'domestic_shipping_fee')?.value as any)?.amount ?? 100
  const shippingCharge = orderType === 'RETAIL' && subtotal >= threshold ? 0 : shippingFee

  // Coupon
  let discount = 0
  if (couponCode) {
    const coupon = await prisma.coupon.findFirst({ where: { code: couponCode, isActive: true } })
    if (coupon && new Date() <= coupon.validUntil) {
      if (!coupon.minOrderValue || subtotal >= Number(coupon.minOrderValue)) {
        if (coupon.type === 'FLAT') discount = Math.min(Number(coupon.value), subtotal)
        else if (coupon.type === 'PERCENT') {
          discount = (subtotal * Number(coupon.value)) / 100
          if (coupon.maxDiscount) discount = Math.min(discount, Number(coupon.maxDiscount))
        }
      }
    }
  }

  // Coins
  const coinSettings = await prisma.siteSettings.findUnique({ where: { key: 'coin_redemption_rate' } })
  const redemptionRate = (coinSettings?.value as any)?.coinsPerRupee ?? 10
  const coinDiscount = coinsToRedeem > 0 ? coinsToRedeem / redemptionRate : 0

  const total = Math.max(0, subtotal + taxAmount + shippingCharge - discount - coinDiscount)

  // Find distributor by address pincode
  let assignedDistributorId: string | null = null
  if (orderType === 'WHOLESALE' && resolvedAddressId) {
    const addressData = await prisma.address.findUnique({ where: { id: resolvedAddressId } })
    if (addressData) {
      const pincodeNum = parseInt(addressData.pincode)
      const mapping = await prisma.statePincode.findFirst({
        where: { pincodeFrom: { lte: pincodeNum }, pincodeTo: { gte: pincodeNum } },
      })
      if (mapping) assignedDistributorId = mapping.distributorId
    }
  }

  // Create Razorpay order (only when real keys are configured — from DB or env)
  let razorpayOrderId: string | undefined
  const { client: razorpay, isTestMode: rzpTestMode } = paymentMethod !== 'COD'
    ? await getRazorpayClient()
    : { client: null, isTestMode: true }
  const testMode = paymentMethod !== 'COD' && !razorpay
  if (paymentMethod !== 'COD' && razorpay) {
    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(total * 100),
      currency: 'INR',
      receipt: generateOrderNumber(),
    })
    razorpayOrderId = rzpOrder.id
  }
  void rzpTestMode // used via testMode above

  // Get state code from address for order
  let stateCode = 'NA'
  if (resolvedAddressId) {
    const addressData = await prisma.address.findUnique({ where: { id: resolvedAddressId } })
    if (addressData) stateCode = addressData.state.slice(0, 2).toUpperCase()
  }

  // Save order
  const orderNumber = generateOrderNumber()
  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: session.user.id!,
      addressId: resolvedAddressId,
      orderType: orderType as any,
      status: 'PLACED',
      paymentStatus: paymentMethod === 'COD' ? 'COD' : 'PENDING',
      paymentMethod,
      razorpayOrderId,
      subtotal,
      taxAmount,
      shippingCharge,
      discount,
      coinDiscount,
      total,
      couponCode,
      assignedDistributorId,
      stateCode,
      items: { create: orderItems },
      history: { create: { status: 'PLACED', note: 'Order placed', notifyCustomer: true } },
    },
  })

  // Decrement stock
  for (const oi of orderItems) {
    await prisma.productVariant.update({ where: { id: oi.productVariantId }, data: { stock: { decrement: oi.quantity } } }).catch(() => {})
  }

  // Mark any active abandoned cart as recovered
  await prisma.abandonedCart.updateMany({
    where: { userId: session.user.id!, isRecovered: false },
    data: { isRecovered: true, recoveredAt: new Date() },
  }).catch(() => {})

  // Send order-placed confirmation (invoice) — non-blocking
  try {
    await sendNotification({ event: 'ORDER_PLACED', orderId: order.id })
  } catch (notifErr) {
    console.error('ORDER_PLACED notification failed:', notifErr)
  }

  // UPI pay-by-QR string (used when online payment runs without a live gateway)
  let upiString: string | undefined
  if (testMode) {
    const upiSetting = await prisma.siteSettings.findUnique({ where: { key: 'upi' } })
    const upiCfg = upiSetting?.value as any
    const upiVpa = upiCfg?.vpa || process.env.UPI_VPA || ''
    const upiPayeeName = upiCfg?.payeeName || process.env.UPI_PAYEE_NAME || 'Naturalife'
    if (upiVpa) {
      const pn = encodeURIComponent(upiPayeeName)
      upiString = `upi://pay?pa=${encodeURIComponent(upiVpa)}&pn=${pn}&am=${total.toFixed(2)}&cu=INR&tn=${encodeURIComponent(orderNumber)}`
    }
  }

  return NextResponse.json({ orderId: order.id, orderNumber, razorpayOrderId, total, testMode, upiString })
  } catch (err: any) {
    console.error('create-order failed:', err)
    return NextResponse.json({ error: err?.message ?? 'Order creation failed' }, { status: 500 })
  }
}
