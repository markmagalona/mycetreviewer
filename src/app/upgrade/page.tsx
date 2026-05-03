'use client'
export const dynamic = 'force-dynamic'
// src/app/upgrade/page.tsx
// Only lists features that are actually built

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

const FEATURES = [
  { icon: '🎓', text: 'All 6 admission tests — UPCAT, ACET, DCAT, USTET, PUPCET, State U CET' },
  { icon: '🤖', text: 'AI-generated practice questions — fresh every session' },
  { icon: '🏃', text: 'Full mock exams — exact sections, strict timers, no hints' },
  { icon: '📊', text: 'Personalized weak topic analysis after every exam' },
  { icon: '⚡', text: '20 AI training sessions per day (free: 10)' },
  { icon: '🔁', text: 'Wrong answer review after mock and training sessions' },
  { icon: '🏆', text: 'XP system, ranks, and weekly leaderboard' },
  { icon: '📅', text: 'Exam countdown and daily study tracking' },
]

export default function UpgradePage() {
  const { user } = useAuth()
  const [submitted, setSubmitted] = useState(false)
  const [gcashName, setGcashName] = useState('')
  const [gcashRef,  setGcashRef]  = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')

  if (user?.isPaid) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-4xl mb-4">✅</div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">You have Full Access</h1>
          <p className="text-sm text-gray-500 mb-6">Your access is active. Go train!</p>
          <Link href="/dashboard" className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-2xl transition-colors">
            Go to Dashboard →
          </Link>
        </div>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!gcashName.trim() || !gcashRef.trim()) {
      setError('Please enter your GCash name and reference number.')
      return
    }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/payment/submit', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          userId:    user?.id || '',
          email:     user?.email || '',
          gcashName: gcashName.trim(),
          gcashRef:  gcashRef.trim(),
          amount:    500,
        }),
      })
      if (res.ok) setSubmitted(true)
      else { const d = await res.json(); setError(d.error || 'Submission failed.') }
    } catch { setError('Network error. Please try again.') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href={user ? '/dashboard' : '/'} className="text-sm text-gray-500 hover:text-gray-900">← Back</Link>
          <span className="font-black text-gray-900">MyCET<span className="text-red-600">Reviewer</span></span>
          <div/>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        {/* Price card */}
        <div className="bg-gray-900 rounded-3xl p-6 mb-8 text-center">
          <div className="text-xs text-gray-400 uppercase tracking-widest mb-2">Full Access</div>
          <div className="text-5xl font-black text-white mb-1">₱500</div>
          <div className="text-red-400 font-semibold text-sm mb-1">1 year · one-time · pay via GCash or Instapay</div>
          <div className="text-gray-500 text-xs">vs ₱8,000–₱25,000 at review centers</div>
        </div>

        {/* Features */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">What you unlock</h2>
          <div className="space-y-3">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-lg flex-shrink-0">{f.icon}</span>
                <span className="text-sm text-gray-700 leading-relaxed">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment */}
        {submitted ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
            <div className="text-3xl mb-3">✅</div>
            <div className="text-lg font-black text-green-900 mb-2">Payment submitted!</div>
            <div className="text-sm text-green-700 leading-relaxed mb-4">
              We'll verify your GCash or Instapay payment and activate your access within a few minutes.
              You'll be able to refresh and start training shortly.
            </div>
            <Link href="/dashboard"
              className="inline-block bg-green-700 hover:bg-green-800 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm">
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-2xl p-6">
            <h2 className="text-base font-black text-gray-900 mb-1">Pay via GCash or Instapay</h2>
            <p className="text-sm text-gray-500 mb-5">Send ₱500 to our GCash or Instapay number, then submit your reference number below.</p>

            {/* GCash / Instapay QR + number */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5 text-center">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">Scan QR or send to number</div>
              <img src="/gcash-qr.png" alt="GCash / Instapay QR Code" className="w-48 h-48 mx-auto mb-3 rounded-xl object-contain"/>
              <div className="text-xl font-black text-gray-900 tracking-wider">0919-381-0347</div>
              <div className="text-xs text-gray-500 mt-1">MyCETReviewer · GCash or Instapay</div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Your GCash / Instapay Account Name
                </label>
                <input type="text" value={gcashName} onChange={e => setGcashName(e.target.value)}
                  placeholder="As it appears in GCash or Instapay" required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  GCash / Instapay Reference Number
                </label>
                <input type="text" value={gcashRef} onChange={e => setGcashRef(e.target.value)}
                  placeholder="Reference number from GCash or Instapay" required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500"/>
              </div>
              {error && <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
              <button type="submit" disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-black py-4 rounded-2xl transition-colors">
                {loading ? 'Submitting...' : 'Submit Payment →'}
              </button>
              <p className="text-xs text-gray-400 text-center">Access activated immediately after verification · Usually within 5 minutes</p>
            </form>
          </div>
        )}

        <div className="text-center mt-6">
          <Link href="/diagnostic" className="text-sm text-gray-400 hover:text-gray-600">
            Try the free diagnostic first →
          </Link>
        </div>
      </div>
    </div>
  )
}
