'use client'

import Link from 'next/link'
import { HeroSlider } from '@/components/home/HeroSlider'
import { SiteIntro } from '@/components/intro/SiteIntro'
import { HomeProducts } from '@/components/home/HomeProducts'
import { TestimonialsCarousel } from '@/components/home/TestimonialsCarousel'
import { LifestyleCarousel } from '@/components/home/LifestyleCarousel'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { translateCatalogTerm } from '@/lib/i18n/translations'

interface Category { name: string; slug: string; img: string; count: string }
interface Testimonial { name: string; city: string; review: string; rating?: number }

export function HomePageClient({
  categories,
  homeProducts,
  lifestyleSlides,
  trending,
  activeOffers,
  showTestimonials,
}: {
  categories: Category[]
  homeProducts: any[]
  lifestyleSlides: { image: string; products: any[] }[]
  trending: { name: string; slug: string; price: number; img: string }[]
  activeOffers: string[]
  showTestimonials: Testimonial[]
}) {
  const { t, lang } = useLanguage()

  return (
    <div style={{ backgroundColor: '#fff', color: 'var(--ink)' }}>
      <SiteIntro trending={trending} offers={activeOffers} />
      {activeOffers.length > 0 && (
        <div className="text-white text-xs sm:text-sm py-2 px-4 text-center font-medium" style={{ background: 'linear-gradient(90deg, var(--green-dark), var(--green))' }}>
          {activeOffers.slice(0, 3).join('　•　')}
        </div>
      )}
      {/* ── Hero Slider ── */}
      <HeroSlider />

      {/* ── Featured Categories ── */}
      <section className="py-16 px-4" style={{ backgroundColor: '#F6F6F6' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--green)' }}>{t('home_explore_range')}</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: 'var(--font-display)', color: '#222' }}>{t('home_featured_categories')}</h2>
            <div className="ornamental-divider w-48 mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.map((cat) => (
              <Link key={cat.slug} href={`/shop?category=${cat.slug}`} className="group relative overflow-hidden rounded-none shadow-md hover:shadow-xl transition-all duration-300">
                <div className="aspect-square relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                    <h3 className="font-bold text-base md:text-lg text-white">{translateCatalogTerm(cat.name, lang)}</h3>
                    <p className="text-xs text-gray-200 mt-0.5">{cat.count}</p>
                  </div>
                </div>
                <div className="absolute top-3 right-3 text-white text-xs font-semibold px-2 py-1 " style={{ backgroundColor: 'var(--green)' }}>{t('home_shop_link')} →</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Promo Grid ── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-6">
          {/* Custom design promo */}
          <div className="relative overflow-hidden shadow-md" style={{ backgroundColor: 'var(--surface)' }}>
            <div className="grid grid-cols-2 h-56 sm:h-64">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/hero/hero-persian-stack.jpg" alt="Custom carpets" className="w-full h-full object-cover" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/hero/hero-rugs-display.jpg" alt="Custom carpets" className="w-full h-full object-cover" />
            </div>
            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { icon: '🎨', label: t('home_choose_design') },
                  { icon: '📐', label: t('home_enter_size') },
                  { icon: '🛒', label: t('home_place_order') },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="w-11 h-11 mx-auto mb-2 flex items-center justify-center text-lg" style={{ backgroundColor: 'var(--green-light)' }}>{s.icon}</div>
                    <p className="text-xs font-medium text-gray-600 leading-tight">{s.label}</p>
                  </div>
                ))}
              </div>
              <h3 className="text-xl font-bold mb-4 whitespace-pre-line" style={{ color: 'var(--ink)' }}>{t('home_custom_promo_title')}</h3>
              <Link href="/custom-design" className="inline-flex items-center gap-2 px-6 py-3 text-white font-semibold text-sm" style={{ backgroundColor: 'var(--green)' }}>
                {t('home_get_started')} →
              </Link>
            </div>
          </div>

          {/* Two stacked banners */}
          <div className="grid grid-rows-2 gap-6">
            <Link href="/register" className="relative overflow-hidden shadow-md h-40 sm:h-full flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/lifestyle/room-4.jpg" alt="Sign up offer" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/55" />
              <div className="relative z-10 p-6 sm:p-8 text-white whitespace-pre-line" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                <p className="text-lg sm:text-xl font-semibold leading-snug">{t('home_signup_offer')}</p>
              </div>
            </Link>
            <Link href="/shop?featured=true" className="relative overflow-hidden shadow-md h-40 sm:h-full flex items-end">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/lifestyle/room-5.jpg" alt="Explore gifting" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="relative z-10 p-6">
                <span className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: 'var(--green)' }}>
                  {t('home_explore_gifts')} →
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Best Sellers ── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--green)' }}>{t('home_customer_favourites')}</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: 'var(--font-display)', color: '#222' }}>{t('home_best_sellers')}</h2>
            <div className="ornamental-divider w-48 mx-auto mt-4" />
          </div>
          <HomeProducts products={homeProducts} />
          <div className="text-center mt-10">
            <Link href="/shop" className="inline-block px-8 py-3 text-white font-semibold text-sm shadow-md" style={{ backgroundColor: 'var(--green)' }}>
              {t('home_view_all_products')} →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Shop the Look ── */}
      {lifestyleSlides.length > 0 && (
        <section className="py-16 px-4" style={{ backgroundColor: 'var(--ivory)' }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-sm font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--green)' }}>{t('home_styled_for_you')}</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: 'var(--font-display)', color: '#222' }}>{t('home_shop_the_look')}</h2>
              <div className="ornamental-divider w-48 mx-auto mt-4" />
            </div>
            <LifestyleCarousel slides={lifestyleSlides} />
          </div>
        </section>
      )}

      {/* ── USP Strip ── */}
      <section className="py-12" style={{ background: 'linear-gradient(135deg, var(--green-dark) 0%, var(--green) 100%)' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white text-center">
            {[
              { title: t('home_micro_fiber_title'), desc: t('home_micro_fiber_desc') },
              { title: t('home_water_absorbent_title'), desc: t('home_water_absorbent_desc') },
              { title: t('home_anti_skid_title'), desc: t('home_anti_skid_desc') },
              { title: t('home_machine_washable_title'), desc: t('home_machine_washable_desc') },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 px-2" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.35)' }}>
                <h4 className="font-semibold text-base md:text-lg text-white">{item.title}</h4>
                <p className="text-xs md:text-sm text-white opacity-90">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sale Banner ── */}
      <section className="relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/carpet/carpet-alt.jpg" alt="Sale" className="w-full h-72 object-cover object-center" />
        <div className="absolute inset-0 bg-black/65 flex flex-col items-center justify-center text-white text-center px-4" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
          <p className="text-xs font-semibold tracking-widest uppercase mb-2 text-white opacity-90">{t('home_sale_limited_time')}</p>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white" style={{ fontFamily: 'var(--font-display)' }}>{t('home_sale_title')}</h2>
          <p className="text-base mb-6 text-gray-100">{t('home_sale_subtitle')}</p>
          <Link href="/shop?onSale=true" className="px-8 py-3 font-semibold text-sm" style={{ backgroundColor: 'var(--green)', color: 'white' }}>
            {t('home_sale_cta')} →
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
                <div key={s.l} className="text-center p-3 bg-white rounded-none shadow-sm border border-gray-100">
                  <div className="text-2xl font-bold" style={{ color: 'var(--green)' }}>{s.n}</div>
                  <div className="text-xs text-gray-500 mt-1">{s.l}</div>
                </div>
              ))}
            </div>
            <Link href="/about" className="inline-block px-6 py-2.5 text-white font-semibold text-sm" style={{ backgroundColor: 'var(--green)' }}>
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
              <img key={i} src={src} alt="Naturalife product" className="w-full rounded-none object-cover aspect-square shadow-sm" />
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--green)' }}>{t('home_reviews_kicker')}</p>
            <h2 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)', color: '#222' }}>{t('home_reviews_title')}</h2>
          </div>
          <TestimonialsCarousel testimonials={showTestimonials} />
        </div>
      </section>

      {/* ── Subscribe ── */}
      <section className="py-14 px-4" style={{ background: 'linear-gradient(135deg, #f0f8ea 0%, #e8f5e0 100%)' }}>
        <div className="max-w-xl mx-auto text-center">
          <p className="text-sm font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--green-dark)' }}>{t('home_newsletter_kicker')}</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ fontFamily: 'var(--font-display)', color: '#222' }}>
            {t('home_newsletter_title')}
          </h2>
          <p className="text-gray-600 text-sm mb-6">{t('home_newsletter_subtitle')}</p>
          <form action="/api/subscribe" method="post" className="flex gap-2 max-w-md mx-auto">
            <input type="email" name="email" placeholder="Enter your email" className="flex-1 border border-gray-300 px-5 py-2.5 text-sm focus:outline-none" required />
            <button type="submit" className="px-5 py-2.5 text-white text-sm font-semibold shrink-0" style={{ backgroundColor: 'var(--green)' }}>
              {t('home_subscribe')}
            </button>
          </form>
        </div>
      </section>

    </div>
  )
}
