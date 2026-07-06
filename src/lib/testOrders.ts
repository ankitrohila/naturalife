import { prisma } from './prisma'

function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `NL-TEST-${ts}-${rand}`
}

export async function createTestOrder(opts: {
  userId: string
  orderType: 'RETAIL' | 'WHOLESALE'
  paymentMethod: 'COD' | 'RAZORPAY'
  paymentStatus?: 'PENDING' | 'PAID' | 'COD' | 'FAILED'
}) {
  const variant = await prisma.productVariant.findFirst({
    where: { stock: { gt: 0 }, product: { status: 'ACTIVE' } },
    include: { product: true },
    orderBy: { price: 'asc' },
  })
  if (!variant) throw new Error('No in-stock products available to build a test order')

  const qty = opts.orderType === 'WHOLESALE' ? Math.max(variant.minWholesaleQty, 10) : 2
  const unitPrice = opts.orderType === 'WHOLESALE' ? Number(variant.wholesalePrice) : Number(variant.price)
  const subtotal = unitPrice * qty
  const taxAmount = subtotal * (Number(variant.product.taxRate) / 100)
  const shippingCharge = opts.orderType === 'RETAIL' && subtotal >= 1000 ? 0 : 100
  const total = subtotal + taxAmount + shippingCharge

  let address = await prisma.address.findFirst({ where: { userId: opts.userId } })
  if (!address) {
    address = await prisma.address.create({
      data: {
        userId: opts.userId,
        line1: 'Test Address, Building 1',
        city: 'Jaipur',
        state: 'Rajasthan',
        pincode: '302001',
        phone: '9999999999',
        isDefault: true,
      },
    })
  }

  const resolvedPaymentStatus = opts.paymentStatus ?? (opts.paymentMethod === 'COD' ? 'COD' : 'PENDING')

  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      userId: opts.userId,
      addressId: address.id,
      orderType: opts.orderType,
      status: resolvedPaymentStatus === 'PAID' || resolvedPaymentStatus === 'COD' ? 'CONFIRMED' : 'PLACED',
      paymentStatus: resolvedPaymentStatus,
      paymentMethod: opts.paymentMethod,
      subtotal,
      taxAmount,
      shippingCharge,
      discount: 0,
      coinDiscount: 0,
      total,
      stateCode: 'RJ',
      items: {
        create: [{ productVariantId: variant.id, quantity: qty, unitPrice, taxRate: Number(variant.product.taxRate), taxAmount, subtotal }],
      },
      history: { create: { status: 'PLACED', note: 'Test order created from admin Test Environment', notifyCustomer: false } },
    },
  })

  return order
}
