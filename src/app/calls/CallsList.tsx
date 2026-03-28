'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface CallWithContact {
  id: string
  status: string
  direction: string
  duration_seconds: number | null
  summary: string | null
  created_at: string
  contact: { id: string; display_name: string } | null
}

const statusColors: Record<string, string> = {
  completed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  initiated: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  failed: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
}

export function CallsList({ initialCalls }: { initialCalls: CallWithContact[] }) {
  const [filter, setFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  const filtered = initialCalls.filter((call) => {
    if (filter !== 'all' && call.status !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      const name = call.contact?.display_name?.toLowerCase() || ''
      const summary = call.summary?.toLowerCase() || ''
      if (!name.includes(q) && !summary.includes(q)) return false
    }
    return true
  })

  const formatDuration = (s: number | null) => {
    if (!s) return '—'
    const m = Math.floor(s / 60)
    const sec = s % 60
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`
  }

  return (
    <div className="mt-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or summary..."
          className="max-w-xs flex-1 rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-950 outline-none transition-all placeholder:text-neutral-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-white/10 dark:bg-neutral-900 dark:text-white"
        />
        <div className="flex gap-1">
          {['all', 'completed', 'initiated', 'failed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                filter === f
                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                  : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-white/5'
              }`}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-12 text-center dark:border-white/10 dark:bg-neutral-950">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-900">
            <svg className="h-6 w-6 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
          </div>
          <p className="mt-3 text-sm font-medium text-neutral-500 dark:text-neutral-400">No conversations found</p>
          <p className="mt-1 text-xs text-neutral-400">Conversations will appear here after customers talk to your AI receptionist.</p>
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {filtered.map((call) => (
            <Link
              key={call.id}
              href={`/calls/${call.id}`}
              className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white px-5 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md dark:border-white/10 dark:bg-neutral-950 dark:hover:border-amber-500/20"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 font-display text-sm font-semibold dark:bg-neutral-800">
                  {call.contact?.display_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-950 dark:text-white">
                    {call.contact?.display_name || 'Unknown Caller'}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-neutral-400">
                    {call.summary || 'No summary available'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="hidden text-xs text-neutral-400 sm:block">
                  {formatDuration(call.duration_seconds)}
                </span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[call.status] || 'text-neutral-400'}`}>
                  {call.status}
                </span>
                <span className="text-xs text-neutral-400">
                  {formatDistanceToNow(new Date(call.created_at), { addSuffix: true })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
