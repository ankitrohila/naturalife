'use client'

import { useState } from 'react'
import { Languages } from 'lucide-react'
import { LANGUAGES } from '@/lib/i18n/translations'
import { useLanguage } from '@/components/providers/LanguageProvider'

export function LanguageToggle() {
  const { lang, setLang } = useLanguage()
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 p-2 text-gray-600 hover:text-[var(--ink)] transition-colors"
        aria-label="Change language"
        title="Change language"
      >
        <Languages size={20} />
        <span className="text-xs font-semibold uppercase hidden sm:inline">{lang}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-[var(--line)] shadow-lg z-50">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => { setLang(l.code); setOpen(false) }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  lang === l.code ? 'text-white' : 'text-[var(--ink)] hover:bg-[var(--surface)]'
                }`}
                style={lang === l.code ? { backgroundColor: 'var(--green)' } : {}}
              >
                {l.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
