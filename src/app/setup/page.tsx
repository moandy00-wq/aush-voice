'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const steps = ['Business Info', 'AI Receptionist', 'Your Link']

const defaultPrompt = `You are a friendly and professional virtual receptionist. Greet callers warmly, answer questions about the business, and take messages when needed. Be concise and helpful.

When a caller wants to make a reservation or schedule an appointment:
- Collect: date, time, party size, their name, and phone number
- Ask if they have any special requests, food allergies, or dietary needs
- IMPORTANT: Never say the reservation is confirmed. Always say it is PENDING and that the team will review and confirm it
- Say something like: "I've noted your reservation request. Our team will review it and get back to you to confirm."

Always be warm, professional, and efficient.`

export default function SetupPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usernameError, setUsernameError] = useState<string | null>(null)

  // Form state
  const [username, setUsername] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [businessDescription, setBusinessDescription] = useState('')
  const [businessHours, setBusinessHours] = useState('')
  const [businessLocation, setBusinessLocation] = useState('')
  const [businessPhone, setBusinessPhone] = useState('')
  const [agentName, setAgentName] = useState('')
  const [agentPrompt, setAgentPrompt] = useState(defaultPrompt)
  const [agentFirstMessage, setAgentFirstMessage] = useState('Hi there! Thanks for calling. How can I help you today?')

  async function handleSubmit() {
    setError(null)
    setLoading(true)

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
      setError(data.error || 'Something went wrong')
      setLoading(false)
      return
    }

    // Small delay to ensure Supabase has propagated the update before middleware reads it
    await new Promise(r => setTimeout(r, 500))
    window.location.href = '/dashboard'
  }

  function validateUsername(val: string) {
    const clean = val.toLowerCase().replace(/[^a-z0-9_-]/g, '')
    setUsername(clean)
    setUsernameError(clean.length > 0 && clean.length < 3 ? 'At least 3 characters' : null)
  }

  const canNext = () => {
    if (step === 0) return username.length >= 3 && businessName.trim().length > 0 && !usernameError
    if (step === 1) return agentName.trim().length > 0
    return true
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-white px-6 dark:bg-black">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-100/50 blur-[120px] dark:bg-amber-500/5" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
          </div>
          <span className="font-display text-xl font-bold text-neutral-950 dark:text-white">Aush Voice Setup</span>
        </div>

        {/* Progress */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                i <= step
                  ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
                  : 'border border-neutral-300 text-neutral-400 dark:border-white/10'
              }`}>
                {i < step ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`h-px w-8 transition-all ${i < step ? 'bg-amber-500' : 'bg-neutral-300 dark:bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>
        <p className="mb-6 text-center text-sm font-medium text-neutral-500 dark:text-neutral-400">{steps[step]}</p>

        {/* Card */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-neutral-950">

          {/* Step 1: Business Info */}
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold text-neutral-950 dark:text-white">Tell us about your business</h2>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Username *</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-400">aushvoice.com/c/</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => validateUsername(e.target.value)}
                    placeholder="mybusiness"
                    className="flex-1 rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-950 outline-none transition-all placeholder:text-neutral-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-white/10 dark:bg-neutral-900 dark:text-white"
                  />
                </div>
                {usernameError && <p className="mt-1 text-xs text-rose-500">{usernameError}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Business Name *</label>
                <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Dylan's Burgers" className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-950 outline-none transition-all placeholder:text-neutral-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-white/10 dark:bg-neutral-900 dark:text-white" />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Description</label>
                <textarea value={businessDescription} onChange={(e) => setBusinessDescription(e.target.value)} placeholder="A short description of your business..." rows={2} className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-950 outline-none transition-all placeholder:text-neutral-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-white/10 dark:bg-neutral-900 dark:text-white" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Hours</label>
                  <input type="text" value={businessHours} onChange={(e) => setBusinessHours(e.target.value)} placeholder="Mon-Fri 9-5" className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-950 outline-none transition-all placeholder:text-neutral-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-white/10 dark:bg-neutral-900 dark:text-white" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Phone</label>
                  <input type="text" value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} placeholder="(555) 123-4567" className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-950 outline-none transition-all placeholder:text-neutral-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-white/10 dark:bg-neutral-900 dark:text-white" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Location</label>
                <input type="text" value={businessLocation} onChange={(e) => setBusinessLocation(e.target.value)} placeholder="123 Main St, City, State" className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-950 outline-none transition-all placeholder:text-neutral-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-white/10 dark:bg-neutral-900 dark:text-white" />
              </div>
            </div>
          )}

          {/* Step 2: AI Receptionist */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold text-neutral-950 dark:text-white">Customize your AI receptionist</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Personalize how your AI answers calls.</p>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Receptionist Name</label>
                <input type="text" value={agentName} onChange={(e) => setAgentName(e.target.value)} placeholder="e.g. Alex, Sam, Ava" className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-950 outline-none transition-all placeholder:text-neutral-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-white/10 dark:bg-neutral-900 dark:text-white" />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">First Message</label>
                <input type="text" value={agentFirstMessage} onChange={(e) => setAgentFirstMessage(e.target.value)} placeholder="Hi there! Thanks for calling..." className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-950 outline-none transition-all placeholder:text-neutral-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-white/10 dark:bg-neutral-900 dark:text-white" />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">AI Instructions</label>
                <p className="mb-2 text-xs text-neutral-400">Tell the AI how to behave, what to say, and what information to collect.</p>
                <textarea value={agentPrompt} onChange={(e) => setAgentPrompt(e.target.value)} rows={6} className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-950 outline-none transition-all placeholder:text-neutral-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-white/10 dark:bg-neutral-900 dark:text-white font-mono text-xs leading-relaxed" />
              </div>
            </div>
          )}

          {/* Step 3: Your Link */}
          {step === 2 && (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10">
                <svg className="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="font-display text-xl font-bold text-neutral-950 dark:text-white">You&apos;re all set!</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Share this link with your customers so they can talk to your AI receptionist:</p>

              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-500/20 dark:bg-amber-500/5">
                <p className="font-mono text-sm font-semibold text-amber-700 dark:text-amber-400">
                  aushvoice.com/c/{username}
                </p>
              </div>

              <p className="text-xs text-neutral-400">You can always change your settings from the dashboard.</p>
            </div>
          )}

          {error && (
            <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">{error}</p>
          )}

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between">
            {step > 0 ? (
              <button onClick={() => setStep(step - 1)} className="text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-950 dark:hover:text-white">
                Back
              </button>
            ) : <div />}

            {step < 2 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canNext()}
                className="rounded-xl border border-neutral-950 bg-neutral-950 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-neutral-800 disabled:opacity-50 dark:border-white dark:bg-white dark:text-black dark:hover:bg-neutral-200"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-amber-500/20 disabled:opacity-50"
              >
                {loading ? 'Setting up...' : 'Go to Dashboard'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
