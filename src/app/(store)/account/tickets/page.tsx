'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, X } from 'lucide-react'

interface Ticket {
  id: string
  subject: string
  category: string
  priority: string
  status: string
  updatedAt: string
  _count: { messages: number }
}

const STATUS_COLORS: Record<string, string> = {
  OPEN: '#f59e0b', PENDING: '#3b82f6', RESOLVED: '#16a34a', CLOSED: '#9ca3af',
}

export default function AccountTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('General')
  const [priority, setPriority] = useState('MEDIUM')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/tickets')
    const data = await res.json()
    setTickets(data.tickets ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchTickets() }, [fetchTickets])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const formData = new FormData()
    formData.append('subject', subject)
    formData.append('category', category)
    formData.append('priority', priority)
    formData.append('description', description)
    if (file) formData.append('attachment', file)
    await fetch('/api/tickets', { method: 'POST', body: formData })
    setSubmitting(false)
    setShowForm(false)
    setSubject(''); setDescription(''); setFile(null)
    fetchTickets()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--ink)' }}>My Tickets</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 text-sm text-white font-medium" style={{ backgroundColor: 'var(--green)' }}>
          <Plus size={16} /> Raise a Ticket
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : tickets.length === 0 ? (
        <div className="bg-white border border-[var(--line)] py-16 text-center">
          <p className="text-sm text-gray-500">You haven&apos;t raised any tickets yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-[var(--line)] divide-y divide-gray-50">
          {tickets.map((t) => (
            <Link key={t.id} href={`/account/tickets/${t.id}`} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
              <div>
                <p className="text-sm font-semibold text-gray-800">{t.subject}</p>
                <p className="text-xs text-gray-500">{t.category} · {t._count.messages} message{t._count.messages !== 1 ? 's' : ''}</p>
              </div>
              <div className="text-right">
                <span className="text-xs px-2 py-0.5 font-medium text-white" style={{ backgroundColor: STATUS_COLORS[t.status] }}>{t.status}</span>
                <p className="text-xs text-gray-400 mt-1">{new Date(t.updatedAt).toLocaleDateString('en-IN')}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Raise a Ticket</h2>
              <button onClick={() => setShowForm(false)} aria-label="Close"><X size={18} /></button>
            </div>
            <form onSubmit={submit} className="space-y-3">
              <input required placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="border border-gray-300 px-3 py-2 text-sm">
                  <option>General</option>
                  <option>Order Issue</option>
                  <option>Product Quality</option>
                  <option>Shipping & Delivery</option>
                  <option>Returns & Refunds</option>
                  <option>Wholesale</option>
                </select>
                <select value={priority} onChange={(e) => setPriority(e.target.value)} className="border border-gray-300 px-3 py-2 text-sm">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <textarea required rows={5} placeholder="Describe your issue..." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm" />
              <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="text-sm" />
              <button type="submit" disabled={submitting} className="w-full py-2.5 text-white font-medium text-sm disabled:opacity-50" style={{ backgroundColor: 'var(--green)' }}>
                {submitting ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
