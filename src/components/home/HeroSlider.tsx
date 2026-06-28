'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const SLIDES = [
  {
    bg: '/images/carpet/carpet-alt.jpg',
    badge: 'New Collection 2025',
    title: 'Making Homes a\nLiving One',
    sub: 'Premium microfiber doormats, rugs & dhurries — crafted for modern Indian homes',
    cta: 'Shop Now',
    ctaLink: '/shop',
    ctaSecondary: 'View Catalogue',
    ctaSecondaryLink: '/shop?featured=true',
    accent: 'var(--green)',
  },
  {
    bg: '/images/products/p-sq-26.jpg',
    badge: 'UP TO 70% OFF',
    title: 'Mega Sale On\nAll Doormats',
    sub: 'Water absorbent, anti-skid, machine washable — doormat that lasts for years',
    cta: 'Shop Doormats',
    ctaLink: '/shop?category=doormats',
    ctaSecondary: 'See All Deals',
    ctaSecondaryLink: '/shop?onSale=true',
    accent: 'var(--saffron)',
  },
  {
    bg: '/images/products/p-brown.jpg',
    badge: 'Wholesale Available',
    title: 'Quality Products\nat Honest Prices',
    sub: 'Serving retail & wholesale customers across 20+ Indian states since 2012',
    cta: 'Explore Range',
    ctaLink: '/shop',
    ctaSecondary: 'Wholesale Enquiry',
    ctaSecondaryLink: '/contact',
    accent: 'var(--green)',
  },
]

export function HeroSlider() {
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimating(true)
      setTimeout(() => {
        setCurrent((c) => (c + 1) % SLIDES.length)
        setAnimating(false)
      }, 400)
    }, 5500)
    return () => clearInterval(timer)
  }, [])

  const goTo = (i: number) => {
    if (i === current) return
    setAnimating(true)
    setTimeout(() => { setCurrent(i); setAnimating(false) }, 300)
  }

  const slide = SLIDES[current]

  return (
    <section className="relative w-full overflow-hidden" style={{ minHeight: 520 }}>
      {/* Background */}
      <div className="absolute inset-0 transition-all duration-700">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={slide.bg}
          alt="Hero"
          className="w-full h-full object-cover object-center animate-kenBurns"
          key={current}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.1) 100%)' }} />
      </div>

      {/* Content */}
      <div className={`relative z-10 flex items-center min-h-[520px] px-6 md:px-16 transition-opacity duration-400 ${animating ? 'opacity-0' : 'opacity-100'}`}>
        <div className="max-w-xl">
          <div className="inline-block text-xs font-bold tracking-widest uppercase text-white px-3 py-1 rounded-full mb-4"
            style={{ backgroundColor: slide.accent }}>
            {slide.badge}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight whitespace-pre-line"
            style={{ fontFamily: 'var(--font-display)', textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
            {slide.title}
          </h1>
          <p className="text-gray-200 text-base md:text-lg mb-8 max-w-md leading-relaxed">
            {slide.sub}
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link href={slide.ctaLink}
              className="px-7 py-3 text-white font-bold rounded-full text-sm shadow-xl transition-transform hover:scale-105"
              style={{ backgroundColor: slide.accent }}>
              {slide.cta}
            </Link>
            <Link href={slide.ctaSecondaryLink}
              className="px-7 py-3 font-bold rounded-full text-sm border-2 border-white text-white hover:bg-white transition-colors"
              style={{ color: 'white' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#333'; e.currentTarget.style.backgroundColor = 'white' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.backgroundColor = '' }}>
              {slide.ctaSecondary}
            </Link>
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === current ? 28 : 10,
              height: 10,
              backgroundColor: i === current ? 'var(--green)' : 'rgba(255,255,255,0.5)',
            }}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Arrows */}
      <button
        onClick={() => goTo((current - 1 + SLIDES.length) % SLIDES.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors"
        aria-label="Previous"
      >
        ‹
      </button>
      <button
        onClick={() => goTo((current + 1) % SLIDES.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors"
        aria-label="Next"
      >
        ›
      </button>
    </section>
  )
}
