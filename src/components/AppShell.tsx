import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppSidebar } from './AppSidebar'

export async function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const userName = user.user_metadata?.display_name || ''
  const userEmail = user.email || ''

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  // Fetch notification counts
  const [unreadCallsRes, pendingAptsRes] = await Promise.all([
    supabase.from('calls').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('read', false).eq('status', 'completed'),
    supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'pending'),
  ])

  const username = profile?.username || ''
  const unreadCalls = unreadCallsRes.count || 0
  const pendingApts = pendingAptsRes.count || 0

  return (
    <div className="flex min-h-dvh bg-neutral-50 dark:bg-black">
      <AppSidebar
        userName={userName}
        userEmail={userEmail}
        schedulingUrl={username ? `/c/${username}` : null}
        unreadCalls={unreadCalls}
        pendingAppointments={pendingApts}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
