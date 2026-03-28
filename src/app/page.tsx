'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useCallback } from 'react'
import { ThemeToggle } from '@/components/ThemeToggle'

function useSmoothScroll() {
  return useCallback((e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    const el = document.getElementById(targetId)
    if (!el) return

    const targetY = el.getBoundingClientRect().top + window.scrollY - 80
    const startY = window.scrollY
    const diff = targetY - startY
    const duration = Math.min(1800, Math.max(800, Math.abs(diff) * 0.8)) // 800-1800ms based on distance
    let startTime: number | null = null

    function easeInOutCubic(t: number) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    }

    function step(timestamp: number) {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      const ease = easeInOutCubic(progress)
      window.scrollTo(0, startY + diff * ease)
      if (progress < 1) requestAnimationFrame(step)
    }

    requestAnimationFrame(step)
    history.pushState(null, '', `#${targetId}`)
  }, [])
}

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
})

const fadeIn = (delay: number) => ({
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, margin: '-80px' },
  transition: { delay, duration: 0.8 },
})

const staggerChild = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
}

export default function LandingPage() {
  const smoothScroll = useSmoothScroll()

  return (
    <div className="min-h-dvh bg-white text-neutral-950 dark:bg-black dark:text-white">
      {/* ───────── NAV ───────── */}
      <nav className="fixed top-0 z-50 w-full border-b border-neutral-200/60 bg-white/70 backdrop-blur-2xl dark:border-white/5 dark:bg-black/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
            </div>
            <span className="font-display text-lg font-bold">Aush Voice</span>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" onClick={(e) => smoothScroll(e, 'features')} className="text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white">Features</a>
            <a href="#how-it-works" onClick={(e) => smoothScroll(e, 'how-it-works')} className="text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white">How It Works</a>
            <a href="#integrations" onClick={(e) => smoothScroll(e, 'integrations')} className="text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white">Integrations</a>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-600 transition-all hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-white/5">
              Log In
            </Link>
            <Link href="/signup" className="rounded-lg border border-neutral-950 bg-neutral-950 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-neutral-800 dark:border-white dark:bg-white dark:text-black dark:hover:bg-neutral-200">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* ───────── HERO ───────── */}
      <section className="relative flex min-h-dvh items-center overflow-hidden px-6 pt-16">
        {/* Background elements */}
        <div className="pointer-events-none absolute inset-0">
          <div className="animate-gradient absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50/30 to-white dark:from-amber-950/20 dark:via-transparent dark:to-black" />
          <div className="absolute right-0 top-1/4 h-[500px] w-[500px] rounded-full bg-amber-200/20 blur-[120px] dark:bg-amber-500/5" />
          <div className="absolute -left-20 bottom-1/4 h-[400px] w-[400px] rounded-full bg-orange-200/20 blur-[100px] dark:bg-orange-500/5" />
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:64px_64px] dark:bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)]" />
        </div>

        <div className="relative z-10 mx-auto grid max-w-7xl gap-16 lg:grid-cols-2 lg:items-center">
          {/* Left: Copy */}
          <div>
            <motion.div {...fadeUp(0.2)} className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-sm font-medium text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              Now with ElevenLabs Conversational AI
            </motion.div>

            <motion.h1 {...fadeUp(0.35)} className="font-display text-5xl font-bold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
              Your own AI receptionist,
              <br />
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">built around your business</span>
            </motion.h1>

            <motion.p {...fadeUp(0.5)} className="mt-6 max-w-lg text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
              Create a fully customizable AI receptionist with its own personality, knowledge base, and scheduling rules — tailored to your business and ready in minutes.
            </motion.p>

            <motion.div {...fadeUp(0.65)} className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/signup" className="group inline-flex items-center gap-2 rounded-xl border border-neutral-950 bg-neutral-950 px-7 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-neutral-950/20 dark:border-white dark:bg-white dark:text-black dark:hover:shadow-white/20">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Start Free
              </Link>
              <Link href="/login" className="inline-flex items-center gap-2 rounded-xl px-7 py-3 text-sm font-medium text-neutral-600 transition-all hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white">
                Already have an account?
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                </svg>
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div {...fadeUp(0.8)} className="mt-10 flex items-center gap-6 border-t border-neutral-200 pt-6 dark:border-white/10">
              <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-500">
                <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                No credit card
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-500">
                <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                Setup in 2 minutes
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-500">
                <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                Free tier available
              </div>
            </motion.div>
          </div>

          {/* Right: UI Preview mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden lg:block"
          >
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl shadow-neutral-200/50 dark:border-white/10 dark:bg-neutral-950 dark:shadow-black/50">
              {/* Fake browser chrome */}
              <div className="mb-4 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-emerald-400" />
                <div className="ml-4 h-6 flex-1 rounded-md bg-neutral-100 dark:bg-neutral-900" />
              </div>
              {/* Fake dashboard content */}
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Total Calls', value: '1,247', icon: '📞', color: 'from-amber-400/10 to-orange-400/10 dark:from-amber-500/10 dark:to-orange-500/10' },
                    { label: 'Appointments', value: '89', icon: '📅', color: 'from-emerald-400/10 to-teal-400/10 dark:from-emerald-500/10 dark:to-teal-500/10' },
                    { label: 'Contacts', value: '312', icon: '👥', color: 'from-blue-400/10 to-indigo-400/10 dark:from-blue-500/10 dark:to-indigo-500/10' },
                  ].map((stat) => (
                    <div key={stat.label} className={`rounded-xl bg-gradient-to-br ${stat.color} p-3 border border-neutral-100 dark:border-white/5`}>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{stat.label}</p>
                      <p className="mt-1 font-display text-xl font-bold">{stat.value}</p>
                    </div>
                  ))}
                </div>
                {/* Fake call list */}
                <div className="rounded-xl border border-neutral-100 dark:border-white/5">
                  {[
                    { name: 'Sarah Johnson', status: 'Completed', time: '2m ago', statusColor: 'bg-emerald-500' },
                    { name: 'Mike Chen', status: 'Scheduled', time: '15m ago', statusColor: 'bg-amber-500' },
                    { name: 'Lisa Park', status: 'Completed', time: '1h ago', statusColor: 'bg-emerald-500' },
                    { name: 'James Wilson', status: 'Missed', time: '2h ago', statusColor: 'bg-rose-500' },
                  ].map((call, i) => (
                    <div key={call.name} className={`flex items-center justify-between px-4 py-3 ${i !== 3 ? 'border-b border-neutral-100 dark:border-white/5' : ''}`}>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 font-display text-xs font-semibold dark:bg-neutral-800">
                          {call.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{call.name}</p>
                          <p className="text-xs text-neutral-400">{call.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${call.statusColor}`} />
                        <span className="text-xs text-neutral-500">{call.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Floating notification card */}
            <motion.div
              initial={{ opacity: 0, y: 20, x: -20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="absolute -left-12 bottom-16 rounded-xl border border-neutral-200 bg-white p-4 shadow-xl dark:border-white/10 dark:bg-neutral-900"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10">
                  <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold">Appointment Booked</p>
                  <p className="text-xs text-neutral-500">Table for 4 — Friday 7PM</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ───────── STATS BAR ───────── */}
      <section className="border-y border-neutral-200 bg-neutral-50 dark:border-white/5 dark:bg-neutral-950">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-neutral-200 dark:divide-white/5 md:grid-cols-4">
          {[
            { value: '99.9%', label: 'Uptime', icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg> },
            { value: '<1s', label: 'Response Time', icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
            { value: '24/7', label: 'Availability', icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg> },
            { value: '50+', label: 'Languages', icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" /></svg> },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              {...fadeIn(i * 0.1)}
              className="flex items-center gap-4 px-8 py-8"
            >
              <div className="text-amber-500">{stat.icon}</div>
              <div>
                <p className="font-display text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ───────── FEATURES ───────── */}
      <section id="features" className="px-6 py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <motion.div {...staggerChild} transition={{ duration: 0.6 }}>
              <span className="font-display text-sm font-semibold uppercase tracking-widest text-amber-500">Features</span>
              <h2 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
                Your receptionist,
                <br />
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">your rules</span>
              </h2>
              <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
                Customize every detail — from personality and knowledge base to scheduling rules and greeting style.
              </p>
            </motion.div>
          </div>

          {/* Feature grid — asymmetric layout */}
          <div className="mt-20 grid gap-5 md:grid-cols-3">
            {/* Large card */}
            <motion.div {...staggerChild} transition={{ duration: 0.5 }} className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-gradient-to-b from-white to-neutral-50 p-8 transition-all duration-300 hover:border-amber-200 hover:shadow-xl hover:shadow-amber-500/5 dark:border-white/10 dark:from-neutral-950 dark:to-neutral-900 dark:hover:border-amber-500/20 md:col-span-2 md:row-span-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/20">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="mt-6 font-display text-2xl font-bold">Fully Customizable AI Personality</h3>
              <p className="mt-3 max-w-md text-neutral-600 dark:text-neutral-400">
                Give your AI receptionist a name, personality, and knowledge base unique to your business. It speaks naturally, understands context, and adapts to every conversation. Powered by ElevenLabs&apos; state-of-the-art speech synthesis.
              </p>
              {/* Fake waveform visual */}
              <div className="mt-8 flex items-end gap-1">
                {[3, 5, 8, 4, 7, 10, 6, 9, 3, 7, 5, 8, 4, 6, 9, 7, 3, 5, 8, 6, 4, 7, 10, 5, 3, 8, 6, 4, 7, 5, 9, 3, 6, 8, 4, 7, 5, 3, 6, 8].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.02, duration: 0.4 }}
                    className="w-1.5 origin-bottom rounded-full bg-gradient-to-t from-amber-400 to-orange-500 opacity-60"
                    style={{ height: `${h * 4}px` }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Small cards */}
            <motion.div {...staggerChild} transition={{ duration: 0.5, delay: 0.1 }} className="group rounded-2xl border border-neutral-200 p-6 transition-all duration-300 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 dark:border-white/10 dark:hover:border-emerald-500/20">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
                <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">Auto-Scheduling from Conversations</h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">Your AI extracts dates, times, and preferences from conversations and books appointments directly to your calendar.</p>
            </motion.div>

            <motion.div {...staggerChild} transition={{ duration: 0.5, delay: 0.2 }} className="group rounded-2xl border border-neutral-200 p-6 transition-all duration-300 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 dark:border-white/10 dark:hover:border-blue-500/20">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
                <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">AI Transcripts & Notes</h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">Every conversation is transcribed and summarized. Key details are extracted and organized automatically.</p>
            </motion.div>
          </div>

          {/* Second row — 3 equal cards */}
          <div className="mt-5 grid gap-5 md:grid-cols-3">
            {[
              {
                icon: <svg className="h-5 w-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
                iconBg: 'bg-violet-50 dark:bg-violet-500/10',
                title: 'Contact Profiles',
                desc: 'Contacts are auto-created from conversations with full history, notes, and appointment records.',
                hoverBorder: 'hover:border-violet-200 dark:hover:border-violet-500/20',
                hoverShadow: 'hover:shadow-violet-500/5',
              },
              {
                icon: <svg className="h-5 w-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>,
                iconBg: 'bg-rose-50 dark:bg-rose-500/10',
                title: 'Real-time Alerts',
                desc: 'Instant notifications when a conversation ends, an appointment is booked, or action is needed.',
                hoverBorder: 'hover:border-rose-200 dark:hover:border-rose-500/20',
                hoverShadow: 'hover:shadow-rose-500/5',
              },
              {
                icon: <svg className="h-5 w-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" /></svg>,
                iconBg: 'bg-teal-50 dark:bg-teal-500/10',
                title: 'Your Own Scheduling Page',
                desc: 'Each owner gets a public scheduling page where customers can talk to your AI receptionist and book appointments.',
                hoverBorder: 'hover:border-teal-200 dark:hover:border-teal-500/20',
                hoverShadow: 'hover:shadow-teal-500/5',
              },
            ].map((f, i) => (
              <motion.div key={f.title} {...staggerChild} transition={{ duration: 0.5, delay: i * 0.1 }} className={`group rounded-2xl border border-neutral-200 p-6 transition-all duration-300 ${f.hoverBorder} hover:shadow-xl ${f.hoverShadow} dark:border-white/10`}>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${f.iconBg}`}>
                  {f.icon}
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── HOW IT WORKS ───────── */}
      <section id="how-it-works" className="border-y border-neutral-200 bg-neutral-50 px-6 py-28 dark:border-white/5 dark:bg-neutral-950">
        <div className="mx-auto max-w-5xl">
          <motion.div {...staggerChild} transition={{ duration: 0.6 }} className="text-center">
            <span className="font-display text-sm font-semibold uppercase tracking-widest text-amber-500">How It Works</span>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">Three steps to automate</h2>
          </motion.div>

          <div className="mt-20 grid gap-8 md:grid-cols-3">
            {[
              {
                num: '01',
                title: 'Sign Up & Configure',
                desc: 'Create your account and use the setup wizard to name your AI receptionist, define its personality, and set your scheduling rules.',
                icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>,
              },
              {
                num: '02',
                title: 'Share Your Scheduling Page',
                desc: 'Get a unique public link where customers can talk to your AI receptionist and book appointments directly.',
                icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>,
              },
              {
                num: '03',
                title: 'Review in Your Dashboard',
                desc: 'Every conversation is transcribed and summarized. Appointments land on your calendar. Contacts are auto-created.',
                icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg>,
              },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="relative text-center"
              >
                {/* Connector line */}
                {i < 2 && (
                  <div className="absolute right-0 top-8 hidden h-px w-full translate-x-1/2 bg-gradient-to-r from-neutral-300 to-transparent dark:from-white/10 md:block" />
                )}
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-amber-200 bg-white text-amber-500 dark:border-amber-500/30 dark:bg-neutral-900">
                  {step.icon}
                </div>
                <span className="mt-4 block font-display text-xs font-bold uppercase tracking-widest text-amber-500">{step.num}</span>
                <h3 className="mt-2 font-display text-xl font-bold">{step.title}</h3>
                <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── INTEGRATIONS ───────── */}
      <section id="integrations" className="px-6 py-28">
        <div className="mx-auto max-w-5xl">
          <motion.div {...staggerChild} transition={{ duration: 0.6 }} className="text-center">
            <span className="font-display text-sm font-semibold uppercase tracking-widest text-amber-500">Powered By</span>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">Enterprise-grade infrastructure</h2>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
              Built on industry-leading platforms for reliability and performance.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              { name: 'ElevenLabs', desc: 'State-of-the-art conversational AI with human-like voice synthesis and real-time processing.', tag: 'Voice AI' },
              { name: 'Supabase', desc: 'Scalable PostgreSQL database with real-time subscriptions, authentication, and row-level security.', tag: 'Database' },
              { name: 'Vercel', desc: 'Edge-optimized deployment with global CDN, serverless functions, and automatic scaling.', tag: 'Hosting' },
            ].map((integration, i) => (
              <motion.div
                key={integration.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="rounded-2xl border border-neutral-200 p-8 dark:border-white/10"
              >
                <span className="inline-block rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600 dark:bg-white/5 dark:text-neutral-400">{integration.tag}</span>
                <h3 className="mt-4 font-display text-xl font-bold">{integration.name}</h3>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{integration.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── FINAL CTA ───────── */}
      <section className="border-t border-neutral-200 px-6 py-28 dark:border-white/5">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl"
        >
          <div className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-gradient-to-b from-neutral-50 to-white p-12 text-center dark:border-white/10 dark:from-neutral-900 dark:to-neutral-950 md:p-16">
            {/* Decorative blurs */}
            <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-amber-300/20 blur-[80px] dark:bg-amber-500/10" />
            <div className="pointer-events-none absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-orange-300/20 blur-[80px] dark:bg-orange-500/10" />

            <div className="relative z-10">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/25">
                <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h2 className="font-display text-3xl font-bold sm:text-4xl">Ready to automate your front desk?</h2>
              <p className="mt-4 text-neutral-600 dark:text-neutral-400">
                Join businesses using AI to handle every conversation with care and precision.
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link href="/signup" className="inline-flex items-center gap-2 rounded-xl border border-neutral-950 bg-neutral-950 px-8 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl dark:border-white dark:bg-white dark:text-black">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Create Your Account
                </Link>
                <Link href="/login" className="text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-950 dark:hover:text-white">
                  or sign in &rarr;
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ───────── FOOTER ───────── */}
      <footer className="border-t border-neutral-200 px-6 py-10 dark:border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-amber-400 to-orange-500">
              <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
            </div>
            <span className="font-display text-sm font-bold text-neutral-400">Aush Voice</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-neutral-400">
            <span>Powered by ElevenLabs</span>
            <span>&middot;</span>
            <span>Built with Next.js & Supabase</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
