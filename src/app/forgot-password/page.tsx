'use client'
export const dynamic = 'force-dynamic'
// src/app/forgot-password/page.tsx

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) { setError('Please enter your email.'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      })
      if (res.ok) setSent(true)
      else { const d = await res.json(); setError(d.error || 'Something went wrong.') }
    } catch { setError('Network error. Please try again.') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/login">
            <div className="text-2xl font-black text-gray-900 mb-1">
              MyCET<span className="text-red-600">Reviewer</span>
            </div>
          </Link>
          <div className="text-sm text-gray-500">Reset your password</div>
        </div>

        {sent ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
            <div className="text-3xl mb-3">📧</div>
            <div className="text-base font-black text-green-900 mb-2">Check your email</div>
            <div className="text-sm text-green-700 mb-4">
              We sent a password reset link to <strong>{email}</strong>. Check your inbox and spam folder.
            </div>
            <Link href="/login" className="text-sm text-red-600 hover:underline">← Back to sign in</Link>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <p className="text-sm text-gray-500 mb-5">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError('') }}
                  placeholder="your@email.com" required autoFocus
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500"/>
              </div>
              {error && <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
              <button type="submit" disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-black py-3 rounded-xl transition-colors">
                {loading ? 'Sending...' : 'Send Reset Link →'}
              </button>
            </form>
            <div className="text-center mt-4">
              <Link href="/login" className="text-sm text-gray-400 hover:text-gray-600">← Back to sign in</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
