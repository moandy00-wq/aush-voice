import { AppShell } from '@/components/AppShell'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: contact } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', id)
    .single()

  if (!contact) notFound()

  const { data: calls } = await supabase
    .from('calls')
    .select('*')
    .eq('contact_id', id)
    .order('created_at', { ascending: false })

  const { data: notes } = await supabase
    .from('contact_notes')
    .select('*')
    .eq('contact_id', id)
    .order('created_at', { ascending: false })

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*')
    .eq('contact_id', id)
    .order('scheduled_at', { ascending: true })

  const statusColors: Record<string, string> = {
    completed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
    initiated: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
    failed: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
    scheduled: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
    cancelled: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
  }

  return (
    <AppShell>
      <div className="animate-fade-in">
        <Link href="/contacts" className="inline-flex items-center gap-1 text-sm text-neutral-500 transition-colors hover:text-neutral-950 dark:hover:text-white">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to Contacts
        </Link>

        {/* Header */}
        <div className="mt-4 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-xl font-bold text-white shadow-lg shadow-amber-500/20">
            {contact.display_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-neutral-950 dark:text-white">{contact.display_name}</h1>
            <div className="flex items-center gap-3 text-sm text-neutral-400">
              {contact.phone_number && <span>{contact.phone_number}</span>}
              {contact.email && <span>{contact.email}</span>}
              <span>Added {new Date(contact.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Calls */}
          <div className="lg:col-span-2">
            <h2 className="font-display text-lg font-bold text-neutral-950 dark:text-white">Conversations ({calls?.length || 0})</h2>
            <div className="mt-4 space-y-2">
              {calls && calls.length > 0 ? calls.map((call) => (
                <Link
                  key={call.id}
                  href={`/calls/${call.id}`}
                  className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white px-5 py-3 transition-all hover:border-amber-200 hover:shadow-sm dark:border-white/10 dark:bg-neutral-950 dark:hover:border-amber-500/20"
                >
                  <div>
                    <p className="text-sm font-medium text-neutral-950 dark:text-white">{call.summary || 'No summary'}</p>
                    <p className="mt-0.5 text-xs text-neutral-400">{new Date(call.created_at).toLocaleString()}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[call.status] || ''}`}>
                    {call.status}
                  </span>
                </Link>
              )) : (
                <p className="text-sm text-neutral-400">No conversations yet.</p>
              )}
            </div>

            {/* Notes */}
            <h2 className="mt-8 font-display text-lg font-bold text-neutral-950 dark:text-white">AI Notes ({notes?.length || 0})</h2>
            <div className="mt-4 space-y-2">
              {notes && notes.length > 0 ? notes.map((note) => (
                <div key={note.id} className="rounded-2xl border border-neutral-200 bg-white px-5 py-4 dark:border-white/10 dark:bg-neutral-950">
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">{note.content}</p>
                  <p className="mt-2 text-xs text-neutral-400">{new Date(note.created_at).toLocaleString()}</p>
                </div>
              )) : (
                <p className="text-sm text-neutral-400">No notes yet.</p>
              )}
            </div>
          </div>

          {/* Appointments sidebar */}
          <div>
            <h2 className="font-display text-lg font-bold text-neutral-950 dark:text-white">Appointments ({appointments?.length || 0})</h2>
            <div className="mt-4 space-y-2">
              {appointments && appointments.length > 0 ? appointments.map((apt) => (
                <div key={apt.id} className="rounded-2xl border border-neutral-200 bg-white px-5 py-4 dark:border-white/10 dark:bg-neutral-950">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-neutral-950 dark:text-white">{apt.title}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[apt.status] || ''}`}>
                      {apt.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-neutral-400">
                    {new Date(apt.scheduled_at).toLocaleString()} · {apt.duration_minutes}min
                  </p>
                  {apt.description && <p className="mt-2 text-xs text-neutral-500">{apt.description}</p>}
                </div>
              )) : (
                <p className="text-sm text-neutral-400">No appointments scheduled.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
