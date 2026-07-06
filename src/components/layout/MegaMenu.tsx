'use client'

import Link from 'next/link'
import { useLanguage } from '@/components/providers/LanguageProvider'

export function MegaMenu() {
  const { t } = useLanguage()

  const navLinks = [
    { label: t('nav_home'), href: '/' },
    { label: t('nav_about'), href: '/about' },
    { label: t('nav_shop'), href: '/shop' },
    { label: t('nav_custom'), href: '/custom-design' },
    { label: t('nav_gallery'), href: '/gallery' },
    { label: t('nav_contact'), href: '/contact' },
  ]

  return (
    <nav className="hidden lg:block border-t border-[var(--line)] bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="py-3 text-sm font-semibold tracking-wide uppercase text-[var(--ink)] hover:text-[var(--green)] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
