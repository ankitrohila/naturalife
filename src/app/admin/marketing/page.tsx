'use client'

import { useEffect, useState } from 'react'

interface Offer { id: string; text: string; isActive: boolean; sortOrder: number }
interface Testimonial { id: string; name: string; location: string | null; rating: number; text: string; isVisible: boolean }

const field = 'w-full border border-[var(--line)] rounded-none px-3 py-2 text-sm focus:outline-none focus:border-[var(--green)]'

export default function AdminMarketingPage() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [subs, setSubs] = useState(0)
  const [offerText, setOfferText] = useState('')
  const [tName, setTName] = useState(''); const [tLoc, setTLoc] = useState(''); const [tRating, setTRating] = useState('5'); const [tText, setTText] = useState('')
  const [editOffer, setEditOffer] = useState<{ id: string; text: string } | null>(null)
  const [editT, setEditT] = useState<{ id: string; text: string } | null>(null)

  const load = () => {
    fetch('/api/admin/marketing/offers').then(r => r.json()).then(d => setOffers(d.offers ?? [])).catch(() => {})
    fetch('/api/admin/marketing/testimonials').then(r => r.json()).then(d => setTestimonials(d.testimonials ?? [])).catch(() => {})
  }
  useEffect(load, [])

  const addOffer = async (e: React.FormEvent) => {
    e.preventDefault(); if (!offerText.trim()) return
    await fetch('/api/admin/marketing/offers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: offerText }) })
    setOfferText(''); load()
  }
  const toggleOffer = async (o: Offer) => { await fetch(`/api/admin/marketing/offers/${o.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !o.isActive }) }); load() }
  const saveOffer = async () => { if (!editOffer) return; await fetch(`/api/admin/marketing/offers/${editOffer.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: editOffer.text }) }); setEditOffer(null); load() }
  const saveT = async () => { if (!editT) return; await fetch(`/api/admin/marketing/testimonials/${editT.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: editT.text }) }); setEditT(null); load() }
  const delOffer = async (id: string) => { if (!confirm('Delete this offer?')) return; await fetch(`/api/admin/marketing/offers/${id}`, { method: 'DELETE' }); load() }

  const addTestimonial = async (e: React.FormEvent) => {
    e.preventDefault(); if (!tName.trim() || !tText.trim()) return
    await fetch('/api/admin/marketing/testimonials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: tName, location: tLoc, rating: tRating, text: tText }) })
    setTName(''); setTLoc(''); setTRating('5'); setTText(''); load()
  }
  const toggleT = async (t: Testimonial) => { await fetch(`/api/admin/marketing/testimonials/${t.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isVisible: !t.isVisible }) }); load() }
  const delT = async (id: string) => { if (!confirm('Delete this testimonial?')) return; await fetch(`/api/admin/marketing/testimonials/${id}`, { method: 'DELETE' }); load() }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[var(--ink)]">Marketing &amp; Promotions</h1>
        <p className="text-sm text-[var(--ink-soft)] mt-1">Offers feed the promo line &amp; popup · testimonials show on the homepage</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[['Offers', offers.length], ['Testimonials', testimonials.length], ['Subscribers', subs]].map(([l, v]) => (
          <div key={l as string} className="bg-white rounded-none p-4 border border-[var(--line)] text-center">
            <p className="text-3xl font-semibold" style={{ color: 'var(--green)' }}>{v as number}</p>
            <p className="text-xs text-[var(--ink-soft)] mt-1">{l as string}</p>
          </div>
        ))}
      </div>

      {/* Offers */}
      <div className="bg-white rounded-none border border-[var(--line)] p-6 mb-6">
        <h2 className="font-semibold text-[var(--ink)] mb-4">Promotional Offers</h2>
        <form onSubmit={addOffer} className="flex gap-2 mb-4">
          <input value={offerText} onChange={(e) => setOfferText(e.target.value)} placeholder="e.g. FLAT 15% OFF on rugs this week" className={field} />
          <button className="px-4 py-2 rounded-none text-white text-sm font-semibold shrink-0" style={{ backgroundColor: 'var(--green)' }}>Add</button>
        </form>
        {offers.length === 0 ? <p className="text-sm text-[var(--ink-soft)] text-center py-3">No offers yet.</p> : (
          <div className="space-y-2">
            {offers.map((o) => (
              <div key={o.id} className="flex items-center justify-between p-3 rounded-none border border-[var(--line)] gap-3">
                {editOffer?.id === o.id ? (
                  <input value={editOffer.text} onChange={(e) => setEditOffer({ id: o.id, text: e.target.value })} className={`${field} flex-1`} autoFocus />
                ) : (
                  <span className="text-sm text-gray-700 flex-1">{o.text}</span>
                )}
                <div className="flex items-center gap-3 shrink-0">
                  {editOffer?.id === o.id ? (
                    <>
                      <button onClick={saveOffer} className="text-xs font-medium text-[var(--green)] hover:underline">Save</button>
                      <button onClick={() => setEditOffer(null)} className="text-xs text-gray-400 hover:underline">Cancel</button>
                    </>
                  ) : (
                    <button onClick={() => setEditOffer({ id: o.id, text: o.text })} className="text-xs text-[var(--ink-soft)] hover:underline">Edit</button>
                  )}
                  <button onClick={() => toggleOffer(o)} className={`text-xs px-2 py-0.5  ${o.isActive ? 'bg-[var(--green-light)] text-[var(--green-dark)]' : 'bg-gray-100 text-gray-500'}`}>{o.isActive ? 'Active' : 'Inactive'}</button>
                  <button onClick={() => delOffer(o.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Testimonials */}
      <div className="bg-white rounded-none border border-[var(--line)] p-6">
        <h2 className="font-semibold text-[var(--ink)] mb-4">Customer Testimonials</h2>
        <form onSubmit={addTestimonial} className="grid md:grid-cols-2 gap-2 mb-4">
          <input value={tName} onChange={(e) => setTName(e.target.value)} placeholder="Customer name" className={field} />
          <input value={tLoc} onChange={(e) => setTLoc(e.target.value)} placeholder="City (optional)" className={field} />
          <select value={tRating} onChange={(e) => setTRating(e.target.value)} className={field}>
            {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} stars</option>)}
          </select>
          <textarea value={tText} onChange={(e) => setTText(e.target.value)} placeholder="Review text" className={`${field} md:col-span-2 resize-none`} rows={2} />
          <button className="px-4 py-2 rounded-none text-white text-sm font-semibold w-fit" style={{ backgroundColor: 'var(--green)' }}>Add Testimonial</button>
        </form>
        {testimonials.length === 0 ? <p className="text-sm text-[var(--ink-soft)] text-center py-3">No testimonials yet.</p> : (
          <div className="space-y-3">
            {testimonials.map((t) => (
              <div key={t.id} className="flex items-start justify-between p-4 rounded-none border border-[var(--line)]">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-gray-800">{t.name}</span>
                    {t.location && <span className="text-xs text-gray-400">{t.location}</span>}
                    <span className="text-[var(--green)] text-xs">{'★'.repeat(t.rating ?? 5)}</span>
                  </div>
                  {editT?.id === t.id ? (
                    <textarea value={editT.text} onChange={(e) => setEditT({ id: t.id, text: e.target.value })} rows={2} className={`${field} resize-none`} autoFocus />
                  ) : (
                    <p className="text-sm text-gray-600 line-clamp-2 italic">&ldquo;{t.text}&rdquo;</p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {editT?.id === t.id ? (
                    <>
                      <button onClick={saveT} className="text-xs font-medium text-[var(--green)] hover:underline">Save</button>
                      <button onClick={() => setEditT(null)} className="text-xs text-gray-400 hover:underline">Cancel</button>
                    </>
                  ) : (
                    <button onClick={() => setEditT({ id: t.id, text: t.text })} className="text-xs text-[var(--ink-soft)] hover:underline">Edit</button>
                  )}
                  <button onClick={() => toggleT(t)} className={`text-xs px-2 py-1  ${t.isVisible ? 'bg-[var(--green-light)] text-[var(--green-dark)]' : 'bg-yellow-50 text-yellow-700'}`}>{t.isVisible ? 'Visible' : 'Hidden'}</button>
                  <button onClick={() => delT(t.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
