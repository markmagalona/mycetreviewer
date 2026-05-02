// src/app/api/leaderboard/route.ts
// Returns global leaderboard + school-filtered leaderboard + Battle of Schools

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type     = searchParams.get('type') || 'global'   // global | school | battle
  const schoolId = searchParams.get('schoolId') || ''
  const examFilter = searchParams.get('exam') || ''       // upcat | acet | etc
  const period   = searchParams.get('period') || 'weekly' // weekly | alltime
  const limit    = Math.min(parseInt(searchParams.get('limit') || '50'), 100)

  const supabase = createAdminClient()

  if (type === 'battle') {
    // Battle of Schools — rank schools by avg score or total XP this week
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // Start of this week
    weekStart.setHours(0, 0, 0, 0)

    const { data: sessions } = await supabase
      .from('exam_sessions')
      .select(`
        score, school_id,
        users!inner(ph_school_id, ph_school_name)
      `)
      .eq('status', 'completed')
      .eq('exam_type', 'diagnostic')
      .gte('completed_at', weekStart.toISOString())
      .not('users.ph_school_id', 'is', null)

    if (!sessions) return NextResponse.json({ schools: [] })

    // Aggregate by school
    const schoolMap: Record<string, { name: string; scores: number[]; students: Set<string> }> = {}
    sessions.forEach((s: any) => {
      const key = s.users?.ph_school_id
      if (!key || !s.users?.ph_school_name) return
      if (!schoolMap[key]) {
        schoolMap[key] = { name: s.users.ph_school_name, scores: [], students: new Set() }
      }
      schoolMap[key].scores.push(s.score || 0)
    })

    const schools = Object.entries(schoolMap)
      .map(([id, data]) => ({
        schoolId: id,
        schoolName: data.name,
        avgScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
        totalStudents: data.scores.length,
        totalSessions: data.scores.length,
      }))
      .filter(s => s.totalStudents >= 2) // At least 2 students to qualify
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, limit)
      .map((s, i) => ({ ...s, rank: i + 1 }))

    return NextResponse.json({ schools, period: 'weekly', weekStart: weekStart.toISOString() })
  }

  // Global or school-filtered leaderboard
  let query = supabase
    .from('users')
    .select('id, username, xp, rank, ph_school_name, target_schools')
    .eq('is_active', true)
    .not('username', 'is', null)
    .gt('xp', 0)
    .order('xp', { ascending: false })
    .limit(limit)

  if (type === 'school' && schoolId) {
    query = query.eq('ph_school_id', schoolId)
  }

  if (examFilter) {
    query = query.contains('target_schools', [examFilter])
  }

  const { data: users, error } = await query

  if (error) {
    return NextResponse.json({ error: 'Failed to load leaderboard' }, { status: 500 })
  }

  const leaderboard = (users || []).map((u, i) => ({
    rank:       i + 1,
    username:   u.username || 'Anonymous',
    xp:         u.xp,
    rankTitle:  u.rank,
    school:     u.ph_school_name || null,
    targetExam: u.target_schools?.[0] || null,
  }))

  return NextResponse.json({ leaderboard, type, period })
}
