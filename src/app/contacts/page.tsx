import { AppShell } from '@/components/AppShell'
import { createClient } from '@/lib/supabase/server'
import { ContactsList } from './ContactsList'

export default async function ContactsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <AppShell>
      <div className="animate-fade-in">
        <h1 className="font-display text-2xl font-bold text-neutral-950 dark:text-white">Contacts</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Manage your contact profiles and call history.</p>
        <ContactsList initialContacts={contacts || []} />
      </div>
    </AppShell>
  )
}
