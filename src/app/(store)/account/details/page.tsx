'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export default function AccountDetailsPage() {
  const { data: session, update } = useSession()
  const [name, setName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (session?.user?.name) setName(session.user.name)
  }, [session])

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMsg('')
    const res = await fetch('/api/account/profile', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, whatsappNumber: whatsapp }),
    })
    setSaving(false)
    if (res.ok) { setMsg('Profile updated successfully.'); update?.() }
    else { const d = await res.json(); setError(d.error ?? 'Failed to update') }
  }

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMsg('')
    const res = await fetch('/api/account/profile', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    setSaving(false)
    if (res.ok) { setMsg('Password changed successfully.'); setCurrentPassword(''); setNewPassword('') }
    else { const d = await res.json(); setError(d.error ?? 'Failed to change password') }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--ink)' }}>Account Details</h1>

      {msg && <p className="text-sm text-green-600">{msg}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="bg-white border border-[var(--line)] p-5">
        <h2 className="font-semibold text-gray-800 mb-4">Profile Information</h2>
        <form onSubmit={saveProfile} className="space-y-3 max-w-md">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email (cannot be changed)</label>
            <input value={session?.user?.email ?? ''} disabled className="w-full border border-gray-200 px-3 py-2 text-sm bg-gray-50 text-gray-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">WhatsApp Number</label>
            <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <button type="submit" disabled={saving} className="px-5 py-2 text-white text-sm font-semibold disabled:opacity-50" style={{ backgroundColor: 'var(--green)' }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div className="bg-white border border-[var(--line)] p-5">
        <h2 className="font-semibold text-gray-800 mb-4">Change Password</h2>
        <form onSubmit={changePassword} className="space-y-3 max-w-md">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Current Password</label>
            <input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">New Password</label>
            <input type="password" required minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <button type="submit" disabled={saving} className="px-5 py-2 text-white text-sm font-semibold disabled:opacity-50" style={{ backgroundColor: 'var(--ink)' }}>
            {saving ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
