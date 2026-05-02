// src/app/api/admin/quick-actions/revoke-paid/route.ts
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

  const supabase = createAdminClient()
  await supabase.from('users')
    .update({ is_paid: false, access_expires_at: null })
    .eq('email', email)

  return NextResponse.redirect(new URL('/admin', request.url))
}
