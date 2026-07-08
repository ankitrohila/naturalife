'use client'

import { useState, useEffect } from 'react'
import { PanelLeft, ChevronLeft } from 'lucide-react'
import { useLanguage } from '@/components/providers/LanguageProvider'

export function ShopSidebarToggle({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage()
  // Open by default on desktop, closed on mobile
  const [open, setOpen] = useState(false)
  useEffect(() => {
    setOpen(window.innerWidth >= 1024)
  }, [])

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed left-0 top-1/2 -translate-y-1/2 z-30 flex items-center gap-2 pl-3 pr-4 py-2.5 bg-white border border-l-0 border-[var(--line)] shadow-md text-sm font-medium text-[var(--ink)] hover:text-[var(--green)] transition-colors"
        >
          <PanelLeft size={16} /> {t('shop_open_sidebar')}
        </button>
      )}

      {open && (
        <aside className="w-full lg:w-64 shrink-0">
          <div className="bg-white p-5 shadow-sm border border-gray-100 sticky top-32 max-h-[calc(100vh-140px)] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">{t('shop_filters')}</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-[var(--ink)] transition-colors"
                aria-label="Collapse sidebar"
                title={t('shop_collapse_sidebar')}
              >
                <ChevronLeft size={18} />
              </button>
            </div>
            {children}
          </div>
        </aside>
      )}
    </>
  )
}
