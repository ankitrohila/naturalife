'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { useLanguage } from '@/components/providers/LanguageProvider'

export function SortDropdown() {
  const { t } = useLanguage()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const OPTIONS = [
    { value: 'newest', label: t('shop_sort_newest') },
    { value: 'price-asc', label: t('shop_sort_price_low') },
    { value: 'price-desc', label: t('shop_sort_price_high') },
  ]

  const currentSort = searchParams.get('sort') ?? 'newest'

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', value)
    params.delete('page')
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  return (
    <div className="relative flex items-center gap-2">
      <select
        value={currentSort}
        onChange={(e) => handleChange(e.target.value)}
        className="text-sm border border-gray-300 rounded-none px-3 py-2 bg-white"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {isPending && <Loader2 size={16} className="animate-spin text-gray-400" />}
    </div>
  )
}
