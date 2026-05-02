// src/app/api/admin/quick-actions/reset-user/route.ts
// Resets a user back to free tier with no sessions — for testing fresh flows
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

  const { data: user } = await supabase
    .from('users').select('id').eq('email', email).single()
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Delete all exam sessions
  await supabase.from('exam_sessions').delete().eq('user_id', user.id)

  // Reset user to free tier
  await supabase.from('users').update({
    is_paid:           false,
    access_expires_at: null,
    xp:                0,
    rank:              'Baguhan',
    streak_days:       0,
  }).eq('id', user.id)

  return NextResponse.redirect(new URL('/admin', request.url))
}
