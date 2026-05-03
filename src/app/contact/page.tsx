'use client'
export const dynamic = 'force-dynamic'
// src/app/contact/page.tsx

import { useState } from 'react'
import Link from 'next/link'

export default function ContactPage() {
  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [issue,   setIssue]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !issue.trim()) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name: name.trim(), email: email.trim(), issue: issue.trim()})
      })
      if (res.ok) setSent(true)
      else setError('Something went wrong. Please email us directly at hello@mycetreviewer.com')
    } catch {
      setError('Network error. Please email us at hello@mycetreviewer.com')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">← Home</Link>
          <span className="font-black text-gray-900">MyCET<span className="text-red-600">Reviewer</span></span>
          <div/>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl font-black text-gray-900 mb-1">Contact Us</h1>
        <p className="text-sm text-gray-500 mb-8">We typically respond within 24 hours. For urgent payment issues, include your GCash reference number.</p>

        {sent ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-3">✅</div>
            <div className="text-lg font-black text-green-900 mb-2">Message sent!</div>
            <div className="text-sm text-green-700">We'll get back to you at {email} within 24 hours.</div>
            <Link href="/" className="inline-block mt-6 text-sm text-red-600 hover:underline">← Back to home</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Your name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Juan dela Cruz" required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com" required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">What can we help you with?</label>
              <textarea value={issue} onChange={e => setIssue(e.target.value)}
                placeholder="Describe your issue or question in detail..."
                rows={5} required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 resize-none"/>
            </div>
            {error && <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
            <button type="submit" disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-black py-4 rounded-2xl transition-colors">
              {loading ? 'Sending...' : 'Send Message →'}
            </button>
            <p className="text-xs text-gray-400 text-center">
              Or email us directly: <a href="mailto:hello@mycetreviewer.com" className="text-red-600 hover:underline">hello@mycetreviewer.com</a>
            </p>
          </form>
        )}

        <div className="mt-10 pt-6 border-t border-gray-100 flex gap-4 text-xs text-gray-400">
          <Link href="/privacy" className="hover:text-gray-600">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-gray-600">Terms of Use</Link>
          <Link href="/" className="hover:text-gray-600">Home</Link>
        </div>
      </div>
    </div>
  )
}
