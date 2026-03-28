'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: name },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Full page reload to ensure session cookies are established
    await new Promise(r => setTimeout(r, 300))
    window.location.href = '/setup'
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-neutral-50 px-6 dark:bg-black">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-100/50 blur-[120px] dark:bg-amber-500/5" />
      </div>

      {/* Back to home */}
      <Link
        href="/"
        className="group fixed left-6 top-6 z-20 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-500 transition-all duration-200 hover:bg-amber-50 hover:text-amber-700 dark:text-neutral-400 dark:hover:bg-amber-500/10 dark:hover:text-amber-400"
      >
        <svg className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back
      </Link>

      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
          </div>
          <span className="font-display text-xl font-bold text-neutral-950 dark:text-white">Aush Voice</span>
        </Link>

        <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-neutral-950">
          <h1 className="font-display text-2xl font-bold text-neutral-950 dark:text-white">Create your account</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Get started with your AI receptionist</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Your name"
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-950 outline-none transition-all placeholder:text-neutral-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-white/10 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-600 dark:focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-950 outline-none transition-all placeholder:text-neutral-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-white/10 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-600 dark:focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-950 outline-none transition-all placeholder:text-neutral-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-white/10 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-600 dark:focus:border-amber-500/50"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl border border-neutral-950 bg-neutral-950 py-2.5 text-sm font-semibold text-white transition-all hover:bg-neutral-800 disabled:opacity-50 dark:border-white dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-amber-600 transition-colors hover:text-amber-500 dark:text-amber-400">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
