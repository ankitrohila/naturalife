'use client'

import { useEffect, useRef, useState } from 'react'

const CARPET = '/images/carpet/carpet-red.jpg'
const START = 0.02 // begins very slightly rolled at the bottom

/**
 * Full-screen intro: a real ornate red carpet covers the entire viewport.
 * As the visitor scrolls / swipes down the carpet ROLLS UP from the bottom —
 * the rolled cylinder grows thicker (more carpet coiled) and rises, lifting the
 * carpet away to reveal the site. No colour blending, so it always covers
 * edge-to-edge; fully responsive on mobile and desktop.
 */
export function CarpetPreloader({ onDone }: { onDone: () => void }) {
  const [p, setP] = useState(START) // progress START → 1
  const [closing, setClosing] = useState(false)
  const prog = useRef(START)
  const done = useRef(false)

  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const finish = () => {
      if (done.current) return
      done.current = true
      setClosing(true)
      document.body.style.overflow = prevOverflow
      window.setTimeout(onDone, 600)
    }
    const bump = (d: number) => {
      if (done.current) return
      prog.current = Math.min(1, Math.max(START, prog.current + d))
      setP(prog.current)
      if (prog.current >= 0.995) finish()
    }

    const onWheel = (e: WheelEvent) => { e.preventDefault(); bump(e.deltaY / 900) }
    let touchY = 0
    const onTouchStart = (e: TouchEvent) => { touchY = e.touches[0].clientY }
    const onTouchMove = (e: TouchEvent) => { const y = e.touches[0].clientY; bump((touchY - y) / 500); touchY = y }
    const onKey = (e: KeyboardEvent) => { if (['ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); bump(0.16) } }

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

  const clip = p * 100                 // % of the flat carpet clipped off the bottom
  const lineVh = (1 - p) * 100         // the roll line, in vh
  const rollVh = 5 + p * 16            // roll gets thicker as more carpet is coiled

  return (
    <div
      className="fixed inset-0 z-[130] overflow-hidden transition-opacity duration-500"
      style={{ opacity: closing ? 0 : 1, pointerEvents: closing ? 'none' : 'auto', background: 'transparent' }}
      aria-label="Intro"
    >
      {/* Flat carpet — full viewport, real red image (cover = always edge-to-edge), clipped from the bottom */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${CARPET})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#5a0f18',
          clipPath: `inset(0 0 ${clip}% 0)`,
          WebkitClipPath: `inset(0 0 ${clip}% 0)`,
        } as React.CSSProperties}
      >
        {/* subtle depth (darken only — never lightens the edges) */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.25) 100%)' }} />
        {/* Logo — top-left only */}
        <img
          src="/images/logo/naturalife-logo.png"
          alt="Naturalife"
          className="absolute top-4 left-4 sm:top-6 sm:left-6 h-8 sm:h-10 w-auto drop-shadow-lg"
          style={{ filter: 'brightness(0) invert(1)', opacity: 1 - p * 1.3 }}
        />
      </div>

      {/* The growing rolled cylinder at the bottom edge */}
      <div
        className="absolute left-[-2%] right-[-2%]"
        style={{ top: `${lineVh}vh`, height: `${rollVh}vh`, transform: 'translateY(-50%)' }}
      >
        {/* carpet wrapped around the roll */}
        <div
          className="absolute inset-0 rounded-[999px]"
          style={{ backgroundImage: `url(${CARPET})`, backgroundSize: 'cover', backgroundPosition: 'center bottom', backgroundColor: '#5a0f18', boxShadow: '0 18px 40px rgba(0,0,0,0.5)' }}
        />
        {/* cylindrical shading → reads as a rounded roll */}
        <div
          className="absolute inset-0 rounded-[999px]"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.30) 16%, rgba(255,255,255,0.22) 42%, rgba(255,255,255,0.05) 55%, rgba(0,0,0,0.40) 82%, rgba(0,0,0,0.6) 100%)',
          }}
        />
        {/* thin coil seams for a "rolled" hint */}
        <div
          className="absolute inset-0 rounded-[999px] opacity-30"
          style={{ background: 'repeating-linear-gradient(180deg, rgba(0,0,0,0.35) 0px, rgba(0,0,0,0) 3px, rgba(0,0,0,0) 9px)' }}
        />
      </div>

      {/* Down chevron hint (no text) */}
      <div
        className="absolute left-1/2 -translate-x-1/2 animate-bounce"
        style={{ top: `calc(${lineVh}vh - 60px)`, opacity: p > 0.85 ? 0 : 0.9, transition: 'opacity 0.3s' }}
      >
        <svg className="w-6 h-6 text-white drop-shadow-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  )
}
