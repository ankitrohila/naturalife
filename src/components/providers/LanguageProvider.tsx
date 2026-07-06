'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { LANGUAGES, translations, type Lang, type TranslationKey } from '@/lib/i18n/translations'

interface LanguageContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: TranslationKey) => string
  dir: 'ltr' | 'rtl'
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

const STORAGE_KEY = 'naturalife-lang'

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Lang | null
    if (saved && LANGUAGES.some((l) => l.code === saved)) setLangState(saved)
  }, [])

  const dir = LANGUAGES.find((l) => l.code === lang)?.dir ?? 'ltr'

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = dir
  }, [lang, dir])

  const setLang = (next: Lang) => {
    setLangState(next)
    localStorage.setItem(STORAGE_KEY, next)
  }

  const t = (key: TranslationKey) => translations[lang][key] ?? translations.en[key]

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
