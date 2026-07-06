'use client'

import { useState, useEffect, useCallback } from 'react'

interface Testimonial { name: string; city: string; review: string; rating?: number }

const DURATION = 5000

export function TestimonialsCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [current, setCurrent] = useState(0)

  const go = useCallback((i: number) => {
    setCurrent((i + testimonials.length) % testimonials.length)
  }, [testimonials.length])

  useEffect(() => {
    if (testimonials.length <= 1) return
    const t = setInterval(() => go(current + 1), DURATION)
    return () => clearInterval(t)
  }, [current, go, testimonials.length])

  if (testimonials.length === 0) return null

  return (
    <div className="max-w-2xl mx-auto">
      <div className="relative overflow-hidden">
        {testimonials.map((t, i) => (
          <div
            key={i}
            className="transition-opacity duration-500 ease-out"
            style={{ display: i === current ? 'block' : 'none', opacity: i === current ? 1 : 0 }}
          >
            <div className="bg-gray-50 rounded-none p-8 shadow-sm border border-gray-100 text-center">
              <div className="flex justify-center gap-1 mb-3">
                {[...Array(5)].map((_, j) => (
                  <span key={j} className="text-sm" style={{ color: j < (t.rating ?? 5) ? 'var(--green)' : '#ddd' }}>★</span>
                ))}
              </div>
              <p className="text-gray-600 text-sm mb-4 italic leading-relaxed">&ldquo;{t.review}&rdquo;</p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: 'var(--green)' }}>
                  {t.name[0]}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm text-gray-800">{t.name}</p>
                  {t.city && <p className="text-xs text-gray-400">{t.city}</p>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {testimonials.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Testimonial ${i + 1}`}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{ width: i === current ? 24 : 8, backgroundColor: i === current ? 'var(--green)' : '#ddd' }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
