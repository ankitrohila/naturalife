import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const metadata = { title: 'Products — Admin' }

interface SP { search?: string; category?: string; status?: string; page?: string }

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams
  const page = parseInt(sp.page ?? '1')
  const limit = 20

  const where: any = {}
  if (sp.status) where.status = sp.status
  if (sp.category) where.categoryId = sp.category
  if (sp.search) where.OR = [{ name: { contains: sp.search, mode: 'insensitive' } }, { sku: { contains: sp.search, mode: 'insensitive' } }]

  const [total, products, categories] = await Promise.all([
    prisma.product.count({ where }).catch(() => 0),
    prisma.product.findMany({
      where,
      include: {
        category: { select: { name: true } },
        images: { where: { isPrimary: true }, take: 1 },
        variants: { select: { price: true, stock: true }, orderBy: { price: 'asc' }, take: 1 },
        _count: { select: { variants: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }).catch(() => []),
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: { sortOrder: 'asc' } }).catch(() => []),
  ])

  const statusBg: Record<string, string> = { ACTIVE: 'bg-green-50 text-green-700', DRAFT: 'bg-yellow-50 text-yellow-700', ARCHIVED: 'bg-gray-100 text-gray-500' }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Link href="/admin/products/new" className="px-4 py-2 text-sm text-white rounded-lg font-medium" style={{ backgroundColor: 'var(--saffron)' }}>
          + New Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5 shadow-sm">
        <form className="flex flex-wrap gap-3">
          <input name="search" defaultValue={sp.search} placeholder="Search name or SKU..." className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-40" />
          <select name="category" defaultValue={sp.category ?? ''} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select name="status" defaultValue={sp.status ?? ''} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <button type="submit" className="px-4 py-2 text-sm text-white rounded-lg font-medium" style={{ backgroundColor: 'var(--saffron)' }}>Filter</button>
          <Link href="/admin/products" className="px-4 py-2 text-sm border border-gray-300 rounded-lg font-medium text-gray-600 hover:bg-gray-50">Clear</Link>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 text-sm text-gray-500">{total} products</div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['', 'Product', 'SKU', 'Category', 'Price', 'Stock', 'Status', 'Flags', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-10 text-center text-gray-400 text-sm">No products found</td></tr>
            ) : products.map((p) => {
              const image = p.images[0]?.url
              const variant = p.variants[0]
              return (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="pl-4 py-3 w-12">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100">
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-[var(--surface-2)]" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{p.name}</p>
                    <p className="text-xs text-gray-400">{p._count.variants} variants</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{p.sku}</td>
                  <td className="px-4 py-3 text-gray-600">{p.category.name}</td>
                  <td className="px-4 py-3 font-semibold">
                    {variant ? `₹${Number(variant.price).toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={variant && variant.stock <= 5 ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                      {variant?.stock ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBg[p.status]}`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs space-x-1">
                    {p.isFeatured && <span className="bg-[var(--green-light)] text-[var(--green-dark)] px-1.5 py-0.5 rounded font-medium">Featured</span>}
                    {p.isOnSale && <span className="bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-medium">SALE</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/products/${p.id}`} className="text-xs font-medium hover:underline mr-3" style={{ color: 'var(--saffron)' }}>Edit</Link>
                    <Link href={`/shop/${p.slug}`} target="_blank" className="text-xs text-gray-400 hover:underline">View</Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
