// src/app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()
    if (!token || !password) return NextResponse.json({ error: 'Token and password required' }, { status: 400 })
    if (password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })

    const supabase = createAdminClient()

    // Look up token
    const { data: resetToken } = await supabase
      .from('password_reset_tokens')
      .select('user_id, email, expires_at, used')
      .eq('token', token)
      .single()

    if (!resetToken) return NextResponse.json({ error: 'Invalid or expired reset link. Please request a new one.' }, { status: 400 })
    if (resetToken.used) return NextResponse.json({ error: 'This reset link has already been used. Please request a new one.' }, { status: 400 })
    if (new Date(resetToken.expires_at) < new Date()) return NextResponse.json({ error: 'This reset link has expired. Please request a new one.' }, { status: 400 })

    // Update password in Supabase Auth
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      resetToken.user_id,
      { password }
    )

    if (updateError) {
      console.error('Password update error:', updateError)
      return NextResponse.json({ error: 'Failed to update password. Please try again.' }, { status: 500 })
    }

    // Mark token as used
    await supabase
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('token', token)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Reset password error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
