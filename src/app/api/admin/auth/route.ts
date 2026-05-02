// src/app/api/admin/auth/route.ts
import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiter — resets on server restart
const attempts = new Map<string, { count: number; firstAt: number }>()
const MAX_ATTEMPTS = 5
const LOCKOUT_MS   = 15 * 60 * 1000 // 15 minutes

export async function POST(request: NextRequest) {
  const ip  = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
  const now = Date.now()

  // Check lockout
  const rec = attempts.get(ip)
  if (rec && now - rec.firstAt < LOCKOUT_MS && rec.count >= MAX_ATTEMPTS) {
    return NextResponse.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 })
  }
  // Reset expired window
  if (rec && now - rec.firstAt >= LOCKOUT_MS) attempts.delete(ip)

  const body = await request.json().catch(() => ({}))

  if (body.password !== process.env.ADMIN_PASSWORD) {
    const curr = attempts.get(ip) || { count: 0, firstAt: now }
    attempts.set(ip, { count: curr.count + 1, firstAt: curr.firstAt })
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  // Success — clear attempts and set session cookie
  attempts.delete(ip)
  const res = NextResponse.json({ success: true })
  res.cookies.set('admin_session', process.env.ADMIN_SESSION_SECRET!, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   60 * 60 * 24 * 7, // 7 days
    path:     '/',
  })
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ success: true })
  res.cookies.delete('admin_session')
  return res
}
