// src/app/api/user/check-username/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const username = searchParams.get('username')?.toLowerCase().trim()
  if (!username || username.length < 3) {
    return NextResponse.json({ available: false, reason: 'Too short' })
  }

  // Block reserved/offensive usernames
  const reserved = ['admin','administrator','moderator','mycetreviewer','support','help','root','system','test','null','undefined']
  if (reserved.includes(username)) {
    return NextResponse.json({ available: false, reason: 'Reserved username' })
  }

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .single()

  return NextResponse.json({ available: !data })
}
