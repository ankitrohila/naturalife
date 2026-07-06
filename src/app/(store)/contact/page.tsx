import { WovenBorderDivider } from '@/components/shared/WovenBorderDivider'

export const metadata = { title: 'Contact Us', description: 'Get in touch with Naturalife — we\'d love to hear from you.' }

export default function ContactPage() {
  return (
    <main>
      <section className="py-16 text-white text-center" style={{ backgroundColor: 'var(--indigo)' }}>
        <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>Contact Us</h1>
        <p className="opacity-80">We&apos;d love to hear from you</p>
      </section>
      <WovenBorderDivider />
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Form */}
          <div className="bg-white rounded-none p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--indigo)', fontFamily: 'var(--font-display)' }}>Send us a message</h2>
            <form action="/api/contact" method="post" className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" name="name" required className="w-full border border-gray-300 rounded-none px-4 py-3 text-sm focus:outline-none" placeholder="Your full name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" name="email" required className="w-full border border-gray-300 rounded-none px-4 py-3 text-sm focus:outline-none" placeholder="your@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" name="phone" className="w-full border border-gray-300 rounded-none px-4 py-3 text-sm focus:outline-none" placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select name="subject" className="w-full border border-gray-300 rounded-none px-4 py-3 text-sm focus:outline-none">
                  <option>General Enquiry</option>
                  <option>Wholesale / Bulk Order</option>
                  <option>Order Support</option>
                  <option>Product Question</option>
                  <option>Return / Refund</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea name="message" required rows={5} className="w-full border border-gray-300 rounded-none px-4 py-3 text-sm focus:outline-none" placeholder="Tell us how we can help..." />
              </div>
              <button type="submit" className="w-full py-3 rounded-none text-white font-semibold" style={{ backgroundColor: 'var(--saffron)' }}>
                Send Message
              </button>
            </form>
          </div>

          {/* Contact info */}
          <div className="space-y-6">
            <div className="rounded-none p-6 border border-[var(--line)]" style={{ backgroundColor: 'var(--surface)' }}>
              <h3 className="font-semibold mb-4" style={{ color: 'var(--ink)' }}>Get in Touch</h3>
              <ul className="space-y-4 text-sm text-gray-600">
                <li className="flex gap-3 items-start">
                  <svg className="w-4 h-4 shrink-0 mt-0.5 text-[var(--green)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 21s7-5.7 7-11a7 7 0 10-14 0c0 5.3 7 11 7 11z" strokeLinejoin="round"/><circle cx="12" cy="10" r="2.5"/></svg>
                  <span>Plot No. 123, Industrial Area<br />Jaipur, Rajasthan - 302001</span>
                </li>
                <li className="flex gap-3 items-center">
                  <svg className="w-4 h-4 shrink-0 text-[var(--green)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012 4.2 2 2 0 014 2h3a2 2 0 012 1.7c.1.9.4 1.8.7 2.7a2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.4-1.1a2 2 0 012.1-.5c.9.3 1.8.6 2.7.7a2 2 0 011.7 2z" strokeLinejoin="round"/></svg>
                  <a href="tel:+919876543210" className="hover:text-[var(--green)]">+91 98765 43210</a>
                </li>
                <li className="flex gap-3 items-center">
                  <svg className="w-4 h-4 shrink-0 text-[var(--green)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6" strokeLinejoin="round"/></svg>
                  <a href="mailto:info@naturalife.in" className="hover:text-[var(--green)]">info@naturalife.in</a>
                </li>
                <li className="flex gap-3 items-center">
                  <svg className="w-4 h-4 shrink-0 text-[var(--green)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span>Mon–Sat: 9:00 AM – 6:00 PM IST</span>
                </li>
              </ul>
            </div>
            <div className="rounded-none p-6 border border-[var(--line)]" style={{ backgroundColor: 'var(--surface)' }}>
              <h3 className="font-semibold mb-3" style={{ color: 'var(--ink)' }}>Wholesale Enquiries</h3>
              <p className="text-sm text-gray-600 mb-3">Interested in bulk orders or becoming a distributor? We serve 20+ Indian states.</p>
              <a href="mailto:wholesale@naturalife.in" className="text-sm font-semibold hover:underline" style={{ color: 'var(--saffron)' }}>wholesale@naturalife.in →</a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
