// src/app/api/admin/payments/revoke/route.ts
// Revokes paid access when GCash payment doesn't match

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  // Verify admin session
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

  const supabase = createAdminClient()

  await Promise.all([
    // Mark payment as rejected
    supabase.from('purchases')
      .update({ status: 'rejected' })
      .eq('id', paymentId),
    // Revoke user access
    supabase.from('users')
      .update({ is_paid: false, access_expires_at: null })
      .eq('id', userId),
  ])

  // Redirect back to payments page
  return NextResponse.redirect(new URL('/admin/payments', request.url))
}
