'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'

function LoginForm() {
  const [email, setEmail] = useState('admin@naturalife.in')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? (isAdmin ? '/admin' : '/')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (res?.error) {
        setError('Invalid email or password. Please check your credentials.')
        console.error('Login error:', res.error)
        setLoading(false)
      } else if (res?.ok) {
        router.push(callbackUrl)
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center px-4 py-8 gap-8" style={{ backgroundColor: '#F5F3F0' }}>
      {/* Left Side - Brand Info */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center text-center">
        <div className="mb-8">
          <Image
            src="/images/logo/naturalife-logo.png"
            alt="Naturalife Logo"
            width={200}
            height={60}
            priority
          />
        </div>
        <h1 className="text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
          Naturalife
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-sm" style={{ fontFamily: 'var(--font-body)' }}>
          Premium Handcrafted Indian Home Textiles
        </p>
        <p className="text-sm text-gray-500 mb-8">Quality • Craftsmanship • Tradition</p>
        <div className="space-y-6 text-left">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--green)' }}>
              <span className="text-white text-lg">✓</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Premium Quality</h3>
              <p className="text-sm text-gray-600">Handcrafted textiles from across India</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--green)' }}>
              <span className="text-white text-lg">✓</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Wholesale & Retail</h3>
              <p className="text-sm text-gray-600">Special pricing for bulk orders</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--green)' }}>
              <span className="text-white text-lg">✓</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Fast Delivery</h3>
              <p className="text-sm text-gray-600">Nationwide shipping across India</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full max-w-md">
        {/* Mobile Logo */}
        <div className="lg:hidden text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/logo/naturalife-logo.png"
              alt="Naturalife Logo"
              width={150}
              height={45}
              priority
            />
          </div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
            Naturalife
          </h1>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>
              Welcome Back
            </h2>
            <p className="text-sm text-gray-600">Sign in to your account</p>
          </div>

          {/* Admin/Customer Toggle */}
          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setIsAdmin(true)
                setEmail('admin@naturalife.in')
                setError('')
              }}
              className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all ${
                isAdmin ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdmin(false)
                setEmail('')
                setError('')
              }}
              className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all ${
                !isAdmin ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Customer
            </button>
          </div>

          {isAdmin && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-xs">
              <p className="text-blue-900">
                <strong>Demo Admin Account:</strong><br />
                Email: admin@naturalife.in<br />
                Password: admin123
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="your@email.com"
                style={{ fontFamily: 'var(--font-body)' }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="Enter your password"
                style={{ fontFamily: 'var(--font-body)' }}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800" style={{ color: '#9B1D20' }}>
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-bold text-base disabled:opacity-60 transition-all hover:shadow-lg transform hover:scale-105"
              style={{ backgroundColor: 'var(--green)' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
            {isAdmin ? (
              <p>
                Contact support for admin access
              </p>
            ) : (
              <>
                <p>
                  Don&apos;t have an account?{' '}
                  <Link href="/register" className="font-semibold hover:underline" style={{ color: 'var(--green)' }}>
                    Create one
                  </Link>
                </p>
              </>
            )}
          </div>

          <div className="text-center mt-4">
            <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              ← Back to home
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-gray-500">
          <p>Your data is secure and encrypted</p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
