import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { hash } from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' })
const prisma = new PrismaClient({ adapter } as any)

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
  image: string
}

const PRODUCTS: ProductData[] = [
  // Doormats
  { name: 'Classic Microfiber Doormat', sku: 'DM-001', category: 'doormats', price: 599, wholesalePrice: 399, stock: 100, description: 'Premium microfiber doormat with anti-skid backing', colors: ['red', 'blue', 'black', 'brown'], sizes: ['16x24', '18x30'], image: '/images/products/doormats/DM-001.jpg' },
  { name: 'Jute Fiber Doormat', sku: 'DM-002', category: 'doormats', price: 499, wholesalePrice: 349, stock: 80, description: 'Eco-friendly jute fiber doormat', colors: ['brown', 'grey', 'ivory'], sizes: ['16x24', '18x30'], image: '/images/products/doormats/DM-002.jpg' },
  { name: 'Reversible Doormat', sku: 'DM-003', category: 'doormats', price: 449, wholesalePrice: 299, stock: 120, description: 'Reversible design doormat with dual patterns', colors: ['multi', 'grey'], sizes: ['16x24'], image: '/images/products/doormats/DM-003.jpg' },
  { name: 'Water-Absorbent Doormat', sku: 'DM-004', category: 'doormats', price: 699, wholesalePrice: 449, stock: 60, description: 'Super absorbent quick-dry doormat', colors: ['black', 'grey', 'blue'], sizes: ['18x30', '24x36'], image: '/images/products/doormats/DM-004.jpg' },
  { name: 'Patterned Doormat', sku: 'DM-005', category: 'doormats', price: 549, wholesalePrice: 369, stock: 90, description: 'Decorative patterned doormat', colors: ['red', 'multi', 'beige'], sizes: ['16x24', '18x30'], image: '/images/products/doormats/DM-005.jpg' },

  // Rugs
  { name: 'Handwoven Wool Rug', sku: 'RG-001', category: 'rugs', price: 3999, wholesalePrice: 2499, stock: 25, description: 'Premium handwoven wool rug', colors: ['red', 'blue', 'multi'], sizes: ['3x5ft', '4x6ft', '5x7ft'], image: '/images/products/rugs/RG-001.jpg' },
  { name: 'Silk Blend Rug', sku: 'RG-002', category: 'rugs', price: 4999, wholesalePrice: 2999, stock: 15, description: 'Luxurious silk blend rug', colors: ['beige', 'brown', 'grey'], sizes: ['4x6ft', '5x7ft', '6x9ft'], image: '/images/products/rugs/RG-002.jpg' },
  { name: 'Cotton Rug', sku: 'RG-003', category: 'rugs', price: 2499, wholesalePrice: 1499, stock: 40, description: 'Durable cotton rug', colors: ['ivory', 'grey', 'black'], sizes: ['3x5ft', '4x6ft'], image: '/images/products/rugs/RG-003.jpg' },

  // Dhurries
  { name: 'Traditional Jute Dhurrie', sku: 'DH-001', category: 'dhurries', price: 1999, wholesalePrice: 1199, stock: 50, description: 'Traditional Indian jute dhurrie', colors: ['multi', 'beige', 'brown'], sizes: ['3x5ft', '4x6ft', '5x7ft'], image: '/images/products/dhurries/DH-001.jpg' },
  { name: 'Cotton Dhurrie', sku: 'DH-002', category: 'dhurries', price: 1499, wholesalePrice: 899, stock: 60, description: 'Lightweight cotton dhurrie', colors: ['grey', 'beige', 'multi'], sizes: ['3x5ft', '4x6ft'], image: '/images/products/dhurries/DH-002.jpg' },

  // Carpets
  { name: 'Persian Carpet', sku: 'CP-001', category: 'carpets', price: 7999, wholesalePrice: 4999, stock: 10, description: 'Authentic Persian design carpet', colors: ['red', 'blue', 'multi'], sizes: ['5x7ft', '6x9ft'], image: '/images/products/carpets/CP-001.jpg' },
  { name: 'Shag Carpet', sku: 'CP-002', category: 'carpets', price: 5999, wholesalePrice: 3499, stock: 20, description: 'Plush shag carpet', colors: ['grey', 'brown', 'ivory'], sizes: ['4x6ft', '5x7ft', '6x9ft'], image: '/images/products/carpets/CP-002.jpg' },

  // Mats
  { name: 'Kitchen Mat', sku: 'MT-001', category: 'mats', price: 399, wholesalePrice: 249, stock: 150, description: 'Non-slip kitchen mat', colors: ['black', 'grey', 'brown'], sizes: ['16x24'], image: '/images/products/mats/MT-001.jpg' },
  { name: 'Bathroom Mat', sku: 'MT-002', category: 'mats', price: 349, wholesalePrice: 199, stock: 180, description: 'Water-absorbent bathroom mat', colors: ['black', 'grey', 'blue'], sizes: ['16x24', '18x30'], image: '/images/products/mats/MT-002.jpg' },
  { name: 'Anti-Fatigue Mat', sku: 'MT-003', category: 'mats', price: 799, wholesalePrice: 499, stock: 75, description: 'Ergonomic anti-fatigue mat', colors: ['black', 'grey'], sizes: ['18x30', '24x36'], image: '/images/products/mats/MT-003.jpg' },

  // Cushion Covers
  { name: 'Silk Cushion Cover', sku: 'CC-001', category: 'cushion-covers', price: 499, wholesalePrice: 299, stock: 200, description: 'Luxury silk cushion cover', colors: ['red', 'blue', 'gold', 'black'], sizes: ['16x16', '18x18', '20x20'], image: '/images/products/cushion-covers/CC-001.jpg' },
  { name: 'Cotton Cushion Cover', sku: 'CC-002', category: 'cushion-covers', price: 299, wholesalePrice: 169, stock: 300, description: 'Soft cotton cushion cover', colors: ['grey', 'beige', 'ivory', 'multi'], sizes: ['16x16', '18x18'], image: '/images/products/cushion-covers/CC-002.jpg' },
  { name: 'Velvet Cushion Cover', sku: 'CC-003', category: 'cushion-covers', price: 699, wholesalePrice: 399, stock: 150, description: 'Premium velvet cushion cover', colors: ['brown', 'grey', 'black'], sizes: ['18x18', '20x20'], image: '/images/products/cushion-covers/CC-003.jpg' },

  // Table Mats
  { name: 'Set of 4 Table Mats', sku: 'TM-001', category: 'table-mats', price: 599, wholesalePrice: 359, stock: 100, description: 'Elegant set of 4 table mats', colors: ['grey', 'beige', 'black'], sizes: ['12x18'], image: '/images/products/table-mats/TM-001.jpg' },
  { name: 'Fabric Placemats', sku: 'TM-002', category: 'table-mats', price: 499, wholesalePrice: 299, stock: 150, description: 'Fabric placemats set', colors: ['multi', 'beige', 'grey'], sizes: ['12x18'], image: '/images/products/table-mats/TM-002.jpg' },

  // Stools
  { name: 'Ottoman Stool', sku: 'ST-001', category: 'stools', price: 1499, wholesalePrice: 899, stock: 40, description: 'Padded ottoman stool', colors: ['grey', 'brown', 'black'], sizes: ['square', 'round'], image: '/images/products/stools/ST-001.jpg' },
  { name: 'Wooden Stool', sku: 'ST-002', category: 'stools', price: 999, wholesalePrice: 599, stock: 60, description: 'Solid wooden stool', colors: ['brown'], sizes: ['square', 'round'], image: '/images/products/stools/ST-002.jpg' },

  // Chef Mats
  { name: 'Chef Anti-Fatigue Mat', sku: 'CM-001', category: 'chef-mats', price: 1299, wholesalePrice: 799, stock: 50, description: 'Professional chef kitchen mat', colors: ['black', 'grey'], sizes: ['18x30', '24x36'], image: '/images/products/chef-mats/CM-001.jpg' },
]

async function main() {
  console.log('🌱 Seeding comprehensive database...')

  // Admin
  const adminPassword = await hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { primaryEmail: 'admin@naturalife.in' },
    update: {},
    create: {
      primaryEmail: 'admin@naturalife.in',
      primaryPhone: '+919999900000',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
      preferredLanguage: 'EN',
    },
  })
  console.log('✓ Admin user: admin@naturalife.in / admin123')

  // Categories
  const categoryMap: Record<string, string> = {}
  const categories = ['doormats', 'rugs', 'dhurries', 'carpets', 'mats', 'cushion-covers', 'table-mats', 'stools', 'chef-mats']

  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { slug: cat },
      update: {},
      create: {
        name: cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        slug: cat,
        description: `Premium ${cat} collection`,
        seoTitle: `${cat} - Naturalife`,
        seoDesc: `Browse our collection of ${cat}`,
      },
    })
    categoryMap[cat] = created.id
  }
  console.log(`✓ ${categories.length} categories created`)

  // Attributes & values
  const colors = [
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

  const colorAttr = await prisma.attribute.upsert({
    where: { id: 'COLOR' },
    update: {},
    create: { id: 'COLOR', name: 'COLOR', displayName: 'Color' },
  })

  for (let i = 0; i < colors.length; i++) {
    await prisma.attributeValue.upsert({
      where: { id: `color-${colors[i].id}` },
      update: {},
      create: {
        id: `color-${colors[i].id}`,
        attributeId: colorAttr.id,
        value: colors[i].id,
        label: colors[i].label,
        hexColor: colors[i].hex,
        sortOrder: i,
      },
    })
  }
  console.log(`✓ ${colors.length} color attributes created`)

  // Create products
  for (const productData of PRODUCTS) {
    const product = await prisma.product.upsert({
      where: { sku: productData.sku },
      update: {},
      create: {
        name: productData.name,
        slug: productData.sku.toLowerCase(),
        sku: productData.sku,
        categoryId: categoryMap[productData.category],
        description: productData.description,
        shortDesc: productData.description.substring(0, 50),
        status: 'ACTIVE',
        taxRate: 18,
        hsnCode: '6301',
        isFeatured: Math.random() > 0.5,
        isOnSale: Math.random() > 0.7,
      },
    })

    // Add product image
    await prisma.productImage.upsert({
      where: { id: `img-${productData.sku}` },
      update: {},
      create: {
        id: `img-${productData.sku}`,
        productId: product.id,
        url: productData.image,
        altText: productData.name,
        isPrimary: true,
        sortOrder: 0,
      },
    })

    // Add variants for each color/size combination
    for (const color of productData.colors) {
      for (const size of productData.sizes) {
        const variantSku = `${productData.sku}-${color}-${size}`.toUpperCase()

        const variant = await prisma.productVariant.upsert({
          where: { sku: variantSku },
          update: {},
          create: {
            productId: product.id,
            sku: variantSku,
            price: productData.price,
            wholesalePrice: productData.wholesalePrice,
            minWholesaleQty: 5,
            stock: productData.stock,
            weight: 0.5,
          },
        })

        // Create bulk pricing rules for wholesale
        await prisma.bulkPricingRule.upsert({
          where: { id: `bulk-${variantSku}-20` },
          update: {},
          create: {
            id: `bulk-${variantSku}-20`,
            productVariantId: variant.id,
            minQty: 20,
            maxQty: 50,
            pricePerUnit: productData.wholesalePrice * 0.85,
            label: 'Pack of 20-50',
          },
        })

        await prisma.bulkPricingRule.upsert({
          where: { id: `bulk-${variantSku}-51` },
          update: {},
          create: {
            id: `bulk-${variantSku}-51`,
            productVariantId: variant.id,
            minQty: 51,
            maxQty: null,
            pricePerUnit: productData.wholesalePrice * 0.70,
            label: 'Pack of 51+',
          },
        })
      }
    }
  }
  console.log(`✓ ${PRODUCTS.length} products with variants created`)

  console.log('\n✅ Database seeded successfully!')
  console.log('👤 Admin login: admin@naturalife.in / admin123')
  console.log('🛍️ Products: ' + PRODUCTS.length + ' items across all categories')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
