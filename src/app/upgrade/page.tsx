'use client'
// src/app/upgrade/page.tsx
// GCash payment — exam date field REMOVED per request
// Access granted immediately on submission

import { useState } from 'react'
import Link from 'next/link'

const FEATURES = [
  'Everything in Free',
  'Unlimited AI practice questions',
  'Full mock exams — all 6 admission tests',
  'AI personalized 30-day study plan',
  'Mistake review mode',
  'Performance history + score tracking',
  'Dark mode + custom themes',
  'Spaced repetition training',
  'Speed XP bonuses',
]

export default function UpgradePage() {
  const [step,       setStep]       = useState<'offer'|'payment'|'confirm'>('offer')
  const [name,       setName]       = useState('')
  const [email,      setEmail]      = useState('')
  const [phone,      setPhone]      = useState('')
  const [reference,  setReference]  = useState('')
  const [targetExam, setTargetExam] = useState('')
  const [screenshot, setScreenshot] = useState<File|null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reference.trim()) { setError('Please enter your GCash reference number.'); return }
    setSubmitting(true); setError('')
    try {
      const form = new FormData()
      form.append('name',       name)
      form.append('email',      email)
      form.append('phone',      phone)
      form.append('reference',  reference)
      form.append('amount',     '500')
      form.append('target_exam',targetExam)
      if (screenshot) form.append('screenshot', screenshot)
      const res = await fetch('/api/payment/submit', { method: 'POST', body: form })
      if (res.ok) setStep('confirm')
      else { const d = await res.json(); setError(d.error || 'Submission failed. Please try again.') }
    } catch { setError('Network error. Please try again.') }
    finally { setSubmitting(false) }
  }

  if (step === 'confirm') return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-xl font-black text-gray-900 mb-2">You now have full access!</h1>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          Your account has been activated. Welcome to MyCETReviewer Full Access.
        </p>
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-left mb-6">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Payment summary</div>
          <div className="space-y-1.5 text-sm">
            {[['Name',name],['Email',email],['Amount','₱500'],['Reference',reference]].map(([l,v])=>(
              <div key={l} className="flex justify-between">
                <span className="text-gray-500">{l}</span>
                <span className="font-semibold">{v}</span>
              </div>
            ))}
          </div>
        </div>
        <Link href="/dashboard"
          className="block w-full bg-red-600 text-white font-black py-4 rounded-2xl text-sm text-center hover:bg-red-700 transition-colors">
          Go to My Dashboard →
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white" style={{maxWidth:'480px',margin:'0 auto'}}>
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-black text-gray-900">MyCET<span className="text-red-600">Reviewer</span></Link>
        <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900">Sign in</Link>
      </nav>

      {/* Offer screen */}
      {step === 'offer' && (
        <div className="px-5 py-8">
          <div className="bg-gray-900 rounded-3xl p-6 text-center mb-6">
            <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Full Access</div>
            <div className="text-5xl font-black text-white mb-1">₱500</div>
            <div className="text-sm text-red-400 font-semibold">1 year · one-time · pay via GCash</div>
            <div className="text-xs text-gray-500 mt-1">vs ₱8,000–₱25,000 review centers</div>
          </div>
          <div className="mb-6">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">What you unlock</div>
            <div className="space-y-2.5">
              {FEATURES.map(f=>(
                <div key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
                  <span className="text-green-600 font-bold text-xs flex-shrink-0">✓</span>{f}
                </div>
              ))}
            </div>
          </div>
          <button onClick={()=>setStep('payment')}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl text-sm transition-colors">
            Pay ₱500 via GCash →
          </button>
          <p className="text-xs text-gray-400 text-center mt-2">Access activated immediately after payment</p>
        </div>
      )}

      {/* Payment screen */}
      {step === 'payment' && (
        <div className="px-5 py-6">
          <h2 className="text-lg font-black text-gray-900 mb-1">Pay via GCash</h2>
          <p className="text-sm text-gray-500 mb-6">Scan the QR code and send exactly ₱500</p>

          {/* GCash QR */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-center mb-6">
            <div className="text-xs text-gray-500 mb-3">Scan with GCash app</div>
            <div className="w-48 h-48 mx-auto mb-3 rounded-xl overflow-hidden">
              {/* Replace placeholder with: <img src="/gcash-qr.png" alt="GCash QR" className="w-48 h-48" /> */}
              <div className="w-48 h-48 bg-gray-200 flex items-center justify-center rounded-xl">
                <span className="text-xs text-gray-400 text-center px-4">
                  Save your GCash QR as<br/>public/gcash-qr.png
                </span>
              </div>
            </div>
            <div className="text-sm font-bold text-gray-900">MyCETReviewer</div>
            <div className="text-sm text-gray-600">09193810347</div>
            <div className="mt-3 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              <div className="text-xs text-red-700 font-bold">Send exactly ₱500</div>
              <div className="text-xs text-red-600 mt-0.5">Put your email in the GCash notes/message field</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              ['Full Name','text',name,setName,'Juan dela Cruz'],
              ['Email','email',email,setEmail,'your@email.com'],
              ['Phone Number','tel',phone,setPhone,'09XXXXXXXXX'],
            ].map(([label,type,val,setter,ph])=>(
              <div key={label as string}>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label as string}</label>
                <input type={type as string} value={val as string} onChange={e=>(setter as any)(e.target.value)} placeholder={ph as string}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500" required/>
              </div>
            ))}

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">GCash Reference Number</label>
              <input value={reference} onChange={e=>setReference(e.target.value)} placeholder="e.g. 1234567890"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 font-mono" required/>
              <p className="text-xs text-gray-400 mt-1">Found in your GCash transaction history after payment</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Screenshot of payment{' '}
                <span className="text-gray-400 font-normal normal-case">(optional but recommended)</span>
              </label>
              <input type="file" accept="image/*" onChange={e=>setScreenshot(e.target.files?.[0]||null)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-600 file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-red-50 file:text-red-700"/>
            </div>

            {error&&(
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>
            )}

            <button type="submit" disabled={submitting}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-black py-4 rounded-2xl text-sm transition-colors">
              {submitting?'Activating your account...':'I have paid — Activate my account →'}
            </button>
            <p className="text-xs text-gray-400 text-center">Access activated immediately upon submission</p>
          </form>
        </div>
      )}
    </div>
  )
}
