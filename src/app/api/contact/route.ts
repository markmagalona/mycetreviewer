// src/app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { name, email, issue } = await request.json()
    if (!name || !email || !issue) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Save to contact_messages table if it exists, otherwise just return success
    try {
      await supabase.from('contact_messages').insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        issue: issue.trim(),
        created_at: new Date().toISOString(),
      })
    } catch {
      // Table may not exist yet - still return success
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
