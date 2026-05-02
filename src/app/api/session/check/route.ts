// src/app/api/session/check/route.ts
// Returns any active in-progress training or mock session for a user
// Used by client before starting a new session

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  if(!userId) return NextResponse.json({error:'userId required'},{status:400})

  const supabase = createAdminClient()
  const {data:activeSession} = await supabase
    .from('exam_sessions')
    .select('id, started_at, exam_type, school_id')
    .eq('user_id', userId)
    .eq('status', 'in_progress')
    .in('exam_type', ['training','mock'])
    .order('started_at', {ascending:false})
    .limit(1)
    .single()

  return NextResponse.json({
    hasActiveSession: !!activeSession,
    session: activeSession || null,
  })
}
