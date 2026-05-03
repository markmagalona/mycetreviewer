'use client'
export const dynamic = 'force-dynamic'
// src/app/reset-password/page.tsx

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const params  = useSearchParams()
  const router  = useRouter()
  const token   = params.get('token') || ''

  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [loading,   setLoading]   = useState(false)
  const [done,      setDone]      = useState(false)
  const [error,     setError]     = useState('')

  useEffect(() => {
    if (!token) setError('Invalid or missing reset token. Please request a new reset link.')
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ token, password })
      })
      if (res.ok) setDone(true)
      else { const d = await res.json(); setError(d.error || 'Reset failed. Please request a new link.') }
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
          <div className="text-sm text-gray-500">Set a new password</div>
        </div>

        {done ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
            <div className="text-3xl mb-3">✅</div>
            <div className="text-base font-black text-green-900 mb-2">Password updated!</div>
            <div className="text-sm text-green-700 mb-4">You can now sign in with your new password.</div>
            <Link href="/login"
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-black px-6 py-3 rounded-xl transition-colors text-sm">
              Sign in →
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">New Password</label>
                <input type="password" value={password} onChange={e => { setPassword(e.target.value); setError('') }}
                  placeholder="At least 8 characters" required minLength={8} autoFocus
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Confirm Password</label>
                <input type="password" value={confirm} onChange={e => { setConfirm(e.target.value); setError('') }}
                  placeholder="Repeat your new password" required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500"/>
              </div>
              {error && <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
              <button type="submit" disabled={loading || !token}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-black py-3 rounded-xl transition-colors">
                {loading ? 'Updating...' : 'Set New Password →'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
