// src/app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import crypto from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://mycetreviewer.com'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const cleanEmail = email.toLowerCase().trim()
    const supabase   = createAdminClient()

    // Check if user exists
    const { data: user } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('email', cleanEmail)
      .single()

    // Always return success to prevent email enumeration
    if (!user) return NextResponse.json({ success: true })

    // Generate secure token
    const token     = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour

    // Store reset token
    await supabase.from('password_reset_tokens').upsert({
      user_id:    user.id,
      email:      cleanEmail,
      token,
      expires_at: expiresAt,
      used:       false,
    }, { onConflict: 'email' })

    const resetLink = `${APP_URL}/reset-password?token=${token}`
    const firstName = (user.name || cleanEmail.split('@')[0]).split(' ')[0]

    // Send email via Resend
    await resend.emails.send({
      from:    'MyCETReviewer <hello@mycetreviewer.com>',
      to:      cleanEmail,
      subject: 'Reset your MyCETReviewer password',
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:520px;margin:40px auto;padding:0 20px;">
    <div style="background:white;border-radius:16px;padding:40px;border:1px solid #e5e7eb;">
      <div style="text-align:center;margin-bottom:32px;">
        <div style="font-size:24px;font-weight:900;color:#111827;">MyCET<span style="color:#c1121f;">Reviewer</span></div>
      </div>
      <h1 style="font-size:20px;font-weight:800;color:#111827;margin:0 0 8px;">Reset your password</h1>
      <p style="font-size:14px;color:#6b7280;margin:0 0 24px;">Hi ${firstName}, we received a request to reset your password. Click the button below — this link expires in 1 hour.</p>
      <div style="text-align:center;margin:32px 0;">
        <a href="${resetLink}" style="display:inline-block;background:#c1121f;color:white;font-weight:800;font-size:15px;padding:14px 32px;border-radius:12px;text-decoration:none;">
          Reset Password →
        </a>
      </div>
      <p style="font-size:12px;color:#9ca3af;margin:24px 0 0;text-align:center;">If you didn't request this, you can safely ignore this email. Your password won't change.</p>
      <p style="font-size:11px;color:#d1d5db;margin:8px 0 0;text-align:center;word-break:break-all;">
        Or copy this link: ${resetLink}
      </p>
    </div>
    <p style="text-align:center;font-size:11px;color:#d1d5db;margin-top:16px;">
      MyCETReviewer · <a href="${APP_URL}/privacy" style="color:#d1d5db;">Privacy</a> · <a href="${APP_URL}/terms" style="color:#d1d5db;">Terms</a>
    </p>
  </div>
</body>
</html>`,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Forgot password error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
