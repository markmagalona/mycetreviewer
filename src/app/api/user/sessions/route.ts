import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const limit  = Math.min(parseInt(searchParams.get('limit') || '10'), 100)
  if (!userId) return NextResponse.json([], { status: 400 })

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('exam_sessions')
    .select('id, school_id, exam_type, status, score, total_questions, correct_answers, xp_earned, completed_at, weak_topics')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(limit)

  return NextResponse.json(data || [])
}
