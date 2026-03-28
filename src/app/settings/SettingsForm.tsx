'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function SettingsForm() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [username, setUsername] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [businessDescription, setBusinessDescription] = useState('')
  const [businessHours, setBusinessHours] = useState('')
  const [businessLocation, setBusinessLocation] = useState('')
  const [businessPhone, setBusinessPhone] = useState('')
  const [agentName, setAgentName] = useState('')
  const [agentPrompt, setAgentPrompt] = useState('')
  const [agentFirstMessage, setAgentFirstMessage] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setUsername(data.username || '')
        setBusinessName(data.business_name || '')
        setBusinessDescription(data.business_description || '')
        setBusinessHours(data.business_hours || '')
        setBusinessLocation(data.business_location || '')
        setBusinessPhone(data.business_phone || '')
        setAgentName(data.agent_name || '')
        setAgentPrompt(data.agent_prompt || '')
        setAgentFirstMessage(data.agent_first_message || '')
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave() {
    setError(null)
    setSaving(true)
    setSaved(false)

    const res = await fetch('/api/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        businessName,
        businessDescription,
        businessHours,
        businessLocation,
        businessPhone,
        agentName,
        agentPrompt,
        agentFirstMessage,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Failed to save')
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="animate-fade-in">
        <h1 className="font-display text-2xl font-bold text-neutral-950 dark:text-white">Settings</h1>
        <div className="mt-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-900" />
          ))}
        </div>
      </div>
    )
  }

  const inputClass = "w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-950 outline-none transition-all placeholder:text-neutral-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-white/10 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-600"

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-neutral-950 dark:text-white">Settings</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Manage your business and AI receptionist settings.</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm font-medium text-emerald-500">Saved!</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl border border-neutral-950 bg-neutral-950 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-neutral-800 disabled:opacity-50 dark:border-white dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">{error}</p>
      )}

      <div className="mt-8 space-y-8">
        {/* Scheduling Page */}
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-white/10 dark:bg-neutral-950">
          <h2 className="font-display text-lg font-bold text-neutral-950 dark:text-white">Scheduling Page</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Your public page URL.</p>
          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Username</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-400">aivoice.com/c/</span>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))} className={inputClass + ' flex-1'} />
            </div>
          </div>
        </section>

        {/* Business Info */}
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-white/10 dark:bg-neutral-950">
          <h2 className="font-display text-lg font-bold text-neutral-950 dark:text-white">Business Information</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Displayed on your scheduling page.</p>
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Business Name</label>
              <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Description</label>
              <textarea value={businessDescription} onChange={(e) => setBusinessDescription(e.target.value)} rows={3} className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Hours</label>
                <input type="text" value={businessHours} onChange={(e) => setBusinessHours(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Phone</label>
                <input type="text" value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} className={inputClass} />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Location</label>
              <input type="text" value={businessLocation} onChange={(e) => setBusinessLocation(e.target.value)} className={inputClass} />
            </div>
          </div>
        </section>

        {/* AI Receptionist */}
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-white/10 dark:bg-neutral-950">
          <h2 className="font-display text-lg font-bold text-neutral-950 dark:text-white">AI Receptionist</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Customize how your AI answers conversations.</p>
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Receptionist Name</label>
              <input type="text" value={agentName} onChange={(e) => setAgentName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">First Message</label>
              <input type="text" value={agentFirstMessage} onChange={(e) => setAgentFirstMessage(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">AI Instructions</label>
              <p className="mb-2 text-xs text-neutral-400">Tell the AI how to behave, what information to collect, and how to respond.</p>
              <textarea value={agentPrompt} onChange={(e) => setAgentPrompt(e.target.value)} rows={8} className={inputClass + ' font-mono text-xs leading-relaxed'} />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
