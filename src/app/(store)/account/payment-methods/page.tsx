'use client'

import { useState, useEffect, useCallback } from 'react'
import { Wallet, CreditCard, Smartphone, Landmark, Check } from 'lucide-react'

const METHODS = [
  { value: 'COD', label: 'Cash on Delivery', icon: Wallet },
  { value: 'CARD', label: 'Credit / Debit Card', icon: CreditCard },
  { value: 'UPI', label: 'UPI', icon: Smartphone },
  { value: 'NETBANKING', label: 'Net Banking', icon: Landmark },
]

export default function PaymentMethodsPage() {
  const [preferred, setPreferred] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchPreference = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/account/payment-method')
    const data = await res.json()
    setPreferred(data.preferredPaymentMethod)
    setLoading(false)
  }, [])

  useEffect(() => { fetchPreference() }, [fetchPreference])

  const choose = async (value: string) => {
    setSaving(true)
    await fetch('/api/account/payment-method', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preferredPaymentMethod: value }),
    })
    setPreferred(value)
    setSaving(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--ink)' }}>Payment Methods</h1>
      </div>

      <div className="bg-white border border-[var(--line)] p-5 mb-6">
        <p className="text-sm text-gray-600">
          We don&apos;t store your card or bank details. Choose your preferred payment option below — it will be pre-selected at checkout for faster ordering. Actual card/UPI details are entered securely with our payment partner at the time of payment.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {METHODS.map((m) => {
            const Icon = m.icon
            const active = preferred === m.value
            return (
              <button
                key={m.value}
                disabled={saving}
                onClick={() => choose(m.value)}
                className="flex items-center gap-3 p-4 border text-left transition-colors disabled:opacity-50"
                style={active ? { borderColor: 'var(--green)', backgroundColor: 'var(--green-light)' } : { borderColor: 'var(--line)' }}
              >
                <Icon size={20} style={{ color: active ? 'var(--green)' : '#666' }} />
                <span className="flex-1 text-sm font-medium text-[var(--ink)]">{m.label}</span>
                {active && <Check size={16} style={{ color: 'var(--green)' }} />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
