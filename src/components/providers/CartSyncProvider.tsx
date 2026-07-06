'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useCartStore } from '@/store/cart'

export function CartSyncProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!session?.user) return

    const sync = () => {
      const state = useCartStore.getState()
      const items = state.items
      const totalValue = state.getSubtotal()
      const itemCount = state.getItemCount()
      fetch('/api/cart/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, totalValue, itemCount }),
      }).catch(() => {})
    }

    const unsubscribe = useCartStore.subscribe(() => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(sync, 5000)
    })

    return () => {
      unsubscribe()
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [session])

  return <>{children}</>
}
