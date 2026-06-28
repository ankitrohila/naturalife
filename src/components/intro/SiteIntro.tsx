'use client'

import { useCallback, useEffect, useState } from 'react'
import { CarpetPreloader } from './CarpetPreloader'
import { ExitIntentPopup, type TrendingItem } from './ExitIntentPopup'

/**
 * Orchestrates the landing experience:
 *  1. First visit  → full-screen carpet preloader, which unfolds on scroll,
 *     then reveals the homepage and opens the offer popup.
 *  2. Return visit → skip the preloader; show the popup on exit-intent.
 */
export function SiteIntro({ trending }: { trending: TrendingItem[] }) {
  const [showPreloader, setShowPreloader] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const seenIntro = sessionStorage.getItem('nl_intro_done')
    if (!seenIntro) {
      setShowPreloader(true)
    } else {
      // Return visit within session: arm exit-intent popup once
      if (!sessionStorage.getItem('nl_popup_done')) armExitIntent()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openPopupOnce = useCallback(() => {
    if (sessionStorage.getItem('nl_popup_done')) return
    sessionStorage.setItem('nl_popup_done', '1')
    setShowPopup(true)
  }, [])

  const armExitIntent = useCallback(() => {
    const handler = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        openPopupOnce()
        document.removeEventListener('mouseout', handler)
      }
    }
    document.addEventListener('mouseout', handler)
    // Fallback: show after 25s of browsing
    window.setTimeout(openPopupOnce, 25000)
  }, [openPopupOnce])

  const onPreloaderDone = useCallback(() => {
    sessionStorage.setItem('nl_intro_done', '1')
    setShowPreloader(false)
    window.setTimeout(openPopupOnce, 900)
  }, [openPopupOnce])

  if (!mounted) return null

  return (
    <>
      {showPreloader && <CarpetPreloader onDone={onPreloaderDone} />}
      {showPopup && trending.length > 0 && (
        <ExitIntentPopup items={trending} onClose={() => setShowPopup(false)} />
      )}
    </>
  )
}
