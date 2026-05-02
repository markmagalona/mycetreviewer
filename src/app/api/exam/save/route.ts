// src/app/api/exam/save/route.ts
// Saves a completed exam session — XP, score, weak topics, answers
// Called when student finishes any exam type

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const XP_RANKS = [
  { rank: 'Baguhan',            min: 0    },
  { rank: 'Mag-aaral',          min: 100  },
  { rank: 'Achiever',           min: 300  },
  { rank: 'With Honor',         min: 600  },
  { rank: 'With High Honor',    min: 1000 },
  { rank: 'With Highest Honor', min: 2000 },
]

function getRank(xp: number): string {
  let rank = 'Baguhan'
  for (const r of XP_RANKS) {
    if (xp >= r.min) rank = r.rank
  }
  return rank
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body?.userId || !body?.school || !body?.examType) {
    return NextResponse.json({ error: 'userId, school, and examType required' }, { status: 400 })
  }

  const {
    userId, school, examType, sessionId,
    answers, examXP, totalQuestions, srCount,
  } = body

  const supabase   = createAdminClient()
  const correct    = answers.filter((a: any) => a.isCorrect).length
  const score      = Math.round(correct / totalQuestions * 100)

  // Build weak topics from answers
  const topicMap: Record<string, { correct: number; total: number }> = {}
  answers.forEach((a: any) => {
    const key = `${a.question.subject} — ${a.question.topic}`
    if (!topicMap[key]) topicMap[key] = { correct: 0, total: 0 }
    topicMap[key].total++
    if (a.isCorrect) topicMap[key].correct++
  })
  const weakTopics = Object.entries(topicMap)
    .sort((a, b) => a[1].correct / a[1].total - b[1].correct / b[1].total)
    .slice(0, 5)
    .map(([name]) => name)

  try {
    if (sessionId) {
      // Update existing session (mock exam started via /api/mock/start)
      await supabase.from('exam_sessions').update({
        status:          'completed',
        score,
        total_questions: totalQuestions,
        correct_answers: correct,
        xp_earned:       examXP,
        weak_topics:     weakTopics,
        sr_count:        srCount || 0,
        completed_at:    new Date().toISOString(),
      }).eq('id', sessionId).eq('user_id', userId)
    } else {
      // Create new session record (diagnostic or training)
      await supabase.from('exam_sessions').insert({
        user_id:         userId,
        school_id:       school,
        exam_type:       examType,
        status:          'completed',
        score,
        total_questions: totalQuestions,
        correct_answers: correct,
        xp_earned:       examXP,
        weak_topics:     weakTopics,
        sr_count:        srCount || 0,
        completed_at:    new Date().toISOString(),
      })
    }

    // Update user XP and rank
    const { data: user } = await supabase
      .from('users')
      .select('xp, streak_days, last_active_at')
      .eq('id', userId)
      .single()

    if (user) {
      const newXP    = (user.xp || 0) + examXP
      const newRank  = getRank(newXP)
      const today    = new Date().toISOString().split('T')[0]
      const lastDate = user.last_active_at?.split('T')[0]
      const isNewDay = lastDate !== today
      const newStreak = isNewDay ? (user.streak_days || 0) + 1 : (user.streak_days || 0)

      await supabase.from('users').update({
        xp:              newXP,
        rank:            newRank,
        streak_days:     newStreak,
        last_active_at:  new Date().toISOString(),
      }).eq('id', userId)

      return NextResponse.json({
        success:    true,
        score,
        xpEarned:   examXP,
        newXP,
        newRank,
        weakTopics,
        rankUp:     newRank !== getRank((user.xp || 0)),
      })
    }

    return NextResponse.json({ success: true, score, xpEarned: examXP, weakTopics })

  } catch (err) {
    console.error('Save session error:', err)
    return NextResponse.json({ error: 'Failed to save session.' }, { status: 500 })
  }
}
