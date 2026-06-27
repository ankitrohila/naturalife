import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { WovenBorderDivider } from '@/components/shared/WovenBorderDivider'

export const metadata = { title: 'About Us', description: 'Learn about Naturalife — handcrafted Indian home textiles since 2005.' }

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="py-20 text-white text-center" style={{ backgroundColor: 'var(--indigo)' }}>
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--gold)' }}>Our Story</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>Weaving Traditions Since 2005</h1>
          <p className="text-lg opacity-80 max-w-2xl mx-auto px-4">500+ artisan partners. 15+ years of excellence. One enduring passion for Indian craftsmanship.</p>
        </section>

        <WovenBorderDivider />

        <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="aspect-square rounded-2xl flex items-center justify-center text-9xl" style={{ backgroundColor: 'var(--cream)' }}>🏺</div>
            <div>
              <h2 className="text-3xl font-bold mb-5" style={{ fontFamily: 'var(--font-display)', color: 'var(--indigo)' }}>Born from Tradition</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Naturalife was founded with a single vision: to bring the rich heritage of Indian textile craftsmanship to modern homes — without compromising on authenticity or artisan welfare.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                We work with over 500 skilled artisans across Rajasthan, Gujarat, and West Bengal, preserving traditional weaving and dyeing techniques that have been passed down through generations. Each artisan brings decades of expertise and a unique cultural perspective to every product they create.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Our products are made from natural, sustainable materials — coir, cotton, jute, and wool — processed using eco-friendly methods. We believe in fair trade practices and ensure our artisans receive fair compensation for their exceptional skill and hard work.
              </p>
            </div>
          </div>
        </section>

        <WovenBorderDivider />

        {/* Stats */}
        <section className="py-16" style={{ backgroundColor: 'var(--cream)' }}>
          <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[['500+', 'Artisan Partners'], ['15+', 'Years of Excellence'], ['20+', 'States Served'], ['50,000+', 'Happy Customers']].map(([value, label]) => (
              <div key={label} className="bg-white rounded-2xl p-6 text-center shadow-sm border border-amber-100">
                <div className="text-3xl font-bold mb-2" style={{ color: 'var(--saffron)', fontFamily: 'var(--font-display)' }}>{value}</div>
                <div className="text-sm text-gray-600">{label}</div>
              </div>
            ))}
          </div>
        </section>

        <WovenBorderDivider />

        {/* Values */}
        <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ fontFamily: 'var(--font-display)', color: 'var(--indigo)' }}>Our Values</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '🤝', title: 'Fair Trade', desc: 'Every artisan receives fair wages and works in safe, dignified conditions. We believe prosperity should flow through the entire supply chain.' },
              { icon: '🌱', title: 'Sustainability', desc: 'Natural materials, eco-friendly dyes, and minimal waste. We are committed to leaving a lighter footprint on our planet.' },
              { icon: '🎨', title: 'Authenticity', desc: 'Traditional techniques, authentic patterns, real craftsmanship. We never cut corners on quality or cultural integrity.' },
            ].map((v) => (
              <div key={v.title} className="rounded-2xl p-6 border border-amber-100" style={{ backgroundColor: 'var(--cream)' }}>
                <div className="text-4xl mb-3">{v.icon}</div>
                <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--indigo)' }}>{v.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <WovenBorderDivider />
      <Footer />
    </>
  )
}
