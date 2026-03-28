import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { webhookPayloadSchema } from '@/lib/schemas'

export async function POST(request: Request) {
  const rawBody = await request.text()

  // Store raw payload first (dead-letter safety)
  const supabase = await createServiceClient()
  let parsedPayload: unknown

  try {
    parsedPayload = JSON.parse(rawBody)
  } catch {
    console.error('Webhook: invalid JSON')
    await supabase.from('webhook_events').insert({
      event_type: 'parse_error',
      payload: { raw: rawBody.slice(0, 5000) },
      processed: false,
      error_message: 'Invalid JSON',
    })
    return NextResponse.json({ ok: true })
  }

  // Store the raw event
  const conversationId = (parsedPayload as Record<string, unknown>)?.data &&
    typeof (parsedPayload as Record<string, { conversation_id?: string }>).data === 'object'
    ? (parsedPayload as { data: { conversation_id?: string } }).data?.conversation_id ?? null
    : null

  const eventType = (parsedPayload as { type?: string })?.type ?? 'unknown'

  await supabase.from('webhook_events').insert({
    event_type: eventType,
    conversation_id: conversationId,
    payload: parsedPayload,
    processed: false,
  })

  // Validate payload
  const parsed = webhookPayloadSchema.safeParse(parsedPayload)
  if (!parsed.success) {
    console.error('Webhook: validation failed', JSON.stringify(parsed.error.issues, null, 2))
    return NextResponse.json({ ok: true })
  }

  const payload = parsed.data
  console.log('[Webhook] Processing:', payload.type, 'convId:', payload.data.conversation_id)

  try {
    if (payload.type === 'post_call_transcription') {
      await handleTranscription(supabase, payload)
    } else if (payload.type === 'call_initiation_failure') {
      await handleFailure(supabase, payload)
    }
    // post_call_audio — ignored for V1

    // Mark webhook event as processed
    if (conversationId) {
      await supabase
        .from('webhook_events')
        .update({ processed: true })
        .eq('conversation_id', conversationId)
        .eq('event_type', eventType)
    }
  } catch (err) {
    console.error('Webhook processing error:', err)
    if (conversationId) {
      await supabase
        .from('webhook_events')
        .update({ error_message: String(err) })
        .eq('conversation_id', conversationId)
        .eq('event_type', eventType)
    }
  }

  return NextResponse.json({ ok: true })
}

async function handleTranscription(
  supabase: Awaited<ReturnType<typeof createServiceClient>>,
  payload: ReturnType<typeof webhookPayloadSchema.parse>
) {
  const { data } = payload
  const convId = data.conversation_id

  // Build transcript text (filter out null messages from tool calls)
  const transcriptText = data.transcript
    ?.filter((t) => t.message)
    .map((t) => `${t.role}: ${t.message}`)
    .join('\n') ?? ''

  // Extract fields — handle both our expected names and ElevenLabs' actual field names
  const extractedFields = data.analysis?.data_collection_results ?? {}
  const callerName = extractedFields.caller_name?.value
  const callerPhone = extractedFields.caller_phone_number?.value
  const callerIntent = extractedFields.caller_intent?.value
  const reservationDetails = extractedFields.reservation_details?.value
  const messageTaken = extractedFields.message_taken?.value
  const reason = extractedFields.reason_for_calling?.value

  // Support both field naming conventions
  const appointmentRequested = extractedFields.appointment_requested?.value || callerIntent === 'reservation'
  const appointmentDate = extractedFields.appointment_date?.value
  const appointmentTime = extractedFields.appointment_time?.value
  const specialRequests = extractedFields.special_requests?.value

  // Build summary from extracted data
  const summaryParts: string[] = []
  if (callerIntent && typeof callerIntent === 'string') summaryParts.push(`Intent: ${callerIntent}`)
  if (reason && typeof reason === 'string') summaryParts.push(reason)
  if (reservationDetails && typeof reservationDetails === 'string') summaryParts.push(`Reservation: ${reservationDetails}`)
  if (messageTaken) summaryParts.push('Message taken for staff')
  const summary = summaryParts.length > 0 ? summaryParts.join('. ') : 'Conversation completed'

  // Calculate duration from metadata or transcript
  let durationSeconds: number | null = null
  const metaDuration = (data as Record<string, unknown>).metadata
  if (metaDuration && typeof metaDuration === 'object' && 'call_duration_secs' in (metaDuration as object)) {
    durationSeconds = Number((metaDuration as Record<string, unknown>).call_duration_secs) || null
  }
  if (!durationSeconds && data.transcript && data.transcript.length > 1) {
    const firstEntry = data.transcript[0]
    const lastEntry = data.transcript[data.transcript.length - 1]
    const first = firstEntry && 'time_in_call_secs' in firstEntry ? Number((firstEntry as Record<string, unknown>).time_in_call_secs) : undefined
    const last = lastEntry && 'time_in_call_secs' in lastEntry ? Number((lastEntry as Record<string, unknown>).time_in_call_secs) : undefined
    if (first !== undefined && last !== undefined && !isNaN(first) && !isNaN(last)) {
      durationSeconds = Math.round(last - first)
    }
  }

  // Look up existing pending call record by ElevenLabs conversation ID
  let existingCall: { id: string; user_id: string } | null = null

  const { data: exactMatch } = await supabase
    .from('calls')
    .select('id, user_id')
    .eq('elevenlabs_conversation_id', convId)
    .single()

  if (exactMatch) {
    existingCall = exactMatch
  } else {
    // No exact match — find the most recent pending "browser-" call and claim it
    const { data: pendingCall } = await supabase
      .from('calls')
      .select('id, user_id')
      .eq('status', 'initiated')
      .like('elevenlabs_conversation_id', 'browser-%')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (pendingCall) {
      // Update the pending call with the real conversation ID
      await supabase
        .from('calls')
        .update({ elevenlabs_conversation_id: convId })
        .eq('id', pendingCall.id)
      existingCall = pendingCall
    }
  }

  if (!existingCall) {
    console.warn(`Webhook: no pending call found for conversation ${convId}, skipping`)
    return
  }

  const userId = existingCall.user_id

  // Find or create contact
  let contactId: string | null = null
  const contactName = typeof callerName === 'string' && callerName.trim()
    ? callerName.trim()
    : `Caller - ${new Date().toLocaleDateString()}`

  // Try to find existing contact by name
  const { data: existingContact } = await supabase
    .from('contacts')
    .select('id')
    .eq('user_id', userId)
    .eq('display_name', contactName)
    .limit(1)
    .single()

  if (existingContact) {
    contactId = existingContact.id
  } else {
    const { data: newContact } = await supabase
      .from('contacts')
      .insert({
        user_id: userId,
        display_name: contactName,
        phone_number: typeof callerPhone === 'string' ? callerPhone : null,
      })
      .select('id')
      .single()
    contactId = newContact?.id ?? null
  }

  // Update the call record
  await supabase
    .from('calls')
    .update({
      status: data.status === 'done' ? 'completed' : data.status === 'failed' ? 'failed' : 'completed',
      contact_id: contactId,
      transcript: data.transcript,
      transcript_text: transcriptText,
      summary,
      extracted_fields: extractedFields,
      duration_seconds: durationSeconds,
      call_successful: data.analysis?.call_successful ?? 'unknown',
      webhook_received_at: new Date().toISOString(),
    })
    .eq('id', existingCall.id)

  // Create AI summary note
  if (contactId) {
    await supabase.from('contact_notes').insert({
      user_id: userId,
      contact_id: contactId,
      call_id: existingCall.id,
      content: summary,
      note_type: 'ai_summary',
    })
  }

  // Create appointment if requested
  if (appointmentRequested) {
    let scheduledAt: Date | null = null

    if (typeof appointmentDate === 'string' && appointmentDate) {
      const timeStr = typeof appointmentTime === 'string' ? appointmentTime : '12:00'
      // Append timezone offset to treat as local time (assume US Eastern = UTC-4)
      scheduledAt = new Date(`${appointmentDate}T${timeStr}:00-04:00`)
    } else if (typeof reservationDetails === 'string' && reservationDetails) {
      // Parse from reservation details like "April 2nd at 3:00 PM for five people"
      try {
        const dateMatch = reservationDetails.match(/(\w+)\s+(\d+)(?:st|nd|rd|th)?/i)
        const timeMatch = reservationDetails.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
        if (dateMatch) {
          const month = dateMatch[1]
          const day = dateMatch[2]
          const year = new Date().getFullYear()
          let hours = timeMatch ? parseInt(timeMatch[1]!) : 12
          const minutes = timeMatch ? timeMatch[2] : '00'
          const ampm = timeMatch ? timeMatch[3]!.toUpperCase() : 'PM'
          if (ampm === 'PM' && hours < 12) hours += 12
          if (ampm === 'AM' && hours === 12) hours = 0
          // Store with timezone offset so it displays correctly
          const dateStr = `${month} ${day}, ${year} ${hours.toString().padStart(2, '0')}:${minutes}`
          const parsed = new Date(dateStr)
          if (!isNaN(parsed.getTime())) {
            // Adjust: treat as local time (UTC-4 for EDT)
            scheduledAt = new Date(parsed.getTime() + 4 * 60 * 60 * 1000)
          }
        }
      } catch {
        // Failed to parse — skip appointment
      }
    }

    if (scheduledAt && !isNaN(scheduledAt.getTime())) {
      const description = typeof reservationDetails === 'string' ? reservationDetails : (reason ? String(reason) : null)
      await supabase.from('appointments').insert({
        user_id: userId,
        contact_id: contactId,
        call_id: existingCall.id,
        title: `Reservation - ${contactName}`,
        description,
        scheduled_at: scheduledAt.toISOString(),
        status: 'pending',
        special_requests: typeof specialRequests === 'string' ? specialRequests : null,
      })
    }
  }
}

async function handleFailure(
  supabase: Awaited<ReturnType<typeof createServiceClient>>,
  payload: ReturnType<typeof webhookPayloadSchema.parse>
) {
  const convId = payload.data.conversation_id

  await supabase
    .from('calls')
    .update({
      status: 'failed',
      error_message: 'Call initiation failed',
      webhook_received_at: new Date().toISOString(),
    })
    .eq('elevenlabs_conversation_id', convId)
}
