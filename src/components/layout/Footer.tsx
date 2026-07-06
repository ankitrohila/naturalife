'use client'

import Link from 'next/link'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { translateCatalogTerm } from '@/lib/i18n/translations'

const ICON = 'w-4 h-4 shrink-0'

function Pin() {
  return <svg className={ICON} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 21s7-5.7 7-11a7 7 0 10-14 0c0 5.3 7 11 7 11z" strokeLinejoin="round"/><circle cx="12" cy="10" r="2.5"/></svg>
}
function Phone() {
  return <svg className={ICON} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012 4.2 2 2 0 014 2h3a2 2 0 012 1.7c.1.9.4 1.8.7 2.7a2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.4-1.1a2 2 0 012.1-.5c.9.3 1.8.6 2.7.7a2 2 0 011.7 2z" strokeLinejoin="round"/></svg>
}
function Mail() {
  return <svg className={ICON} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6" strokeLinejoin="round"/></svg>
}
function Clock() {
  return <svg className={ICON} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round"/></svg>
}

export function Footer() {
  const { t, lang } = useLanguage()
  return (
    <footer className="bg-[var(--surface)] text-[var(--ink-soft)] border-t border-[var(--line)]">
      <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, transparent, var(--green-light), var(--green), var(--green-light), transparent)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo/naturalife-logo.png" alt="Naturalife Homecare" className="h-11 w-auto object-contain mb-4" />
            <p className="text-sm leading-relaxed mb-5">
              {t('footer_tagline')}
            </p>
            <div className="flex gap-2.5">
              {['Facebook', 'Instagram', 'YouTube', 'WhatsApp'].map((social) => (
                <Link key={social} href="#" aria-label={social}
                  className="w-9 h-9 flex items-center justify-center text-[var(--green-dark)] text-xs font-semibold bg-[var(--green-light)] hover:bg-[var(--green)] hover:text-white transition-colors">
                  {social[0]}
                </Link>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold text-[var(--ink)] mb-4 text-sm tracking-wide uppercase">{t('footer_shop_heading')}</h4>
            <ul className="space-y-2.5">
              {[
                [translateCatalogTerm('Doormats', lang), '/shop?category=doormats'],
                [translateCatalogTerm('Rugs & Dhurries', lang), '/shop?category=rugs'],
                [translateCatalogTerm('Bath Mats', lang), '/shop?category=mats'],
                [translateCatalogTerm('Cushion Covers', lang), '/shop?category=cushion-covers'],
                [translateCatalogTerm('Table Mats', lang), '/shop?category=table-mats'],
                [translateCatalogTerm('Stools', lang), '/shop?category=stools'],
                [t('shop_on_sale'), '/shop?onSale=true'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-sm hover:text-[var(--green)] transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-semibold text-[var(--ink)] mb-4 text-sm tracking-wide uppercase">{t('footer_information')}</h4>
            <ul className="space-y-2.5">
              {[
                [t('footer_about_us'), '/about'],
                [t('footer_contact_us'), '/contact'],
                [t('footer_custom_design'), '/custom-design'],
                [t('footer_wholesale'), '/contact'],
                [t('footer_privacy'), '/pages/privacy-policy'],
                [t('footer_terms'), '/pages/terms-and-conditions'],
                [t('footer_returns'), '/pages/return-refund-policy'],
                [t('footer_shipping'), '/pages/shipping-policy'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-sm hover:text-[var(--green)] transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact — the one place icons live */}
          <div>
            <h4 className="font-semibold text-[var(--ink)] mb-4 text-sm tracking-wide uppercase">{t('footer_contact_heading')}</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex gap-3 items-start"><span className="text-[var(--green)] mt-0.5"><Pin /></span><span>Naturalife Homecare, India</span></li>
              <li className="flex gap-3 items-center"><span className="text-[var(--green)]"><Phone /></span><a href="tel:+919876543210" className="hover:text-[var(--green)] transition-colors">+91 98765 43210</a></li>
              <li className="flex gap-3 items-center"><span className="text-[var(--green)]"><Mail /></span><a href="mailto:info@naturalife.co.in" className="hover:text-[var(--green)] transition-colors">info@naturalife.co.in</a></li>
              <li className="flex gap-3 items-center"><span className="text-[var(--green)]"><Clock /></span><span>Mon–Sat: 9am – 6pm</span></li>
            </ul>
            <div className="mt-6">
              <p className="text-xs text-[var(--ink-soft)] mb-2">{t('footer_accepted_payments')}</p>
              <div className="flex gap-2 flex-wrap text-xs">
                {['UPI', 'GPay', 'Visa', 'MC', 'COD'].map((p) => (
                  <span key={p} className="px-2 py-0.5 rounded border border-[var(--line)] text-[var(--ink-soft)]">{p}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--line)] py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-[var(--ink-soft)]">
          <p>© 2025 Naturalife Homecare. {t('footer_rights')}</p>
          <p>{t('footer_designed_in_india')} &nbsp;|&nbsp; {t('footer_gst')}</p>
        </div>
      </div>
    </footer>
  )
}
