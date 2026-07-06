'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/store/cart'
import { useSession, signOut } from 'next-auth/react'
import { Search, ShoppingCart, User, Menu, Camera, LayoutDashboard, Package, Coins, Download, MapPin, CreditCard, Heart, LifeBuoy, LogOut, Grid3x3 } from 'lucide-react'
import { MegaMenu } from './MegaMenu'
import { MobileDrawer } from './MobileDrawer'
import { CategoriesMegaMenu } from './CategoriesMegaMenu'
import { LanguageToggle } from './LanguageToggle'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { ImageSearchModal } from '@/components/search/ImageSearchModal'
import type { NavigationCategory } from '@/app/actions/categories'

const ACCOUNT_MENU = [
  { label: 'Dashboard', href: '/account', icon: LayoutDashboard },
  { label: 'Orders', href: '/account/orders', icon: Package },
  { label: 'Store Credits', href: '/account/store-credits', icon: Coins },
  { label: 'Downloads', href: '/account/downloads', icon: Download },
  { label: 'Addresses', href: '/account/addresses', icon: MapPin },
  { label: 'Payment Methods', href: '/account/payment-methods', icon: CreditCard },
  { label: 'Account Details', href: '/account/details', icon: User },
  { label: 'Wishlist', href: '/account/wishlist', icon: Heart },
  { label: 'Get Support', href: '/account/tickets', icon: LifeBuoy },
]

export function Header({ categories = [] }: { categories?: NavigationCategory[] }) {
  const { t } = useLanguage()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [imageSearchOpen, setImageSearchOpen] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [searchQ, setSearchQ] = useState('')
  const itemCount = useCartStore((s) => s.getItemCount())
  const { data: session } = useSession()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const accountCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const openAccountMenu = useCallback(() => {
    if (accountCloseTimer.current) clearTimeout(accountCloseTimer.current)
    setAccountMenuOpen(true)
  }, [])
  const startCloseAccountMenu = useCallback(() => {
    accountCloseTimer.current = setTimeout(() => setAccountMenuOpen(false), 250)
  }, [])

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white border-b border-[var(--line)] relative">
        {/* Main bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 text-gray-600 hover:text-[var(--ink)] transition-colors"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo/naturalife-logo.png"
                alt="Naturalife Homecare"
                className="h-9 w-auto object-contain"
              />
            </Link>

            {/* Desktop persistent search */}
            <form
              action="/shop"
              method="get"
              className="hidden lg:flex items-center flex-1 max-w-md mx-8 border border-[var(--line)] bg-[var(--surface)] transition-colors focus-within:border-[var(--green)]"
            >
              <Search size={16} className="ml-3 text-gray-400 shrink-0" />
              <input
                type="text"
                name="search"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder={t('search_placeholder')}
                className="flex-1 px-3 py-2 text-sm bg-transparent focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setImageSearchOpen(true)}
                className="px-2.5 text-gray-400 hover:text-[var(--green)] transition-colors shrink-0"
                aria-label="Search by image"
                title="Search by image"
              >
                <Camera size={17} />
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white shrink-0"
                style={{ backgroundColor: 'var(--green)' }}
              >
                Search
              </button>
            </form>

            {/* Right icons */}
            <div className="flex items-center gap-1">
              {/* Mobile search toggle */}
              <button
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-[var(--ink)] transition-colors"
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              {/* Categories mega-menu toggle */}
              <button
                onClick={() => setCategoriesOpen((v) => !v)}
                className={`flex items-center gap-1.5 p-2 transition-colors ${
                  categoriesOpen ? 'text-[var(--green)]' : 'text-gray-600 hover:text-[var(--ink)]'
                }`}
                aria-label="Product Categories"
                title={t('categories_tooltip')}
              >
                <Grid3x3 size={20} />
              </button>

              {/* Language toggle */}
              <LanguageToggle />

              {/* Desktop account */}
              {session ? (
                <div className="hidden lg:flex items-center gap-1">
                  {(session.user as any)?.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      className="text-xs px-2 py-1 text-white font-medium"
                      style={{ backgroundColor: 'var(--green)' }}
                    >
                      Admin
                    </Link>
                  )}
                  <div
                    className="relative"
                    onMouseEnter={openAccountMenu}
                    onMouseLeave={startCloseAccountMenu}
                  >
                    <Link
                      href="/account"
                      className="p-2 text-gray-600 hover:text-[var(--ink)] transition-colors flex items-center"
                    >
                      <User size={20} />
                    </Link>

                    {accountMenuOpen && (
                      <div className="absolute right-0 top-full w-56 bg-white border border-[var(--line)] shadow-lg z-50">
                        <div className="px-4 py-3 border-b border-[var(--line)]">
                          <p className="text-sm font-semibold text-[var(--ink)]">Hello, {session.user?.name?.split(' ')[0]}!</p>
                        </div>
                        <div>
                          {ACCOUNT_MENU.map((item) => {
                            const Icon = item.icon
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setAccountMenuOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--ink-soft)] hover:bg-[var(--surface)] hover:text-[var(--green)] transition-colors"
                              >
                                <Icon size={15} /> {item.label}
                              </Link>
                            )
                          })}
                        </div>
                        <button
                          onClick={() => { signOut({ callbackUrl: '/login' }); setAccountMenuOpen(false) }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors border-t border-[var(--line)]"
                        >
                          <LogOut size={15} /> Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="hidden lg:block text-sm font-medium text-white px-3 py-1.5"
                  style={{ backgroundColor: 'var(--green)' }}
                >
                  Login
                </Link>
              )}

              {/* Cart */}
              <Link
                href="/cart"
                className="relative p-2 text-gray-600 hover:text-[var(--ink)] transition-colors"
              >
                <ShoppingCart size={20} />
                {mounted && itemCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'var(--green)' }}
                  >
                    {itemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile search bar */}
        {mobileSearchOpen && (
          <div className="lg:hidden border-t border-[var(--line)] bg-white px-4 py-3">
            <form action="/shop" method="get" className="flex gap-2">
              <div className="flex-1 flex items-center border border-[var(--line)] bg-[var(--surface)]">
                <Search size={16} className="ml-3 text-gray-400 shrink-0" />
                <input
                  type="text"
                  name="search"
                  placeholder={t('search_placeholder')}
                  className="flex-1 px-3 py-2 text-sm bg-transparent focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setImageSearchOpen(true)}
                  className="px-2.5 text-gray-400 hover:text-[var(--green)] transition-colors shrink-0"
                  aria-label="Search by image"
                >
                  <Camera size={16} />
                </button>
              </div>
              <button
                type="submit"
                className="px-4 py-2 text-white text-sm font-medium"
                style={{ backgroundColor: 'var(--green)' }}
              >
                Go
              </button>
            </form>
          </div>
        )}

        {/* Desktop simple nav bar */}
        <MegaMenu />

        {/* Categories mega-menu dropdown (triggered by the grid icon above) */}
        {categoriesOpen && (
          <div className="absolute left-0 right-0 top-full z-40 bg-white border-t border-[var(--line)] shadow-lg max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
              <CategoriesMegaMenu categories={categories} onClose={() => setCategoriesOpen(false)} />
            </div>
          </div>
        )}
      </header>

      {/* Mobile drawer */}
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} categories={categories} />

      {/* Image search modal */}
      {imageSearchOpen && <ImageSearchModal onClose={() => setImageSearchOpen(false)} />}
    </>
  )
}
