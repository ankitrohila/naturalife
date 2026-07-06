import { HomePageClient } from '@/components/home/HomePageClient'
import type { ProductCardData } from '@/components/shop/ProductCard'
import { prisma } from '@/lib/prisma'
import { getGoogleReviews } from '@/lib/googleReviews'

const FEATURED_PRODUCTS = [
  { name: 'NATURALIFE DOORMAT BB-11', slug: 'dm-001', price: 499, img: '/images/products/p-sq-26.jpg', tag: 'Best Seller' },
  { name: 'NATURALIFE MICRO SHAG DOORMAT BB-73', slug: 'dm-002', price: 415, img: '/images/products/p-sq-73.jpg', tag: 'New' },
  { name: 'NATURALIFE DOORMAT BB-10', slug: 'dm-003', price: 499, img: '/images/products/p-blkgre.jpg', tag: 'Sale' },
  { name: 'NATURALIFE REVERSIBLE DOORMAT BB-138', slug: 'dm-004', price: 320, img: '/images/products/p-sq-25.jpg', tag: 'Popular' },
  { name: 'NATURALIFE REVERSIBLE DOORMAT BB-137', slug: 'dm-005', price: 320, img: '/images/products/p-sq-1.jpg', tag: null },
  { name: 'NATURALIFE DHURRIE', slug: 'dh-001', price: 320, img: '/images/products/p-brown.jpg', tag: 'Sale' },
  { name: 'NATURALIFE RUG', slug: 'rg-001', price: 575, img: '/images/products/p-sq-2.jpg', tag: 'New' },
  { name: 'NATURALIFE CUSHION COVER', slug: 'cc-001', price: 599, img: '/images/products/p-sq-3.jpg', tag: null },
]

const CATEGORIES = [
  { name: 'Doormats', slug: 'doormats', img: '/images/products/p-sq-26.jpg', count: '50+ styles' },
  { name: 'Rugs & Dhurries', slug: 'rugs', img: '/images/products/p-brown.jpg', count: '30+ styles' },
  { name: 'Bath Mats', slug: 'mats', img: '/images/products/p-sq-73.jpg', count: '20+ styles' },
  { name: 'Cushion Covers', slug: 'cushion-covers', img: '/images/products/p-blkgre.jpg', count: '40+ styles' },
]

export default async function HomePage() {
  const [dbProducts, testimonials, googleReviews] = await Promise.all([
    prisma.product.findMany({
      where: { status: 'ACTIVE' },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { include: { bulkPricingRules: { orderBy: { minQty: 'asc' } } }, orderBy: { price: 'asc' } },
        attributeValues: { include: { attribute: true, value: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 12,
    }).catch(() => []),
    prisma.testimonial.findMany({ where: { isVisible: true }, take: 3 }).catch(() => []),
    getGoogleReviews(),
  ])

  const activeOffers = (await prisma.marqueeOffer.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }).catch(() => [])).map(o => o.text)

  // Full product objects for the interactive homepage grid (filters + quick view)
  const homeProducts = JSON.parse(JSON.stringify(dbProducts.map(p => ({
    ...p,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt),
  }))))

  const displayProducts = dbProducts.length > 0 ? dbProducts.map(p => ({
    name: p.name,
    slug: p.slug,
    price: p.variants[0] ? Number(p.variants[0].price) : 0,
    img: p.images.find(i => i.isPrimary)?.url ?? p.images[0]?.url ?? FEATURED_PRODUCTS[0].img,
    tag: p.isOnSale ? 'Sale' : p.isFeatured ? 'Featured' : null,
  })) : FEATURED_PRODUCTS

  const trending = displayProducts.slice(0, 3).map(p => ({
    name: p.name, slug: p.slug, price: p.price, img: p.img,
  }))

  // Lifestyle carousel: pair 5 room photos with 3 real products each (cycling if the catalog is small)
  const roomImages = ['room-1', 'room-2', 'room-3', 'room-4', 'room-5']
  const cardData: ProductCardData[] = dbProducts.map((p) => {
    const variant = p.variants[0]
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      image: p.images.find((i) => i.isPrimary)?.url ?? p.images[0]?.url ?? null,
      price: variant ? Number(variant.price) : null,
      compareAtPrice: variant?.compareAtPrice ? Number(variant.compareAtPrice) : null,
      variantId: variant?.id,
      sku: variant?.sku,
      wholesalePrice: variant ? Number(variant.wholesalePrice) : undefined,
      taxRate: Number(p.taxRate),
    }
  })
  const lifestyleSlides = cardData.length > 0 ? roomImages.map((room, i) => ({
    image: `/images/lifestyle/${room}.jpg`,
    products: [0, 1, 2].map((j) => cardData[(i * 3 + j) % cardData.length]),
  })) : []

  const showTestimonials = googleReviews && googleReviews.length > 0 ? googleReviews.map(r => ({
    name: r.authorName, city: r.relativeTime, review: r.text, rating: r.rating,
  })) : testimonials.length > 0 ? testimonials.map(t => ({
    name: t.name, city: t.location ?? '', review: t.text
  })) : [
    { name: 'Priya Sharma', city: 'Mumbai', review: 'The microfiber doormat is absolutely amazing! Super soft, water absorbent, and looks great at our entrance. Highly recommend!' },
    { name: 'Rahul Verma', city: 'Delhi', review: 'Bought 3 doormats for different rooms. Quality is top-notch and the anti-skid backing gives great peace of mind. Fast delivery too!' },
    { name: 'Anita Patel', city: 'Ahmedabad', review: 'The reversible doormat is such a smart product. Love that I get two looks in one. The colors are exactly as shown in the pictures.' },
  ]

  return (
    <HomePageClient
      categories={CATEGORIES}
      homeProducts={homeProducts}
      lifestyleSlides={lifestyleSlides}
      trending={trending}
      activeOffers={activeOffers}
      showTestimonials={showTestimonials}
    />
  )
}
