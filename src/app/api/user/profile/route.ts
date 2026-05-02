// src/app/api/user/profile/route.ts
// Update user profile: username, school, target exam, exam date

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = createAdminClient()
  const body = await request.json().catch(() => null)
  if (!body?.userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const { userId, username, phSchoolId, phSchoolName, targetSchools, examDate } = body

  // Validate username if provided
  if (username !== undefined) {
    if (!username || username.length < 3) {
      return NextResponse.json({ error: 'Username must be at least 3 characters.' }, { status: 400 })
    }
    if (username.length > 20) {
      return NextResponse.json({ error: 'Username must be 20 characters or less.' }, { status: 400 })
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json({ error: 'Username can only contain letters, numbers, and underscores.' }, { status: 400 })
    }

    // Check uniqueness
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('username', username.toLowerCase())
      .neq('id', userId)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'That username is already taken. Try another.' }, { status: 409 })
    }
  }

  const updates: any = { updated_at: new Date().toISOString() }
  if (username !== undefined)     updates.username       = username.toLowerCase()
  if (phSchoolId !== undefined)   updates.ph_school_id   = phSchoolId
  if (phSchoolName !== undefined) updates.ph_school_name = phSchoolName
  if (targetSchools !== undefined)updates.target_schools = targetSchools
  if (examDate !== undefined)     updates.exam_date      = examDate || null

  const { error } = await supabase.from('users').update(updates).eq('id', userId)
  if (error) {
    return NextResponse.json({ error: 'Update failed. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
