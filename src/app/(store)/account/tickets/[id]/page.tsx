'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface Message {
  id: string
  senderRole: string
  senderName: string
  message: string
  createdAt: string
}

interface TicketDetail {
  id: string
  subject: string
  category: string
  priority: string
  status: string
  attachmentUrl: string | null
  messages: Message[]
}

const STATUS_COLORS: Record<string, string> = {
  OPEN: '#f59e0b', PENDING: '#3b82f6', RESOLVED: '#16a34a', CLOSED: '#9ca3af',
}

export default function TicketDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [ticket, setTicket] = useState<TicketDetail | null>(null)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchTicket = useCallback(async () => {
    const res = await fetch(`/api/tickets/${id}`)
    if (res.ok) { const data = await res.json(); setTicket(data.ticket) }
    setLoading(false)
  }, [id])

  useEffect(() => { fetchTicket() }, [fetchTicket])

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reply.trim()) return
    setSending(true)
    await fetch(`/api/tickets/${id}/messages`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: reply }),
    })
    setReply('')
    setSending(false)
    fetchTicket()
  }

  if (loading) return <p className="text-sm text-gray-500">Loading...</p>
  if (!ticket) return <p className="text-sm text-gray-500">Ticket not found.</p>

  return (
    <div>
      <Link href="/account/tickets" className="text-sm text-gray-500 hover:text-[var(--green)] mb-4 inline-block">← Back to Tickets</Link>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--ink)' }}>{ticket.subject}</h1>
          <p className="text-xs text-gray-500">{ticket.category} · Priority: {ticket.priority}</p>
        </div>
        <span className="text-xs px-3 py-1 font-medium text-white" style={{ backgroundColor: STATUS_COLORS[ticket.status] }}>{ticket.status}</span>
      </div>

      <div className="bg-white border border-[var(--line)] p-5 space-y-4 mb-4 max-h-[500px] overflow-y-auto">
        {ticket.messages.map((m) => (
          <div key={m.id} className={`flex ${m.senderRole === 'ADMIN' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[75%] p-3 ${m.senderRole === 'ADMIN' ? 'bg-[var(--surface)]' : 'text-white'}`} style={m.senderRole !== 'ADMIN' ? { backgroundColor: 'var(--green)' } : {}}>
              <p className="text-xs font-semibold mb-1 opacity-80">{m.senderName} {m.senderRole === 'ADMIN' && '(Support)'}</p>
              <p className="text-sm whitespace-pre-line">{m.message}</p>
              <p className="text-[10px] opacity-60 mt-1">{new Date(m.createdAt).toLocaleString('en-IN')}</p>
            </div>
          </div>
        ))}
        {ticket.attachmentUrl && (
          <div className="pt-2 border-t border-[var(--line)]">
            <a href={ticket.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-medium hover:underline" style={{ color: 'var(--green)' }}>View Attachment →</a>
          </div>
        )}
      </div>

      {ticket.status !== 'CLOSED' && (
        <form onSubmit={sendReply} className="flex gap-2">
          <textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Type your reply..." rows={2} className="flex-1 border border-[var(--line)] px-3 py-2 text-sm" />
          <button type="submit" disabled={sending} className="px-5 text-white text-sm font-semibold disabled:opacity-50" style={{ backgroundColor: 'var(--green)' }}>
            {sending ? '...' : 'Reply'}
          </button>
        </form>
      )}
    </div>
  )
}
