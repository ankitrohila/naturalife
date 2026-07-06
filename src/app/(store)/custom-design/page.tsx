'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Upload, Loader2, CheckCircle2, Palette, Ruler, ShoppingBag } from 'lucide-react'
import { useLanguage } from '@/components/providers/LanguageProvider'

interface FormField {
  name: string
  label: string
  type: 'text' | 'tel' | 'email' | 'select' | 'textarea'
  required: boolean
  options?: string[]
}

interface FormDef {
  key: string
  name: string
  fields: FormField[]
}

const CAROUSEL_IMAGES = [
  '/images/hero/hero-rugs-display.jpg',
  '/images/hero/hero-persian-stack.jpg',
  '/images/hero/hero-carpet-texture.jpg',
  '/images/hero/hero-handweaving.jpg',
]

const STEP_KEYS = [
  ['custom_step_design', 'custom_step_design_desc'],
  ['custom_step_customisation', 'custom_step_customisation_desc'],
  ['custom_step_simulation', 'custom_step_simulation_desc'],
  ['custom_step_weaving', 'custom_step_weaving_desc'],
  ['custom_step_delivery', 'custom_step_delivery_desc'],
] as const

const WHY_US_KEYS = [
  ['custom_why_1_title', 'custom_why_1_desc'],
  ['custom_why_2_title', 'custom_why_2_desc'],
  ['custom_why_3_title', 'custom_why_3_desc'],
  ['custom_why_4_title', 'custom_why_4_desc'],
  ['custom_why_5_title', 'custom_why_5_desc'],
  ['custom_why_6_title', 'custom_why_6_desc'],
] as const

export default function CustomDesignPage() {
  const { t } = useLanguage()
  const [form, setForm] = useState<FormDef | null>(null)
  const [values, setValues] = useState<Record<string, string>>({})
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [slide, setSlide] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const formSectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/forms/custom-design')
      .then((r) => r.json())
      .then(setForm)
      .catch(() => setError('Failed to load form'))
  }, [])

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % CAROUSEL_IMAGES.length), 4000)
    return () => clearInterval(t)
  }, [])

  const scrollToForm = () => formSectionRef.current?.scrollIntoView({ behavior: 'smooth' })

  const handleFile = (f: File) => {
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return
    setSubmitting(true)
    setError('')
    const formData = new FormData()
    formData.append('formKey', form.key)
    Object.entries(values).forEach(([k, v]) => formData.append(k, v))
    if (file) formData.append('image', file)

    try {
      const res = await fetch('/api/leads', { method: 'POST', body: formData })
      if (res.ok) setSubmitted(true)
      else { const d = await res.json(); setError(d.error ?? 'Submission failed') }
    } catch {
      setError('Submission failed. Please try again.')
    }
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <main className="min-h-screen max-w-2xl mx-auto px-4 py-24 text-center" style={{ backgroundColor: 'var(--ivory)' }}>
        <CheckCircle2 size={48} className="mx-auto mb-4 text-[var(--green)]" />
        <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--ink)' }}>Request Submitted!</h1>
        <p className="text-gray-600">Thank you for sharing your design idea. Our team will review it and get in touch with you shortly.</p>
      </main>
    )
  }

  return (
    <main style={{ backgroundColor: 'var(--ivory)' }}>
      {/* ── Hero ── */}
      <section className="py-16 sm:py-20 px-4 text-center" style={{ background: 'linear-gradient(135deg, var(--green-dark) 0%, var(--green) 100%)' }}>
        <div className="max-w-3xl mx-auto text-white">
          <p className="text-xs font-semibold tracking-widest uppercase mb-3 opacity-80">Made Just For You</p>
          <h1 className="text-3xl sm:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>{t('custom_hero_title')}</h1>
          <p className="text-sm sm:text-base opacity-90 mb-8 max-w-xl mx-auto">
            {t('custom_hero_subtitle')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button onClick={scrollToForm} className="px-6 py-3 text-sm font-semibold bg-white" style={{ color: 'var(--green-dark)' }}>
              {t('custom_send_design')} →
            </button>
            <Link href="/shop" className="px-6 py-3 text-sm font-semibold border border-white/70 text-white hover:bg-white/10 transition-colors">
              {t('custom_choose_catalogue')}
            </Link>
            <a href="https://wa.me/918950205038" target="_blank" rel="noopener noreferrer" className="px-6 py-3 text-sm font-semibold border border-white/70 text-white hover:bg-white/10 transition-colors">
              {t('custom_chat_whatsapp')}
            </a>
          </div>
        </div>
      </section>

      {/* ── Image carousel ── */}
      <section className="py-10 px-4">
        <div className="max-w-3xl mx-auto aspect-[16/9] overflow-hidden relative shadow-md">
          {CAROUSEL_IMAGES.map((img, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={img}
              src={img}
              alt="Custom rug inspiration"
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
              style={{ opacity: i === slide ? 1 : 0 }}
            />
          ))}
        </div>
      </section>

      {/* ── Form (unchanged fields/logic) ── */}
      <section ref={formSectionRef} className="py-10 px-4">
        <div className="max-w-2xl mx-auto bg-white border border-[var(--line)] shadow-sm p-6 sm:p-10">
          <h2 className="text-xl md:text-2xl font-semibold mb-2" style={{ color: 'var(--ink)' }}>{t('custom_form_title')}</h2>
          <p className="text-sm text-gray-600 mb-8">{t('custom_form_subtitle')}</p>

          {!form ? (
            <p className="text-sm text-gray-500">Loading form...</p>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              {error && <p className="text-sm text-red-600">{error}</p>}

              {/* Image upload */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">{t('custom_reference_photo')}</label>
                {!preview ? (
                  <div
                    onClick={() => inputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 p-10 flex flex-col items-center justify-center cursor-pointer hover:border-[var(--green)] transition-colors"
                  >
                    <Upload size={28} className="text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">{t('custom_upload_hint')}</p>
                    <input ref={inputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt="Preview" className="w-24 h-24 object-cover border border-[var(--line)]" />
                    <button type="button" onClick={() => { setPreview(null); setFile(null) }} className="text-sm text-red-500 hover:underline">{t('custom_remove')}</button>
                  </div>
                )}
              </div>

              {form.fields.map((f) => (
                <div key={f.name}>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
                    {f.label}{f.required && <span className="text-red-500"> *</span>}
                  </label>
                  {f.type === 'textarea' ? (
                    <textarea
                      required={f.required}
                      rows={4}
                      value={values[f.name] ?? ''}
                      onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                      className="w-full border border-[var(--line)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--green)]"
                    />
                  ) : f.type === 'select' ? (
                    <select
                      required={f.required}
                      value={values[f.name] ?? ''}
                      onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                      className="w-full border border-[var(--line)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--green)]"
                    >
                      <option value="">Select...</option>
                      {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input
                      type={f.type}
                      required={f.required}
                      value={values[f.name] ?? ''}
                      onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                      className="w-full border border-[var(--line)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--green)]"
                    />
                  )}
                </div>
              ))}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 text-white font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: 'var(--green)' }}
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                {submitting ? t('custom_submitting') : t('custom_submit')}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ── 3-column features ── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { icon: Palette, title: t('custom_feature_1_title'), desc: t('custom_feature_1_desc') },
            { icon: Ruler, title: t('custom_feature_2_title'), desc: t('custom_feature_2_desc') },
            { icon: ShoppingBag, title: t('custom_feature_3_title'), desc: t('custom_feature_3_desc') },
          ].map((f) => (
            <div key={f.title} className="text-center px-4">
              <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'var(--green-light)' }}>
                <f.icon size={24} style={{ color: 'var(--green)' }} />
              </div>
              <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--ink)' }}>{f.title}</h3>
              <p className="text-sm text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5-step process ── */}
      <section className="py-16 px-4" style={{ backgroundColor: 'var(--surface)' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
            {t('custom_how_it_works')}
          </h2>
          <div className="space-y-8">
            {STEP_KEYS.map(([titleKey, descKey], i) => (
              <div key={titleKey} className="flex items-start gap-5">
                <div className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: 'var(--green)' }}>
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--ink)' }}>{t(titleKey)}</h3>
                  <p className="text-sm text-gray-600">{t(descKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Naturalife ── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
            {t('custom_why_us')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {WHY_US_KEYS.map(([titleKey, descKey]) => (
              <div key={titleKey}>
                <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--green)' }}>{t(titleKey)}</h3>
                <p className="text-xs text-gray-600">{t(descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
