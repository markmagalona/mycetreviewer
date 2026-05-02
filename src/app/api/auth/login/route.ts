import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
  }

  const { email, password } = body
  const cleanEmail    = email.toLowerCase().trim()
  const supabase      = await createClient()
  const supabaseAdmin = createAdminClient()

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email:    cleanEmail,
    password,
  })

  if (authError || !authData.user) {
    console.error('Auth error:', authError?.message)
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
  }

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id, username, is_paid')
    .eq('email', cleanEmail)
    .single()

  if (user) {
    await supabaseAdmin.from('users')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', user.id)
    return NextResponse.json({
      success:     true,
      userId:      user.id,
      hasUsername: !!user.username,
      isPaid:      user.is_paid,
    })
  }

  const { data: newUser } = await supabaseAdmin
    .from('users')
    .insert({ email: cleanEmail, name: cleanEmail.split('@')[0] })
    .select('id').single()

  return NextResponse.json({
    success: true, userId: newUser?.id, hasUsername: false, isNewUser: true,
  })
}
