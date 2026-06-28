'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const NAV = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Orders', href: '/admin/orders' },
  { label: 'Products', href: '/admin/products' },
  { label: 'Add Product', href: '/admin/products/new' },
  { label: 'Categories', href: '/admin/categories' },
  { label: 'Customers', href: '/admin/customers' },
  { label: 'Distributors', href: '/admin/distributors' },
  { label: 'Coupons', href: '/admin/coupons' },
  { label: 'Marketing', href: '/admin/marketing' },
  { label: 'Media Library', href: '/admin/media' },
  { label: 'Notifications', href: '/admin/notifications' },
  { label: 'CMS Pages', href: '/admin/pages' },
  { label: 'Settings', href: '/admin/settings' },
  { label: 'Test Env', href: '/admin/test-env' },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 shrink-0 min-h-screen flex flex-col bg-white border-r border-[var(--line)]">
      {/* Logo */}
      <div className="p-5 border-b border-[var(--line)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo/naturalife-logo.png" alt="Naturalife Admin" className="h-8 w-auto object-contain" />
        <p className="text-xs text-[var(--green)] mt-1.5 font-medium tracking-wide">Admin Panel</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 overflow-y-auto">
        {NAV.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-lg text-sm font-medium mb-0.5 transition-colors ${
                isActive
                  ? 'bg-[var(--green)] text-white'
                  : 'text-[var(--ink-soft)] hover:bg-[var(--green-light)] hover:text-[var(--ink)]'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-[var(--line)] space-y-1">
        <Link href="/" className="block px-3 py-2 rounded-lg text-xs text-[var(--ink-soft)] hover:bg-[var(--surface)] hover:text-[var(--ink)] transition-colors">
          View Store
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full text-left px-3 py-2 rounded-lg text-xs text-red-500 hover:bg-red-50 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </aside>
  )
}
