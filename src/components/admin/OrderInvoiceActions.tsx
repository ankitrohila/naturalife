'use client'

import { useState } from 'react'

export function OrderInvoiceActions({ orderId }: { orderId: string }) {
  const [sending, setSending] = useState(false)
  const [msg, setMsg] = useState('')

  const sendWhatsApp = async () => {
    setSending(true); setMsg('')
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/send-invoice`, { method: 'POST' })
      const data = await res.json()
      setMsg(data.message ?? (res.ok ? 'Sent' : data.error ?? 'Failed'))
    } catch {
      setMsg('Failed to send')
    }
    setSending(false)
  }

  return (
    <div className="bg-white rounded-none shadow-sm border border-[var(--line)] p-5">
      <h2 className="font-semibold text-[var(--ink)] mb-3">Invoice</h2>
      <div className="flex flex-col gap-2">
        <a
          href={`/api/invoices/${orderId}?print=1`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full text-center py-2.5 rounded-none text-white text-sm font-semibold"
          style={{ backgroundColor: 'var(--green)' }}
        >
          Download Invoice (PDF)
        </a>
        <a
          href={`/api/invoices/${orderId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full text-center py-2.5 rounded-none border border-[var(--line)] text-sm font-medium text-[var(--ink)] hover:bg-[var(--surface)]"
        >
          View Invoice
        </a>
        <button
          onClick={sendWhatsApp}
          disabled={sending}
          className="w-full py-2.5 rounded-none border border-[var(--green)] text-sm font-semibold text-[var(--green)] hover:bg-[var(--green-light)] disabled:opacity-60"
        >
          {sending ? 'Sending…' : 'Send Invoice on WhatsApp'}
        </button>
        {msg && <p className="text-xs text-[var(--ink-soft)] text-center">{msg}</p>}
      </div>
    </div>
  )
}
