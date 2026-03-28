import { AppShell } from '@/components/AppShell'
import { createClient } from '@/lib/supabase/server'
import { CallsList } from './CallsList'

export default async function CallsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: calls } = await supabase
    .from('calls')
    .select('*, contact:contacts(id, display_name)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <AppShell>
      <div className="animate-fade-in">
        <h1 className="font-display text-2xl font-bold text-neutral-950 dark:text-white">Conversations</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">View all your AI conversations and their details.</p>
        <CallsList initialCalls={calls || []} />
      </div>
    </AppShell>
  )
}
