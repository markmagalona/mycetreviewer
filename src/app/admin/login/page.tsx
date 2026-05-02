// src/app/admin/login/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/auth', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ password }),
      })
      if (res.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || 'Incorrect password.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-2xl font-black text-white mb-1">
            MyCET<span className="text-red-500">Reviewer</span>
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">Admin Access</div>
        </div>

        <form onSubmit={handleLogin}
          className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Admin Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500 transition-colors mb-4"
            placeholder="Enter admin password"
            required
            autoFocus
          />

          {error && (
            <div className="mb-4 text-xs text-red-400 bg-red-950 border border-red-900 rounded-lg px-3 py-2.5">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold py-3 rounded-xl transition-colors text-sm">
            {loading ? 'Checking...' : 'Login to Admin'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-600 mt-4">
          MyCETReviewer Admin · Authorized access only
        </p>
      </div>
    </div>
  )
}
