// src/app/api/mock/start/route.ts — v2
// Adds weekly limit: 1 mock per week per user

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body?.userId || !body?.schoolId) {
    return NextResponse.json({ error: 'userId and schoolId required' }, { status: 400 })
  }

  const { userId, schoolId } = body
  const supabase = createAdminClient()

  // Guard 1: must have completed at least 1 diagnostic
  const { data: sessions } = await supabase
    .from('exam_sessions')
    .select('id, exam_type, status, completed_at')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(100)

  const hasDiagnostic = (sessions || []).some(s =>
    s.exam_type === 'diagnostic' && s.status === 'completed'
  )

  if (!hasDiagnostic) {
    return NextResponse.json({
      error: 'Complete your diagnostic exam first before taking a mock exam.',
      code:  'DIAGNOSTIC_REQUIRED',
    }, { status: 403 })
  }

  // Guard 2: weekly mock limit — 1 per week
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const mockThisWeek = (sessions || []).filter(s =>
    s.exam_type === 'mock' &&
    s.status === 'completed' &&
    s.completed_at > weekAgo
  )

  if (mockThisWeek.length >= 1) {
    return NextResponse.json({
      error: 'You have already taken a mock exam this week. Come back next week!',
      code:  'WEEKLY_LIMIT',
    }, { status: 403 })
  }

  // Guard 3: no active training or mock session
  const activeSession = (sessions || []).find(s =>
    s.status === 'in_progress' &&
    ['training', 'mock'].includes(s.exam_type)
  )

  if (activeSession) {
    return NextResponse.json({
      error:   'You have an unfinished session. Complete or abandon it first.',
      code:    'SESSION_IN_PROGRESS',
      session: { id: activeSession.id, type: activeSession.exam_type },
    }, { status: 403 })
  }

  // Guard 4: must be paid
  const { data: user } = await supabase
    .from('users')
    .select('is_paid')
    .eq('id', userId)
    .single()

  if (!user?.is_paid) {
    return NextResponse.json({
      error: 'Mock exams require Full Access.',
      code:  'PAYMENT_REQUIRED',
    }, { status: 403 })
  }

  // Create session
  const { data: session, error } = await supabase
    .from('exam_sessions')
    .insert({
      user_id:    userId,
      school_id:  schoolId,
      exam_type:  'mock',
      status:     'in_progress',
      started_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error || !session) {
    return NextResponse.json({ error: 'Could not create session.' }, { status: 500 })
  }

  return NextResponse.json({ success: true, sessionId: session.id })
}
