import { AppShell } from '@/components/AppShell'
import { createClient } from '@/lib/supabase/server'
import { CalendarView } from './CalendarView'

export default async function CalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, contact:contacts(id, display_name, phone_number)')
    .eq('user_id', user!.id)
    .order('scheduled_at', { ascending: true })

  return (
    <AppShell>
      <div className="animate-fade-in">
        <h1 className="font-display text-2xl font-bold text-neutral-950 dark:text-white">Calendar</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">View and manage scheduled appointments.</p>
        <CalendarView initialAppointments={appointments || []} />
      </div>
    </AppShell>
  )
}
