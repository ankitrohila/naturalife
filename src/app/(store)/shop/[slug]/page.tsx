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

  // Build the set of (attributeId:valueId) pairs actually present in this product's variants.
  // This is the authoritative list — only show selectors for values that have a real variant.
  const variantAttrPairs = new Set(
    product.variants.flatMap((v) => {
      const avs = (v.attributeValues as Array<{ attributeId: string; valueId: string }> | null) ?? []
      return avs.map((av) => `${av.attributeId}:${av.valueId}`)
    })
  )

  // Collect all unique valueIds from variant JSON (these need AttributeValue records)
  const variantValueIds = [...new Set(
    product.variants.flatMap((v) => {
      const avs = (v.attributeValues as Array<{ attributeId: string; valueId: string }> | null) ?? []
      return avs.map((av) => av.valueId)
    })
  )]

  // Fetch full AttributeValue records for all variant options
  const allVariantAVs = variantValueIds.length > 0
    ? await prisma.attributeValue.findMany({ where: { id: { in: variantValueIds } }, include: { attribute: true } })
    : []

  // Build the merged attributeValues list:
  // Start from ProductAttributeValue records that are actually backed by a variant,
  // then add variant-derived ones not already in the list.
  const existingValueIds = new Set(product.attributeValues.map((av) => av.value.id))
  const validExisting = product.attributeValues.filter(
    (av) => variantAttrPairs.has(`${av.attributeId}:${av.valueId}`)
  )
  const derived = allVariantAVs
    .filter((av) => !existingValueIds.has(av.id) && variantAttrPairs.has(`${av.attributeId}:${av.id}`))
    .map((av) => ({
      productId: product.id,
      attributeId: av.attributeId,
      valueId: av.id,
      attribute: av.attribute,
      value: { id: av.id, value: av.value, label: av.label, hexColor: av.hexColor, imageUrl: (av as any).imageUrl ?? null },
    }))
  ;(product as any).attributeValues = [...validExisting, ...derived]

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
