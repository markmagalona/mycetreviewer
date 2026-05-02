// src/app/api/admin/schools/approve/route.ts
// "Verify" action — marks community-submitted school as DepEd-verified

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

  // Mark as verified
  await supabase
    .from('schools_ph')
    .update({ verified: true })
    .eq('id', schoolId)

  return NextResponse.redirect(new URL('/admin/schools', request.url))
}
