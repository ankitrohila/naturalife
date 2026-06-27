'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const NAV = [
  { label: 'Dashboard', href: '/admin', icon: '📊' },
  { label: 'Orders', href: '/admin/orders', icon: '📦' },
  { label: 'Products', href: '/admin/products', icon: '🏷️' },
  { label: 'Add Product', href: '/admin/products/new', icon: '➕' },
  { label: 'Categories', href: '/admin/categories', icon: '🗂️' },
  { label: 'Customers', href: '/admin/customers', icon: '👥' },
  { label: 'Distributors', href: '/admin/distributors', icon: '🏭' },
  { label: 'Coupons', href: '/admin/coupons', icon: '🎟️' },
  { label: 'Marketing', href: '/admin/marketing', icon: '📣' },
  { label: 'Media Library', href: '/admin/media', icon: '🖼️' },
  { label: 'Notifications', href: '/admin/notifications', icon: '🔔' },
  { label: 'CMS Pages', href: '/admin/pages', icon: '📄' },
  { label: 'Settings', href: '/admin/settings', icon: '⚙️' },
  { label: 'Test Env', href: '/admin/test-env', icon: '🧪' },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 shrink-0 min-h-screen flex flex-col shadow-sm" style={{ backgroundColor: '#1a2e1a' }}>
      {/* Logo */}
      <div className="p-4 border-b border-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://naturalife.co.in/wp-content/uploads/2020/07/naturalifelogo.png"
          alt="Naturalife Admin"
          className="h-9 w-auto object-contain"
          style={{ filter: 'brightness(0) invert(1)' }}
        />
        <p className="text-xs text-green-400 mt-1 font-medium">Admin Panel</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 overflow-y-auto">
        {NAV.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium mb-0.5 transition-all"
              style={isActive
                ? { backgroundColor: 'var(--green)', color: 'white' }
                : { color: '#aaa' }}
              onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = 'rgba(135,182,110,0.15)'; e.currentTarget.style.color = 'white' } }}
              onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = '#aaa' } }}
            >
              <span className="text-base">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-white/10 space-y-1.5">
        <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-white transition-colors">
          🏠 View Store
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
        >
          🚪 Sign Out
        </button>
      </div>
    </aside>
  )
}
