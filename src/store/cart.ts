'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type OrderType = 'RETAIL' | 'WHOLESALE'

export interface CartItem {
  variantId: string
  productId: string
  productSlug: string
  name: string
  image: string
  attributes: Record<string, string>
  qty: number
  unitPrice: number
  wholesalePrice: number
  taxRate: number
  sku: string
}

interface CartState {
  items: CartItem[]
  orderType: OrderType
  couponCode: string
  coinsToRedeem: number
  addItem: (item: CartItem) => void
  removeItem: (variantId: string) => void
  updateQty: (variantId: string, qty: number) => void
  setOrderType: (type: OrderType) => void
  setCoupon: (code: string) => void
  setCoins: (coins: number) => void
  clearCart: () => void
  getSubtotal: () => number
  getTaxTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      orderType: 'RETAIL',
      couponCode: '',
      coinsToRedeem: 0,

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.variantId === item.variantId)
          if (existing) {
            return { items: state.items.map((i) => i.variantId === item.variantId ? { ...i, qty: i.qty + item.qty } : i) }
          }
          return { items: [...state.items, item] }
        }),

      removeItem: (variantId) =>
        set((state) => ({ items: state.items.filter((i) => i.variantId !== variantId) })),

      updateQty: (variantId, qty) =>
        set((state) => ({
          items: qty <= 0
            ? state.items.filter((i) => i.variantId !== variantId)
            : state.items.map((i) => i.variantId === variantId ? { ...i, qty } : i),
        })),

      setOrderType: (orderType) => set({ orderType }),
      setCoupon: (couponCode) => set({ couponCode }),
      setCoins: (coinsToRedeem) => set({ coinsToRedeem }),
      clearCart: () => set({ items: [], couponCode: '', coinsToRedeem: 0 }),

      getSubtotal: () => {
        const { items, orderType } = get()
        return items.reduce((sum, item) => {
          const price = orderType === 'WHOLESALE' ? item.wholesalePrice : item.unitPrice
          return sum + price * item.qty
        }, 0)
      },

      getTaxTotal: () => {
        const { items, orderType } = get()
        return items.reduce((sum, item) => {
          const price = orderType === 'WHOLESALE' ? item.wholesalePrice : item.unitPrice
          return sum + (price * item.qty * item.taxRate) / 100
        }, 0)
      },

      getItemCount: () => get().items.reduce((sum, i) => sum + i.qty, 0),
    }),
    { name: 'naturalife-cart' }
  )
)
