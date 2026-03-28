'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface Contact {
  id: string
  display_name: string
  phone_number: string | null
  email: string | null
  created_at: string
}

export function ContactsList({ initialContacts }: { initialContacts: Contact[] }) {
  const [search, setSearch] = useState('')

  const filtered = initialContacts.filter((c) => {
    if (!search) return true
    const q = search.toLowerCase()
    return c.display_name.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.phone_number?.includes(q)
  })

  return (
    <div className="mt-6">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search contacts..."
        className="max-w-xs rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-950 outline-none transition-all placeholder:text-neutral-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-white/10 dark:bg-neutral-900 dark:text-white"
      />

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-12 text-center dark:border-white/10 dark:bg-neutral-950">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-900">
            <svg className="h-6 w-6 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          </div>
          <p className="mt-3 text-sm font-medium text-neutral-500 dark:text-neutral-400">No contacts yet</p>
          <p className="mt-1 text-xs text-neutral-400">Contacts are created automatically when someone talks to your AI receptionist.</p>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((contact) => (
            <Link
              key={contact.id}
              href={`/contacts/${contact.id}`}
              className="rounded-2xl border border-neutral-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md dark:border-white/10 dark:bg-neutral-950 dark:hover:border-amber-500/20"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-bold text-white">
                  {contact.display_name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-neutral-950 dark:text-white">{contact.display_name}</p>
                  <p className="text-xs text-neutral-400">
                    {formatDistanceToNow(new Date(contact.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
