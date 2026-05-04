// src/app/api/auth/payment-confirmed/route.ts
// Sends payment confirmation email via Resend
// Called from admin quick-actions/grant-paid route after access is granted

import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://mycetreviewer.com'

export async function POST(request: NextRequest) {
  try {
    const { email, name, expiresAt } = await request.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const firstName = (name || email.split('@')[0]).split(' ')[0]
    const expiryDate = expiresAt
      ? new Date(expiresAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })

    await resend.emails.send({
      from:    'MyCETReviewer <hello@mycetreviewer.com>',
      to:      email,
      subject: "You're in! Full access to MyCETReviewer is now active 🎓",
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:540px;margin:40px auto;padding:0 20px;">
    <div style="background:white;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">

      <!-- Header -->
      <div style="background:#111827;padding:32px 40px 28px;">
        <div style="font-size:24px;font-weight:900;color:white;margin-bottom:4px;">
          MyCET<span style="color:#c1121f;">Reviewer</span>
        </div>
        <div style="font-size:13px;color:#9ca3af;">Your CET preparation platform</div>
      </div>

      <!-- Body -->
      <div style="padding:36px 40px;">
        <h1 style="font-size:22px;font-weight:900;color:#111827;margin:0 0 8px;">
          You're in, ${firstName}! 🎉
        </h1>
        <p style="font-size:15px;color:#6b7280;margin:0 0 28px;line-height:1.6;">
          Your payment has been verified and your <strong style="color:#111827;">full access to MyCETReviewer is now active</strong> — valid for one full year.
        </p>

        <!-- What's unlocked -->
        <div style="background:#fef2f2;border-radius:12px;padding:24px;margin-bottom:28px;">
          <div style="font-size:12px;font-weight:700;color:#c1121f;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:16px;">
            What you now have access to
          </div>
          <table style="width:100%;border-collapse:collapse;">
            ${[
              ['AI-generated practice questions', 'Fresh every session, verified for accuracy'],
              ['Full mock exams', 'Real question counts, strict timers, no hints'],
              ['20 AI training sessions per day', '2× more than the free plan'],
              ['30-day personalized study plan', 'Built around your diagnostic weak topics'],
              ['Wrong answer review', 'After every training and mock session'],
              ['All 6 CETs covered', 'UPCAT, ACET, DCAT, USTET, PUPCET, State U CET'],
              ['XP system, ranks & leaderboard', 'Compete with students nationwide'],
            ].map(([feature, desc]) => `
            <tr>
              <td style="padding:6px 0;vertical-align:top;width:20px;">
                <span style="color:#c1121f;font-weight:700;font-size:14px;">✓</span>
              </td>
              <td style="padding:6px 0 6px 8px;">
                <span style="font-size:14px;font-weight:700;color:#111827;">${feature}</span>
                <span style="font-size:13px;color:#6b7280;"> — ${desc}</span>
              </td>
            </tr>`).join('')}
          </table>
        </div>

        <!-- CTA -->
        <div style="text-align:center;margin-bottom:28px;">
          <a href="${APP_URL}/dashboard"
            style="display:inline-block;background:#c1121f;color:white;font-weight:800;font-size:15px;padding:14px 36px;border-radius:12px;text-decoration:none;">
            Start Training Now →
          </a>
          <div style="font-size:12px;color:#9ca3af;margin-top:10px;">
            Start with the free diagnostic if you haven't yet — it finds your exact weak spots.
          </div>
        </div>

        <!-- Expiry notice -->
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-bottom:24px;text-align:center;">
          <div style="font-size:12px;color:#6b7280;margin-bottom:4px;">Your access is valid until</div>
          <div style="font-size:16px;font-weight:900;color:#111827;">${expiryDate}</div>
        </div>

        <p style="font-size:13px;color:#9ca3af;margin:0;line-height:1.6;">
          Questions? Reply to this email or visit
          <a href="${APP_URL}/contact" style="color:#c1121f;text-decoration:none;">mycetreviewer.com/contact</a>.
          <br/>Good luck on your exam — you've got this. 💪
        </p>
      </div>

      <!-- Footer -->
      <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
        <div style="font-size:11px;color:#9ca3af;">
          MyCETReviewer ·
          <a href="${APP_URL}/privacy" style="color:#9ca3af;text-decoration:none;">Privacy Policy</a> ·
          <a href="${APP_URL}/terms" style="color:#9ca3af;text-decoration:none;">Terms of Use</a>
        </div>
        <div style="font-size:11px;color:#d1d5db;margin-top:4px;">
          To stop receiving emails, contact hello@mycetreviewer.com
        </div>
      </div>

    </div>
  </div>
</body>
</html>`
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Payment confirmation email error:', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
