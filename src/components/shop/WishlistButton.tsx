'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'

const WISHLIST_KEY = 'naturalife-wishlist'

function readWishlist(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function WishlistButton({ productId, className }: { productId: string; className?: string }) {
  const [wishlisted, setWishlisted] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setWishlisted(readWishlist().includes(productId))
  }, [productId])

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const current = readWishlist()
    const next = current.includes(productId)
      ? current.filter((id) => id !== productId)
      : [...current, productId]
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(next))
    setWishlisted(!wishlisted)
  }

  return (
    <button
      onClick={toggle}
      aria-label="Add to wishlist"
      className={className ?? 'w-8 h-8 bg-white shadow flex items-center justify-center text-[var(--ink)] hover:bg-[var(--green)] hover:text-white transition-colors'}
    >
      <Heart size={15} fill={mounted && wishlisted ? 'currentColor' : 'none'} className={mounted && wishlisted ? 'text-red-500' : ''} />
    </button>
  )
}
