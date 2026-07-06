'use client'

import { useState, useEffect, useCallback } from 'react'

interface NotifLog {
  id: string
  event: string
  recipient: string
  channel: string
  status: string
  createdAt: string
}

const STATUS_COLORS: Record<string, string> = {
  SENT: 'bg-green-50 text-green-700',
  SIMULATED: 'bg-blue-50 text-blue-700',
  FAILED: 'bg-red-50 text-red-600',
}

export default function TestEnvPage() {
  const [mode, setMode] = useState<'TEST' | 'LIVE'>('TEST')
  const [testEmail, setTestEmail] = useState('')
  const [testWA, setTestWA] = useState('')
  const [logs, setLogs] = useState<NotifLog[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [toast, setToast] = useState('')

  const fetchState = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/test/state')
    const data = await res.json()
    setMode(data.mode)
    setTestEmail(data.testEmail)
    setTestWA(data.testWA)
    setLogs(data.logs ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchState() }, [fetchState])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 4000)
  }

  const setNotificationMode = async (newMode: 'TEST' | 'LIVE') => {
    setBusy('mode')
    await fetch('/api/admin/notification-mode', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: newMode }),
    })
    setMode(newMode)
    setBusy(null)
    showToast(`Switched to ${newMode} mode`)
  }

  const createOrder = async (kind: 'retail' | 'wholesale') => {
    setBusy(kind)
    try {
      const res = await fetch(`/api/test/create-${kind}-order`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      showToast(`Test ${kind} order ${data.order.orderNumber} created`)
      fetchState()
    } catch (err: any) {
      showToast(`Error: ${err.message}`)
    } finally {
      setBusy(null)
    }
  }

  const sendTestNotification = async (event: string, channel: 'EMAIL' | 'WHATSAPP') => {
    const key = `${event}-${channel}`
    setBusy(key)
    try {
      const res = await fetch('/api/test/send-notification', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event, channel }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      showToast(channel === 'WHATSAPP' && data.simulated ? 'WhatsApp simulated (no Twilio creds configured yet)' : `${channel} sent`)
      fetchState()
    } catch (err: any) {
      showToast(`Error: ${err.message}`)
    } finally {
      setBusy(null)
    }
  }

  const testPayment = async (method: 'UPI/GPay' | 'Card' | 'COD') => {
    const apiMethod = method === 'UPI/GPay' ? 'UPI' : method === 'Card' ? 'CARD' : 'COD'
    setBusy(method)
    try {
      const res = await fetch('/api/test/simulate-payment', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ method: apiMethod }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      showToast(data.result)
      fetchState()
    } catch (err: any) {
      showToast(`Error: ${err.message}`)
    } finally {
      setBusy(null)
    }
  }

  const isLive = mode === 'LIVE'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Test Environment</h1>
        <div className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold ${isLive ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
          <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500' : 'bg-orange-500'}`} />
          {isLive ? 'LIVE MODE' : 'TEST MODE'}
        </div>
      </div>

      {toast && (
        <div className="bg-gray-900 text-white text-sm px-4 py-3 mb-5 shadow-lg">{toast}</div>
      )}

      {!isLive && (
        <div className="bg-orange-50 border border-orange-200 rounded-none p-4 mb-6 text-sm text-orange-800">
          <strong>TEST MODE ACTIVE:</strong> All notifications go to test contacts — Email: {testEmail} | WhatsApp: {testWA}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Order Cycle Simulator */}
        <div className="bg-white rounded-none border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Order Cycle Simulator</h2>
            <p className="text-xs text-gray-500 mt-1">Create test orders using real catalog data (COD, confirmed)</p>
          </div>
          <div className="px-5 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                disabled={busy === 'retail'}
                onClick={() => createOrder('retail')}
                className="flex items-center justify-center gap-2 py-3 text-sm font-medium border border-gray-300 rounded-none hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {busy === 'retail' ? 'Creating...' : 'Create Retail Order'}
              </button>
              <button
                disabled={busy === 'wholesale'}
                onClick={() => createOrder('wholesale')}
                className="flex items-center justify-center gap-2 py-3 text-sm font-medium border border-gray-300 rounded-none hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {busy === 'wholesale' ? 'Creating...' : 'Create Wholesale Order'}
              </button>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Status Progression (managed from Orders → order detail)</label>
              <div className="flex flex-wrap gap-2">
                {['PLACED', 'CONFIRMED', 'PACKED', 'DISPATCHED', 'DELIVERED', 'RETURN_REQUESTED', 'RETURNED', 'REFUNDED'].map((s) => (
                  <span key={s} className="text-xs px-2 py-1 bg-gray-50 border border-gray-200 rounded-none text-gray-600">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Notification Test */}
        <div className="bg-white rounded-none border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Test Notifications</h2>
            <p className="text-xs text-gray-500 mt-1">Sends using your most recent order</p>
          </div>
          <div className="px-5 py-5 space-y-3">
            {['ORDER_PLACED', 'ORDER_DISPATCHED', 'ORDER_DELIVERED', 'RETURN_REQUESTED', 'REFUND_DONE'].map((event) => (
              <div key={event} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-700">{event.replace(/_/g, ' ')}</span>
                <div className="flex gap-2">
                  <button
                    disabled={busy === `${event}-EMAIL`}
                    onClick={() => sendTestNotification(event, 'EMAIL')}
                    className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-none hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    Email
                  </button>
                  <button
                    disabled={busy === `${event}-WHATSAPP`}
                    onClick={() => sendTestNotification(event, 'WHATSAPP')}
                    className="text-xs px-3 py-1 bg-[var(--green-light)] text-[var(--green-dark)] rounded-none hover:opacity-80 transition-opacity disabled:opacity-50"
                  >
                    WhatsApp
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Test */}
        <div className="bg-white rounded-none border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Payment Test</h2>
          </div>
          <div className="px-5 py-5 space-y-3">
            <div className="bg-yellow-50 border border-yellow-200 rounded-none p-3 text-sm text-yellow-800">
              No live gateway configured — UPI/Card simulate a 90% success / 10% decline outcome, same as the real checkout&apos;s test-mode flow.
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(['UPI/GPay', 'Card', 'COD'] as const).map((m) => (
                <button key={m} disabled={busy === m} onClick={() => testPayment(m)} className="py-3 text-sm font-medium border border-gray-300 rounded-none hover:bg-gray-50 disabled:opacity-50">
                  {busy === m ? 'Testing...' : `Test ${m}`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="bg-white rounded-none border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Mode Control</h2>
          </div>
          <div className="px-5 py-5">
            <p className="text-sm text-gray-600 mb-4">
              Current: <strong>{mode}</strong><br />
              Test email: <code className="text-xs">{testEmail}</code><br />
              Test WhatsApp: <code className="text-xs">{testWA}</code>
            </p>
            <div className="flex gap-3">
              <button
                disabled={busy === 'mode'}
                onClick={() => setNotificationMode('TEST')}
                className={`px-4 py-2 text-sm rounded-none font-medium disabled:opacity-50 ${!isLive ? 'text-white' : 'border border-gray-300 text-gray-600'}`}
                style={!isLive ? { backgroundColor: '#f97316' } : {}}
              >
                Set TEST Mode
              </button>
              <button
                disabled={busy === 'mode'}
                onClick={() => setNotificationMode('LIVE')}
                className={`px-4 py-2 text-sm rounded-none font-medium disabled:opacity-50 ${isLive ? 'text-white' : 'border border-gray-300 text-gray-600'}`}
                style={isLive ? { backgroundColor: '#16a34a' } : {}}
              >
                Set LIVE Mode
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Log */}
      <div className="mt-6 bg-white rounded-none border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Notification Log</h2>
          <button onClick={fetchState} className="text-xs text-gray-500 hover:text-gray-800">Refresh</button>
        </div>
        {loading ? (
          <p className="px-5 py-8 text-center text-sm text-gray-400">Loading...</p>
        ) : logs.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-gray-400">No notifications sent yet</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Event', 'Recipient', 'Channel', 'Status', 'Time'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-3 text-xs font-medium text-gray-700">{log.event}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{log.recipient}</td>
                  <td className="px-4 py-3 text-xs">{log.channel}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 font-medium ${STATUS_COLORS[log.status] ?? 'bg-gray-50 text-gray-600'}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{new Date(log.createdAt).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
