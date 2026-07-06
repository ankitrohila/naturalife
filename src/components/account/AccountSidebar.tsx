'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { LayoutDashboard, Package, Coins, Download, MapPin, CreditCard, User, Heart, LifeBuoy, LogOut } from 'lucide-react'

const NAV = [
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

export function AccountSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-full lg:w-56 shrink-0">
      <nav className="bg-white border border-[var(--line)]">
        {NAV.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-4 py-3 text-sm font-medium border-b border-[var(--line)] last:border-b-0 transition-colors ${
                isActive ? 'bg-[var(--green)] text-white' : 'text-[var(--ink-soft)] hover:bg-[var(--surface)]'
              }`}
            >
              <Icon size={16} /> {item.label}
            </Link>
          )
        })}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </nav>
    </aside>
  )
}
