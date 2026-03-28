import { AppShell } from '@/components/AppShell'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const displayName = user?.user_metadata?.display_name || user?.email || 'User'

  // Fetch counts
  const [callsRes, todayCallsRes, pendingAptsRes, contactsRes, recentCallsRes, unreadRes] = await Promise.all([
    supabase.from('calls').select('id', { count: 'exact', head: true }).eq('user_id', user!.id),
    supabase.from('calls').select('id', { count: 'exact', head: true }).eq('user_id', user!.id).gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
    supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('user_id', user!.id).eq('status', 'pending'),
    supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('user_id', user!.id),
    supabase.from('calls').select('*, contact:contacts(display_name)').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('calls').select('id', { count: 'exact', head: true }).eq('user_id', user!.id).eq('read', false).eq('status', 'completed'),
  ])

  const totalCalls = callsRes.count || 0
  const todayCalls = todayCallsRes.count || 0
  const pendingApts = pendingAptsRes.count || 0
  const totalContacts = contactsRes.count || 0
  const recentCalls = recentCallsRes.data || []
  const unreadCalls = unreadRes.count || 0

  const statusColors: Record<string, string> = {
    completed: 'bg-emerald-500',
    initiated: 'bg-amber-500',
    failed: 'bg-rose-500',
  }

  return (
    <AppShell>
      <div className="animate-fade-in">
        <div>
          <h1 className="font-display text-2xl font-bold text-neutral-950 dark:text-white">
            Welcome back, {displayName}
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Here&apos;s an overview of your AI receptionist activity.
          </p>
        </div>

        {/* Stat cards */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Conversations', value: totalCalls, icon: '📞', gradient: 'from-amber-400/10 to-orange-400/10 dark:from-amber-500/10 dark:to-orange-500/10', border: 'border-amber-200/50 dark:border-amber-500/10', badge: unreadCalls > 0 ? unreadCalls : null },
            { label: "Today's Calls", value: todayCalls, icon: '📊', gradient: 'from-blue-400/10 to-indigo-400/10 dark:from-blue-500/10 dark:to-indigo-500/10', border: 'border-blue-200/50 dark:border-blue-500/10', badge: null },
            { label: 'Pending Reservations', value: pendingApts, icon: '📅', gradient: 'from-emerald-400/10 to-teal-400/10 dark:from-emerald-500/10 dark:to-teal-500/10', border: 'border-emerald-200/50 dark:border-emerald-500/10', badge: pendingApts > 0 ? pendingApts : null },
            { label: 'Total Contacts', value: totalContacts, icon: '👥', gradient: 'from-violet-400/10 to-purple-400/10 dark:from-violet-500/10 dark:to-purple-500/10', border: 'border-violet-200/50 dark:border-violet-500/10', badge: null },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`relative rounded-2xl border bg-gradient-to-br ${stat.gradient} ${stat.border} p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`}
            >
              {stat.badge && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-xs font-bold text-white">
                  {stat.badge}
                </span>
              )}
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{stat.label}</p>
                <span className="text-xl">{stat.icon}</span>
              </div>
              <p className="mt-2 font-display text-3xl font-bold text-neutral-950 dark:text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-8 dark:border-amber-500/20 dark:from-amber-500/5 dark:to-orange-500/5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/20">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-neutral-950 dark:text-white">Share your scheduling page</h2>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                Share your scheduling page link with customers so they can talk to your AI receptionist. Click &quot;Your Scheduling Page&quot; in the sidebar to preview it.
              </p>
            </div>
          </div>
        </div>

        {/* Recent calls */}
        <div className="mt-8">
          <h2 className="font-display text-lg font-bold text-neutral-950 dark:text-white">Recent Conversations</h2>
          {recentCalls.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-12 text-center dark:border-white/10 dark:bg-neutral-950">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-900">
                <svg className="h-6 w-6 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
              </div>
              <p className="mt-3 text-sm font-medium text-neutral-500 dark:text-neutral-400">No conversations yet</p>
              <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">Start a conversation with your AI receptionist to see it here</p>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {recentCalls.map((call: Record<string, unknown>) => (
                <Link
                  key={call.id as string}
                  href={`/calls/${call.id}`}
                  className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white px-5 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md dark:border-white/10 dark:bg-neutral-950 dark:hover:border-amber-500/20"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 font-display text-sm font-semibold dark:bg-neutral-800">
                      {((call.contact as Record<string, string> | null)?.display_name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-neutral-950 dark:text-white">
                          {(call.contact as Record<string, string> | null)?.display_name || 'Unknown Caller'}
                        </p>
                        {!(call.read as boolean) && (call.status as string) === 'completed' && (
                          <span className="h-2 w-2 rounded-full bg-amber-500" />
                        )}
                      </div>
                      <p className="mt-0.5 line-clamp-1 text-xs text-neutral-400">
                        {(call.summary as string) || 'No summary available'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`h-2 w-2 rounded-full ${statusColors[(call.status as string)] || 'bg-neutral-400'}`} />
                    <span className="text-xs text-neutral-400">{(call.status as string)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
