// src/app/api/admin/quick-actions/grant-paid/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  if (cookieStore.get('admin_session')?.value !== process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const form  = await request.formData()
  const email = (form.get('email') as string)?.toLowerCase().trim()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  const supabase  = createAdminClient()
  const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()

  const { error } = await supabase.from('users')
    .update({ is_paid: true, access_expires_at: expiresAt })
    .eq('email', email)

  if (error) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  return NextResponse.redirect(new URL('/admin', request.url))
}
