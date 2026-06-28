'use client'

import { useEffect, useRef, useState } from 'react'

const STRIPS = 9
const CARPET = '/images/carpet/carpet-alt.jpg'

/**
 * Full-screen intro: a real carpet covers the viewport and folds up
 * (accordion-style, strip by strip) as the visitor scrolls / swipes down.
 * When fully folded it fades out and calls onDone().
 */
export function CarpetPreloader({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0) // 0 → 1
  const [closing, setClosing] = useState(false)
  const prog = useRef(0)
  const done = useRef(false)

  useEffect(() => {
    // Lock the page while the carpet is shown
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const finish = () => {
      if (done.current) return
      done.current = true
      setClosing(true)
      document.body.style.overflow = prevOverflow
      window.setTimeout(onDone, 650)
    }

    const bump = (delta: number) => {
      if (done.current) return
      prog.current = Math.min(1, Math.max(0, prog.current + delta))
      setProgress(prog.current)
      if (prog.current >= 1) finish()
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      bump(e.deltaY / 1400)
    }
    let touchY = 0
    const onTouchStart = (e: TouchEvent) => { touchY = e.touches[0].clientY }
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0].clientY
      bump((touchY - y) / 600)
      touchY = y
    }
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key)) bump(0.2)
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onDone])

  return (
    <div
      className="fixed inset-0 z-[120] overflow-hidden bg-[var(--green-dark)] transition-opacity duration-700"
      style={{ opacity: closing ? 0 : 1, pointerEvents: closing ? 'none' : 'auto' }}
      aria-label="Intro"
    >
      {/* Carpet strips that fold up from the bottom as you scroll */}
      <div className="absolute inset-0" style={{ perspective: '1400px' }}>
        {Array.from({ length: STRIPS }).map((_, i) => {
          // Bottom strips fold first
          const stripStart = (STRIPS - 1 - i) / STRIPS
          const local = Math.min(1, Math.max(0, (progress - stripStart * 0.85) / 0.32))
          const angle = local * -92 // rotate up and away
          return (
            <div
              key={i}
              className="absolute left-0 w-full"
              style={{
                top: `${(i / STRIPS) * 100}%`,
                height: `${100 / STRIPS + 0.4}%`,
                backgroundImage: `url(${CARPET})`,
                backgroundSize: `100% ${STRIPS * 100}%`,
                backgroundPosition: `center ${(i / (STRIPS - 1)) * 100}%`,
                transformOrigin: 'top center',
                transform: `rotateX(${angle}deg)`,
                transition: 'transform 0.12s linear',
                boxShadow: local > 0 ? '0 -10px 30px rgba(0,0,0,0.35)' : 'none',
                backfaceVisibility: 'hidden',
              }}
            />
          )
        })}
      </div>

      {/* Overlay text */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-white pointer-events-none px-6 text-center"
        style={{ opacity: 1 - progress * 1.4 }}>
        <img src="/images/logo/naturalife-logo.png" alt="Naturalife" className="h-14 w-auto mb-6 brightness-0 invert" />
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">Naturalife</h1>
        <p className="mt-3 text-sm md:text-base text-white/80">Handcrafted Indian home textiles</p>
        <div className="mt-10 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs uppercase tracking-[0.25em] text-white/70">Scroll to unfold</span>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-white/90" style={{ width: `${progress * 100}%` }} />
    </div>
  )
}
