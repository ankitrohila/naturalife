'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, X } from 'lucide-react'

interface Faq { id: string; question: string; answer: string; category: string; isActive: boolean }
interface LogEntry { id: string; userMessage: string; botResponse: string; matchedFaqId: string | null; createdAt: string }

export default function AdminChatbotPage() {
  const [tab, setTab] = useState<'faqs' | 'logs'>('faqs')
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [stats, setStats] = useState<{ total: number; unmatchedCount: number; matchRate: number; topQueries: { query: string; count: number }[] } | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ question: '', answer: '', category: 'General' })

  const fetchFaqs = useCallback(async () => {
    const res = await fetch('/api/admin/chatbot/faqs')
    const data = await res.json()
    setFaqs(data.faqs ?? [])
  }, [])

  const fetchLogs = useCallback(async () => {
    const res = await fetch('/api/admin/chatbot/logs')
    const data = await res.json()
    setLogs(data.logs ?? [])
    setStats(data)
  }, [])

  useEffect(() => { fetchFaqs(); fetchLogs() }, [fetchFaqs, fetchLogs])

  const addFaq = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/admin/chatbot/faqs', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    })
    setShowForm(false)
    setForm({ question: '', answer: '', category: 'General' })
    fetchFaqs()
  }

  const removeFaq = async (id: string) => {
    if (!confirm('Delete this FAQ?')) return
    await fetch(`/api/admin/chatbot/faqs/${id}`, { method: 'DELETE' })
    fetchFaqs()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chatbot Training & Logs</h1>
          <p className="text-sm text-gray-500">Manage the assistant&apos;s knowledge base and review conversations.</p>
        </div>
        {tab === 'faqs' && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 text-sm text-white font-medium" style={{ backgroundColor: 'var(--green)' }}>
            <Plus size={16} /> Add FAQ
          </button>
        )}
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Conversations</p>
            <p className="text-xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Match Rate</p>
            <p className="text-xl font-bold" style={{ color: 'var(--green)' }}>{stats.matchRate}%</p>
          </div>
          <div className="bg-white border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Unanswered Queries</p>
            <p className="text-xl font-bold text-orange-500">{stats.unmatchedCount}</p>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-5">
        <button onClick={() => setTab('faqs')} className={`px-4 py-2 text-sm font-medium border ${tab === 'faqs' ? 'text-white' : 'text-gray-600 bg-white'}`} style={tab === 'faqs' ? { backgroundColor: 'var(--green)', borderColor: 'var(--green)' } : { borderColor: '#e5e5e5' }}>Knowledge Base</button>
        <button onClick={() => setTab('logs')} className={`px-4 py-2 text-sm font-medium border ${tab === 'logs' ? 'text-white' : 'text-gray-600 bg-white'}`} style={tab === 'logs' ? { backgroundColor: 'var(--green)', borderColor: 'var(--green)' } : { borderColor: '#e5e5e5' }}>Conversation Logs</button>
      </div>

      {tab === 'faqs' ? (
        <div className="bg-white border border-gray-100 shadow-sm divide-y divide-gray-50">
          {faqs.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-gray-400">No FAQs yet</p>
          ) : faqs.map((f) => (
            <div key={f.id} className="px-4 py-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">{f.question}</p>
                <p className="text-xs text-gray-500 mt-0.5">{f.answer}</p>
                <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 mt-1 inline-block">{f.category}</span>
              </div>
              <button onClick={() => removeFaq(f.id)} className="text-gray-400 hover:text-red-500 shrink-0"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      ) : (
        <div>
          {stats && stats.topQueries.length > 0 && (
            <div className="bg-white border border-gray-100 p-4 mb-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Most Common Queries</h3>
              {stats.topQueries.map((q) => (
                <div key={q.query} className="flex justify-between text-xs py-1">
                  <span className="text-gray-600">{q.query}</span>
                  <span className="font-medium text-gray-800">{q.count}</span>
                </div>
              ))}
            </div>
          )}
          <div className="bg-white border border-gray-100 shadow-sm divide-y divide-gray-50">
            {logs.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-gray-400">No conversations logged yet</p>
            ) : logs.map((l) => (
              <div key={l.id} className="px-4 py-3">
                <p className="text-xs text-gray-400 mb-1">{new Date(l.createdAt).toLocaleString('en-IN')}</p>
                <p className="text-sm text-gray-800"><span className="font-semibold">User:</span> {l.userMessage}</p>
                <p className="text-sm text-gray-600"><span className="font-semibold">Bot:</span> {l.botResponse} {!l.matchedFaqId && <span className="text-orange-500 text-xs">(unmatched)</span>}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Add FAQ</h2>
              <button onClick={() => setShowForm(false)} aria-label="Close"><X size={18} /></button>
            </div>
            <form onSubmit={addFaq} className="space-y-3">
              <input required placeholder="Question / sample query" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} className="w-full border border-gray-300 px-3 py-2 text-sm" />
              <textarea required rows={3} placeholder="Answer" value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} className="w-full border border-gray-300 px-3 py-2 text-sm" />
              <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border border-gray-300 px-3 py-2 text-sm" />
              <button type="submit" className="w-full py-2.5 text-white font-medium text-sm" style={{ backgroundColor: 'var(--green)' }}>Save FAQ</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
