// src/app/api/auth/register/route.ts
// Creates new account with email + password

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
  }

  const { email, password, name } = body
  const cleanEmail = email.toLowerCase().trim()
  const supabase   = createAdminClient()

  // Check if email already exists in our users table
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', cleanEmail)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'An account with this email already exists. Sign in instead.' }, { status: 409 })
  }

  // Create Supabase auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email:             cleanEmail,
    password,
    email_confirm:     true, // skip email confirmation for now
  })

  if (authError || !authData.user) {
    if (authError?.message?.includes('already registered')) {
      return NextResponse.json({ error: 'An account with this email already exists. Sign in instead.' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 })
  }

  // Create user record in our users table
  const { data: newUser, error: userError } = await supabase
    .from('users')
    .insert({
      id:    authData.user.id, // use same UUID as Supabase auth
      email: cleanEmail,
      name:  name || cleanEmail.split('@')[0],
    })
    .select('id')
    .single()

  if (userError || !newUser) {
    return NextResponse.json({ error: 'Account created but profile setup failed. Please contact support.' }, { status: 500 })
  }

  // Send welcome email (non-blocking)
  fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://mycetreviewer.com'}/api/auth/welcome-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: cleanEmail, name: name || '' }),
  }).catch(() => {})

  return NextResponse.json({
    success:   true,
    userId:    newUser.id,
    isNewUser: true,
  })
}
