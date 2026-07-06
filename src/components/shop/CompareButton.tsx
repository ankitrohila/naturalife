'use client'

import { useState, useEffect } from 'react'
import { Scale } from 'lucide-react'

const COMPARE_KEY = 'naturalife-compare'
const MAX_COMPARE = 4

export function readCompareList(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(COMPARE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function writeCompareList(ids: string[]) {
  localStorage.setItem(COMPARE_KEY, JSON.stringify(ids))
  window.dispatchEvent(new Event('compare-updated'))
}

export function CompareButton({ productId, className }: { productId: string; className?: string }) {
  const [inCompare, setInCompare] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setInCompare(readCompareList().includes(productId))
  }, [productId])

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const current = readCompareList()
    if (current.includes(productId)) {
      writeCompareList(current.filter((id) => id !== productId))
      setInCompare(false)
    } else {
      if (current.length >= MAX_COMPARE) {
        alert(`You can compare up to ${MAX_COMPARE} products at a time.`)
        return
      }
      writeCompareList([...current, productId])
      setInCompare(true)
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label="Compare"
      title="Compare"
      className={className ?? 'w-8 h-8 bg-white shadow flex items-center justify-center text-[var(--ink)] hover:bg-[var(--green)] hover:text-white transition-colors'}
    >
      <Scale size={14} fill={mounted && inCompare ? 'currentColor' : 'none'} className={mounted && inCompare ? 'text-[var(--green)]' : ''} />
    </button>
  )
}
