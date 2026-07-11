import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

const SEED_SECRET = 'naturalife-seed-2024'

interface ProductData {
  name: string
  sku: string
  category: string
  price: number
  wholesalePrice: number
  stock: number
  description: string
  colors: string[]
  sizes: string[]
}

const PRODUCTS: ProductData[] = [
  { name: 'Classic Microfiber Doormat', sku: 'DM-001', category: 'doormats', price: 599, wholesalePrice: 399, stock: 100, description: 'Premium microfiber doormat with anti-skid rubber backing. Machine washable, quick-dry, durable for heavy foot traffic.', colors: ['red', 'blue', 'black', 'brown'], sizes: ['16x24', '18x30'] },
  { name: 'Jute Fiber Doormat', sku: 'DM-002', category: 'doormats', price: 499, wholesalePrice: 349, stock: 80, description: 'Eco-friendly natural jute fiber doormat. Biodegradable, sturdy weave that traps dirt effectively.', colors: ['brown', 'grey', 'ivory'], sizes: ['16x24', '18x30'] },
  { name: 'Reversible Cotton Doormat', sku: 'DM-003', category: 'doormats', price: 449, wholesalePrice: 299, stock: 120, description: 'Reversible design doormat with dual patterns — two looks in one. Soft cotton weave with anti-slip base.', colors: ['multi', 'grey'], sizes: ['16x24'] },
  { name: 'Water-Absorbent Doormat', sku: 'DM-004', category: 'doormats', price: 699, wholesalePrice: 449, stock: 60, description: 'Super absorbent quick-dry doormat. Absorbs up to 5x its weight in water. Perfect for monsoon season.', colors: ['black', 'grey', 'blue'], sizes: ['18x30', '24x36'] },
  { name: 'Patterned Boho Doormat', sku: 'DM-005', category: 'doormats', price: 549, wholesalePrice: 369, stock: 90, description: 'Decorative boho-patterned doormat with vibrant hand-block print. Adds a welcoming touch to any entrance.', colors: ['red', 'multi', 'beige'], sizes: ['16x24', '18x30'] },
  { name: 'Handwoven Wool Rug', sku: 'RG-001', category: 'rugs', price: 3999, wholesalePrice: 2499, stock: 25, description: 'Premium handwoven 100% wool rug from Rajasthan artisans. Rich texture, vibrant natural dyes, reversible.', colors: ['red', 'blue', 'multi'], sizes: ['3x5ft', '4x6ft', '5x7ft'] },
  { name: 'Silk Blend Luxury Rug', sku: 'RG-002', category: 'rugs', price: 4999, wholesalePrice: 2999, stock: 15, description: 'Luxurious silk-wool blend rug with 300 knots per sq inch. Lustrous finish, ideal for living rooms.', colors: ['beige', 'brown', 'grey'], sizes: ['4x6ft', '5x7ft', '6x9ft'] },
  { name: 'Flat Weave Cotton Rug', sku: 'RG-003', category: 'rugs', price: 2499, wholesalePrice: 1499, stock: 40, description: 'Durable flat weave cotton rug, easy to clean and lightweight. Great for kitchens and high traffic areas.', colors: ['ivory', 'grey', 'black'], sizes: ['3x5ft', '4x6ft'] },
  { name: 'Geometric Pattern Rug', sku: 'RG-004', category: 'rugs', price: 3499, wholesalePrice: 2199, stock: 20, description: 'Bold geometric pattern hand-tufted rug. Modern design meets traditional craftsmanship.', colors: ['black', 'grey', 'multi'], sizes: ['4x6ft', '5x7ft', '6x9ft'] },
  { name: 'Traditional Jute Dhurrie', sku: 'DH-001', category: 'dhurries', price: 1999, wholesalePrice: 1199, stock: 50, description: 'Traditional Indian jute dhurrie with classic striped pattern. Handwoven by skilled artisans in Panipat.', colors: ['multi', 'beige', 'brown'], sizes: ['3x5ft', '4x6ft', '5x7ft'] },
  { name: 'Woven Cotton Dhurrie', sku: 'DH-002', category: 'dhurries', price: 1499, wholesalePrice: 899, stock: 60, description: 'Lightweight reversible cotton dhurrie with diamond motif. Versatile for indoor and outdoor use.', colors: ['grey', 'beige', 'multi'], sizes: ['3x5ft', '4x6ft'] },
  { name: 'Chindi Recycled Dhurrie', sku: 'DH-003', category: 'dhurries', price: 1299, wholesalePrice: 799, stock: 70, description: 'Eco-conscious chindi dhurrie made from recycled cotton rags. Each piece is unique with vibrant mixed hues.', colors: ['multi', 'red', 'blue'], sizes: ['3x5ft', '4x6ft', '5x7ft'] },
  { name: 'Persian Design Carpet', sku: 'CP-001', category: 'carpets', price: 7999, wholesalePrice: 4999, stock: 10, description: 'Authentic Persian-inspired design carpet hand-knotted in wool. Dense pile, museum-quality craftsmanship.', colors: ['red', 'blue', 'multi'], sizes: ['5x7ft', '6x9ft'] },
  { name: 'Shag Pile Carpet', sku: 'CP-002', category: 'carpets', price: 5999, wholesalePrice: 3499, stock: 20, description: 'Plush high-pile shag carpet for ultimate comfort underfoot. Adds warmth and luxury to bedrooms.', colors: ['grey', 'brown', 'ivory'], sizes: ['4x6ft', '5x7ft', '6x9ft'] },
  { name: 'Floral Carved Carpet', sku: 'CP-003', category: 'carpets', price: 6499, wholesalePrice: 3999, stock: 15, description: 'Hand-carved floral carpet with sculpted pile that creates a 3D effect. Lush and visually striking.', colors: ['beige', 'multi', 'brown'], sizes: ['5x7ft', '6x9ft'] },
  { name: 'Non-Slip Kitchen Mat', sku: 'MT-001', category: 'mats', price: 399, wholesalePrice: 249, stock: 150, description: 'Non-slip cushioned kitchen mat for comfort while cooking. PVC backing prevents sliding on tile or hardwood.', colors: ['black', 'grey', 'brown'], sizes: ['16x24'] },
  { name: 'Microfiber Bathroom Mat', sku: 'MT-002', category: 'mats', price: 349, wholesalePrice: 199, stock: 180, description: 'Ultra-soft water-absorbent bathroom mat. Quick-dry microfiber, machine washable, stays fresh.', colors: ['black', 'grey', 'blue'], sizes: ['16x24', '18x30'] },
  { name: 'Anti-Fatigue Comfort Mat', sku: 'MT-003', category: 'mats', price: 799, wholesalePrice: 499, stock: 75, description: 'Ergonomic anti-fatigue mat with memory foam core. Reduces joint pain during long standing sessions.', colors: ['black', 'grey'], sizes: ['18x30', '24x36'] },
  { name: 'Yoga & Exercise Mat', sku: 'MT-004', category: 'mats', price: 899, wholesalePrice: 549, stock: 60, description: 'Thick non-slip yoga mat with alignment lines. 6mm cushioning, sweat-resistant surface, carry strap included.', colors: ['blue', 'green', 'multi'], sizes: ['24x68', '24x72'] },
  { name: 'Silk Embroidered Cushion Cover', sku: 'CC-001', category: 'cushion-covers', price: 499, wholesalePrice: 299, stock: 200, description: 'Luxury silk cushion cover with intricate embroidery. Zipper closure, hidden seams, vibrant colourfast threads.', colors: ['red', 'blue', 'gold', 'black'], sizes: ['16x16', '18x18', '20x20'] },
  { name: 'Cotton Block Print Cushion Cover', sku: 'CC-002', category: 'cushion-covers', price: 299, wholesalePrice: 169, stock: 300, description: 'Hand block-printed cotton cushion cover with Jaipur motifs. Soft, breathable, washes well.', colors: ['grey', 'beige', 'ivory', 'multi'], sizes: ['16x16', '18x18'] },
  { name: 'Velvet Cushion Cover', sku: 'CC-003', category: 'cushion-covers', price: 699, wholesalePrice: 399, stock: 150, description: 'Premium crushed velvet cushion cover. Rich texture adds instant luxury to sofas and beds.', colors: ['brown', 'grey', 'black', 'blue'], sizes: ['18x18', '20x20'] },
  { name: 'Set of 6 Jute Table Mats', sku: 'TM-001', category: 'table-mats', price: 699, wholesalePrice: 399, stock: 100, description: 'Elegant set of 6 natural jute placemats with cotton border. Heat-resistant, easy to wipe clean.', colors: ['grey', 'beige', 'brown'], sizes: ['12x18'] },
  { name: 'Woven Fabric Placemats Set', sku: 'TM-002', category: 'table-mats', price: 499, wholesalePrice: 299, stock: 150, description: 'Set of 6 woven fabric placemats in pastel palette. Machine washable, colour-fast, reversible.', colors: ['multi', 'beige', 'grey'], sizes: ['12x18'] },
  { name: 'Upholstered Ottoman Stool', sku: 'ST-001', category: 'stools', price: 1499, wholesalePrice: 899, stock: 40, description: 'Padded ottoman stool with velvet upholstery and solid wooden legs. Multi-purpose seating, footrest, or side table.', colors: ['grey', 'brown', 'black'], sizes: ['square', 'round'] },
  { name: 'Solid Wood Stool', sku: 'ST-002', category: 'stools', price: 999, wholesalePrice: 599, stock: 60, description: 'Handcrafted solid sheesham wood stool. Natural grain finish, strong mortise-tenon joints, lasts decades.', colors: ['brown'], sizes: ['square', 'round'] },
  { name: 'Professional Chef Anti-Fatigue Mat', sku: 'CM-001', category: 'chef-mats', price: 1299, wholesalePrice: 799, stock: 50, description: 'Commercial-grade anti-fatigue mat for professional kitchens. Bevelled edges, non-slip, grease-resistant.', colors: ['black', 'grey'], sizes: ['18x30', '24x36'] },
  { name: 'Home Kitchen Chef Mat', sku: 'CM-002', category: 'chef-mats', price: 899, wholesalePrice: 549, stock: 80, description: 'Cushioned home chef mat with decorative print. Memory foam core, waterproof top, anti-microbial coating.', colors: ['black', 'grey', 'brown'], sizes: ['18x30', '24x36'] },
]

const PRODUCT_IMAGES = [
  '/images/products/p-sq-1.jpg', '/images/products/p-sq-2.jpg', '/images/products/p-sq-3.jpg',
  '/images/products/p-sq-4.jpg', '/images/products/p-sq-5.jpg', '/images/products/p-sq-8.jpg',
  '/images/products/p-sq-10.jpg', '/images/products/p-sq-12.jpg', '/images/products/p-sq-13.jpg',
  '/images/products/p-sq-14.jpg', '/images/products/p-sq-15.jpg', '/images/products/p-sq-17.jpg',
  '/images/products/p-sq-18.jpg', '/images/products/p-sq-19.jpg', '/images/products/p-sq-21.jpg',
  '/images/products/p-sq-22.jpg', '/images/products/p-sq-23.jpg', '/images/products/p-sq-24.jpg',
  '/images/products/p-sq-25.jpg', '/images/products/p-sq-26.jpg', '/images/products/p-sq-72.jpg',
  '/images/products/p-sq-73.jpg', '/images/products/p-sq-77.jpg', '/images/products/p-blkgre.jpg',
  '/images/products/p-brown.jpg',
]

const COLORS = [
  { id: 'red', label: 'Red', hex: '#C0392B' },
  { id: 'blue', label: 'Blue', hex: '#2980B9' },
  { id: 'green', label: 'Green', hex: '#27AE60' },
  { id: 'black', label: 'Black', hex: '#2C2C2C' },
  { id: 'grey', label: 'Grey', hex: '#7F8C8D' },
  { id: 'brown', label: 'Brown', hex: '#7B4F2E' },
  { id: 'beige', label: 'Beige', hex: '#F5E6CA' },
  { id: 'ivory', label: 'Ivory', hex: '#FAF7F0' },
  { id: 'multi', label: 'Multicolor', hex: '#E8832A' },
  { id: 'gold', label: 'Gold', hex: '#C9A84C' },
]

const sizeSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('secret') !== SEED_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // step param: 'init' | 'products-0' | 'products-1' | ... (5 products per batch)
  const step = searchParams.get('step') ?? 'init'
  const log: string[] = []

  try {
    if (step === 'init') {
      // Admin
      const adminPassword = await hash('admin123', 12)
      await prisma.user.upsert({
        where: { primaryEmail: 'admin@naturalife.in' },
        update: {},
        create: { primaryEmail: 'admin@naturalife.in', primaryPhone: '+919999900000', name: 'Admin User', password: adminPassword, role: 'ADMIN', preferredLanguage: 'EN' },
      })
      log.push('✓ Admin user')

      // Categories
      const categories = ['doormats', 'rugs', 'dhurries', 'carpets', 'mats', 'cushion-covers', 'table-mats', 'stools', 'chef-mats']
      for (const cat of categories) {
        await prisma.category.upsert({
          where: { slug: cat },
          update: {},
          create: {
            name: cat.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            slug: cat,
            description: `Premium ${cat} collection — handcrafted by Indian artisans`,
            seoTitle: `Buy ${cat} Online India | Naturalife`,
            seoDesc: `Shop our handcrafted ${cat} collection. Free shipping above ₹1000.`,
          },
        })
      }
      log.push(`✓ ${categories.length} categories`)

      // Attributes
      const colorAttr = await prisma.attribute.upsert({ where: { id: 'COLOR' }, update: {}, create: { id: 'COLOR', name: 'COLOR', displayName: 'Color' } })
      for (let i = 0; i < COLORS.length; i++) {
        await prisma.attributeValue.upsert({
          where: { id: `color-${COLORS[i].id}` },
          update: { hexColor: COLORS[i].hex, label: COLORS[i].label },
          create: { id: `color-${COLORS[i].id}`, attributeId: colorAttr.id, value: COLORS[i].id, label: COLORS[i].label, hexColor: COLORS[i].hex, sortOrder: i },
        })
      }

      const allSizes = Array.from(new Set(PRODUCTS.flatMap((p) => p.sizes)))
      const sizeAttr = await prisma.attribute.upsert({ where: { id: 'SIZE' }, update: {}, create: { id: 'SIZE', name: 'SIZE', displayName: 'Size' } })
      for (let i = 0; i < allSizes.length; i++) {
        await prisma.attributeValue.upsert({
          where: { id: `size-${sizeSlug(allSizes[i])}` },
          update: { label: allSizes[i].toUpperCase() },
          create: { id: `size-${sizeSlug(allSizes[i])}`, attributeId: sizeAttr.id, value: sizeSlug(allSizes[i]), label: allSizes[i].toUpperCase(), sortOrder: i },
        })
      }
      log.push(`✓ ${COLORS.length} colors, ${allSizes.length} sizes`)

      const batchCount = Math.ceil(PRODUCTS.length / 5)
      return NextResponse.json({ success: true, log, next: 'products-0', totalBatches: batchCount })
    }

    if (step.startsWith('products-')) {
      const batchIdx = parseInt(step.split('-')[1])
      const batchSize = 5
      const start = batchIdx * batchSize
      const batch = PRODUCTS.slice(start, start + batchSize)

      if (batch.length === 0) {
        return NextResponse.json({ success: true, log: ['✅ All products seeded!'], done: true })
      }

      const colorAttr = await prisma.attribute.findUnique({ where: { id: 'COLOR' } })
      const sizeAttr = await prisma.attribute.findUnique({ where: { id: 'SIZE' } })
      if (!colorAttr || !sizeAttr) throw new Error('Attributes not found — run init step first')

      for (let i = 0; i < batch.length; i++) {
        const productData = batch[i]
        const pIdx = start + i
        const catRecord = await prisma.category.findUnique({ where: { slug: productData.category } })
        if (!catRecord) throw new Error(`Category not found: ${productData.category}`)

        const product = await prisma.product.upsert({
          where: { sku: productData.sku },
          update: { name: productData.name, description: productData.description, status: 'ACTIVE', isFeatured: pIdx % 2 === 0, isOnSale: pIdx % 3 === 0 },
          create: {
            name: productData.name, slug: productData.sku.toLowerCase(), sku: productData.sku,
            categoryId: catRecord.id, description: productData.description, shortDesc: productData.description.substring(0, 80),
            status: 'ACTIVE', taxRate: 18, hsnCode: '6301', isFeatured: pIdx % 2 === 0, isOnSale: pIdx % 3 === 0,
          },
        })

        for (const color of productData.colors) {
          await prisma.productAttributeValue.upsert({
            where: { productId_attributeId_valueId: { productId: product.id, attributeId: colorAttr.id, valueId: `color-${color}` } },
            update: {}, create: { productId: product.id, attributeId: colorAttr.id, valueId: `color-${color}` },
          })
        }
        for (const size of productData.sizes) {
          await prisma.productAttributeValue.upsert({
            where: { productId_attributeId_valueId: { productId: product.id, attributeId: sizeAttr.id, valueId: `size-${sizeSlug(size)}` } },
            update: {}, create: { productId: product.id, attributeId: sizeAttr.id, valueId: `size-${sizeSlug(size)}` },
          })
        }

        await prisma.productImage.deleteMany({ where: { productId: product.id } })
        for (let cIdx = 0; cIdx < productData.colors.length; cIdx++) {
          const color = productData.colors[cIdx]
          const url = PRODUCT_IMAGES[(pIdx * 3 + cIdx) % PRODUCT_IMAGES.length]
          await prisma.productImage.create({
            data: { productId: product.id, url, altText: `${productData.name} - ${color}`, isPrimary: cIdx === 0, colorHex: COLORS.find((c) => c.id === color)?.hex ?? null, attributeValue: `color-${color}`, sortOrder: cIdx },
          })
        }

        for (const color of productData.colors) {
          let sIdx = 0
          for (const size of productData.sizes) {
            const variantSku = `${productData.sku}-${color}-${size}`.toUpperCase()
            const mult = 1 + sIdx * 0.7
            const price = Math.round(productData.price * mult)
            const wholesale = Math.round(productData.wholesalePrice * mult)
            sIdx++

            const variant = await prisma.productVariant.upsert({
              where: { sku: variantSku },
              update: { price, wholesalePrice: wholesale, minWholesaleQty: 5, attributeValues: [{ attributeId: colorAttr.id, valueId: `color-${color}` }, { attributeId: sizeAttr.id, valueId: `size-${sizeSlug(size)}` }] },
              create: {
                productId: product.id, sku: variantSku, price, wholesalePrice: wholesale,
                minWholesaleQty: 5, stock: productData.stock, weight: 0.5,
                attributeValues: [{ attributeId: colorAttr.id, valueId: `color-${color}` }, { attributeId: sizeAttr.id, valueId: `size-${sizeSlug(size)}` }],
              },
            })
            await prisma.bulkPricingRule.upsert({
              where: { id: `bulk-${variantSku}-20` },
              update: { pricePerUnit: Math.round(wholesale * 0.85) },
              create: { id: `bulk-${variantSku}-20`, productVariantId: variant.id, minQty: 20, maxQty: 50, pricePerUnit: Math.round(wholesale * 0.85), label: 'Pack of 20–50' },
            })
            await prisma.bulkPricingRule.upsert({
              where: { id: `bulk-${variantSku}-51` },
              update: { pricePerUnit: Math.round(wholesale * 0.70) },
              create: { id: `bulk-${variantSku}-51`, productVariantId: variant.id, minQty: 51, maxQty: null, pricePerUnit: Math.round(wholesale * 0.70), label: 'Pack of 51+' },
            })
          }
        }
        log.push(`✓ ${productData.name}`)
      }

      const nextBatch = batchIdx + 1
      const remaining = PRODUCTS.slice(nextBatch * batchSize)
      return NextResponse.json({
        success: true, log,
        next: remaining.length > 0 ? `products-${nextBatch}` : null,
        done: remaining.length === 0,
      })
    }

    return NextResponse.json({ error: 'Unknown step' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, log }, { status: 500 })
  }
}
