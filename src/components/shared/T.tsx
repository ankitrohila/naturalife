'use client'

import { useLanguage } from '@/components/providers/LanguageProvider'
import { translateCatalogTerm, type TranslationKey } from '@/lib/i18n/translations'

// Drop-in translated text for use inside server components — avoids
// converting entire server-rendered pages to client components just to
// swap a label. Renders {t(k)} using whatever the fallback is if missing.
export function T({ k, fallback }: { k: TranslationKey; fallback?: string }) {
  const { t } = useLanguage()
  return <>{t(k) || fallback}</>
}

// Same idea for the small finite catalog vocabulary (category/color/material
// names) — falls back to the original English term if untranslated.
export function CatalogTerm({ term }: { term: string }) {
  const { lang } = useLanguage()
  return <>{translateCatalogTerm(term, lang)}</>
}
