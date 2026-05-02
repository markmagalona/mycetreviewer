'use client'
// src/app/auth/callback/page.tsx
// Handles magic link redirect from Supabase
// After user clicks the email link they land here
// We exchange the code for a session, find/create their user record,
// then redirect to profile (first time) or dashboard (returning)

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading'|'success'|'error'>('loading')
  const [message, setMessage] = useState('Signing you in...')

  useEffect(() => {
    async function handleCallback() {
      const supabase = createClient()

      try {
        // Exchange the auth code for a session
        const code = new URLSearchParams(window.location.search).get('code')
const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(
  code || window.location.href
)

        if (error || !session) {
          // Try getting existing session (user may have already exchanged)
          const { data: { session: existing } } = await supabase.auth.getSession()
          if (!existing) {
            setStatus('error')
            setMessage('Sign-in link expired or invalid. Please request a new one.')
            return
          }
        }

        const finalSession = session || (await supabase.auth.getSession()).data.session
        if (!finalSession?.user) {
          setStatus('error')
          setMessage('Could not complete sign-in. Please try again.')
          return
        }

        setMessage('Finding your account...')

        // Look up user in our users table by email
        const res  = await fetch('/api/auth/session', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ email: finalSession.user.email }),
        })
        const data = await res.json()

        if (!data.userId) {
          setStatus('error')
          setMessage('Account not found. Please sign up first.')
          return
        }

        // Store userId for use across the app
        sessionStorage.setItem('userId',    data.userId)
        sessionStorage.setItem('userEmail', finalSession.user.email || '')
        localStorage.setItem('userId',      data.userId)

        setStatus('success')

        // First-time users go to profile setup, returning users go to dashboard
        if (data.isNewUser || !data.hasUsername) {
          setMessage('Welcome! Setting up your profile...')
          setTimeout(() => router.push('/profile'), 800)
        } else {
          setMessage('Welcome back! Loading your dashboard...')
          setTimeout(() => router.push('/dashboard'), 800)
        }

      } catch (err) {
        console.error('Auth callback error:', err)
        setStatus('error')
        setMessage('Something went wrong. Please try signing in again.')
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <div className="text-2xl font-black text-gray-900 mb-6">
          MyCET<span className="text-red-600">Reviewer</span>
        </div>

        {status === 'loading' && (
          <div>
            <div className="w-10 h-10 border-3 border-gray-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4" style={{borderWidth:'3px'}}/>
            <div className="text-sm text-gray-600">{message}</div>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="text-3xl mb-3">✅</div>
            <div className="text-sm font-bold text-green-700">{message}</div>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="text-3xl mb-3">❌</div>
            <div className="text-sm text-red-600 mb-5">{message}</div>
            <a href="/login"
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors">
              Back to sign in
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
