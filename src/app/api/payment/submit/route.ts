// src/app/api/payment/submit/route.ts
// Auto-grants access on submission — no waiting for manual approval
// Mark reviews GCash manually and revokes in admin if fake

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = createAdminClient()
  const form     = await request.formData().catch(() => null)
  if (!form) return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })

  const name       = form.get('name') as string
  const email      = form.get('email') as string
  const phone      = form.get('phone') as string
  const reference  = form.get('reference') as string
  const amount     = parseFloat(form.get('amount') as string) || 500
  const targetExam = form.get('target_exam') as string
  const screenshot = form.get('screenshot') as File | null

  if (!name || !email || !reference) {
    return NextResponse.json({ error: 'Name, email, and reference number are required.' }, { status: 400 })
  }

  try {
    // Find or create user
    let { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (!user) {
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          email: email.toLowerCase().trim(),
          name,
          phone,
          target_schools: targetExam ? [targetExam] : [],
        })
        .select('id')
        .single()
      if (error) throw error
      user = newUser
    }

    // Upload screenshot if provided
    let screenshotUrl: string | null = null
    if (screenshot && screenshot.size > 0) {
      const ext      = screenshot.name.split('.').pop() || 'jpg'
      const fileName = `payments/${user.id}/${Date.now()}.${ext}`
      const buffer   = Buffer.from(await screenshot.arrayBuffer())
      const { data: uploaded } = await supabase.storage
        .from('screenshots')
        .upload(fileName, buffer, { contentType: screenshot.type })
      if (uploaded) {
        const { data: urlData } = supabase.storage.from('screenshots').getPublicUrl(fileName)
        screenshotUrl = urlData.publicUrl
      }
    }

    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()

    // Create purchase record — status 'approved' immediately
    await supabase.from('purchases').insert({
      user_id:           user.id,
      amount,
      payment_reference: reference.trim(),
      screenshot_url:    screenshotUrl,
      status:            'approved', // auto-approve — admin revokes if fake
      approved_at:       new Date().toISOString(),
      expires_at:        expiresAt,
    })

    // Activate account immediately
    await supabase.from('users').update({
      is_paid:           true,
      access_expires_at: expiresAt,
      updated_at:        new Date().toISOString(),
    }).eq('id', user.id)

    // Send payment confirmation email (non-blocking)
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/payment-confirmed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.toLowerCase().trim(), name, expiresAt }),
    }).catch(() => {})

    return NextResponse.json({ success: true, userId: user.id })
  } catch (err) {
    console.error('Payment submit error:', err)
    return NextResponse.json({ error: 'Submission failed. Please try again.' }, { status: 500 })
  }
}
