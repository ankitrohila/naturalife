import { prisma } from '@/lib/prisma'

export default async function AdminMarketingPage() {
  const [marqueeOffers, testimonials, emailSubs] = await Promise.all([
    prisma.marqueeOffer.findMany({ orderBy: { sortOrder: 'asc' } }).catch(() => []),
    prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }).catch(() => []),
    prisma.emailSubscription.count().catch(() => 0),
  ])

  return (
    <>
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Marketing & Promotions</h1>
            <p className="text-sm text-gray-500 mt-1">Manage marquee banners, testimonials, and subscriber list</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
              <p className="text-3xl font-bold" style={{ color: 'var(--green)' }}>{marqueeOffers.length}</p>
              <p className="text-xs text-gray-500 mt-1">Marquee Offers</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
              <p className="text-3xl font-bold" style={{ color: 'var(--green)' }}>{testimonials.length}</p>
              <p className="text-xs text-gray-500 mt-1">Testimonials</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
              <p className="text-3xl font-bold" style={{ color: 'var(--green)' }}>{emailSubs}</p>
              <p className="text-xs text-gray-500 mt-1">Email Subscribers</p>
            </div>
          </div>

          {/* Marquee Offers */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">Promotional Offers</h2>
              <span className="text-xs text-gray-400">Used across promotions &amp; campaigns</span>
            </div>
            {marqueeOffers.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No marquee offers. Run db:seed to create defaults.</p>
            ) : (
              <div className="space-y-2">
                {marqueeOffers.map((offer) => (
                  <div key={offer.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 font-mono text-xs">#{offer.sortOrder}</span>
                      <span className="text-sm text-gray-700">{offer.text}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${offer.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {offer.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4">
              <p className="text-xs text-gray-400 mb-2">Live Preview:</p>
              <div className="text-white text-xs py-2 px-4 text-center rounded" style={{ backgroundColor: 'var(--green)' }}>
                {marqueeOffers.filter(o => o.isActive).map(o => o.text).join('  ·  ') || 'UP TO 70% OFF  ·  FREE SHIPPING ABOVE ₹999'}
              </div>
            </div>
          </div>

          {/* Testimonials */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">Customer Testimonials</h2>
              <div className="text-xs text-gray-400">{testimonials.filter(t => t.isVisible).length} visible / {testimonials.length} total</div>
            </div>
            {testimonials.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No testimonials yet.</p>
            ) : (
              <div className="space-y-3">
                {testimonials.map((t) => (
                  <div key={t.id} className="flex items-start justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50">
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-gray-800">{t.name}</span>
                        {t.location && <span className="text-xs text-gray-400">{t.location}</span>}
                        <span className="text-[var(--green)] text-xs">{'★'.repeat(t.rating ?? 5)}</span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 italic">&ldquo;{t.text}&rdquo;</p>
                    </div>
                    <span className={`shrink-0 text-xs px-2 py-1 rounded-full ${t.isVisible ? 'bg-green-100 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                      {t.isVisible ? 'Visible' : 'Hidden'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
    </>
  )
}
