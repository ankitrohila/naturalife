'use client'

import Link from 'next/link'

export function Footer() {
  return (
    <footer style={{ backgroundColor: '#1a2e1a', color: '#ccc' }}>
      {/* Green top accent */}
      <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, var(--green-dark), var(--green), var(--saffron), var(--green), var(--green-dark))' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://naturalife.co.in/wp-content/uploads/2020/07/naturalifelogo.png"
              alt="Naturalife Homecare"
              className="h-12 w-auto object-contain mb-4"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
            <p className="text-sm leading-relaxed mb-5 text-gray-400">
              Making homes a living one since 2012. Quality microfiber doormats, rugs, and home textiles crafted for modern Indian homes.
            </p>
            <div className="flex gap-3">
              {['Facebook', 'Instagram', 'YouTube', 'WhatsApp'].map((social) => (
                <Link key={social} href="#" className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold transition-colors"
                  style={{ backgroundColor: 'rgba(135,182,110,0.25)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--green)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(135,182,110,0.25)' }}>
                  {social[0]}
                </Link>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm tracking-wide uppercase">Shop</h4>
            <ul className="space-y-2.5">
              {[
                ['Doormats', '/shop?category=doormats'],
                ['Rugs & Dhurries', '/shop?category=rugs-dhurries'],
                ['Bath Mats', '/shop?category=bath-mat'],
                ['Cushion Covers', '/shop?category=cushion-covers'],
                ['Table Runners', '/shop?category=table-runner'],
                ['Stools', '/shop?category=stools'],
                ['On Sale', '/shop?onSale=true'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                    <span style={{ color: 'var(--green)' }}>›</span> {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm tracking-wide uppercase">Information</h4>
            <ul className="space-y-2.5">
              {[
                ['About Us', '/about'],
                ['Contact Us', '/contact'],
                ['Wholesale Enquiry', '/contact'],
                ['Privacy Policy', '/pages/privacy-policy'],
                ['Terms & Conditions', '/pages/terms-and-conditions'],
                ['Return & Refund', '/pages/return-refund-policy'],
                ['Shipping Policy', '/pages/shipping-policy'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                    <span style={{ color: 'var(--green)' }}>›</span> {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm tracking-wide uppercase">Contact Us</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex gap-3">
                <span style={{ color: 'var(--green)' }}>📍</span>
                <span>Naturalife Homecare, India</span>
              </li>
              <li className="flex gap-3">
                <span style={{ color: 'var(--green)' }}>📞</span>
                <a href="tel:+919876543210" className="hover:text-white transition-colors">+91 98765 43210</a>
              </li>
              <li className="flex gap-3">
                <span style={{ color: 'var(--green)' }}>✉️</span>
                <a href="mailto:info@naturalife.co.in" className="hover:text-white transition-colors">info@naturalife.co.in</a>
              </li>
              <li className="flex gap-3">
                <span style={{ color: 'var(--green)' }}>⏰</span>
                <span>Mon–Sat: 9am – 6pm</span>
              </li>
            </ul>
            <div className="mt-6">
              <p className="text-xs text-gray-500 mb-2">Accepted Payments</p>
              <div className="flex gap-2 flex-wrap text-xs">
                {['UPI', 'GPay', 'Visa', 'MC', 'COD'].map((p) => (
                  <span key={p} className="px-2 py-0.5 rounded border border-gray-600 text-gray-300">{p}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-700 py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-500">
          <p>© 2025 Naturalife Homecare. All rights reserved.</p>
          <p>Designed with ♥ in India &nbsp;|&nbsp; GST registered business</p>
        </div>
      </div>
    </footer>
  )
}
