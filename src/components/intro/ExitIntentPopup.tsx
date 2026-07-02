'use client'

import Link from 'next/link'

export type TrendingItem = { name: string; slug: string; price: number; img: string }

export function ExitIntentPopup({
  items,
  code = 'NATURALIFE10',
  offers = [],
  onClose,
}: {
  items: TrendingItem[]
  code?: string
  offers?: string[]
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl grid md:grid-cols-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-[var(--ink)] shadow"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>

        {/* Left — offer */}
        <div className="relative p-8 md:p-10 flex flex-col justify-center text-white min-h-[360px]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'url(/images/carpet/carpet-alt.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--green-dark)]/85 to-black/70" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">Wait! before you leave…</h2>
            <p className="text-white/85 mb-5">Get 10% off for your first order</p>
            <div className="inline-block bg-white text-[var(--ink)] font-semibold tracking-[0.2em] px-6 py-3 rounded-md mb-5">
              {code}
            </div>
            <p className="text-sm text-white/80 mb-4 max-w-xs">
              Use the above code to get 10% off on your first order at checkout.
            </p>
            {offers.length > 0 && (
              <ul className="mb-6 space-y-1 max-w-xs">
                {offers.slice(0, 3).map((o, i) => (
                  <li key={i} className="text-xs text-white/90 flex gap-2"><span className="text-white">•</span>{o}</li>
                ))}
              </ul>
            )}
            <Link
              href="/shop"
              onClick={onClose}
              className="inline-flex items-center gap-2 bg-white text-[var(--ink)] font-semibold px-7 py-3 rounded-full hover:bg-[var(--green-light)] transition-colors w-fit"
            >
              Shop Now
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Right — trending products */}
        <div className="p-8 md:p-10">
          <h3 className="text-xl font-semibold text-[var(--ink)] mb-4">Recommended Products</h3>
          <div className="h-px bg-[var(--line)] mb-5" />
          <div className="space-y-5">
            {items.slice(0, 3).map((it) => (
              <Link
                key={it.slug}
                href={`/shop/${it.slug}`}
                onClick={onClose}
                className="flex items-center gap-4 group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={it.img}
                  alt={it.name}
                  className="w-20 h-20 rounded-xl object-cover bg-[var(--surface-2)] shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--green)] group-hover:underline line-clamp-2 uppercase">
                    {it.name}
                  </p>
                  <p className="text-sm text-[var(--ink-soft)] mt-1">
                    ₹{it.price.toLocaleString('en-IN')} – ₹{Math.round(it.price * 1.6).toLocaleString('en-IN')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <Link
            href="/shop"
            onClick={onClose}
            className="mt-7 block text-center text-sm font-semibold text-[var(--ink)] border border-[var(--line)] rounded-full py-2.5 hover:bg-[var(--surface)] transition-colors"
          >
            View all products
          </Link>
        </div>
      </div>
    </div>
  )
}
