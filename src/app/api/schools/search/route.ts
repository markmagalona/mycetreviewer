// src/app/api/schools/search/route.ts
// Returns name + region only (no city/province)

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q      = searchParams.get('q')?.trim() || ''
  const region = searchParams.get('region') || ''
  const limit  = Math.min(parseInt(searchParams.get('limit') || '10'), 20)

  if (q.length < 2 && !region) {
    return NextResponse.json({ schools: [] })
  }

  const supabase = createAdminClient()
  let query = supabase
    .from('schools_ph')
    .select('id, name, region, type, verified')
    .limit(limit)
    .order('verified', { ascending: false }) // verified schools first
    .order('name')

  if (q.length >= 2) {
    query = query.ilike('name', `%${q}%`)
  }

  if (region) {
    query = query.eq('region', region)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }

  return NextResponse.json({ schools: data || [] })
}
