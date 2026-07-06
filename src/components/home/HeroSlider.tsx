'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/components/providers/LanguageProvider'

const SLIDES = [
  { img: '/images/hero/hero-rugs-display.jpg', kickerKey: 'hero_kicker_1', titleKey: 'hero_title_1' },
  { img: '/images/hero/hero-persian-stack.jpg', kickerKey: 'hero_kicker_2', titleKey: 'hero_title_2' },
  { img: '/images/hero/hero-handweaving.jpg', kickerKey: 'hero_kicker_3', titleKey: 'hero_title_3' },
] as const

const DURATION = 6500

export function HeroSlider() {
  const { t } = useLanguage()
  const [current, setCurrent] = useState(0)
  const [key, setKey] = useState(0) // bumps to replay entrance animations

  const go = useCallback((i: number) => {
    setCurrent((i + SLIDES.length) % SLIDES.length)
    setKey((k) => k + 1)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => go(current + 1), DURATION)
    return () => clearInterval(interval)
  }, [current, go])

  const slide = { kicker: t(SLIDES[current].kickerKey), title: t(SLIDES[current].titleKey) }
  const words = slide.title.split('\n')

  return (
    <section className="relative w-full h-[100svh] min-h-[560px] overflow-hidden bg-black">
      {/* Slides (crossfade + ken burns) */}
      {SLIDES.map((s, i) => (
        <div key={i} className="absolute inset-0 transition-opacity duration-[1200ms] ease-out" style={{ opacity: i === current ? 1 : 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={s.img}
            alt=""
            className={`w-full h-full object-cover ${i === current ? 'hero-zoom' : ''}`}
            key={`${i}-${key}`}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.45) 42%, rgba(0,0,0,0.12) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 35%)' }} />
        </div>
      ))}

      {/* Content — minimal */}
      <div key={key} className="relative z-10 h-full flex items-center">
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <p className="hero-rise text-xs sm:text-sm font-semibold tracking-[0.3em] uppercase text-white/80 mb-4 sm:mb-6" style={{ animationDelay: '0.05s' }}>
            {slide.kicker}
          </p>

          <h1 className="text-white font-semibold leading-[0.95] tracking-tight text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] mb-8 sm:mb-10">
            {words.map((w, wi) => (
              <span key={wi} className="block overflow-hidden">
                <span className="hero-line block" style={{ animationDelay: `${0.18 + wi * 0.12}s` }}>{w}</span>
              </span>
            ))}
          </h1>

          {/* Single transparent shopping button */}
          <div className="hero-rise" style={{ animationDelay: `${0.5 + words.length * 0.12}s` }}>
            <Link
              href="/shop"
              className="group inline-flex items-center gap-3 border border-white/70 bg-white/10 backdrop-blur-md px-8 py-3.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-white hover:text-[var(--ink)]"
            >
              {t('hero_shop_now')}
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Arrows */}
      <button onClick={() => go(current - 1)} aria-label="Previous"
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 border border-white/40 text-white flex items-center justify-center backdrop-blur-sm bg-white/5 hover:bg-white/20 transition-colors">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      <button onClick={() => go(current + 1)} aria-label="Next"
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 border border-white/40 text-white flex items-center justify-center backdrop-blur-sm bg-white/5 hover:bg-white/20 transition-colors">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>

      {/* Dots + progress */}
      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => go(i)} aria-label={`Slide ${i + 1}`} className="relative h-1.5 rounded-full overflow-hidden transition-all duration-300"
            style={{ width: i === current ? 40 : 10, backgroundColor: i === current ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.45)' }}>
            {i === current && (
              <span key={key} className="hero-progress absolute inset-0 bg-white rounded-full" style={{ animationDuration: `${DURATION}ms` }} />
            )}
          </button>
        ))}
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-6 right-6 z-20 hidden sm:flex flex-col items-center gap-1 text-white/70 animate-bounce">
        <span className="text-[10px] tracking-widest uppercase">{t('hero_scroll')}</span>
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
    </section>
  )
}
