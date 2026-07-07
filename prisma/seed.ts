import { PrismaClient, Role, Language, Material, ProductStatus, NotificationEvent, NotificationChannel } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Admin user
  const adminPassword = await hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { primaryEmail: 'admin@naturalife.in' },
    update: {},
    create: {
      primaryEmail: 'admin@naturalife.in',
      primaryPhone: '+919999900000',
      name: 'Admin',
      password: adminPassword,
      role: Role.ADMIN,
      preferredLanguage: Language.EN,
    },
  })
  console.log('✓ Admin user created')

  // Categories
  const categoryData = [
    { name: 'Doormats', slug: 'doormats', description: 'Premium quality doormats for your entrance', sortOrder: 1 },
    { name: 'Rugs', slug: 'rugs', description: 'Handcrafted rugs for every room', sortOrder: 2 },
    { name: 'Dhurries', slug: 'dhurries', description: 'Traditional Indian dhurrie rugs', sortOrder: 3 },
    { name: 'Carpets', slug: 'carpets', description: 'Luxurious carpets for your home', sortOrder: 4 },
    { name: 'Mats', slug: 'mats', description: 'Utility mats for kitchen, bath and more', sortOrder: 5 },
    { name: 'Cushion Covers', slug: 'cushion-covers', description: 'Decorative cushion covers', sortOrder: 6 },
    { name: 'Table Mats', slug: 'table-mats', description: 'Elegant table mats and placemats', sortOrder: 7 },
    { name: 'Stools', slug: 'stools', description: 'Handcrafted stools and ottomans', sortOrder: 8 },
    { name: 'Chef Mats', slug: 'chef-mats', description: 'Anti-fatigue kitchen chef mats', sortOrder: 9 },
    { name: 'Placemats', slug: 'placemats', description: 'Stylish placemats for dining', sortOrder: 10 },
  ]

  const categories: Record<string, string> = {}
  for (const cat of categoryData) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { ...cat, seoTitle: `${cat.name} - Naturalife`, seoDesc: cat.description },
    })
    categories[cat.slug] = c.id
  }
  console.log('✓ Categories created')

  // Attributes
  const attributeData = [
    { name: 'COLOR' as const, displayName: 'Color' },
    { name: 'SIZE' as const, displayName: 'Size' },
    { name: 'SHAPE' as const, displayName: 'Shape' },
    { name: 'FABRIC' as const, displayName: 'Fabric' },
    { name: 'MATERIAL' as const, displayName: 'Material' },
    { name: 'HEIGHT' as const, displayName: 'Height' },
  ]

  const attrs: Record<string, string> = {}
  for (const attr of attributeData) {
    const a = await prisma.attribute.upsert({
      where: { id: attr.name },
      update: {},
      create: { id: attr.name, name: attr.name, displayName: attr.displayName },
    })
    attrs[attr.name] = a.id
  }

  // Attribute values
  const colorValues = [
    { value: 'red', label: 'Red', hexColor: '#C0392B' },
    { value: 'blue', label: 'Blue', hexColor: '#2980B9' },
    { value: 'green', label: 'Green', hexColor: '#27AE60' },
    { value: 'beige', label: 'Beige', hexColor: '#F5E6CA' },
    { value: 'brown', label: 'Brown', hexColor: '#7B4F2E' },
    { value: 'multi', label: 'Multicolor', hexColor: '#E8832A' },
    { value: 'grey', label: 'Grey', hexColor: '#7F8C8D' },
    { value: 'black', label: 'Black', hexColor: '#2C2C2C' },
    { value: 'ivory', label: 'Ivory', hexColor: '#FAF7F0' },
    { value: 'yellow', label: 'Yellow', hexColor: '#F1C40F' },
  ]

  for (let i = 0; i < colorValues.length; i++) {
    await prisma.attributeValue.upsert({
      where: { id: `color-${colorValues[i].value}` },
      update: {},
      create: { id: `color-${colorValues[i].value}`, attributeId: attrs['COLOR'], ...colorValues[i], sortOrder: i },
    })
  }

  const sizeValues = [
    { value: '16x24', label: '16"×24"' },
    { value: '18x30', label: '18"×30"' },
    { value: '24x36', label: '24"×36"' },
    { value: '2x3ft', label: "2'×3'" },
    { value: '3x5ft', label: "3'×5'" },
    { value: '4x6ft', label: "4'×6'" },
    { value: '5x7ft', label: "5'×7'" },
    { value: '6x9ft', label: "6'×9'" },
    { value: '8x10ft', label: "8'×10'" },
  ]

  for (let i = 0; i < sizeValues.length; i++) {
    await prisma.attributeValue.upsert({
      where: { id: `size-${sizeValues[i].value}` },
      update: {},
      create: { id: `size-${sizeValues[i].value}`, attributeId: attrs['SIZE'], ...sizeValues[i], sortOrder: i },
    })
  }

  const shapeValues = [
    { value: 'rectangle', label: 'Rectangle' },
    { value: 'square', label: 'Square' },
    { value: 'round', label: 'Round' },
    { value: 'oval', label: 'Oval' },
    { value: 'runner', label: 'Runner' },
  ]

  for (let i = 0; i < shapeValues.length; i++) {
    await prisma.attributeValue.upsert({
      where: { id: `shape-${shapeValues[i].value}` },
      update: {},
      create: { id: `shape-${shapeValues[i].value}`, attributeId: attrs['SHAPE'], ...shapeValues[i], sortOrder: i },
    })
  }

  const fabricValues = [
    { value: 'cotton', label: 'Cotton' },
    { value: 'jute', label: 'Jute' },
    { value: 'wool', label: 'Wool' },
    { value: 'polyester', label: 'Polyester' },
    { value: 'rubber', label: 'Rubber' },
    { value: 'coir', label: 'Coir' },
    { value: 'chenille', label: 'Chenille' },
  ]

  for (let i = 0; i < fabricValues.length; i++) {
    await prisma.attributeValue.upsert({
      where: { id: `fabric-${fabricValues[i].value}` },
      update: {},
      create: { id: `fabric-${fabricValues[i].value}`, attributeId: attrs['FABRIC'], ...fabricValues[i], sortOrder: i },
    })
  }

  const materialValues = [
    { value: 'handwoven', label: 'Hand-woven' },
    { value: 'machine', label: 'Machine Made' },
    { value: 'handtufted', label: 'Hand-tufted' },
    { value: 'handknotted', label: 'Hand-knotted' },
    { value: 'flatweave', label: 'Flat Weave' },
  ]

  for (let i = 0; i < materialValues.length; i++) {
    await prisma.attributeValue.upsert({
      where: { id: `material-${materialValues[i].value}` },
      update: {},
      create: { id: `material-${materialValues[i].value}`, attributeId: attrs['MATERIAL'], ...materialValues[i], sortOrder: i },
    })
  }

  console.log('✓ Attributes and values created')

  // Product images from public/images/products
  const productImages = [
    'p-sq-1.jpg','p-sq-2.jpg','p-sq-3.jpg','p-sq-4.jpg','p-sq-5.jpg',
    'p-sq-8.jpg','p-sq-10.jpg','p-sq-12.jpg','p-sq-13.jpg','p-sq-14.jpg',
    'p-sq-15.jpg','p-sq-17.jpg','p-sq-18.jpg','p-sq-19.jpg','p-sq-21.jpg',
    'p-sq-22.jpg','p-sq-23.jpg','p-sq-24.jpg','p-sq-25.jpg','p-sq-26.jpg',
    'p-sq-72.jpg','p-sq-73.jpg','p-sq-77.jpg','p-blkgre.jpg','p-brown.jpg',
  ]

  // Sample Products — 25 products across all categories
  const sampleProducts = [
    // Doormats (3)
    { name: 'Coir Rope Doormat', slug: 'coir-rope-doormat', sku: 'DM-001', shortDesc: 'Eco-friendly handwoven coir rope doormat with natural finish', description: 'Made from 100% natural coir fiber, this handwoven doormat is perfect for your entrance. Durable, eco-friendly, and naturally anti-bacterial.', categoryId: categories['doormats'], isFeatured: true, isOnSale: false, status: ProductStatus.ACTIVE, material: Material.JUTE, taxRate: 12, hsnCode: '5705', seoTitle: 'Coir Rope Doormat | Naturalife', seoDesc: 'Premium handwoven coir rope doormat.' },
    { name: 'Printed Welcome Doormat', slug: 'printed-welcome-doormat', sku: 'DM-002', shortDesc: 'Colourful printed coir doormat with welcome message', description: 'Brighten your entryway with this vibrant printed coir doormat. Features a cheerful "Welcome" design and sturdy PVC backing for durability.', categoryId: categories['doormats'], isFeatured: false, isOnSale: true, status: ProductStatus.ACTIVE, material: Material.JUTE, taxRate: 12, hsnCode: '5705', seoTitle: 'Printed Welcome Doormat | Naturalife', seoDesc: 'Colourful printed coir doormat with PVC backing.' },
    { name: 'Rubber Backed Outdoor Mat', slug: 'rubber-backed-outdoor-mat', sku: 'DM-003', shortDesc: 'Heavy-duty rubber-backed outdoor doormat', description: 'Weather-resistant outdoor doormat with heavy-duty rubber backing. Excellent at trapping mud and dirt. Easy to clean with a garden hose.', categoryId: categories['doormats'], isFeatured: false, isOnSale: false, status: ProductStatus.ACTIVE, material: Material.RUBBER, taxRate: 18, hsnCode: '4016', seoTitle: 'Rubber Backed Outdoor Mat | Naturalife', seoDesc: 'Heavy-duty weather-resistant outdoor doormat.' },

    // Rugs (3)
    { name: 'Handknotted Persian Rug', slug: 'handknotted-persian-rug', sku: 'RG-002', shortDesc: 'Intricately handknotted wool rug with Persian motifs', description: 'A timeless masterpiece handknotted by skilled artisans. Features classic Persian motifs in rich jewel tones. Each rug takes months to complete.', categoryId: categories['rugs'], isFeatured: true, isOnSale: false, status: ProductStatus.ACTIVE, material: Material.WOOL, taxRate: 12, hsnCode: '5701', seoTitle: 'Handknotted Persian Rug | Naturalife', seoDesc: 'Premium handknotted Persian wool rug.' },
    { name: 'Modern Geometric Area Rug', slug: 'modern-geometric-area-rug', sku: 'RG-003', shortDesc: 'Contemporary geometric pattern area rug', description: 'Add a modern touch to your space with this contemporary area rug. Features bold geometric patterns in neutral tones that complement any decor.', categoryId: categories['rugs'], isFeatured: true, isOnSale: true, status: ProductStatus.ACTIVE, material: Material.POLYESTER, taxRate: 12, hsnCode: '5703', seoTitle: 'Modern Geometric Area Rug | Naturalife', seoDesc: 'Contemporary geometric pattern area rug.' },
    { name: 'Vintage Overdyed Rug', slug: 'vintage-overdyed-rug', sku: 'RG-004', shortDesc: 'Vintage-style overdyed rug with faded charm', description: 'This overdyed rug combines vintage charm with modern sensibility. The faded, distressed look adds character and warmth to living rooms and bedrooms.', categoryId: categories['rugs'], isFeatured: false, isOnSale: false, status: ProductStatus.ACTIVE, material: Material.COTTON, taxRate: 12, hsnCode: '5702', seoTitle: 'Vintage Overdyed Rug | Naturalife', seoDesc: 'Vintage-style overdyed rug.' },

    // Dhurries (3)
    { name: 'Jaipur Block Print Dhurrie', slug: 'jaipur-block-print-dhurrie', sku: 'RG-001', shortDesc: 'Traditional Jaipur hand block printed cotton dhurrie', description: 'Handcrafted by skilled artisans in Jaipur with authentic block print patterns. Lightweight, washable, and full of traditional Indian art.', categoryId: categories['dhurries'], isFeatured: true, isOnSale: true, status: ProductStatus.ACTIVE, material: Material.COTTON, taxRate: 12, hsnCode: '5702', seoTitle: 'Jaipur Block Print Dhurrie | Naturalife', seoDesc: 'Authentic Jaipur hand block printed cotton dhurrie.' },
    { name: 'Striped Cotton Dhurrie', slug: 'striped-cotton-dhurrie', sku: 'DH-002', shortDesc: 'Handwoven striped cotton dhurrie in earthy tones', description: 'A classic striped dhurrie handwoven from pure cotton. Earthy tones of terracotta, indigo and cream bring warmth to any room. Reversible design.', categoryId: categories['dhurries'], isFeatured: false, isOnSale: false, status: ProductStatus.ACTIVE, material: Material.COTTON, taxRate: 12, hsnCode: '5702', seoTitle: 'Striped Cotton Dhurrie | Naturalife', seoDesc: 'Handwoven striped cotton dhurrie.' },
    { name: 'Rajasthani Mirror Work Dhurrie', slug: 'rajasthani-mirror-dhurrie', sku: 'DH-003', shortDesc: 'Vibrant Rajasthani dhurrie with traditional mirror work', description: 'This stunning dhurrie showcases the famous mirror work (shisha) embroidery of Rajasthan. Vibrant colours and sparkling mirrors create a show-stopping floor piece.', categoryId: categories['dhurries'], isFeatured: true, isOnSale: false, status: ProductStatus.ACTIVE, material: Material.COTTON, taxRate: 12, hsnCode: '5702', seoTitle: 'Rajasthani Mirror Work Dhurrie | Naturalife', seoDesc: 'Vibrant Rajasthani mirror work dhurrie.' },

    // Carpets (3)
    { name: 'Handwoven Wool Carpet', slug: 'handwoven-wool-carpet', sku: 'CP-001', shortDesc: 'Luxurious handwoven pure wool carpet with geometric patterns', description: 'Hand-woven by master craftsmen using pure wool. Timeless geometric patterns inspired by traditional Indian art.', categoryId: categories['carpets'], isFeatured: true, isOnSale: false, status: ProductStatus.ACTIVE, material: Material.WOOL, taxRate: 12, hsnCode: '5701', seoTitle: 'Handwoven Wool Carpet | Naturalife', seoDesc: 'Premium handwoven pure wool carpet.' },
    { name: 'Silk Touch Luxury Carpet', slug: 'silk-touch-luxury-carpet', sku: 'CP-002', shortDesc: 'Ultra-soft silk-blend luxury carpet for living rooms', description: 'Experience the ultimate in luxury with this silk-blend carpet. Incredibly soft underfoot with a subtle sheen that adds elegance to any room.', categoryId: categories['carpets'], isFeatured: true, isOnSale: true, status: ProductStatus.ACTIVE, material: Material.WOOL, taxRate: 12, hsnCode: '5701', seoTitle: 'Silk Touch Luxury Carpet | Naturalife', seoDesc: 'Ultra-soft silk-blend luxury carpet.' },
    { name: 'Shag Pile Bedroom Carpet', slug: 'shag-pile-bedroom-carpet', sku: 'CP-003', shortDesc: 'Deep shag pile carpet for cozy bedrooms', description: 'Sink your feet into this deep shag pile carpet. Perfect for bedrooms and reading nooks. Anti-static treated and stain-resistant.', categoryId: categories['carpets'], isFeatured: false, isOnSale: false, status: ProductStatus.ACTIVE, material: Material.POLYESTER, taxRate: 12, hsnCode: '5703', seoTitle: 'Shag Pile Bedroom Carpet | Naturalife', seoDesc: 'Deep shag pile carpet for cozy bedrooms.' },

    // Mats (2)
    { name: 'Yoga Jute Mat', slug: 'yoga-jute-mat', sku: 'MT-001', shortDesc: 'Natural jute yoga mat with non-slip grip', description: 'Eco-friendly yoga mat made from natural jute fiber. Excellent grip for all yoga styles. Biodegradable and sustainably sourced.', categoryId: categories['mats'], isFeatured: true, isOnSale: false, status: ProductStatus.ACTIVE, material: Material.JUTE, taxRate: 12, hsnCode: '5705', seoTitle: 'Yoga Jute Mat | Naturalife', seoDesc: 'Eco-friendly natural jute yoga mat.' },
    { name: 'Kids Play Mat', slug: 'kids-play-mat', sku: 'MT-002', shortDesc: 'Soft padded play mat for children with fun prints', description: 'Safe and soft play mat for toddlers and young children. Non-toxic materials, easy to clean, and features fun educational prints.', categoryId: categories['mats'], isFeatured: false, isOnSale: true, status: ProductStatus.ACTIVE, material: Material.COTTON, taxRate: 5, hsnCode: '6304', seoTitle: 'Kids Play Mat | Naturalife', seoDesc: 'Safe soft play mat for children.' },

    // Cushion Covers (2)
    { name: 'Bohemian Cotton Cushion Cover', slug: 'bohemian-cotton-cushion-cover', sku: 'CC-001', shortDesc: 'Handcrafted bohemian style cotton cushion cover with embroidery', description: 'Add bohemian charm with these hand-embroidered cotton cushion covers. Each piece is unique, showcasing the skill of Indian artisans.', categoryId: categories['cushion-covers'], isFeatured: true, isOnSale: false, status: ProductStatus.ACTIVE, material: Material.COTTON, taxRate: 5, hsnCode: '6304', seoTitle: 'Bohemian Cotton Cushion Cover | Naturalife', seoDesc: 'Hand-embroidered bohemian cushion covers.' },
    { name: 'Velvet Embossed Cushion Cover', slug: 'velvet-embossed-cushion-cover', sku: 'CC-002', shortDesc: 'Luxurious velvet cushion cover with embossed pattern', description: 'Rich velvet cushion cover with elegant embossed patterns. Hidden zipper closure for a clean finish. Available in 8 premium colours.', categoryId: categories['cushion-covers'], isFeatured: false, isOnSale: false, status: ProductStatus.ACTIVE, material: Material.POLYESTER, taxRate: 5, hsnCode: '6304', seoTitle: 'Velvet Embossed Cushion Cover | Naturalife', seoDesc: 'Luxurious velvet cushion cover.' },

    // Table Mats (2)
    { name: 'Handloom Cotton Table Runner', slug: 'handloom-cotton-table-runner', sku: 'TM-001', shortDesc: 'Hand-woven cotton table runner with traditional border design', description: 'Elevate your dining table with this handloom woven cotton table runner. Classic Indian border pattern in vibrant colors.', categoryId: categories['table-mats'], isFeatured: false, isOnSale: false, status: ProductStatus.ACTIVE, material: Material.COTTON, taxRate: 5, hsnCode: '6304', seoTitle: 'Handloom Cotton Table Runner | Naturalife', seoDesc: 'Handloom cotton table runner.' },
    { name: 'Jute Braided Placemat Set', slug: 'jute-braided-placemat-set', sku: 'TM-002', shortDesc: 'Set of 6 hand-braided jute placemats', description: 'Natural jute placemats hand-braided in a beautiful spiral pattern. Set of 6 with matching coasters. Perfect for farmhouse and bohemian dining.', categoryId: categories['table-mats'], isFeatured: true, isOnSale: true, status: ProductStatus.ACTIVE, material: Material.JUTE, taxRate: 5, hsnCode: '6304', seoTitle: 'Jute Braided Placemat Set | Naturalife', seoDesc: 'Hand-braided jute placemats set of 6.' },

    // Stools (1)
    { name: 'Handwoven Pouf Ottoman', slug: 'handwoven-pouf-ottoman', sku: 'ST-001', shortDesc: 'Handwoven cotton pouf ottoman stool', description: 'Versatile handwoven pouf that works as extra seating, a footrest, or a side table. Made from 100% cotton with a sturdy inner frame.', categoryId: categories['stools'], isFeatured: true, isOnSale: false, status: ProductStatus.ACTIVE, material: Material.COTTON, taxRate: 12, hsnCode: '9401', seoTitle: 'Handwoven Pouf Ottoman | Naturalife', seoDesc: 'Handwoven cotton pouf ottoman.' },

    // Chef Mats (2)
    { name: 'Anti-Fatigue Kitchen Chef Mat', slug: 'anti-fatigue-kitchen-chef-mat', sku: 'CM-001', shortDesc: 'Ergonomic anti-fatigue mat for kitchen and standing desks', description: 'Premium anti-fatigue mat reduces stress on feet, legs and back. Non-slip bottom, easy to clean.', categoryId: categories['chef-mats'], isFeatured: false, isOnSale: true, status: ProductStatus.ACTIVE, material: Material.RUBBER, taxRate: 18, hsnCode: '4016', seoTitle: 'Anti-Fatigue Kitchen Chef Mat | Naturalife', seoDesc: 'Premium anti-fatigue kitchen mat.' },
    { name: 'Printed Kitchen Floor Mat', slug: 'printed-kitchen-floor-mat', sku: 'CM-002', shortDesc: 'Decorative printed kitchen floor mat with cushioned base', description: 'Stylish printed kitchen mat that combines comfort with aesthetics. Waterproof surface, cushioned base, and anti-slip backing.', categoryId: categories['chef-mats'], isFeatured: true, isOnSale: false, status: ProductStatus.ACTIVE, material: Material.RUBBER, taxRate: 18, hsnCode: '4016', seoTitle: 'Printed Kitchen Floor Mat | Naturalife', seoDesc: 'Decorative printed kitchen floor mat.' },

    // Placemats (2)
    { name: 'Woven Cotton Placemat Set', slug: 'woven-cotton-placemat-set', sku: 'PM-001', shortDesc: 'Set of 4 handwoven cotton placemats', description: 'Elegant handwoven cotton placemats in a set of 4. Traditional weaving patterns with modern colour palettes. Machine washable.', categoryId: categories['placemats'], isFeatured: false, isOnSale: false, status: ProductStatus.ACTIVE, material: Material.COTTON, taxRate: 5, hsnCode: '6304', seoTitle: 'Woven Cotton Placemat Set | Naturalife', seoDesc: 'Handwoven cotton placemat set of 4.' },
    { name: 'Banana Fiber Placemat', slug: 'banana-fiber-placemat', sku: 'PM-002', shortDesc: 'Eco-friendly banana fiber placemat', description: 'Unique placemat made from sustainably harvested banana fiber. Natural golden colour with a distinctive texture. Heat resistant and durable.', categoryId: categories['placemats'], isFeatured: true, isOnSale: true, status: ProductStatus.ACTIVE, material: Material.JUTE, taxRate: 5, hsnCode: '6304', seoTitle: 'Banana Fiber Placemat | Naturalife', seoDesc: 'Eco-friendly banana fiber placemat.' },
  ]

  for (let pi = 0; pi < sampleProducts.length; pi++) {
    const productData = sampleProducts[pi]
    const product = await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {},
      create: productData,
    })

    // Add product images (assign 2-3 images per product from the pool)
    const imgStart = (pi * 3) % productImages.length
    const imgCount = pi % 3 === 0 ? 3 : 2
    for (let imgI = 0; imgI < imgCount; imgI++) {
      const imgFile = productImages[(imgStart + imgI) % productImages.length]
      await prisma.productImage.upsert({
        where: { id: `img-${productData.slug}-${imgI}` },
        update: {},
        create: {
          id: `img-${productData.slug}-${imgI}`,
          productId: product.id,
          url: `/images/products/${imgFile}`,
          altText: productData.name,
          isPrimary: imgI === 0,
          sortOrder: imgI,
        },
      })
    }

    // Create variants for each product
    const basePrice = 449 + (pi * 100) % 1500
    const variantConfigs = [
      { sizeSuffix: '16x24', price: basePrice, wholesalePrice: Math.round(basePrice * 0.65), minWholesaleQty: 20, stock: 100 },
      { sizeSuffix: '18x30', price: basePrice + 150, wholesalePrice: Math.round((basePrice + 150) * 0.65), minWholesaleQty: 15, stock: 80 },
      { sizeSuffix: '24x36', price: basePrice + 400, wholesalePrice: Math.round((basePrice + 400) * 0.65), minWholesaleQty: 10, stock: 60 },
    ]

    for (let i = 0; i < variantConfigs.length; i++) {
      const vc = variantConfigs[i]
      const variantSku = `${product.sku}-${vc.sizeSuffix}`
      await prisma.productVariant.upsert({
        where: { sku: variantSku },
        update: {},
        create: {
          productId: product.id,
          sku: variantSku,
          price: vc.price,
          wholesalePrice: vc.wholesalePrice,
          minWholesaleQty: vc.minWholesaleQty,
          stock: vc.stock,
          weight: 0.5 + i * 0.3,
          dimensions: { length: 60 + i * 15, width: 40 + i * 10, height: 1 },
          attributeValues: [
            { attributeId: 'SIZE', valueId: `size-${vc.sizeSuffix}` },
            { attributeId: 'COLOR', valueId: 'color-multi' },
          ],
        },
      })
    }

    // Add bulk pricing rules
    const firstVariant = await prisma.productVariant.findFirst({ where: { productId: product.id } })
    if (firstVariant) {
      await prisma.bulkPricingRule.createMany({
        data: [
          { productVariantId: firstVariant.id, minQty: 10, maxQty: 19, pricePerUnit: firstVariant.wholesalePrice, label: 'Pack of 10' },
          { productVariantId: firstVariant.id, minQty: 20, maxQty: 49, pricePerUnit: Number(firstVariant.wholesalePrice) * 0.9, label: 'Pack of 20' },
          { productVariantId: firstVariant.id, minQty: 50, maxQty: null, pricePerUnit: Number(firstVariant.wholesalePrice) * 0.8, label: 'Pack of 50+' },
        ],
        skipDuplicates: true,
      })
    }
  }
  console.log('✓ Sample products with variants and images created')

  // Custom Design Form Definition
  await prisma.formDefinition.upsert({
    where: { key: 'custom-design' },
    update: {},
    create: {
      key: 'custom-design',
      name: 'Custom Design Request',
      fields: [
        { name: 'name', label: 'Full Name', type: 'text', required: true },
        { name: 'email', label: 'Email Address', type: 'email', required: true },
        { name: 'phone', label: 'Phone Number', type: 'tel', required: true },
        { name: 'product_type', label: 'Product Type', type: 'select', required: true, options: ['Rug', 'Carpet', 'Dhurrie', 'Doormat', 'Cushion Cover', 'Table Mat', 'Other'] },
        { name: 'size', label: 'Desired Size', type: 'select', required: false, options: ['2×3 ft', '3×5 ft', '4×6 ft', '5×7 ft', '6×9 ft', '8×10 ft', 'Custom Size'] },
        { name: 'material', label: 'Preferred Material', type: 'select', required: false, options: ['Cotton', 'Wool', 'Jute', 'Silk Blend', 'Polyester', 'No Preference'] },
        { name: 'budget', label: 'Budget Range', type: 'select', required: false, options: ['Under ₹1,000', '₹1,000 - ₹3,000', '₹3,000 - ₹5,000', '₹5,000 - ₹10,000', 'Above ₹10,000'] },
        { name: 'description', label: 'Design Description', type: 'textarea', required: true },
      ],
      isActive: true,
    },
  })
  console.log('✓ Custom design form created')

  // Marquee Offers
  await prisma.marqueeOffer.createMany({
    data: [
      { text: '🎉 FREE SHIPPING on orders above ₹1000', sortOrder: 1, isActive: true },
      { text: '✨ NEW: Handwoven Dhurries now available in 12 colors', sortOrder: 2, isActive: true },
      { text: '🏷️ Wholesale accounts: Get up to 40% off | Apply now', linkUrl: '/wholesale', sortOrder: 3, isActive: true },
      { text: '🚀 Pan-India delivery in 5-7 working days', sortOrder: 4, isActive: true },
      { text: '💰 Earn Naturalife Coins on every purchase | Redeem for discounts', sortOrder: 5, isActive: true },
    ],
    skipDuplicates: true,
  })
  console.log('✓ Marquee offers created')

  // Notification Templates
  const templates = [
    {
      event: NotificationEvent.ORDER_PLACED,
      channel: NotificationChannel.EMAIL,
      subject: 'Order Confirmed - #{{orderNumber}} | Naturalife',
      bodyTemplate: `Hi {{customerName}},

Your order #{{orderNumber}} has been placed successfully!

Order Summary:
{{#each items}}
- {{this.name}} ({{this.qty}} × ₹{{this.price}}) = ₹{{this.subtotal}}
{{/each}}

Subtotal: ₹{{subtotal}}
Shipping: ₹{{shipping}}
Tax (GST): ₹{{tax}}
Discount: -₹{{discount}}
Total: ₹{{total}}

Payment Method: {{paymentMethod}}

We'll notify you when your order is dispatched.

Thank you for shopping with Naturalife!`,
    },
    {
      event: NotificationEvent.ORDER_PLACED,
      channel: NotificationChannel.WHATSAPP,
      subject: null,
      bodyTemplate: `✅ *Order Confirmed!*
Order #{{orderNumber}}
Total: ₹{{total}}
Payment: {{paymentMethod}}

We'll notify you when it ships. Track at naturalife.in/orders/{{orderNumber}}`,
    },
    {
      event: NotificationEvent.ORDER_DISPATCHED,
      channel: NotificationChannel.EMAIL,
      subject: 'Your order #{{orderNumber}} has been dispatched! | Naturalife',
      bodyTemplate: `Hi {{customerName}},

Great news! Your order #{{orderNumber}} has been dispatched.

Tracking Number: {{trackingNumber}}
Courier: {{courier}}
Track here: {{trackingUrl}}

Expected delivery: {{expectedDelivery}}`,
    },
    {
      event: NotificationEvent.ORDER_DISPATCHED,
      channel: NotificationChannel.WHATSAPP,
      subject: null,
      bodyTemplate: `🚚 *Order Dispatched!*
Order #{{orderNumber}}
Tracking: {{trackingNumber}}
Track: {{trackingUrl}}`,
    },
    {
      event: NotificationEvent.ORDER_DELIVERED,
      channel: NotificationChannel.EMAIL,
      subject: 'Your order #{{orderNumber}} has been delivered! | Naturalife',
      bodyTemplate: `Hi {{customerName}},

Your order #{{orderNumber}} has been delivered!

You've earned {{coinsEarned}} Naturalife Coins from this order.

We'd love to hear your feedback. Leave a review at: {{reviewUrl}}`,
    },
    {
      event: NotificationEvent.ORDER_DELIVERED,
      channel: NotificationChannel.WHATSAPP,
      subject: null,
      bodyTemplate: `📦 *Order Delivered!*
Order #{{orderNumber}} is delivered.
You earned {{coinsEarned}} coins! 🎉
Share your experience: {{reviewUrl}}`,
    },
    {
      event: NotificationEvent.RETURN_REQUESTED,
      channel: NotificationChannel.EMAIL,
      subject: 'Return Request Received - #{{orderNumber}} | Naturalife',
      bodyTemplate: `Hi {{customerName}},

We've received your return request for order #{{orderNumber}}.

Pickup scheduled for: {{pickupDate}}
Our team will contact you shortly.`,
    },
    {
      event: NotificationEvent.RETURN_REQUESTED,
      channel: NotificationChannel.WHATSAPP,
      subject: null,
      bodyTemplate: `↩️ *Return Request Received*
Order #{{orderNumber}}
Pickup: {{pickupDate}}
We'll contact you soon.`,
    },
    {
      event: NotificationEvent.REFUND_DONE,
      channel: NotificationChannel.EMAIL,
      subject: 'Refund Processed - #{{orderNumber}} | Naturalife',
      bodyTemplate: `Hi {{customerName}},

Your refund of ₹{{refundAmount}} for order #{{orderNumber}} has been processed.

It will reflect in your account within 5-7 business days.`,
    },
    {
      event: NotificationEvent.REFUND_DONE,
      channel: NotificationChannel.WHATSAPP,
      subject: null,
      bodyTemplate: `💸 *Refund Processed*
₹{{refundAmount}} refunded for order #{{orderNumber}}
Reflects in 5-7 business days.`,
    },
  ]

  for (const tmpl of templates) {
    await prisma.notificationTemplate.upsert({
      where: { event_channel: { event: tmpl.event, channel: tmpl.channel } },
      update: {},
      create: tmpl,
    })
  }
  console.log('✓ Notification templates created')

  // Site Settings
  const settings = [
    { key: 'company_name', value: { text: 'Naturalife' } },
    { key: 'company_gst', value: { text: '07AAAAA0000A1Z5' } },
    { key: 'company_address', value: { text: 'Plot No. 123, Industrial Area, Jaipur, Rajasthan - 302001' } },
    { key: 'company_phone', value: { text: '+91 98765 43210' } },
    { key: 'company_email', value: { text: 'info@naturalife.in' } },
    { key: 'company_whatsapp', value: { text: '+91 98765 43210' } },
    { key: 'free_shipping_threshold', value: { amount: 1000 } },
    { key: 'domestic_shipping_fee', value: { amount: 100 } },
    { key: 'international_shipping_fee_usd', value: { amount: 200 } },
    { key: 'cod_available', value: { enabled: true } },
    { key: 'coin_earn_rate', value: { coinsPerHundred: 10 } },
    { key: 'coin_redemption_rate', value: { coinsPerRupee: 10 } },
    { key: 'notification_mode', value: { mode: 'TEST' } },
    { key: 'exit_popup_enabled', value: { enabled: true } },
    { key: 'exit_popup_coupon', value: { code: 'WELCOME10', discount: '10%' } },
    { key: 'social_instagram', value: { url: 'https://instagram.com/naturalife' } },
    { key: 'social_facebook', value: { url: 'https://facebook.com/naturalife' } },
    { key: 'social_youtube', value: { url: 'https://youtube.com/@naturalife' } },
    { key: 'social_pinterest', value: { url: 'https://pinterest.com/naturalife' } },
  ]

  for (const s of settings) {
    await prisma.siteSettings.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    })
  }
  console.log('✓ Site settings created')

  // Default Coupon
  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      type: 'PERCENT',
      value: 10,
      minOrderValue: 500,
      maxDiscount: 200,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      usageLimit: 1000,
      isActive: true,
    },
  })

  await prisma.coupon.upsert({
    where: { code: 'BULK20' },
    update: {},
    create: {
      code: 'BULK20',
      type: 'PERCENT',
      value: 20,
      minOrderValue: 5000,
      maxDiscount: 2000,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      usageLimit: 500,
      isActive: true,
    },
  })
  console.log('✓ Default coupons created')

  // Sample Testimonials
  await prisma.testimonial.createMany({
    data: [
      { name: 'Priya Sharma', location: 'Delhi', rating: 5, text: 'Absolutely love the quality of the doormats! The coir rope doormat has been in use for 6 months and still looks new. Great value for money.', source: 'MANUAL', isVisible: true, isVerified: true },
      { name: 'Rajesh Kumar', location: 'Mumbai', rating: 5, text: 'Ordered the Jaipur dhurrie for our living room. The colors are vibrant and the craftsmanship is excellent. Received many compliments!', source: 'MANUAL', isVisible: true, isVerified: true },
      { name: 'Ananya Reddy', location: 'Hyderabad', rating: 4, text: 'The wool carpet is beautiful and premium quality. Delivery was on time. Will definitely order more products.', source: 'MANUAL', isVisible: true, isVerified: true },
      { name: 'Mohit Jain', location: 'Jaipur', rating: 5, text: 'Best quality rugs I have found online. The wholesale pricing is very competitive. Highly recommend for interior designers.', source: 'MANUAL', isVisible: true, isVerified: true },
      { name: 'Deepa Nair', location: 'Bangalore', rating: 5, text: 'The cushion covers are gorgeous! Hand embroidery is so detailed. Makes a perfect gift too. Fast shipping and great packaging.', source: 'MANUAL', isVisible: true, isVerified: true },
    ],
    skipDuplicates: false,
  })
  console.log('✓ Sample testimonials created')

  // Default Pages
  const pages = [
    {
      slug: 'about',
      title: 'About Us',
      content: {
        blocks: [
          { type: 'hero', heading: 'Our Story', subheading: 'Weaving traditions since 2005' },
          { type: 'text', content: 'Naturalife was founded with a vision to bring the rich heritage of Indian textile craftsmanship to modern homes. We work with over 500 skilled artisans across Rajasthan, Gujarat, and West Bengal, preserving traditional weaving and dyeing techniques passed down through generations.\n\nOur products are made from natural, sustainable materials — coir, cotton, jute, and wool — processed using eco-friendly methods. We believe in fair trade practices and ensure our artisans receive fair compensation for their exceptional skill and hard work.' },
          { type: 'stats', items: [{ value: '500+', label: 'Artisan Partners' }, { value: '15+', label: 'Years of Excellence' }, { value: '20+', label: 'States Served' }, { value: '50,000+', label: 'Happy Customers' }] },
        ],
      },
      seoTitle: 'About Naturalife - Our Story & Mission',
      seoDesc: 'Learn about Naturalife\'s mission to bring authentic Indian textile craftsmanship to modern homes. 500+ artisan partners, 15+ years of excellence.',
      isPublished: true,
    },
    {
      slug: 'privacy-policy',
      title: 'Privacy Policy',
      content: {
        blocks: [{ type: 'text', content: 'At Naturalife, we take your privacy seriously. This policy outlines how we collect, use, and protect your personal information.\n\n**Information We Collect**\nWe collect information you provide directly, such as name, email, phone number, and delivery address when you create an account or place an order.\n\n**How We Use Your Information**\nWe use your information to process orders, send order updates, improve our services, and communicate promotional offers (with your consent).\n\n**Data Security**\nWe implement industry-standard security measures to protect your data. Your payment information is processed securely through Razorpay and we do not store card details.\n\n**Contact Us**\nFor privacy-related queries, contact us at privacy@naturalife.in' }],
      },
      seoTitle: 'Privacy Policy | Naturalife',
      isPublished: true,
    },
    {
      slug: 'terms-and-conditions',
      title: 'Terms & Conditions',
      content: {
        blocks: [{ type: 'text', content: 'By using Naturalife\'s website and services, you agree to these terms and conditions.\n\n**Orders & Payment**\nAll prices are inclusive of GST. We accept UPI, cards, net banking, and COD. Orders are confirmed once payment is successful.\n\n**Shipping**\nWe deliver pan-India within 5-7 working days. Express delivery available for select pincodes.\n\n**Cancellations**\nOrders can be cancelled within 24 hours of placement. After dispatch, cancellation is not possible.\n\n**Governing Law**\nThese terms are governed by the laws of India, jurisdiction of Rajasthan courts.' }],
      },
      seoTitle: 'Terms & Conditions | Naturalife',
      isPublished: true,
    },
    {
      slug: 'return-refund-policy',
      title: 'Return & Refund Policy',
      content: {
        blocks: [{ type: 'text', content: '**Return Policy**\nWe accept returns within 7 days of delivery for damaged or defective products. Products must be unused and in original packaging.\n\n**Non-Returnable Items**\nCustom/personalized orders, sale items, and gift cards cannot be returned.\n\n**Refund Process**\nOnce we receive and inspect the returned item, refunds are processed within 5-7 business days to the original payment method.\n\n**How to Initiate a Return**\nLogin to your account → My Orders → Select Order → Request Return. Or contact us at support@naturalife.in' }],
      },
      seoTitle: 'Return & Refund Policy | Naturalife',
      isPublished: true,
    },
    {
      slug: 'shipping-policy',
      title: 'Shipping Policy',
      content: {
        blocks: [{ type: 'text', content: '**Domestic Shipping (India)**\nFree shipping on orders above ₹1,000. Flat ₹100 for orders below ₹1,000. Delivery in 5-7 working days.\n\n**Wholesale Orders**\nShipping charges for wholesale orders are calculated based on weight and destination. Contact your assigned distributor for details.\n\n**International Shipping**\nWe ship worldwide. Flat $200 shipping for international orders. Delivery in 15-21 working days. Customs duties as applicable.\n\n**Tracking**\nTracking number shared via email and WhatsApp once order is dispatched.' }],
      },
      seoTitle: 'Shipping Policy | Naturalife',
      isPublished: true,
    },
  ]

  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: page,
    })
  }
  console.log('✓ Default pages created')

  // Distributor Users for major states
  const distributorStates = [
    { state: 'MH', name: 'Maharashtra', company: 'Mumbai Textile Distributors', phone: '+912212345678', email: 'mh@naturalife.in', pincodeFrom: 400000, pincodeTo: 445000 },
    { state: 'DL', name: 'Delhi', company: 'Delhi NCR Rugs & Mats', phone: '+911123456789', email: 'dl@naturalife.in', pincodeFrom: 110000, pincodeTo: 110099 },
    { state: 'KA', name: 'Karnataka', company: 'Bangalore Home Decor Dist.', phone: '+918023456789', email: 'ka@naturalife.in', pincodeFrom: 560000, pincodeTo: 591000 },
    { state: 'TN', name: 'Tamil Nadu', company: 'Chennai Textile Partners', phone: '+914423456789', email: 'tn@naturalife.in', pincodeFrom: 600000, pincodeTo: 643000 },
    { state: 'GJ', name: 'Gujarat', company: 'Ahmedabad Craft Distributors', phone: '+917923456789', email: 'gj@naturalife.in', pincodeFrom: 360000, pincodeTo: 396500 },
  ]

  for (const distData of distributorStates) {
    const distPassword = await hash('dist123', 12)
    const distUser = await prisma.user.upsert({
      where: { primaryEmail: distData.email },
      update: {},
      create: {
        primaryEmail: distData.email,
        primaryPhone: distData.phone,
        name: distData.company,
        password: distPassword,
        role: Role.DISTRIBUTOR,
        stateCode: distData.state,
        preferredLanguage: Language.EN,
      },
    })

    const distributor = await prisma.distributor.upsert({
      where: { userId: distUser.id },
      update: {},
      create: {
        userId: distUser.id,
        stateCodes: [distData.state],
        email: distData.email,
        phone: distData.phone,
        companyName: distData.company,
        isActive: true,
      },
    })

    await prisma.statePincode.upsert({
      where: { id: `sp-${distData.state}` },
      update: {},
      create: {
        id: `sp-${distData.state}`,
        stateCode: distData.state,
        stateName: distData.name,
        pincodeFrom: distData.pincodeFrom,
        pincodeTo: distData.pincodeTo,
        distributorId: distributor.id,
      },
    })
  }
  console.log('✓ Distributors and state mappings created')

  console.log('\n✅ Database seeded successfully!')
  console.log('Admin login: admin@naturalife.in / admin123')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
