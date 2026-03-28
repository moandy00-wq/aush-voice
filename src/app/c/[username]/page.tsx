'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggle } from '@/components/ThemeToggle'
import { PublicConversationWidget } from '@/components/PublicConversationWidget'

interface Profile {
  id: string
  username: string
  business_name: string
  business_description: string | null
  business_hours: string | null
  business_location: string | null
  business_phone: string | null
  agent_name: string | null
  agent_prompt: string | null
  agent_first_message: string | null
}

export default function SchedulingPage() {
  const params = useParams()
  const username = params.username as string
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (error || !data) {
        setNotFound(true)
      } else {
        setProfile(data)
      }
      setLoading(false)
    }
    loadProfile()
  }, [username])

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white dark:bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    )
  }

  if (notFound || !profile) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white px-6 dark:bg-black">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-neutral-950 dark:text-white">Page not found</h1>
          <p className="mt-2 text-neutral-500">This scheduling page doesn&apos;t exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-white dark:bg-black">
      {/* Nav */}
      <nav className="border-b border-neutral-200 bg-white/80 backdrop-blur-xl dark:border-white/5 dark:bg-black/80">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
            </div>
            <span className="font-display text-lg font-bold text-neutral-950 dark:text-white">{profile.business_name}</span>
          </div>
          <ThemeToggle />
        </div>
      </nav>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-6 py-12">
        {/* Business info */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/20">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
          </div>
          <h1 className="mt-6 font-display text-3xl font-bold text-neutral-950 dark:text-white">
            {profile.business_name}
          </h1>
          {profile.business_description && (
            <p className="mt-3 text-neutral-600 dark:text-neutral-400">{profile.business_description}</p>
          )}
        </div>

        {/* Business details */}
        {(profile.business_hours || profile.business_location || profile.business_phone) && (
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {profile.business_hours && (
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 dark:border-white/10 dark:bg-neutral-950">
                <div className="flex items-center gap-2 text-amber-500">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs font-semibold uppercase tracking-widest">Hours</span>
                </div>
                <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">{profile.business_hours}</p>
              </div>
            )}
            {profile.business_location && (
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 dark:border-white/10 dark:bg-neutral-950">
                <div className="flex items-center gap-2 text-amber-500">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <span className="text-xs font-semibold uppercase tracking-widest">Location</span>
                </div>
                <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">{profile.business_location}</p>
              </div>
            )}
            {profile.business_phone && (
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 dark:border-white/10 dark:bg-neutral-950">
                <div className="flex items-center gap-2 text-amber-500">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  <span className="text-xs font-semibold uppercase tracking-widest">Phone</span>
                </div>
                <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">{profile.business_phone}</p>
              </div>
            )}
          </div>
        )}

        {/* Conversation section */}
        <div className="mt-12">
          <div className="rounded-2xl border border-neutral-200 bg-white p-8 dark:border-white/10 dark:bg-neutral-950">
            <h2 className="font-display text-xl font-bold text-neutral-950 dark:text-white">
              Talk to {profile.agent_name || 'our AI Receptionist'}
            </h2>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              Click the button below to start a conversation. {profile.agent_name || 'Our AI assistant'} can answer your questions, help you schedule an appointment, or take a message.
            </p>
            <PublicConversationWidget
              ownerId={profile.id}
              agentPrompt={profile.agent_prompt}
              agentFirstMessage={profile.agent_first_message}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-xs text-neutral-400 dark:text-neutral-600">
            Powered by <span className="font-semibold">Aush Voice</span>
          </p>
        </div>
      </div>
    </div>
  )
}
