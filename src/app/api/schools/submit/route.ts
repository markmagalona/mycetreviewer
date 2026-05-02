// src/app/api/schools/submit/route.ts
// Student submits school — auto-approved immediately, usable right away
// Admin can review and reject if incorrect

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

function cleanSchoolName(raw: string): string {
  let name = raw.trim()

  // Expand common abbreviations first
  name = name
    .replace(/\bNHS\b/gi, 'National High School')
    .replace(/\bSHS\b/gi, 'Senior High School')
    .replace(/\bNational\s+HS\b/gi, 'National High School')
    .replace(/\bSenior\s+HS\b/gi, 'Senior High School')
    .replace(/\bSt\.\s/gi, 'Saint ')
    .replace(/\bSt\s/gi, 'Saint ')
    .replace(/\bNat'?l\b/gi, 'National')
    .replace(/\bIntl\b/gi, 'International')
    .replace(/\bCath\b/gi, 'Catholic')
    .replace(/\bAcad\b/gi, 'Academy')
    .replace(/\bInst\b/gi, 'Institute')
    .replace(/\bTech\b/gi, 'Technical')

  // Fix title case
  name = name.replace(/\b\w+/g, word => {
    const keepLower = ['de', 'ng', 'of', 'the', 'and', 'for', 'in', 'a', 'an', 'at']
    if (keepLower.includes(word.toLowerCase())) return word.toLowerCase()
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  })

  // Always capitalize first character
  name = name.charAt(0).toUpperCase() + name.slice(1)

  // Remove double spaces
  name = name.replace(/\s+/g, ' ').trim()

  return name
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body?.name?.trim()) {
    return NextResponse.json({ error: 'School name is required' }, { status: 400 })
  }

  const supabase    = createAdminClient()
  const rawName     = body.name.trim()
  const cleanedName = cleanSchoolName(rawName)

  // Check if already in verified list
  const { data: existing } = await supabase
    .from('schools_ph')
    .select('id, name')
    .ilike('name', cleanedName)
    .limit(1)
    .single()

  if (existing) {
    return NextResponse.json({ exists: true, school: existing })
  }

  // Check if already submitted recently
  const { data: alreadyExists } = await supabase
    .from('schools_ph')
    .select('id, name')
    .ilike('name', `%${cleanedName.split(' ').slice(0,3).join(' ')}%`)
    .limit(1)
    .single()

  if (alreadyExists) {
    return NextResponse.json({ exists: true, school: alreadyExists })
  }

  // Auto-approve — add directly to schools_ph so it's immediately usable
  const { data: newSchool, error } = await supabase
    .from('schools_ph')
    .insert({
      name:     cleanedName,
      verified: false, // marks as community-submitted, not DepEd-verified
      level:    'SHS',
      type:     'public', // default — admin can correct later
    })
    .select('id, name')
    .single()

  if (error || !newSchool) {
    return NextResponse.json({ error: 'Submission failed. Please try again.' }, { status: 500 })
  }

  // Also log to pending_schools for admin review
  await supabase.from('pending_schools').insert({
    submitted_name: rawName,
    cleaned_name:   cleanedName,
    submitted_by:   body.userId || null,
    status:         'auto_approved',
    approved_at:    new Date().toISOString(),
  })

  // Update submitting user's profile immediately
  if (body.userId) {
    await supabase.from('users').update({
      ph_school_id:   newSchool.id,
      ph_school_name: cleanedName,
    }).eq('id', body.userId)
  }

  return NextResponse.json({
    success:     true,
    school:      newSchool,
    cleanedName,
    message:     `"${cleanedName}" has been added and is now available.`,
  })
}
