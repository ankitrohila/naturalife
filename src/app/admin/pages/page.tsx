import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function AdminPagesPage() {
  const pages = await prisma.page.findMany({ orderBy: { slug: 'asc' } }).catch(() => [])

  const defaultPages = [
    { slug: 'about', title: 'About Us', status: 'PUBLISHED' },
    { slug: 'privacy-policy', title: 'Privacy Policy', status: 'PUBLISHED' },
    { slug: 'terms-and-conditions', title: 'Terms & Conditions', status: 'PUBLISHED' },
    { slug: 'return-refund-policy', title: 'Return & Refund Policy', status: 'PUBLISHED' },
    { slug: 'shipping-policy', title: 'Shipping Policy', status: 'PUBLISHED' },
  ]

  const displayPages = pages.length > 0 ? pages : defaultPages

  return (
    <>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">CMS Pages</h1>
              <p className="text-sm text-gray-500 mt-1">Manage static pages like About, Privacy Policy, etc.</p>
            </div>
            <button className="px-4 py-2 text-white rounded-lg text-sm font-medium" style={{ backgroundColor: 'var(--green)' }}>
              + New Page
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead style={{ backgroundColor: '#F6F6F6' }}>
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Title</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">URL</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {displayPages.map((p, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{p.title}</td>
                    <td className="px-4 py-3">
                      <Link href={`/pages/${p.slug}`} target="_blank" className="text-xs font-mono hover:underline" style={{ color: 'var(--green)' }}>
                        /pages/{p.slug}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                        {(p as any).status ?? 'PUBLISHED'}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button className="text-xs px-2 py-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-50">Edit</button>
                      <Link href={`/pages/${p.slug}`} target="_blank" className="text-xs px-2 py-1 rounded text-white" style={{ backgroundColor: 'var(--green)' }}>
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
            <strong>Tip:</strong> Run <code className="bg-blue-100 px-1 rounded">npm run db:seed</code> to auto-create all standard pages (Privacy Policy, Terms, Return Policy, Shipping Policy).
          </div>
        </div>
    </>
  )
}
