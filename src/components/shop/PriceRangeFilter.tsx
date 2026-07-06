'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export function PriceRangeFilter({ catalogMin, catalogMax }: { catalogMin: number; catalogMax: number }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const initialMin = searchParams.get('priceMin') ? parseInt(searchParams.get('priceMin')!) : catalogMin
  const initialMax = searchParams.get('priceMax') ? parseInt(searchParams.get('priceMax')!) : catalogMax

  const [min, setMin] = useState(initialMin)
  const [max, setMax] = useState(initialMax)

  useEffect(() => {
    setMin(searchParams.get('priceMin') ? parseInt(searchParams.get('priceMin')!) : catalogMin)
    setMax(searchParams.get('priceMax') ? parseInt(searchParams.get('priceMax')!) : catalogMax)
  }, [catalogMin, catalogMax, searchParams])

  const apply = (nextMin: number, nextMax: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (nextMin > catalogMin) params.set('priceMin', String(nextMin)); else params.delete('priceMin')
    if (nextMax < catalogMax) params.set('priceMax', String(nextMax)); else params.delete('priceMax')
    params.delete('page')
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  if (catalogMin >= catalogMax) return null

  return (
    <div>
      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
        <span>₹{min.toLocaleString('en-IN')}</span>
        <span>₹{max.toLocaleString('en-IN')}</span>
        {isPending && <Loader2 size={12} className="animate-spin" />}
      </div>
      <div className="relative h-6 flex items-center">
        <div className="absolute left-0 right-0 h-1 bg-gray-200" />
        <div
          className="absolute h-1"
          style={{
            backgroundColor: 'var(--green)',
            left: `${((min - catalogMin) / (catalogMax - catalogMin)) * 100}%`,
            right: `${100 - ((max - catalogMin) / (catalogMax - catalogMin)) * 100}%`,
          }}
        />
        <input
          type="range"
          min={catalogMin}
          max={catalogMax}
          value={min}
          onChange={(e) => setMin(Math.min(parseInt(e.target.value), max - 1))}
          onMouseUp={() => apply(min, max)}
          onTouchEnd={() => apply(min, max)}
          className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[var(--green)] [&::-webkit-slider-thumb]:cursor-pointer"
        />
        <input
          type="range"
          min={catalogMin}
          max={catalogMax}
          value={max}
          onChange={(e) => setMax(Math.max(parseInt(e.target.value), min + 1))}
          onMouseUp={() => apply(min, max)}
          onTouchEnd={() => apply(min, max)}
          className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[var(--green)] [&::-webkit-slider-thumb]:cursor-pointer"
        />
      </div>
    </div>
  )
}
