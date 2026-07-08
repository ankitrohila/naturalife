'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'

interface NavItem { label: string; href: string; divider?: boolean }
const NAV: NavItem[] = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Orders', href: '/admin/orders' },
  { label: 'WhatsApp Orders', href: '/admin/whatsapp-orders' },
  { label: 'Abandoned Carts', href: '/admin/abandoned-carts' },
  { label: 'Leads & Forms', href: '/admin/leads' },
  { label: 'Form Manager', href: '/admin/forms' },
  { label: 'Support Tickets', href: '/admin/tickets' },
  { label: 'Chatbot', href: '/admin/chatbot' },
  { label: 'Products', href: '/admin/products' },
  { label: 'Add Product', href: '/admin/products/new' },
  { label: 'Categories', href: '/admin/categories' },
  { label: 'Customers', href: '/admin/customers' },
  { label: 'Users & Roles', href: '/admin/users' },
  { label: 'Reviews', href: '/admin/reviews' },
  { label: 'Distributors', href: '/admin/distributors' },
  { label: 'Coupons', href: '/admin/coupons' },
  { label: 'Marketing', href: '/admin/marketing' },
  { label: 'Media Library', href: '/admin/media' },
  { label: 'Notifications', href: '/admin/notifications' },
  { label: 'CMS Pages', href: '/admin/pages' },
  { label: 'Menu Manager', href: '/admin/menus' },
  { label: '— Config —', href: '', divider: true },
  { label: 'Settings', href: '/admin/settings' },
  { label: 'Payment Gateways', href: '/admin/settings?tab=payment' },
  { label: 'UPI / QR Config', href: '/admin/settings?tab=upi' },
  { label: 'Email & WhatsApp', href: '/admin/settings?tab=comms' },
  { label: 'Shipping Partners', href: '/admin/settings?tab=shipping' },
  { label: 'Test Env', href: '/admin/test-env' },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const isMasterAdmin = (session?.user as any)?.role === 'MASTER_ADMIN'

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
          if (item.divider) {
            return <p key={item.label} className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">{item.label.replace(/—/g, '').trim()}</p>
          }
          // ?tab= links are just shortcuts — never highlight as active (avoids SSR mismatch)
          const isActive = !item.href.includes('?') && (
            (item.href === '/admin' && pathname === '/admin') ||
            (item.href !== '/admin' && pathname.startsWith(item.href))
          )
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={`block px-3 py-2 rounded-none text-sm font-medium mb-0.5 transition-colors ${
                isActive
                  ? 'bg-[var(--green)] text-white'
                  : item.href.includes('?tab=')
                    ? 'text-[var(--ink-soft)] hover:bg-[var(--green-light)] hover:text-[var(--ink)] pl-6 text-xs'
                    : 'text-[var(--ink-soft)] hover:bg-[var(--green-light)] hover:text-[var(--ink)]'
              }`}
            >
              {item.href.includes('?tab=') ? `↳ ${item.label}` : item.label}
            </Link>
          )
        })}
        {isMasterAdmin && (
          <Link
            href="/admin/database"
            className={`block px-3 py-2 rounded-none text-sm font-medium mb-0.5 mt-2 pt-2 border-t border-[var(--line)] transition-colors ${
              pathname.startsWith('/admin/database')
                ? 'bg-[var(--ink)] text-white'
                : 'text-red-500 hover:bg-red-50'
            }`}
          >
            🔒 Database Manager
          </Link>
        )}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-[var(--line)] space-y-1">
        <Link href="/" className="block px-3 py-2 rounded-none text-xs text-[var(--ink-soft)] hover:bg-[var(--surface)] hover:text-[var(--ink)] transition-colors">
          View Store
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full text-left px-3 py-2 rounded-none text-xs text-red-500 hover:bg-red-50 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </aside>
  )
}
