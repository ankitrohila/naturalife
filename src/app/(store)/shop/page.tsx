import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ProductCard } from '@/components/shop/ProductCard'
import { SortDropdown } from '@/components/shop/SortDropdown'
import { PriceRangeFilter } from '@/components/shop/PriceRangeFilter'
import { ShopSidebarToggle } from '@/components/shop/ShopSidebarToggle'
import { T, CatalogTerm } from '@/components/shared/T'
import { X } from 'lucide-react'

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
  color?: string
  size?: string
  material?: string
  inStock?: string
}

const materialLabel: Record<string, string> = {
  PLASTIC: 'Plastic', RUBBER: 'Rubber', JUTE: 'Jute',
  COTTON: 'Cotton', POLYESTER: 'Polyester', WOOL: 'Wool', OTHER: 'Other',
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams
  const page = parseInt(sp.page ?? '1')
  const limit = 12
  const orderType = sp.orderType ?? 'RETAIL'

  const selectedColors = sp.color ? sp.color.split(',').filter(Boolean) : []
  const selectedSizes = sp.size ? sp.size.split(',').filter(Boolean) : []
  const selectedMaterials = sp.material ? sp.material.split(',').filter(Boolean) : []

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
  if (selectedMaterials.length > 0) where.material = { in: selectedMaterials }
  if (sp.inStock === 'true') where.variants = { some: { stock: { gt: 0 } } }

  const andClauses: any[] = []
  if (selectedColors.length > 0) {
    andClauses.push({ attributeValues: { some: { attribute: { name: 'COLOR' }, value: { value: { in: selectedColors } } } } })
  }
  if (selectedSizes.length > 0) {
    andClauses.push({ attributeValues: { some: { attribute: { name: 'SIZE' }, value: { value: { in: selectedSizes } } } } })
  }

  // where clause WITHOUT price filter — used to compute the dynamic price range bounds
  const wherePriceless = { ...where, ...(andClauses.length > 0 ? { AND: [...andClauses] } : {}) }

  if (sp.priceMin || sp.priceMax) {
    const priceFilter: any = {}
    if (sp.priceMin) priceFilter.gte = parseFloat(sp.priceMin)
    if (sp.priceMax) priceFilter.lte = parseFloat(sp.priceMax)
    andClauses.push({ variants: { some: { price: priceFilter } } })
  }
  if (andClauses.length > 0) where.AND = andClauses

  const orderBy: any =
    sp.sort === 'price-asc' ? { variants: { _count: 'asc' } } :
    { createdAt: 'desc' }

  const [total, products, categories, colorValues, sizeValues, materialGroups, priceBounds] = await Promise.all([
    prisma.product.count({ where }).catch(() => 0),
    prisma.product.findMany({
      where,
      include: {
        category: { select: { name: true, slug: true } },
        images: { where: { isPrimary: true }, take: 1 },
        variants: { orderBy: { price: 'asc' }, take: 1 },
        attributeValues: { include: { attribute: true, value: true } },
      },
      orderBy: sp.sort === 'price-desc' || sp.sort === 'price-asc' ? { createdAt: 'desc' } : orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }).catch(() => []),
    prisma.category.findMany({
      where: { parentId: null },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { products: { where: { status: 'ACTIVE' } } } } },
    }).catch(() => []),
    prisma.attributeValue.findMany({
      where: { attribute: { name: 'COLOR' } },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { productAttributeValues: { where: { product: { status: 'ACTIVE' } } } } } },
    }).catch(() => []),
    prisma.attributeValue.findMany({
      where: { attribute: { name: 'SIZE' } },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { productAttributeValues: { where: { product: { status: 'ACTIVE' } } } } } },
    }).catch(() => []),
    prisma.product.groupBy({ by: ['material'], where: { status: 'ACTIVE' }, _count: true }).catch(() => []),
    prisma.productVariant.aggregate({
      where: { product: wherePriceless },
      _min: { price: true },
      _max: { price: true },
    }).catch(() => ({ _min: { price: 0 }, _max: { price: 10000 } })),
  ])

  const catalogMin = Math.floor(Number(priceBounds._min.price ?? 0))
  const catalogMax = Math.ceil(Number(priceBounds._max.price ?? 10000))

  // Sort by price client-side if requested (variant price sort across relation is unreliable)
  if (sp.sort === 'price-asc' || sp.sort === 'price-desc') {
    products.sort((a, b) => {
      const pa = Number(a.variants[0]?.price ?? 0)
      const pb = Number(b.variants[0]?.price ?? 0)
      return sp.sort === 'price-asc' ? pa - pb : pb - pa
    })
  }

  const totalPages = Math.ceil(total / limit)

  const buildUrl = (params: Partial<SearchParams>) => {
    const merged = { ...sp, ...params }
    const qs = Object.entries(merged)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
      .join('&')
    return `/shop?${qs}`
  }

  const toggleInList = (current: string[], value: string) =>
    current.includes(value) ? current.filter((v) => v !== value) : [...current, value]

  const colorUrl = (value: string) => buildUrl({ color: toggleInList(selectedColors, value).join(',') || undefined, page: '1' })
  const sizeUrl = (value: string) => buildUrl({ size: toggleInList(selectedSizes, value).join(',') || undefined, page: '1' })
  const materialUrl = (value: string) => buildUrl({ material: toggleInList(selectedMaterials, value).join(',') || undefined, page: '1' })

  const activeFilters: { label: string; removeUrl: string }[] = []
  if (sp.category) {
    const cat = categories.find((c) => c.slug === sp.category)
    activeFilters.push({ label: cat?.name ?? sp.category, removeUrl: buildUrl({ category: undefined, page: '1' }) })
  }
  selectedColors.forEach((c) => {
    const cv = colorValues.find((v) => v.value === c)
    activeFilters.push({ label: cv?.label ?? c, removeUrl: colorUrl(c) })
  })
  selectedSizes.forEach((s) => {
    const sv = sizeValues.find((v) => v.value === s)
    activeFilters.push({ label: sv?.label ?? s, removeUrl: sizeUrl(s) })
  })
  selectedMaterials.forEach((m) => {
    activeFilters.push({ label: materialLabel[m] ?? m, removeUrl: materialUrl(m) })
  })
  if (sp.onSale === 'true') activeFilters.push({ label: 'On Sale', removeUrl: buildUrl({ onSale: undefined, page: '1' }) })
  if (sp.featured === 'true') activeFilters.push({ label: 'Featured', removeUrl: buildUrl({ featured: undefined, page: '1' }) })
  if (sp.inStock === 'true') activeFilters.push({ label: 'In Stock', removeUrl: buildUrl({ inStock: undefined, page: '1' }) })
  if (sp.priceMin || sp.priceMax) {
    activeFilters.push({ label: `₹${sp.priceMin ?? '0'} – ₹${sp.priceMax ?? '∞'}`, removeUrl: buildUrl({ priceMin: undefined, priceMax: undefined, page: '1' }) })
  }

  const hasAnyFilter = activeFilters.length > 0

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--ivory)' }}>
      {/* Order type toggle */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-200 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-4 flex-wrap">
          <div className="flex rounded-none overflow-hidden border border-gray-300 text-sm">
            <Link href={buildUrl({ orderType: 'RETAIL', page: '1' })} className={`px-4 py-2 font-medium transition-colors ${orderType === 'RETAIL' ? 'text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`} style={orderType === 'RETAIL' ? { backgroundColor: 'var(--saffron)' } : {}}>
              <T k="shop_retail_purchase" />
            </Link>
            <Link href={buildUrl({ orderType: 'WHOLESALE', page: '1' })} className={`px-4 py-2 font-medium transition-colors ${orderType === 'WHOLESALE' ? 'text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`} style={orderType === 'WHOLESALE' ? { backgroundColor: 'var(--indigo)' } : {}}>
              <T k="shop_wholesale_bulk" />
            </Link>
          </div>
          <span className="text-sm text-gray-500 ml-auto">{total} <T k="shop_products_found" /></span>
          <SortDropdown />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar filters */}
          <ShopSidebarToggle>
              {/* Categories */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-600 mb-2"><T k="shop_category" /></h4>
                <div className="space-y-1">
                  <Link href={buildUrl({ category: undefined, page: '1' })} className={`flex items-center justify-between text-sm px-2 py-1 transition-colors ${!sp.category ? 'font-semibold' : 'text-gray-600 hover:text-gray-900'}`} style={!sp.category ? { color: 'var(--saffron)' } : {}}>
                    <span><T k="shop_all_products" /></span>
                  </Link>
                  {categories.map((cat) => (
                    <Link key={cat.id} href={buildUrl({ category: cat.slug, page: '1' })} className={`flex items-center justify-between text-sm px-2 py-1 transition-colors ${sp.category === cat.slug ? 'font-semibold' : 'text-gray-600 hover:text-gray-900'}`} style={sp.category === cat.slug ? { color: 'var(--saffron)' } : {}}>
                      <span><CatalogTerm term={cat.name} /></span>
                      <span className="text-xs text-gray-400">({cat._count.products})</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Color */}
              {colorValues.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-600 mb-2"><T k="shop_color" /></h4>
                  <div className="space-y-1">
                    {colorValues.map((cv) => {
                      const active = selectedColors.includes(cv.value)
                      return (
                        <Link key={cv.id} href={colorUrl(cv.value)} className={`flex items-center gap-2 text-sm px-2 py-1 transition-colors ${active ? 'font-semibold text-[var(--ink)]' : 'text-gray-600 hover:text-gray-900'}`}>
                          <span
                            className="w-4 h-4 rounded-full border border-gray-300 shrink-0"
                            style={cv.imageUrl ? { backgroundImage: `url(${cv.imageUrl})`, backgroundSize: 'cover' } : { backgroundColor: cv.hexColor ?? '#ddd' }}
                          />
                          <span className="flex-1"><CatalogTerm term={cv.label} /></span>
                          <span className="text-xs text-gray-400">({cv._count.productAttributeValues})</span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Size */}
              {sizeValues.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-600 mb-2"><T k="shop_size" /></h4>
                  <div className="flex flex-wrap gap-2">
                    {sizeValues.map((sv) => {
                      const active = selectedSizes.includes(sv.value)
                      return (
                        <Link
                          key={sv.id}
                          href={sizeUrl(sv.value)}
                          className="px-2.5 py-1 border text-xs transition-colors"
                          style={active ? { borderColor: 'var(--green)', color: 'var(--green)', backgroundColor: 'var(--green-light)' } : { borderColor: '#e5e5e5', color: '#555' }}
                        >
                          {sv.label} ({sv._count.productAttributeValues})
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Material */}
              {materialGroups.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-600 mb-2"><T k="shop_material" /></h4>
                  <div className="space-y-1">
                    {materialGroups.map((mg: any) => {
                      const active = selectedMaterials.includes(mg.material)
                      return (
                        <Link key={mg.material} href={materialUrl(mg.material)} className={`flex items-center justify-between text-sm px-2 py-1 transition-colors ${active ? 'font-semibold text-[var(--ink)]' : 'text-gray-600 hover:text-gray-900'}`}>
                          <span><CatalogTerm term={materialLabel[mg.material] ?? mg.material} /></span>
                          <span className="text-xs text-gray-400">({mg._count})</span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Price Range — dynamic bounds computed from the current catalog/filter set */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-600 mb-2"><T k="shop_price_range" /></h4>
                <PriceRangeFilter catalogMin={catalogMin} catalogMax={catalogMax} />
              </div>

              {/* Quick filters */}
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2"><T k="shop_quick_filters" /></h4>
                <div className="space-y-1">
                  <Link href={buildUrl({ onSale: sp.onSale === 'true' ? undefined : 'true', page: '1' })} className="flex items-center gap-2 text-sm px-2 py-1 text-gray-600 hover:text-gray-900">
                    <span className="w-4 h-4 border border-gray-300 flex items-center justify-center text-xs" style={sp.onSale === 'true' ? { backgroundColor: 'var(--saffron)', borderColor: 'var(--saffron)', color: 'white' } : {}}>
                      {sp.onSale === 'true' ? '✓' : ''}
                    </span>
                    <T k="shop_on_sale" />
                  </Link>
                  <Link href={buildUrl({ featured: sp.featured === 'true' ? undefined : 'true', page: '1' })} className="flex items-center gap-2 text-sm px-2 py-1 text-gray-600 hover:text-gray-900">
                    <span className="w-4 h-4 border border-gray-300 flex items-center justify-center text-xs" style={sp.featured === 'true' ? { backgroundColor: 'var(--saffron)', borderColor: 'var(--saffron)', color: 'white' } : {}}>
                      {sp.featured === 'true' ? '✓' : ''}
                    </span>
                    <T k="shop_featured" />
                  </Link>
                  <Link href={buildUrl({ inStock: sp.inStock === 'true' ? undefined : 'true', page: '1' })} className="flex items-center gap-2 text-sm px-2 py-1 text-gray-600 hover:text-gray-900">
                    <span className="w-4 h-4 border border-gray-300 flex items-center justify-center text-xs" style={sp.inStock === 'true' ? { backgroundColor: 'var(--saffron)', borderColor: 'var(--saffron)', color: 'white' } : {}}>
                      {sp.inStock === 'true' ? '✓' : ''}
                    </span>
                    <T k="shop_in_stock_only" />
                  </Link>
                </div>
              </div>

              {hasAnyFilter && (
                <Link href="/shop" className="mt-4 block text-xs text-red-500 hover:underline"><T k="shop_clear_all" /></Link>
              )}
          </ShopSidebarToggle>

          {/* Product grid */}
          <div className="flex-1">
            {sp.search && (
              <p className="text-sm text-gray-600 mb-4">Search results for: <strong>&ldquo;{sp.search}&rdquo;</strong></p>
            )}

            {/* Active filter chips */}
            {hasAnyFilter && (
              <div className="flex flex-wrap gap-2 mb-5">
                {activeFilters.map((f, i) => (
                  <Link key={i} href={f.removeUrl} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--green)] hover:text-[var(--green)] transition-colors">
                    {f.label}
                    <X size={12} />
                  </Link>
                ))}
                <Link href="/shop" className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-500 hover:underline">
                  <T k="shop_clear_all" fallback="Clear all" />
                </Link>
              </div>
            )}

            {products.length === 0 ? (
              <div className="text-center py-20">
                <h3 className="text-lg font-semibold text-gray-600 mb-2"><T k="shop_no_products" /></h3>
                <p className="text-gray-500 text-sm"><T k="shop_try_adjusting" /></p>
                <Link href="/shop" className="mt-4 inline-block text-sm font-medium hover:underline" style={{ color: 'var(--saffron)' }}>
                  <T k="shop_view_all" />
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.map((p) => {
                    const image = p.images?.[0]?.url ?? null
                    const variant = p.variants?.[0]
                    const price = variant ? (orderType === 'WHOLESALE' ? Number(variant.wholesalePrice ?? variant.price) : Number(variant.price)) : null
                    const colors = p.attributeValues
                      .filter((av) => av.attribute.name === 'COLOR')
                      .map((av) => ({ id: av.value.id, label: av.value.label, hexColor: av.value.hexColor, imageUrl: av.value.imageUrl }))
                      .filter((c, i, arr) => arr.findIndex((x) => x.id === c.id) === i)

                    return (
                      <ProductCard
                        key={p.id}
                        product={{
                          id: p.id,
                          name: p.name,
                          slug: p.slug,
                          image,
                          categoryName: p.category.name,
                          price,
                          compareAtPrice: variant?.compareAtPrice ? Number(variant.compareAtPrice) : null,
                          isOnSale: p.isOnSale,
                          isFeatured: p.isFeatured,
                          colors,
                          wholesaleLabel: orderType === 'WHOLESALE',
                          variantId: variant?.id,
                          sku: variant?.sku,
                          wholesalePrice: variant ? Number(variant.wholesalePrice) : undefined,
                          taxRate: Number(p.taxRate),
                        }}
                      />
                    )
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    {page > 1 && (
                      <Link href={buildUrl({ page: String(page - 1) })} className="px-4 py-2 border border-gray-300 rounded-none text-sm hover:bg-gray-50">
                        ← <T k="shop_prev" />
                      </Link>
                    )}
                    {[...Array(totalPages)].map((_, i) => (
                      <Link
                        key={i}
                        href={buildUrl({ page: String(i + 1) })}
                        className="px-4 py-2 border rounded-none text-sm transition-colors"
                        style={page === i + 1 ? { backgroundColor: 'var(--saffron)', color: 'white', borderColor: 'var(--saffron)' } : { borderColor: '#d1d5db' }}
                      >
                        {i + 1}
                      </Link>
                    ))}
                    {page < totalPages && (
                      <Link href={buildUrl({ page: String(page + 1) })} className="px-4 py-2 border border-gray-300 rounded-none text-sm hover:bg-gray-50">
                        <T k="shop_next" /> →
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
  )
}
