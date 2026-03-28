export interface Contact {
  id: string
  user_id: string
  phone_number: string | null
  display_name: string
  email: string | null
  created_at: string
  updated_at: string
}

export interface TranscriptEntry {
  role: 'agent' | 'user'
  message: string
  timestamp?: number
}

export interface Call {
  id: string
  user_id: string
  contact_id: string | null
  elevenlabs_conversation_id: string | null
  direction: 'browser' | 'inbound' | 'outbound'
  status: 'initiated' | 'completed' | 'failed'
  duration_seconds: number | null
  transcript: TranscriptEntry[] | null
  transcript_text: string | null
  summary: string | null
  extracted_fields: Record<string, { value: string | boolean | null; rationale?: string }> | null
  custom_prompt: string | null
  error_message: string | null
  call_successful: string | null
  webhook_received_at: string | null
  created_at: string
  updated_at: string
  // Joined
  contact?: Contact
}

export interface Appointment {
  id: string
  user_id: string
  contact_id: string | null
  call_id: string | null
  title: string
  description: string | null
  scheduled_at: string
  duration_minutes: number
  status: 'pending' | 'approved' | 'declined' | 'expired' | 'cancelled'
  created_at: string
  special_requests: string | null
  updated_at: string
  // Joined
  contact?: Contact
}

export interface Call {
  read: boolean
}

export interface ContactNote {
  id: string
  user_id: string
  contact_id: string
  call_id: string | null
  content: string
  note_type: 'ai_summary' | 'manual'
  created_at: string
}

export interface WebhookEvent {
  id: string
  event_type: string | null
  conversation_id: string | null
  payload: unknown
  processed: boolean
  error_message: string | null
  created_at: string
}
