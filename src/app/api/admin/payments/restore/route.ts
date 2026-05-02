// src/app/api/admin/payments/restore/route.ts
// Restores paid access if it was revoked by mistake

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')?.value
  if (!session || session !== process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const form      = await request.formData()
  const paymentId = form.get('paymentId') as string
  const userId    = form.get('userId') as string

  if (!paymentId || !userId) {
    return NextResponse.json({ error: 'paymentId and userId required' }, { status: 400 })
  }

  const supabase  = createAdminClient()
  const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()

  await Promise.all([
    supabase.from('purchases')
      .update({ status: 'approved', approved_at: new Date().toISOString(), expires_at: expiresAt })
      .eq('id', paymentId),
    supabase.from('users')
      .update({ is_paid: true, access_expires_at: expiresAt })
      .eq('id', userId),
  ])

  return NextResponse.redirect(new URL('/admin/payments', request.url))
}
