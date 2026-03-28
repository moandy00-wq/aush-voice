import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  // Use regular client to get the authenticated user
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { username, businessName, businessDescription, businessHours, businessLocation, businessPhone, agentName, agentPrompt, agentFirstMessage } = body

  if (!username || !businessName) {
    return NextResponse.json({ error: 'Username and business name are required' }, { status: 400 })
  }

  // Use service client to bypass RLS for profile updates
  const serviceClient = await createServiceClient()

  // Check username availability
  const { data: existing } = await serviceClient
    .from('profiles')
    .select('id')
    .eq('username', username)
    .neq('id', user.id)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Username is already taken' }, { status: 409 })
  }

  // Upsert profile (handles case where trigger didn't create one)
  const { error } = await serviceClient
    .from('profiles')
    .upsert({
      id: user.id,
      username,
      business_name: businessName,
      business_description: businessDescription || null,
      business_hours: businessHours || null,
      business_location: businessLocation || null,
      business_phone: businessPhone || null,
      agent_name: agentName || 'AI Receptionist',
      agent_prompt: agentPrompt || null,
      agent_first_message: agentFirstMessage || null,
      setup_completed: true,
    }, { onConflict: 'id' })

  if (error) {
    console.error('Setup error:', error)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
