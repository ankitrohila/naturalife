'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, X } from 'lucide-react'
import type { NavigationCategory } from '@/app/actions/categories'

function CategoryContent({ cat, onNavigate }: { cat: NavigationCategory; onNavigate: () => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Subcategories</p>
        <div className="space-y-2">
          {cat.children.length > 0 ? (
            cat.children.map((child) => (
              <Link
                key={child.id}
                href={`/shop?category=${child.slug}`}
                onClick={onNavigate}
                className="flex items-center justify-between text-sm text-[var(--ink)] hover:text-[var(--green)] transition-colors"
              >
                <span>{child.name}</span>
                <span className="text-xs text-gray-400">({child.productCount})</span>
              </Link>
            ))
          ) : (
            <p className="text-sm text-gray-500">Browse all {cat.name.toLowerCase()}</p>
          )}
        </div>
        <Link
          href={`/shop?category=${cat.slug}`}
          onClick={onNavigate}
          className="inline-block mt-5 text-sm font-semibold text-[var(--green)] hover:underline"
        >
          Shop All {cat.name} →
        </Link>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Featured &amp; On Sale</p>
        {cat.featuredProducts.length > 0 ? (
          <div className="space-y-3">
            {cat.featuredProducts.map((p) => (
              <Link
                key={p.id}
                href={`/shop/${p.slug}`}
                onClick={onNavigate}
                className="flex items-center gap-3 group"
              >
                <div className="w-14 h-14 shrink-0 overflow-hidden bg-[var(--surface)]">
                  {p.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-[var(--ink)] group-hover:text-[var(--green)] transition-colors truncate">{p.name}</p>
                  {p.price != null && <p className="text-xs text-gray-500">₹{p.price.toLocaleString('en-IN')}</p>}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No featured products yet.</p>
        )}
      </div>

      <div className="hidden lg:block">
        {cat.image ? (
          <Link href={`/shop?category=${cat.slug}`} onClick={onNavigate} className="block overflow-hidden aspect-[4/3]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cat.image} alt={cat.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </Link>
        ) : (
          <div className="aspect-[4/3] flex items-center justify-center" style={{ backgroundColor: 'var(--surface)' }}>
            <p className="text-sm text-gray-400">Explore {cat.name}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export function CategoriesMegaMenu({
  categories,
  onClose,
}: {
  categories: NavigationCategory[]
  onClose: () => void
}) {
  const [activeId, setActiveId] = useState<string | null>(categories[0]?.id ?? null)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)

  if (categories.length === 0) {
    return <p className="text-sm text-gray-500 px-4 py-6">No categories available.</p>
  }

  const activeCategory = categories.find((c) => c.id === activeId) ?? categories[0]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Product Categories</p>
        <button onClick={onClose} className="text-gray-400 hover:text-[var(--ink)] transition-colors" aria-label="Close categories">
          <X size={18} />
        </button>
      </div>

      {/* Desktop: vertical tabs + content pane */}
      <div className="hidden lg:flex gap-8">
        <div className="w-56 shrink-0 border-r border-[var(--line)] pr-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onMouseEnter={() => setActiveId(cat.id)}
              onClick={() => setActiveId(cat.id)}
              className={`block w-full text-left px-3 py-2.5 text-sm font-medium uppercase tracking-wide transition-colors ${
                activeCategory.id === cat.id ? 'text-white' : 'text-[var(--ink)] hover:bg-[var(--surface)]'
              }`}
              style={activeCategory.id === cat.id ? { backgroundColor: 'var(--green)' } : {}}
            >
              {cat.name}
            </button>
          ))}
        </div>
        <div className="flex-1">
          <CategoryContent cat={activeCategory} onNavigate={onClose} />
        </div>
      </div>

      {/* Mobile / tablet: accordion */}
      <div className="lg:hidden divide-y divide-[var(--line)] border-t border-[var(--line)]">
        {categories.map((cat) => (
          <div key={cat.id}>
            <button
              onClick={() => setMobileExpanded((prev) => (prev === cat.id ? null : cat.id))}
              className="flex items-center justify-between w-full px-1 py-3 text-sm font-semibold uppercase tracking-wide text-[var(--ink)]"
            >
              {cat.name}
              <ChevronDown size={16} className={`transition-transform ${mobileExpanded === cat.id ? 'rotate-180' : ''}`} />
            </button>
            {mobileExpanded === cat.id && (
              <div className="pb-5">
                <CategoryContent cat={cat} onNavigate={onClose} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
