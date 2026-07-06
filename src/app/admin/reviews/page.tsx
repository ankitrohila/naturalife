'use client'

import { useEffect, useState } from 'react'

interface Review { id: string; name: string; email: string | null; rating: number; text: string; isApproved: boolean; createdAt: string; product: { name: string; slug: string } | null }
interface Enquiry { id: string; name: string; email: string; phone: string | null; subject: string | null; message: string; status: string; createdAt: string }

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [tab, setTab] = useState<'reviews' | 'messages'>('reviews')

  const load = () => { fetch('/api/admin/reviews').then(r => r.json()).then(d => { setReviews(d.reviews ?? []); setEnquiries(d.enquiries ?? []) }).catch(() => {}) }
  useEffect(() => { load() }, [])

  const approve = async (r: Review) => { await fetch(`/api/admin/reviews/${r.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isApproved: !r.isApproved }) }); load() }
  const del = async (id: string) => { if (!confirm('Delete this review?')) return; await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' }); load() }

  const pending = reviews.filter(r => !r.isApproved).length

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[var(--ink)]">Reviews &amp; Messages</h1>
        <p className="text-sm text-[var(--ink-soft)] mt-1">Moderate product reviews and read contact enquiries</p>
      </div>

      <div className="flex gap-6 border-b border-[var(--line)] mb-6">
        {([['reviews', `Product Reviews${pending ? ` (${pending} pending)` : ''}`], ['messages', `Contact Messages (${enquiries.length})`]] as const).map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} className={`pb-3 text-sm font-medium -mb-px border-b-2 ${tab === k ? 'border-[var(--green)] text-[var(--ink)]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>{label}</button>
        ))}
      </div>

      {tab === 'reviews' ? (
        <div className="bg-white rounded-none border border-[var(--line)] overflow-hidden">
          {reviews.length === 0 ? <p className="p-8 text-center text-sm text-[var(--ink-soft)]">No reviews yet.</p> : (
            <div className="divide-y divide-[var(--line)]">
              {reviews.map((r) => (
                <div key={r.id} className="p-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-sm text-[var(--ink)]">{r.name}</span>
                      <span className="text-[var(--green)] text-xs">{'★'.repeat(r.rating)}</span>
                      <span className="text-xs text-gray-400">on {r.product?.name ?? 'product'}</span>
                      <span className={`text-xs px-2 py-0.5  ${r.isApproved ? 'bg-[var(--green-light)] text-[var(--green-dark)]' : 'bg-yellow-50 text-yellow-700'}`}>{r.isApproved ? 'Published' : 'Pending'}</span>
                    </div>
                    <p className="text-sm text-gray-600 italic">&ldquo;{r.text}&rdquo;</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(r.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button onClick={() => approve(r)} className="text-xs px-3 py-1 rounded-none text-white font-medium" style={{ backgroundColor: r.isApproved ? '#9ca3af' : 'var(--green)' }}>{r.isApproved ? 'Unpublish' : 'Approve'}</button>
                    <button onClick={() => del(r.id)} className="text-xs px-3 py-1 rounded-none border border-red-200 text-red-600">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-none border border-[var(--line)] overflow-hidden">
          {enquiries.length === 0 ? <p className="p-8 text-center text-sm text-[var(--ink-soft)]">No messages yet.</p> : (
            <div className="divide-y divide-[var(--line)]">
              {enquiries.map((e) => (
                <div key={e.id} className="p-4">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-sm text-[var(--ink)]">{e.name}</span>
                    <span className="text-xs text-gray-400">{e.email}{e.phone ? ` · ${e.phone}` : ''}</span>
                    {e.subject && <span className="text-xs px-2 py-0.5  bg-[var(--surface-2)] text-gray-600">{e.subject}</span>}
                  </div>
                  <p className="text-sm text-gray-600">{e.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(e.createdAt).toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
