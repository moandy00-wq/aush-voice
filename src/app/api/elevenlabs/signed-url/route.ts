import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  // Verify user is authenticated
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const agentId = process.env.ELEVENLABS_AGENT_ID
  const apiKey = process.env.ELEVENLABS_API_KEY

  if (!agentId || !apiKey) {
    return NextResponse.json({ error: 'ElevenLabs not configured' }, { status: 500 })
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`,
      {
        headers: { 'xi-api-key': apiKey },
      }
    )

    if (!response.ok) {
      const body = await response.text()
      console.error('ElevenLabs signed URL error:', response.status, body)
      return NextResponse.json({ error: 'Failed to get signed URL' }, { status: 500 })
    }

    const data = await response.json()
    return NextResponse.json({ signedUrl: data.signed_url })
  } catch (err) {
    console.error('ElevenLabs signed URL error:', err)
    return NextResponse.json({ error: 'Failed to connect to ElevenLabs' }, { status: 500 })
  }
}
