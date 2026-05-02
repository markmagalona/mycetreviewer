// src/app/api/auth/magic-link/route.ts
// Sends magic link email via Supabase
// Includes redirect URL in the link so user lands in the right place

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body?.email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  const email    = body.email.toLowerCase().trim()
  const redirect = body.redirect || '/dashboard'

  // Build the callback URL — Supabase will redirect here after link click
  const baseUrl     = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const callbackUrl = `${baseUrl}/auth/callback?redirect=${encodeURIComponent(redirect)}`

  const supabase = createAdminClient()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: callbackUrl,
      shouldCreateUser: true, // create Supabase auth user if not exists
    },
  })

  if (error) {
    console.error('Magic link error:', error)
    return NextResponse.json({ error: 'Could not send sign-in link. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
