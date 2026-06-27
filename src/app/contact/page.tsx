import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { WovenBorderDivider } from '@/components/shared/WovenBorderDivider'

export const metadata = { title: 'Contact Us', description: 'Get in touch with Naturalife — we\'d love to hear from you.' }

export default function ContactPage() {
  return (
    <>
      <Header />
      <main>
        <section className="py-16 text-white text-center" style={{ backgroundColor: 'var(--indigo)' }}>
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>Contact Us</h1>
          <p className="opacity-80">We&apos;d love to hear from you</p>
        </section>
        <WovenBorderDivider />
        <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Form */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--indigo)', fontFamily: 'var(--font-display)' }}>Send us a message</h2>
              <form action="/api/contact" method="post" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" name="name" required className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none" placeholder="Your full name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" name="email" required className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none" placeholder="your@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="tel" name="phone" className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none" placeholder="+91 98765 43210" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <select name="subject" className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none">
                    <option>General Enquiry</option>
                    <option>Wholesale / Bulk Order</option>
                    <option>Order Support</option>
                    <option>Product Question</option>
                    <option>Return / Refund</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea name="message" required rows={5} className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none" placeholder="Tell us how we can help..." />
                </div>
                <button type="submit" className="w-full py-3 rounded-xl text-white font-semibold" style={{ backgroundColor: 'var(--saffron)' }}>
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact info */}
            <div className="space-y-6">
              <div className="rounded-2xl p-6 border border-amber-100" style={{ backgroundColor: 'var(--cream)' }}>
                <h3 className="font-semibold mb-4" style={{ color: 'var(--indigo)' }}>Get in Touch</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <p>📍 Plot No. 123, Industrial Area<br />Jaipur, Rajasthan - 302001</p>
                  <p>📞 <a href="tel:+919876543210" className="hover:underline">+91 98765 43210</a></p>
                  <p>✉️ <a href="mailto:info@naturalife.in" className="hover:underline">info@naturalife.in</a></p>
                  <p>💬 WhatsApp: +91 98765 43210</p>
                  <p>🕐 Mon–Sat: 9:00 AM – 6:00 PM IST</p>
                </div>
              </div>
              <div className="rounded-2xl p-6 border border-amber-100" style={{ backgroundColor: 'var(--cream)' }}>
                <h3 className="font-semibold mb-3" style={{ color: 'var(--indigo)' }}>Wholesale Enquiries</h3>
                <p className="text-sm text-gray-600 mb-3">Interested in bulk orders or becoming a distributor? We serve 20+ Indian states.</p>
                <a href="mailto:wholesale@naturalife.in" className="text-sm font-semibold hover:underline" style={{ color: 'var(--saffron)' }}>wholesale@naturalife.in →</a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <WovenBorderDivider />
      <Footer />
    </>
  )
}
