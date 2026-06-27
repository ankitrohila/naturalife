'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return }
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, password: form.password }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Registration failed'); setLoading(false) }
    else router.push('/login?registered=1')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundColor: 'var(--ivory)' }}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: 'var(--saffron)' }}>N</div>
            <span className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--indigo)' }}>Naturalife</span>
          </Link>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--indigo)', fontFamily: 'var(--font-display)' }}>Create Account</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Your full name' },
            { label: 'Email', key: 'email', type: 'email', placeholder: 'your@email.com' },
            { label: 'Mobile Number', key: 'phone', type: 'tel', placeholder: '+91 98765 43210' },
            { label: 'Password', key: 'password', type: 'password', placeholder: 'Min 8 characters' },
            { label: 'Confirm Password', key: 'confirmPassword', type: 'password', placeholder: 'Re-enter password' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type={type}
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none"
                placeholder={placeholder}
              />
            </div>
          ))}
          {error && <p className="text-sm font-medium" style={{ color: 'var(--crimson)' }}>{error}</p>}
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-60" style={{ backgroundColor: 'var(--saffron)' }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold hover:underline" style={{ color: 'var(--saffron)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
