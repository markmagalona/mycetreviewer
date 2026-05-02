// src/app/api/session/abandon/route.ts
// Marks an in-progress session as abandoned so user can start a new one
// No XP awarded for abandoned sessions

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(()=>null)
  if(!body?.sessionId||!body?.userId) return NextResponse.json({error:'sessionId and userId required'},{status:400})

  const supabase = createAdminClient()

  // Verify the session belongs to this user
  const {data:session} = await supabase
    .from('exam_sessions')
    .select('id, user_id, status')
    .eq('id', body.sessionId)
    .eq('user_id', body.userId)
    .single()

  if(!session) return NextResponse.json({error:'Session not found'},{status:404})
  if(session.status!=='in_progress') return NextResponse.json({error:'Session is not in progress'},{status:400})

  const {error} = await supabase
    .from('exam_sessions')
    .update({status:'abandoned', completed_at:new Date().toISOString()})
    .eq('id', body.sessionId)

  if(error) return NextResponse.json({error:'Failed to abandon session'},{status:500})
  return NextResponse.json({success:true})
}
