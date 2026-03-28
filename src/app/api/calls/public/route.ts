import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { ownerId, conversationId } = await request.json()

    if (!ownerId || !conversationId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const supabase = await createServiceClient()

    // Verify owner exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', ownerId)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Owner not found' }, { status: 404 })
    }

    // Create pending call record for this owner
    const { error } = await supabase.from('calls').insert({
      user_id: ownerId,
      elevenlabs_conversation_id: conversationId,
      status: 'initiated',
      direction: 'browser',
    })

    if (error) {
      console.error('Create public call error:', error)
      return NextResponse.json({ error: 'Failed to create call' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
