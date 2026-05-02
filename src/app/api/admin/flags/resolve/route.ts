// src/app/api/admin/flags/resolve/route.ts
// Resolves a flagged question — dismiss or delete

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')?.value
  if (!session || session !== process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const form       = await request.formData()
  const flagId     = form.get('flagId') as string
  const questionId = form.get('questionId') as string
  const action     = form.get('action') as 'dismiss' | 'delete'

  const supabase = createAdminClient()

  if (action === 'delete') {
    // Hide the question from students
    await supabase.from('questions').update({ status: 'hidden' }).eq('id', questionId)
    // Mark flag as resolved-deleted
    await supabase.from('question_flags')
      .update({ status: 'resolved_deleted', resolved_at: new Date().toISOString() })
      .eq('id', flagId)
  } else {
    // Mark question as active (un-hide if it was auto-hidden)
    await supabase.from('questions').update({ status: 'active', flag_count: 0 }).eq('id', questionId)
    // Mark flag as dismissed
    await supabase.from('question_flags')
      .update({ status: 'resolved_dismissed', resolved_at: new Date().toISOString() })
      .eq('id', flagId)
  }

  return NextResponse.redirect(new URL('/admin/flagged', request.url))
}
