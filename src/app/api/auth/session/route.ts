// src/app/api/auth/session/route.ts
// Called after magic link callback
// Finds or creates the user record, returns userId + profile status

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body?.email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  const supabase = createAdminClient()
  const email    = body.email.toLowerCase().trim()

  // Find existing user
  const { data: existing } = await supabase
    .from('users')
    .select('id, username, is_paid, access_expires_at')
    .eq('email', email)
    .single()

  if (existing) {
    // Update last active timestamp
    await supabase.from('users')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', existing.id)

    return NextResponse.json({
      userId:      existing.id,
      isNewUser:   false,
      hasUsername: !!existing.username,
      isPaid:      existing.is_paid,
    })
  }

  // New user — create their record
  const { data: newUser, error } = await supabase
    .from('users')
    .insert({
      email,
      name:            email.split('@')[0],
      last_active_at:  new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error || !newUser) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }

  return NextResponse.json({
    userId:      newUser.id,
    isNewUser:   true,
    hasUsername: false,
    isPaid:      false,
  })
}
