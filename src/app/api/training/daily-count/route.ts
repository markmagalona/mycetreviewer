// src/app/api/training/daily-count/route.ts
// Returns how many AI batches a user has generated today

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const date   = searchParams.get('date') || new Date().toISOString().split('T')[0]

  if (!userId) return NextResponse.json({ count: 0 })

  const supabase = createAdminClient()
  const { count } = await supabase
    .from('ai_generation_log')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', `${date}T00:00:00`)
    .lte('created_at', `${date}T23:59:59`)

  return NextResponse.json({ count: count || 0 })
}
