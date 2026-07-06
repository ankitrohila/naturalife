'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { X, ChevronDown, User, Shield } from 'lucide-react'
import type { NavigationCategory } from '@/app/actions/categories'

export function MobileDrawer({
  open,
  onClose,
  categories,
}: {
  open: boolean
  onClose: () => void
  categories: NavigationCategory[]
}) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const { data: session } = useSession()

  const toggle = (id: string) => setExpanded((prev) => (prev === id ? null : id))

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 bottom-0 z-[100] w-80 max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--line)]">
          <Link href="/" onClick={onClose} className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo/naturalife-logo.png" alt="Naturalife" className="h-8 w-auto" />
          </Link>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-[var(--ink)] transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Category tree */}
        <div className="flex-1 overflow-y-auto py-3">
          <Link
            href="/"
            onClick={onClose}
            className="block px-5 py-3 text-sm font-medium text-[var(--ink)] hover:bg-[var(--surface)] transition-colors"
          >
            Home
          </Link>

          <Link
            href="/shop"
            onClick={onClose}
            className="block px-5 py-3 text-sm font-medium text-[var(--ink)] hover:bg-[var(--surface)] transition-colors"
          >
            Shop All
          </Link>

          {categories.map((cat) => (
            <div key={cat.id}>
              <div className="flex items-center">
                <Link
                  href={`/shop?category=${cat.slug}`}
                  onClick={onClose}
                  className="flex-1 px-5 py-3 text-sm font-medium text-[var(--ink)] hover:bg-[var(--surface)] transition-colors"
                >
                  {cat.name}
                </Link>
                {cat.children.length > 0 && (
                  <button
                    onClick={() => toggle(cat.id)}
                    className="px-4 py-3 text-gray-400 hover:text-[var(--ink)] transition-colors"
                    aria-label={`Expand ${cat.name}`}
                  >
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${expanded === cat.id ? 'rotate-180' : ''}`}
                    />
                  </button>
                )}
              </div>

              {/* Children */}
              {expanded === cat.id && cat.children.length > 0 && (
                <div className="bg-[var(--surface)]">
                  {cat.children.map((child) => (
                    <Link
                      key={child.id}
                      href={`/shop?category=${child.slug}`}
                      onClick={onClose}
                      className="block pl-10 pr-5 py-2.5 text-sm text-gray-600 hover:text-[var(--green)] transition-colors"
                    >
                      {child.name}
                      <span className="text-xs text-gray-400 ml-2">({child.productCount})</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="my-2 border-t border-[var(--line)]" />

          <Link
            href="/about"
            onClick={onClose}
            className="block px-5 py-3 text-sm font-medium text-[var(--ink)] hover:bg-[var(--surface)] transition-colors"
          >
            About
          </Link>
          <Link
            href="/contact"
            onClick={onClose}
            className="block px-5 py-3 text-sm font-medium text-[var(--ink)] hover:bg-[var(--surface)] transition-colors"
          >
            Contact
          </Link>
        </div>

        {/* Bottom section */}
        <div className="border-t border-[var(--line)] px-5 py-4 space-y-2">
          {session ? (
            <>
              {(session.user as any)?.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  onClick={onClose}
                  className="flex items-center gap-2 w-full py-2.5 px-3 text-sm font-medium text-white"
                  style={{ backgroundColor: 'var(--green)' }}
                >
                  <Shield size={16} /> Admin Panel
                </Link>
              )}
              <Link
                href="/account"
                onClick={onClose}
                className="flex items-center gap-2 w-full py-2.5 px-3 text-sm font-medium border border-[var(--line)] text-[var(--ink)]"
              >
                <User size={16} /> My Account
              </Link>
              <button
                onClick={() => { signOut(); onClose() }}
                className="w-full py-2.5 px-3 text-sm font-medium text-gray-500 hover:text-red-500 text-left"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <Link
                href="/login"
                onClick={onClose}
                className="flex-1 text-center py-2.5 text-sm font-medium text-white"
                style={{ backgroundColor: 'var(--green)' }}
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={onClose}
                className="flex-1 text-center py-2.5 text-sm font-medium border border-gray-300 text-gray-600"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
