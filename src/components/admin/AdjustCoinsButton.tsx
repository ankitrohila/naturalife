'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'

export function AdjustCoinsButton({ userId, userName }: { userId: string; userName: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [action, setAction] = useState<'add' | 'deduct'>('add')
  const [coins, setCoins] = useState('')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await fetch(`/api/admin/customers/${userId}/coins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, coins: parseInt(coins), reason }),
    })
    setSaving(false)
    setOpen(false)
    setCoins('')
    setReason('')
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
      >
        Adjust Coins
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-white w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Adjust Store Credit — {userName}</h2>
              <button onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button>
            </div>
            <form onSubmit={submit} className="space-y-3">
              <div className="flex border border-gray-300 rounded-none overflow-hidden text-sm">
                <button type="button" onClick={() => setAction('add')} className={`flex-1 py-2 font-medium ${action === 'add' ? 'text-white' : 'bg-white text-gray-600'}`} style={action === 'add' ? { backgroundColor: 'var(--green)' } : {}}>
                  Add Coins
                </button>
                <button type="button" onClick={() => setAction('deduct')} className={`flex-1 py-2 font-medium ${action === 'deduct' ? 'text-white bg-red-500' : 'bg-white text-gray-600'}`}>
                  Deduct Coins
                </button>
              </div>
              <input required type="number" min="1" placeholder="Number of coins" value={coins} onChange={(e) => setCoins(e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm" />
              <input placeholder="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm" />
              <button type="submit" disabled={saving} className="w-full py-2.5 text-white font-medium text-sm disabled:opacity-50" style={{ backgroundColor: 'var(--green)' }}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
