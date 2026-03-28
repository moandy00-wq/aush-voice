import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const ownerId = searchParams.get('owner')

  if (!ownerId) {
    return NextResponse.json({ error: 'Missing owner' }, { status: 400 })
  }

  const agentId = process.env.ELEVENLABS_AGENT_ID
  const apiKey = process.env.ELEVENLABS_API_KEY

  if (!agentId || !apiKey) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`,
      { headers: { 'xi-api-key': apiKey } }
    )

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to get signed URL' }, { status: 500 })
    }

    const data = await response.json()
    return NextResponse.json({ signedUrl: data.signed_url })
  } catch {
    return NextResponse.json({ error: 'Connection failed' }, { status: 500 })
  }
}
