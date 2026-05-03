// src/app/api/payment/upload-proof/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file     = formData.get('file') as File
    const userId   = formData.get('userId') as string || 'guest'
    const ref      = formData.get('ref') as string || 'unknown'

    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const supabase  = createAdminClient()
    const ext       = file.name.split('.').pop() || 'jpg'
    const timestamp = Date.now()
    const path      = `${userId}/${timestamp}-${ref}.${ext}`

    const buffer = Buffer.from(await file.arrayBuffer())

    const { error } = await supabase.storage
      .from('payment-proofs')
      .upload(path, buffer, {
        contentType: file.type || 'image/jpeg',
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    // Get signed URL valid for 7 days (for admin to view)
    const { data: signedData } = await supabase.storage
      .from('payment-proofs')
      .createSignedUrl(path, 60 * 60 * 24 * 7)

    return NextResponse.json({ url: signedData?.signedUrl || path })
  } catch (err) {
    console.error('Upload proof error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
