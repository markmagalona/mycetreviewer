// src/app/api/admin/schools/reject/route.ts
// Removes an incorrect community-submitted school from the list

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')?.value
  if (!session || session !== process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const form     = await request.formData()
  const schoolId = form.get('schoolId') as string

  if (!schoolId) {
    return NextResponse.json({ error: 'schoolId required' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Remove from schools_ph entirely
  await supabase.from('schools_ph').delete().eq('id', schoolId)

  // Also clear this school from any user profiles that have it set
  await supabase.from('users')
    .update({ ph_school_id: null })
    .eq('ph_school_id', schoolId)

  // Mark pending log as rejected
  await supabase.from('pending_schools')
    .update({ status: 'rejected' })
    .eq('status', 'auto_approved')

  return NextResponse.redirect(new URL('/admin/schools', request.url))
}
