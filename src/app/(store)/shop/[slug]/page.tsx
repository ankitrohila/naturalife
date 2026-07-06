import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { WovenBorderDivider } from '@/components/shared/WovenBorderDivider'
import { ProductDetailClient } from '@/components/product/ProductDetailClient'
import { RelatedProducts } from '@/components/product/RelatedProducts'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await prisma.product.findUnique({ where: { slug }, select: { name: true, seoTitle: true, seoDesc: true, shortDesc: true } })
  if (!product) return {}
  return {
    title: product.seoTitle ?? product.name,
    description: product.seoDesc ?? product.shortDesc ?? '',
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { orderBy: { sortOrder: 'asc' } },
      variants: {
        include: { bulkPricingRules: { orderBy: { minQty: 'asc' } } },
        orderBy: { price: 'asc' },
      },
      attributeValues: {
        include: { attribute: true, value: true },
      },
      reviews: { where: { isApproved: true }, orderBy: { createdAt: 'desc' } },
    },
  })

  if (!product || product.status === 'ARCHIVED') notFound()

  const relatedProducts = await prisma.product.findMany({
    where: { categoryId: product.categoryId, status: 'ACTIVE', id: { not: product.id } },
    include: {
      category: true,
      images: { orderBy: { sortOrder: 'asc' } },
      variants: { include: { bulkPricingRules: { orderBy: { minQty: 'asc' } } }, orderBy: { price: 'asc' } },
      attributeValues: { include: { attribute: true, value: true } },
    },
    take: 5,
  })

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--ivory)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
          <a href="/" className="hover:underline">Home</a>
          <span>/</span>
          <a href="/shop" className="hover:underline">Shop</a>
          <span>/</span>
          <a href={`/shop?category=${product.category.slug}`} className="hover:underline">{product.category.name}</a>
          <span>/</span>
          <span className="text-gray-800">{product.name}</span>
        </nav>

        <ProductDetailClient product={JSON.parse(JSON.stringify(product))} />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <WovenBorderDivider />
            <h2 className="text-2xl font-semibold my-8 text-center" style={{ color: 'var(--ink)' }}>
              Related Products
            </h2>
            <RelatedProducts items={JSON.parse(JSON.stringify(relatedProducts))} />
          </div>
        )}
      </div>
    </main>
  )
}
