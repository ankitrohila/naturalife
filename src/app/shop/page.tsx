import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { WovenBorderDivider } from '@/components/shared/WovenBorderDivider'
import Link from 'next/link'

interface SearchParams {
  category?: string
  search?: string
  onSale?: string
  featured?: string
  sort?: string
  page?: string
  orderType?: string
  priceMin?: string
  priceMax?: string
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams
  const page = parseInt(sp.page ?? '1')
  const limit = 12
  const orderType = sp.orderType ?? 'RETAIL'

  const where: any = { status: 'ACTIVE' }
  if (sp.category) where.category = { slug: sp.category }
  if (sp.onSale === 'true') where.isOnSale = true
  if (sp.featured === 'true') where.isFeatured = true
  if (sp.search) {
    where.OR = [
      { name: { contains: sp.search, mode: 'insensitive' } },
      { shortDesc: { contains: sp.search, mode: 'insensitive' } },
    ]
  }

  const [total, products, categories] = await Promise.all([
    prisma.product.count({ where }).catch(() => 0),
    prisma.product.findMany({
      where,
      include: {
        category: { select: { name: true, slug: true } },
        images: { where: { isPrimary: true }, take: 1 },
        variants: { orderBy: { price: 'asc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }).catch(() => []),
    prisma.category.findMany({ where: { parentId: null }, orderBy: { sortOrder: 'asc' } }).catch(() => []),
  ])

  const totalPages = Math.ceil(total / limit)

  const buildUrl = (params: Partial<SearchParams>) => {
    const merged = { ...sp, ...params }
    const qs = Object.entries(merged)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
      .join('&')
    return `/shop?${qs}`
  }

  return (
    <>
      <Header />
      <main className="min-h-screen" style={{ backgroundColor: 'var(--ivory)' }}>
        {/* Order type toggle */}
        <div className="sticky top-16 z-40 bg-white border-b border-gray-200 py-3 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-4 flex-wrap">
            <div className="flex rounded-lg overflow-hidden border border-gray-300 text-sm">
              <Link href={buildUrl({ orderType: 'RETAIL', page: '1' })} className={`px-4 py-2 font-medium transition-colors ${orderType === 'RETAIL' ? 'text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`} style={orderType === 'RETAIL' ? { backgroundColor: 'var(--saffron)' } : {}}>
                Retail Purchase
              </Link>
              <Link href={buildUrl({ orderType: 'WHOLESALE', page: '1' })} className={`px-4 py-2 font-medium transition-colors ${orderType === 'WHOLESALE' ? 'text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`} style={orderType === 'WHOLESALE' ? { backgroundColor: 'var(--indigo)' } : {}}>
                Wholesale / Bulk
              </Link>
            </div>
            <span className="text-sm text-gray-500 ml-auto">{total} products found</span>
            <form method="get" action="/shop" className="flex items-center gap-2">
              {sp.category && <input type="hidden" name="category" value={sp.category} />}
              {sp.onSale && <input type="hidden" name="onSale" value={sp.onSale} />}
              {sp.featured && <input type="hidden" name="featured" value={sp.featured} />}
              {sp.search && <input type="hidden" name="search" value={sp.search} />}
              {sp.orderType && <input type="hidden" name="orderType" value={sp.orderType} />}
              <select name="sort" defaultValue={sp.sort ?? 'newest'} className="text-sm border border-gray-300 rounded-lg px-3 py-2">
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
              <button type="submit" className="text-xs px-3 py-2 rounded-lg text-white shrink-0" style={{ backgroundColor: 'var(--saffron)' }}>Sort</button>
            </form>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Sidebar filters */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 sticky top-32">
                <h3 className="font-semibold text-gray-800 mb-4">Filters</h3>

                {/* Categories */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Category</h4>
                  <div className="space-y-1">
                    <Link href={buildUrl({ category: undefined, page: '1' })} className={`block text-sm px-2 py-1 rounded transition-colors ${!sp.category ? 'font-semibold' : 'text-gray-600 hover:text-gray-900'}`} style={!sp.category ? { color: 'var(--saffron)' } : {}}>
                      All Products
                    </Link>
                    {categories.map((cat) => (
                      <Link key={cat.id} href={buildUrl({ category: cat.slug, page: '1' })} className={`block text-sm px-2 py-1 rounded transition-colors ${sp.category === cat.slug ? 'font-semibold' : 'text-gray-600 hover:text-gray-900'}`} style={sp.category === cat.slug ? { color: 'var(--saffron)' } : {}}>
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Price Range</h4>
                  <form method="get" action="/shop" className="flex gap-2 items-center">
                    {sp.category && <input type="hidden" name="category" value={sp.category} />}
                    {sp.onSale && <input type="hidden" name="onSale" value={sp.onSale} />}
                    {sp.featured && <input type="hidden" name="featured" value={sp.featured} />}
                    <input type="number" name="priceMin" placeholder="Min" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" defaultValue={sp.priceMin} />
                    <input type="number" name="priceMax" placeholder="Max" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" defaultValue={sp.priceMax} />
                    <button type="submit" className="text-xs px-2 py-1 rounded text-white shrink-0" style={{ backgroundColor: 'var(--saffron)' }}>Go</button>
                  </form>
                </div>

                {/* Quick filters */}
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Quick Filters</h4>
                  <div className="space-y-1">
                    <Link href={buildUrl({ onSale: 'true', featured: undefined, page: '1' })} className="flex items-center gap-2 text-sm px-2 py-1 rounded text-gray-600 hover:text-gray-900">
                      <span className="w-4 h-4 border border-gray-300 rounded flex items-center justify-center text-xs" style={sp.onSale === 'true' ? { backgroundColor: 'var(--saffron)', borderColor: 'var(--saffron)', color: 'white' } : {}}>
                        {sp.onSale === 'true' ? '✓' : ''}
                      </span>
                      On Sale
                    </Link>
                    <Link href={buildUrl({ featured: 'true', onSale: undefined, page: '1' })} className="flex items-center gap-2 text-sm px-2 py-1 rounded text-gray-600 hover:text-gray-900">
                      <span className="w-4 h-4 border border-gray-300 rounded flex items-center justify-center text-xs" style={sp.featured === 'true' ? { backgroundColor: 'var(--saffron)', borderColor: 'var(--saffron)', color: 'white' } : {}}>
                        {sp.featured === 'true' ? '✓' : ''}
                      </span>
                      Featured
                    </Link>
                  </div>
                </div>

                {(sp.category || sp.onSale || sp.featured || sp.priceMin || sp.priceMax) && (
                  <Link href="/shop" className="mt-4 block text-xs text-red-500 hover:underline">Clear all filters</Link>
                )}
              </div>
            </aside>

            {/* Product grid */}
            <div className="flex-1">
              {sp.search && (
                <p className="text-sm text-gray-600 mb-4">Search results for: <strong>&ldquo;{sp.search}&rdquo;</strong></p>
              )}

              {products.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">🏠</div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No products found</h3>
                  <p className="text-gray-500 text-sm">Try adjusting your filters</p>
                  <Link href="/shop" className="mt-4 inline-block text-sm font-medium hover:underline" style={{ color: 'var(--saffron)' }}>
                    View all products
                  </Link>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {products.map((p) => {
                      const image = p.images?.[0]?.url
                      const variant = p.variants?.[0]
                      const price = variant ? (orderType === 'WHOLESALE' ? Number(variant.wholesalePrice ?? variant.price) : Number(variant.price)) : null

                      return (
                        <Link key={p.id} href={`/shop/${p.slug}`} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-1 border border-gray-100">
                          <div className="relative aspect-square bg-gray-50">
                            {image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-4xl">🏠</div>
                            )}
                            {p.isOnSale && (
                              <span className="absolute top-2 left-2 text-white text-xs font-bold px-2 py-1 rounded" style={{ backgroundColor: 'var(--crimson)' }}>SALE</span>
                            )}
                            {p.isFeatured && (
                              <span className="absolute top-2 right-2 text-white text-xs font-bold px-2 py-1 rounded" style={{ backgroundColor: 'var(--gold)' }}>⭐</span>
                            )}
                          </div>
                          <div className="p-3">
                            <p className="text-xs text-gray-400 mb-1">{p.category.name}</p>
                            <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2">{p.name}</h3>
                            {price && (
                              <div>
                                <p className="text-sm font-bold" style={{ color: 'var(--saffron)' }}>₹{price.toLocaleString('en-IN')}</p>
                                {orderType === 'WHOLESALE' && <p className="text-xs text-gray-400">Wholesale price</p>}
                              </div>
                            )}
                          </div>
                        </Link>
                      )
                    })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-10">
                      {page > 1 && (
                        <Link href={buildUrl({ page: String(page - 1) })} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                          ← Prev
                        </Link>
                      )}
                      {[...Array(totalPages)].map((_, i) => (
                        <Link
                          key={i}
                          href={buildUrl({ page: String(i + 1) })}
                          className="px-4 py-2 border rounded-lg text-sm transition-colors"
                          style={page === i + 1 ? { backgroundColor: 'var(--saffron)', color: 'white', borderColor: 'var(--saffron)' } : { borderColor: '#d1d5db' }}
                        >
                          {i + 1}
                        </Link>
                      ))}
                      {page < totalPages && (
                        <Link href={buildUrl({ page: String(page + 1) })} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                          Next →
                        </Link>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <WovenBorderDivider />
      <Footer />
    </>
  )
}
