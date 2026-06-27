import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { WovenBorderDivider } from '@/components/shared/WovenBorderDivider'
import { ProductDetailClient } from '@/components/product/ProductDetailClient'

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
    },
  })

  if (!product || product.status === 'ARCHIVED') notFound()

  const relatedProducts = await prisma.product.findMany({
    where: { categoryId: product.categoryId, status: 'ACTIVE', id: { not: product.id } },
    include: { images: { where: { isPrimary: true }, take: 1 }, variants: { orderBy: { price: 'asc' }, take: 1 } },
    take: 4,
  })

  return (
    <>
      <Header />
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
              <h2 className="text-2xl font-bold my-8" style={{ fontFamily: 'var(--font-display)', color: 'var(--indigo)' }}>
                You May Also Like
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relatedProducts.map((p) => {
                  const image = p.images?.[0]?.url
                  const variant = p.variants?.[0]
                  return (
                    <a key={p.id} href={`/shop/${p.slug}`} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-1 border border-gray-100">
                      <div className="aspect-square bg-gray-50">
                        {image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl">🏠</div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="text-sm font-semibold line-clamp-2 mb-1">{p.name}</h3>
                        {variant && <p className="text-sm font-bold" style={{ color: 'var(--saffron)' }}>₹{Number(variant.price).toLocaleString('en-IN')}</p>}
                      </div>
                    </a>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </main>
      <WovenBorderDivider />
      <Footer />
    </>
  )
}
