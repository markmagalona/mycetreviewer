// src/app/api/auth/welcome-email/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://mycetreviewer.com'

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const firstName = (name || email.split('@')[0]).split(' ')[0]

    await resend.emails.send({
      from:    'MyCETReviewer <hello@mycetreviewer.com>',
      to:      email,
      subject: `Welcome to MyCETReviewer, ${firstName}! 🎓`,
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

      <h1 style="font-size:22px;font-weight:900;color:#111827;margin:0 0 8px;">Welcome, ${firstName}! 🎉</h1>
      <p style="font-size:14px;color:#6b7280;margin:0 0 24px;">Your free account is ready. Here's how to get started:</p>

      <div style="background:#fef2f2;border-radius:12px;padding:20px;margin-bottom:24px;">
        <div style="font-size:13px;font-weight:700;color:#c1121f;margin-bottom:12px;">YOUR 3-STEP PLAN</div>
        <div style="display:flex;align-items:flex-start;margin-bottom:10px;">
          <div style="background:#c1121f;color:white;font-weight:800;font-size:11px;border-radius:50%;width:20px;height:20px;display:flex;align-items:center;justify-content:center;margin-right:10px;flex-shrink:0;line-height:20px;text-align:center;">1</div>
          <div style="font-size:13px;color:#374151;"><strong>Take the free diagnostic</strong> — find your exact weak spots in 15 minutes</div>
        </div>
        <div style="display:flex;align-items:flex-start;margin-bottom:10px;">
          <div style="background:#c1121f;color:white;font-weight:800;font-size:11px;border-radius:50%;width:20px;height:20px;display:flex;align-items:center;justify-content:center;margin-right:10px;flex-shrink:0;line-height:20px;text-align:center;">2</div>
          <div style="font-size:13px;color:#374151;"><strong>Train on your weak topics</strong> — AI generates fresh questions every session</div>
        </div>
        <div style="display:flex;align-items:flex-start;">
          <div style="background:#c1121f;color:white;font-weight:800;font-size:11px;border-radius:50%;width:20px;height:20px;display:flex;align-items:center;justify-content:center;margin-right:10px;flex-shrink:0;line-height:20px;text-align:center;">3</div>
          <div style="font-size:13px;color:#374151;"><strong>Take a mock exam</strong> — simulate the real thing with exact question counts</div>
        </div>
      </div>

      <div style="text-align:center;margin:32px 0;">
        <a href="${APP_URL}/diagnostic" style="display:inline-block;background:#c1121f;color:white;font-weight:800;font-size:15px;padding:14px 32px;border-radius:12px;text-decoration:none;">
          Start Free Diagnostic →
        </a>
      </div>

      <div style="background:#f9fafb;border-radius:12px;padding:16px;margin-top:8px;">
        <div style="font-size:12px;color:#6b7280;text-align:center;">
          Want unlimited AI practice, full mock exams, and a personalized 30-day plan?<br/>
          <a href="${APP_URL}/upgrade" style="color:#c1121f;font-weight:700;text-decoration:none;">Upgrade for ₱500 — full year access →</a>
        </div>
      </div>

      <p style="font-size:12px;color:#9ca3af;margin:24px 0 0;text-align:center;">
        Questions? Reply to this email or visit <a href="${APP_URL}/contact" style="color:#c1121f;">mycetreviewer.com/contact</a>
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
    console.error('Welcome email error:', err)
    return NextResponse.json({ success: true }) // Don't fail registration if email fails
  }
}
