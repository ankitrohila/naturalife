import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { HeroSlider } from '@/components/home/HeroSlider'
import { SiteIntro } from '@/components/intro/SiteIntro'
import { prisma } from '@/lib/prisma'

const FEATURED_PRODUCTS = [
  { name: 'NATURALIFE DOORMAT BB-11', slug: 'dm-001', price: 499, img: '/images/products/p-sq-26.jpg', tag: 'Best Seller' },
  { name: 'NATURALIFE MICRO SHAG DOORMAT BB-73', slug: 'dm-002', price: 415, img: '/images/products/p-sq-73.jpg', tag: 'New' },
  { name: 'NATURALIFE DOORMAT BB-10', slug: 'dm-003', price: 499, img: '/images/products/p-blkgre.jpg', tag: 'Sale' },
  { name: 'NATURALIFE REVERSIBLE DOORMAT BB-138', slug: 'dm-004', price: 320, img: '/images/products/p-sq-25.jpg', tag: 'Popular' },
  { name: 'NATURALIFE REVERSIBLE DOORMAT BB-137', slug: 'dm-005', price: 320, img: '/images/products/p-sq-1.jpg', tag: null },
  { name: 'NATURALIFE DHURRIE', slug: 'dh-001', price: 320, img: '/images/products/p-brown.jpg', tag: 'Sale' },
  { name: 'NATURALIFE RUG', slug: 'rg-001', price: 575, img: '/images/products/p-sq-2.jpg', tag: 'New' },
  { name: 'NATURALIFE CUSHION COVER', slug: 'cc-001', price: 599, img: '/images/products/p-sq-3.jpg', tag: null },
]

const CATEGORIES = [
  { name: 'Doormats', slug: 'doormats', img: '/images/products/p-sq-26.jpg', count: '50+ styles' },
  { name: 'Rugs & Dhurries', slug: 'rugs', img: '/images/products/p-brown.jpg', count: '30+ styles' },
  { name: 'Bath Mats', slug: 'mats', img: '/images/products/p-sq-73.jpg', count: '20+ styles' },
  { name: 'Cushion Covers', slug: 'cushion-covers', img: '/images/products/p-blkgre.jpg', count: '40+ styles' },
]

export default async function HomePage() {
  const [dbProducts, testimonials] = await Promise.all([
    prisma.product.findMany({
      where: { status: 'ACTIVE', isFeatured: true },
      include: { images: { where: { isPrimary: true }, take: 1 }, variants: { orderBy: { price: 'asc' }, take: 1 } },
      take: 8,
    }).catch(() => []),
    prisma.testimonial.findMany({ where: { isVisible: true }, take: 3 }).catch(() => []),
  ])

  const displayProducts = dbProducts.length > 0 ? dbProducts.map(p => ({
    name: p.name,
    slug: p.slug,
    price: p.variants[0] ? Number(p.variants[0].price) : 0,
    img: p.images[0]?.url ?? FEATURED_PRODUCTS[0].img,
    tag: p.isOnSale ? 'Sale' : p.isFeatured ? 'Featured' : null,
  })) : FEATURED_PRODUCTS

  const trending = displayProducts.slice(0, 3).map(p => ({
    name: p.name, slug: p.slug, price: p.price, img: p.img,
  }))

  const showTestimonials = testimonials.length > 0 ? testimonials.map(t => ({
    name: t.name, city: t.location ?? '', review: t.text
  })) : [
    { name: 'Priya Sharma', city: 'Mumbai', review: 'The microfiber doormat is absolutely amazing! Super soft, water absorbent, and looks great at our entrance. Highly recommend!' },
    { name: 'Rahul Verma', city: 'Delhi', review: 'Bought 3 doormats for different rooms. Quality is top-notch and the anti-skid backing gives great peace of mind. Fast delivery too!' },
    { name: 'Anita Patel', city: 'Ahmedabad', review: 'The reversible doormat is such a smart product. Love that I get two looks in one. The colors are exactly as shown in the pictures.' },
  ]

  return (
    <div style={{ backgroundColor: '#fff', color: 'var(--ink)' }}>
      <SiteIntro trending={trending} />
      <Header />

      {/* ── Hero Slider ── */}
      <HeroSlider />

      {/* ── Featured Categories ── */}
      <section className="py-16 px-4" style={{ backgroundColor: '#F6F6F6' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--green)' }}>Explore Our Range</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: 'var(--font-display)', color: '#222' }}>Featured Categories</h2>
            <div className="ornamental-divider w-48 mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {CATEGORIES.map((cat) => (
              <Link key={cat.slug} href={`/shop?category=${cat.slug}`} className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300">
                <div className="aspect-square relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="font-bold text-base md:text-lg">{cat.name}</h3>
                    <p className="text-xs text-gray-300 mt-0.5">{cat.count}</p>
                  </div>
                </div>
                <div className="absolute top-3 right-3 text-white text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--green)' }}>Shop →</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Best Sellers ── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--green)' }}>Customer Favourites</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: 'var(--font-display)', color: '#222' }}>Best Sellers</h2>
            <div className="ornamental-divider w-48 mx-auto mt-4" />
          </div>
          <div className="flex gap-2 justify-center mb-8 flex-wrap">
            {[['All', '/shop'], ['Best Seller', '/shop?featured=true'], ['On Sale', '/shop?onSale=true'], ['New Arrivals', '/shop?sort=newest']].map(([tab, href]) => (
              <Link key={tab} href={href} className="px-4 py-1.5 text-sm font-medium rounded-full border transition-all" style={{ borderColor: 'var(--green)', color: 'var(--green)' }}>
                {tab}
              </Link>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {displayProducts.map((p, i) => (
              <Link key={i} href={`/shop/${p.slug}`} className="product-card group bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                <div className="relative overflow-hidden aspect-square bg-gray-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400" />
                  {p.tag && (
                    <span className="absolute top-2 left-2 text-white text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: p.tag === 'Sale' ? 'var(--crimson)' : p.tag === 'New' ? 'var(--green)' : 'var(--gold)' }}>
                      {p.tag}
                    </span>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <div className="m-2 py-2 text-center text-xs font-semibold text-white rounded-lg" style={{ backgroundColor: 'var(--green)' }}>Quick View</div>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 mb-1.5 leading-snug">{p.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold" style={{ color: 'var(--green)' }}>₹{p.price.toLocaleString('en-IN')}</span>
                    <span className="text-xs text-gray-400 line-through">₹{Math.round(p.price * 1.3).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/shop" className="inline-block px-8 py-3 text-white font-semibold rounded-full text-sm shadow-md" style={{ backgroundColor: 'var(--green)' }}>
              View All Products →
            </Link>
          </div>
        </div>
      </section>

      {/* ── USP Strip ── */}
      <section className="py-12" style={{ background: 'linear-gradient(135deg, var(--green-dark) 0%, var(--green) 100%)' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white text-center">
            {[
              { title: '100% Micro Fiber', desc: 'Premium quality materials' },
              { title: 'Water Absorbent', desc: 'Super soft & quick-dry' },
              { title: 'Anti-Skid Backing', desc: 'Safe for all floors' },
              { title: 'Machine Washable', desc: '40°C easy care' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 px-2">
                <h4 className="font-semibold text-base md:text-lg">{item.title}</h4>
                <p className="text-xs md:text-sm opacity-80">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sale Banner ── */}
      <section className="relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/carpet/carpet-alt.jpg" alt="Sale" className="w-full h-72 object-cover object-center" />
        <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center text-white text-center px-4">
          <p className="text-xs font-semibold tracking-widest uppercase mb-2 opacity-80">Limited Time</p>
          <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>UP TO 70% OFF</h2>
          <p className="text-base mb-6 text-gray-200">On our entire collection of doormats, rugs & dhurries</p>
          <Link href="/shop?onSale=true" className="px-8 py-3 font-semibold rounded-full text-sm" style={{ backgroundColor: 'var(--green)', color: 'white' }}>
            Shop the Sale →
          </Link>
        </div>
      </section>

      {/* ── About ── */}
      <section className="py-16 px-4" style={{ backgroundColor: '#F6F6F6' }}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--green)' }}>Our Story</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-5 leading-snug" style={{ fontFamily: 'var(--font-display)', color: '#222' }}>
              Making Homes a Living One
            </h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Our mission is to bring together a diverse, curated collection of beautiful home textiles from across India. Naturalife was built on the belief that every home deserves quality, comfort, and style.
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              From handwoven dhurries to microfiber doormats crafted for modern homes — every product is selected with care, tested for quality, and offered at an honest price.
            </p>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[{ n: '12+', l: 'Years on Market' }, { n: '50k+', l: 'Happy Customers' }, { n: '24×7', l: 'Support' }].map((s) => (
                <div key={s.l} className="text-center p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="text-2xl font-bold" style={{ color: 'var(--green)' }}>{s.n}</div>
                  <div className="text-xs text-gray-500 mt-1">{s.l}</div>
                </div>
              ))}
            </div>
            <Link href="/about" className="inline-block px-6 py-2.5 text-white font-semibold rounded-full text-sm" style={{ backgroundColor: 'var(--green)' }}>
              Learn More →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              '/images/products/p-sq-26.jpg',
              '/images/products/p-sq-73.jpg',
              '/images/products/p-brown.jpg',
              '/images/products/p-blkgre.jpg',
            ].map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={src} alt="Naturalife product" className="w-full rounded-xl object-cover aspect-square shadow-sm" />
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--green)' }}>Reviews</p>
            <h2 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)', color: '#222' }}>Happy Customers</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {showTestimonials.map((t, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex gap-1 mb-3">{[...Array(5)].map((_, j) => <span key={j} className="text-yellow-400 text-sm">★</span>)}</div>
                <p className="text-gray-600 text-sm mb-4 italic leading-relaxed">&ldquo;{t.review}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: 'var(--green)' }}>{t.name[0]}</div>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">{t.name}</p>
                    {t.city && <p className="text-xs text-gray-400">{t.city}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Subscribe ── */}
      <section className="py-14 px-4" style={{ background: 'linear-gradient(135deg, #f0f8ea 0%, #e8f5e0 100%)' }}>
        <div className="max-w-xl mx-auto text-center">
          <p className="text-sm font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--green-dark)' }}>Newsletter</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ fontFamily: 'var(--font-display)', color: '#222' }}>
            Get Exclusive Deals & New Arrivals
          </h2>
          <p className="text-gray-600 text-sm mb-6">Subscribe and get 10% off your first order.</p>
          <form action="/api/subscribe" method="post" className="flex gap-2 max-w-md mx-auto">
            <input type="email" name="email" placeholder="Enter your email" className="flex-1 border border-gray-300 rounded-full px-5 py-2.5 text-sm focus:outline-none" required />
            <button type="submit" className="px-5 py-2.5 text-white rounded-full text-sm font-semibold shrink-0" style={{ backgroundColor: 'var(--green)' }}>
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  )
}
