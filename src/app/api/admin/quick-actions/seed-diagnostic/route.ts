// src/app/api/admin/quick-actions/seed-diagnostic/route.ts
// Seeds a completed UPCAT diagnostic for a user — unlocks AI training
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

  // Find user
  const { data: user } = await supabase
    .from('users').select('id').eq('email', email).single()
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Check if diagnostic already exists
  const { count } = await supabase
    .from('exam_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('exam_type', 'diagnostic')
    .eq('status', 'completed')

  if ((count || 0) > 0) {
    // Already has a diagnostic — just redirect
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // Seed a completed UPCAT diagnostic
  await supabase.from('exam_sessions').insert({
    user_id:         user.id,
    school_id:       'upcat',
    exam_type:       'diagnostic',
    status:          'completed',
    score:           55,
    total_questions: 20,
    correct_answers: 11,
    xp_earned:       180,
    weak_topics:     ['Mathematics — Algebra', 'Language Proficiency — Grammar', 'Science — Cell Biology'],
    completed_at:    new Date().toISOString(),
  })

  // Give them some XP too
  await supabase.from('users')
    .update({ xp: 180, rank: 'Mag-aaral', last_active_at: new Date().toISOString() })
    .eq('id', user.id)

  return NextResponse.redirect(new URL('/admin', request.url))
}
