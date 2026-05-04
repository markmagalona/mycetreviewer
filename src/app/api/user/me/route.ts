// src/app/api/user/me/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('users')
    .select('id, email, name, username, is_paid, xp, rank, streak_days, target_schools, ph_school_name, exam_date, access_expires_at')
    .eq('id', userId)
    .single()

  if (error || !data) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Check access expiry
  const isAccessValid = data.is_paid && (
    !data.access_expires_at ||
    new Date(data.access_expires_at) > new Date()
  )

  return NextResponse.json({ ...data, is_paid: isAccessValid })
}
