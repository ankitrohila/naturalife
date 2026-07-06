'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Scale, X } from 'lucide-react'
import { readCompareList } from './CompareButton'

export function CompareTray() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const update = () => setCount(readCompareList().length)
    update()
    window.addEventListener('compare-updated', update)
    window.addEventListener('storage', update)
    return () => {
      window.removeEventListener('compare-updated', update)
      window.removeEventListener('storage', update)
    }
  }, [])

  const clearAll = () => {
    localStorage.setItem('naturalife-compare', '[]')
    window.dispatchEvent(new Event('compare-updated'))
  }

  if (count === 0) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[150] bg-[var(--ink)] text-white shadow-xl flex items-center gap-4 px-5 py-3">
      <span className="flex items-center gap-2 text-sm font-medium">
        <Scale size={16} /> {count} product{count !== 1 ? 's' : ''} to compare
      </span>
      <Link href="/compare" className="text-sm font-semibold px-3 py-1.5 text-white" style={{ backgroundColor: 'var(--green)' }}>
        Compare Now
      </Link>
      <button onClick={clearAll} aria-label="Clear compare list" className="text-gray-400 hover:text-white">
        <X size={16} />
      </button>
    </div>
  )
}
