import { AppShell } from '@/components/AppShell'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { TranscriptEntry } from '@/lib/supabase/types'

export default async function CallDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: call } = await supabase
    .from('calls')
    .select('*, contact:contacts(id, display_name)')
    .eq('id', id)
    .single()

  if (!call) notFound()

  const statusColors: Record<string, string> = {
    completed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
    initiated: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
    failed: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
  }

  const formatDuration = (s: number | null) => {
    if (!s) return '—'
    const m = Math.floor(s / 60)
    const sec = s % 60
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`
  }

  const transcript = (call.transcript || []) as TranscriptEntry[]
  const extracted = (call.extracted_fields || {}) as Record<string, { value: string | boolean | null; rationale?: string }>

  return (
    <AppShell>
      <div className="animate-fade-in">
        {/* Back link */}
        <Link href="/calls" className="inline-flex items-center gap-1 text-sm text-neutral-500 transition-colors hover:text-neutral-950 dark:hover:text-white">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to Conversations
        </Link>

        {/* Header */}
        <div className="mt-4 flex items-start justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-neutral-950 dark:text-white">
              {call.contact?.display_name || 'Unknown Caller'}
            </h1>
            <div className="mt-2 flex items-center gap-3">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[call.status] || ''}`}>
                {call.status}
              </span>
              <span className="text-sm text-neutral-400">
                {new Date(call.created_at).toLocaleString()}
              </span>
              <span className="text-sm text-neutral-400">
                {formatDuration(call.duration_seconds)}
              </span>
            </div>
          </div>
          {call.contact && (
            <Link
              href={`/contacts/${call.contact.id}`}
              className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 transition-all hover:bg-neutral-50 dark:border-white/10 dark:text-neutral-400 dark:hover:bg-white/5"
            >
              View Contact
            </Link>
          )}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Main column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Summary */}
            {call.summary && (
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-white/10 dark:bg-neutral-950">
                <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-amber-500">AI Summary</h2>
                <p className="mt-3 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">{call.summary}</p>
              </div>
            )}

            {/* Transcript */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-white/10 dark:bg-neutral-950">
              <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-amber-500">Transcript</h2>
              {transcript.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {transcript.map((entry, i) => (
                    <div key={i} className={`flex ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                        entry.role === 'user'
                          ? 'bg-amber-50 text-neutral-950 dark:bg-amber-500/10 dark:text-amber-100'
                          : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300'
                      }`}>
                        <p className="mb-1 text-xs font-semibold opacity-60">
                          {entry.role === 'agent' ? 'AI' : 'Caller'}
                        </p>
                        {entry.message}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-neutral-400">No transcript available yet.</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Extracted fields */}
            {Object.keys(extracted).length > 0 && (
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-white/10 dark:bg-neutral-950">
                <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-amber-500">Extracted Data</h2>
                <div className="mt-4 space-y-3">
                  {Object.entries(extracted).map(([key, val]) => (
                    <div key={key}>
                      <p className="text-xs font-medium text-neutral-500">{key.replace(/_/g, ' ')}</p>
                      <p className="mt-0.5 text-sm text-neutral-950 dark:text-white">
                        {val.value === null ? '—' : typeof val.value === 'boolean' ? (val.value ? 'Yes' : 'No') : String(val.value)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom prompt */}
            {call.custom_prompt && (
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-white/10 dark:bg-neutral-950">
                <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-amber-500">Test Scenario</h2>
                <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">{call.custom_prompt}</p>
              </div>
            )}

            {/* Metadata */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-white/10 dark:bg-neutral-950">
              <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-amber-500">Details</h2>
              <div className="mt-4 space-y-3 text-sm">
                <div>
                  <p className="text-xs font-medium text-neutral-500">Direction</p>
                  <p className="text-neutral-950 dark:text-white">{call.direction}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-neutral-500">Conversation ID</p>
                  <p className="truncate font-mono text-xs text-neutral-950 dark:text-white">{call.elevenlabs_conversation_id || '—'}</p>
                </div>
                {call.webhook_received_at && (
                  <div>
                    <p className="text-xs font-medium text-neutral-500">Webhook Received</p>
                    <p className="text-neutral-950 dark:text-white">{new Date(call.webhook_received_at).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
