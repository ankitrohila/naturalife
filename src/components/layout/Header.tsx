'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/store/cart'
import { useSession, signOut } from 'next-auth/react'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Doormats', href: '/shop?category=doormats' },
  { label: 'Rugs & Dhurries', href: '/shop?category=rugs-dhurries' },
  { label: 'Bath Mats', href: '/shop?category=bath-mat' },
  { label: 'Cushion Covers', href: '/shop?category=cushion-covers' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQ, setSearchQ] = useState('')
  const itemCount = useCartStore((s) => s.getItemCount())
  const { data: session } = useSession()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--line)] bg-white/80 backdrop-blur-md">
      {/* Main header */}
      <div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo/naturalife-logo.png"
                alt="Naturalife Homecare"
                className="h-9 w-auto object-contain"
              />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-sm font-medium text-gray-700 rounded-md transition-all hover:bg-green-50"
                  style={{ color: '#444' }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right icons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Search"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                </svg>
              </button>

              {session ? (
                <div className="hidden sm:flex items-center gap-1">
                  {(session.user as any)?.role === 'ADMIN' && (
                    <Link href="/admin" className="text-xs px-2 py-1 rounded text-white font-medium" style={{ backgroundColor: 'var(--saffron)' }}>
                      Admin
                    </Link>
                  )}
                  <Link href="/account" className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </Link>
                  <button onClick={() => signOut()} className="text-xs text-gray-500 hover:text-red-500 hidden md:block">Sign out</button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="hidden sm:block text-sm font-medium text-white px-3 py-1.5 rounded-lg"
                  style={{ backgroundColor: 'var(--green)' }}
                >
                  Login
                </Link>
              )}

              <Link href="/cart" className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {mounted && itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--green)', fontSize: '10px' }}>
                    {itemCount}
                  </span>
                )}
              </Link>

              <button
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Menu"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileOpen
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search dropdown */}
      {searchOpen && (
        <div className="border-b border-gray-100 bg-white px-4 py-3 shadow-md">
          <form action="/shop" method="get" className="max-w-2xl mx-auto flex gap-2">
            <input
              type="text"
              name="search"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Search doormats, rugs, cushion covers..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-green-400"
              autoFocus
            />
            <button type="submit" className="px-5 py-2 text-white rounded-lg text-sm font-semibold" style={{ backgroundColor: 'var(--green)' }}>
              Search
            </button>
          </form>
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-b border-gray-100 shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-gray-100 flex gap-2">
              {session ? (
                <>
                  <Link href="/account" className="flex-1 text-center py-2 text-sm font-medium rounded-lg text-white" style={{ backgroundColor: 'var(--green)' }}>My Account</Link>
                  <button onClick={() => signOut()} className="flex-1 text-center py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-600">Sign Out</button>
                </>
              ) : (
                <>
                  <Link href="/login" className="flex-1 text-center py-2 text-sm font-medium rounded-lg text-white" style={{ backgroundColor: 'var(--green)' }}>Login</Link>
                  <Link href="/register" className="flex-1 text-center py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-600">Register</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
