'use client'

import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, isBefore } from 'date-fns'

interface Appointment {
  id: string
  title: string
  description: string | null
  special_requests: string | null
  scheduled_at: string
  duration_minutes: number
  status: string
  contact: { id: string; display_name: string; phone_number: string | null } | null
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500',
  approved: 'bg-emerald-500',
  declined: 'bg-neutral-400',
  expired: 'bg-neutral-400',
  cancelled: 'bg-neutral-400',
}

const statusBg: Record<string, string> = {
  pending: 'border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/5',
  approved: 'border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/5',
  declined: 'border-neutral-200 bg-neutral-50 opacity-50 dark:border-white/5 dark:bg-neutral-900',
  expired: 'border-neutral-200 bg-neutral-50 opacity-50 dark:border-white/5 dark:bg-neutral-900',
}

export function CalendarView({ initialAppointments }: { initialAppointments: Appointment[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [appointments, setAppointments] = useState(initialAppointments)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Auto-expire past pending reservations
  useEffect(() => {
    const now = new Date()
    const expiredIds = appointments
      .filter(a => a.status === 'pending' && isBefore(new Date(a.scheduled_at), now))
      .map(a => a.id)

    if (expiredIds.length > 0) {
      expiredIds.forEach(async (id) => {
        await fetch('/api/appointments', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, status: 'expired' }),
        })
      })
      setAppointments(prev => prev.map(a =>
        expiredIds.includes(a.id) ? { ...a, status: 'expired' } : a
      ))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAction = async (id: string, status: 'approved' | 'declined') => {
    setActionLoading(true)
    const res = await fetch('/api/appointments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    if (res.ok) {
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a))
      setSelectedAppointment(null)
    }
    setActionLoading(false)
  }

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startDay = monthStart.getDay()
  const paddedDays: (Date | null)[] = Array(startDay).fill(null).concat(days)

  const getAppointmentsForDay = (day: Date) =>
    appointments.filter((a) => isSameDay(new Date(a.scheduled_at), day))

  // Check for time conflicts
  const getConflicts = (day: Date) => {
    const dayApts = getAppointmentsForDay(day).filter(a => ['pending', 'approved'].includes(a.status))
    const conflicts: string[] = []
    for (let i = 0; i < dayApts.length; i++) {
      for (let j = i + 1; j < dayApts.length; j++) {
        const t1 = new Date(dayApts[i]!.scheduled_at).getTime()
        const t2 = new Date(dayApts[j]!.scheduled_at).getTime()
        const diff = Math.abs(t1 - t2) / 60000
        if (diff < (dayApts[i]!.duration_minutes || 30)) {
          conflicts.push(`${dayApts[i]!.title} and ${dayApts[j]!.title} overlap`)
        }
      }
    }
    return conflicts
  }

  const pendingAppointments = appointments.filter(a => a.status === 'pending')

  return (
    <div className="mt-6">
      {/* Pending Reservations Banner */}
      {pendingAppointments.length > 0 && (
        <div className="mb-6">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-neutral-950 dark:text-white">
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-amber-500 px-1.5 text-xs font-bold text-white">
              {pendingAppointments.length}
            </span>
            Pending Reservations
          </h2>
          <div className="mt-3 space-y-2">
            {pendingAppointments.map((apt) => (
              <div key={apt.id} className="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 dark:border-amber-500/20 dark:bg-amber-500/5">
                <div>
                  <p className="text-sm font-medium text-neutral-950 dark:text-white">{apt.title}</p>
                  <p className="text-xs text-neutral-500">
                    {format(new Date(apt.scheduled_at), 'MMM d, yyyy · h:mm a')} · {apt.duration_minutes}min
                  </p>
                  {apt.description && <p className="mt-1 text-xs text-neutral-400">{apt.description}</p>}
                  {apt.special_requests && <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">Special: {apt.special_requests}</p>}
                  {apt.contact?.phone_number && (
                    <p className="mt-1 text-xs text-neutral-400">Phone: {apt.contact.phone_number}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAction(apt.id, 'approved')}
                    disabled={actionLoading}
                    className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-emerald-600 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(apt.id, 'declined')}
                    disabled={actionLoading}
                    className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-600 transition-all hover:bg-neutral-100 dark:border-white/10 dark:text-neutral-400 dark:hover:bg-white/5"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-neutral-950 dark:text-white">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="rounded-xl border border-neutral-200 p-2 text-neutral-500 transition-all hover:bg-neutral-100 dark:border-white/10 dark:hover:bg-white/5">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          </button>
          <button onClick={() => setCurrentMonth(new Date())} className="rounded-xl border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-all hover:bg-neutral-100 dark:border-white/10 dark:text-neutral-400 dark:hover:bg-white/5">Today</button>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="rounded-xl border border-neutral-200 p-2 text-neutral-500 transition-all hover:bg-neutral-100 dark:border-white/10 dark:hover:bg-white/5">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white dark:border-white/10 dark:bg-neutral-950">
        <div className="grid grid-cols-7 border-b border-neutral-200 dark:border-white/5">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-widest text-neutral-400">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {paddedDays.map((day, i) => {
            if (!day) return <div key={`pad-${i}`} className="min-h-[80px] border-b border-r border-neutral-100 dark:border-white/5" />

            const dayAppointments = getAppointmentsForDay(day)
            const isCurrentMonth = isSameMonth(day, currentMonth)
            const today = isToday(day)
            const conflicts = getConflicts(day)

            return (
              <div key={day.toISOString()} className={`min-h-[80px] border-b border-r border-neutral-100 p-1.5 dark:border-white/5 ${!isCurrentMonth ? 'opacity-30' : ''}`}>
                <div className="flex items-center gap-1">
                  <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${today ? 'bg-amber-500 text-white' : 'text-neutral-600 dark:text-neutral-400'}`}>
                    {format(day, 'd')}
                  </span>
                  {conflicts.length > 0 && (
                    <span className="text-amber-500" title={conflicts.join(', ')}>
                      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                    </span>
                  )}
                </div>
                <div className="mt-1 space-y-0.5">
                  {dayAppointments.slice(0, 2).map((apt) => (
                    <button
                      key={apt.id}
                      onClick={() => setSelectedAppointment(apt)}
                      className={`flex w-full items-center gap-1 rounded px-1 py-0.5 text-left text-xs transition-all hover:ring-1 hover:ring-amber-500/50 ${apt.status === 'declined' || apt.status === 'expired' ? 'line-through opacity-50' : ''}`}
                    >
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusColors[apt.status] || 'bg-neutral-400'}`} />
                      <span className="truncate text-neutral-700 dark:text-neutral-300">
                        {format(new Date(apt.scheduled_at), 'h:mm a')}
                      </span>
                    </button>
                  ))}
                  {dayAppointments.length > 2 && <p className="px-1 text-xs text-neutral-400">+{dayAppointments.length - 2} more</p>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedAppointment(null)}>
          <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-neutral-950" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-neutral-950 dark:text-white">{selectedAppointment.title}</h3>
              <div className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${statusColors[selectedAppointment.status] || ''}`} />
                <span className="text-xs font-medium text-neutral-500 capitalize">{selectedAppointment.status}</span>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div>
                <p className="text-xs font-medium text-neutral-500">Date & Time</p>
                <p className="text-neutral-950 dark:text-white">{format(new Date(selectedAppointment.scheduled_at), 'EEEE, MMMM d, yyyy · h:mm a')}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500">Duration</p>
                <p className="text-neutral-950 dark:text-white">{selectedAppointment.duration_minutes} minutes</p>
              </div>
              {selectedAppointment.contact && (
                <div>
                  <p className="text-xs font-medium text-neutral-500">Contact</p>
                  <p className="text-neutral-950 dark:text-white">{selectedAppointment.contact.display_name}</p>
                  {selectedAppointment.contact.phone_number && (
                    <p className="text-xs text-neutral-400">{selectedAppointment.contact.phone_number}</p>
                  )}
                </div>
              )}
              {selectedAppointment.description && (
                <div>
                  <p className="text-xs font-medium text-neutral-500">Details</p>
                  <p className="text-neutral-700 dark:text-neutral-300">{selectedAppointment.description}</p>
                </div>
              )}
              {selectedAppointment.special_requests && (
                <div>
                  <p className="text-xs font-medium text-neutral-500">Special Requests</p>
                  <p className="text-amber-600 dark:text-amber-400">{selectedAppointment.special_requests}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            {selectedAppointment.status === 'pending' && (
              <div className="mt-6 space-y-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(selectedAppointment.id, 'approved')}
                    disabled={actionLoading}
                    className="flex-1 rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-600 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(selectedAppointment.id, 'declined')}
                    disabled={actionLoading}
                    className="flex-1 rounded-xl border border-neutral-300 py-2.5 text-sm font-semibold text-neutral-600 transition-all hover:bg-neutral-100 dark:border-white/10 dark:text-neutral-400 dark:hover:bg-white/5"
                  >
                    Decline
                  </button>
                </div>
                {selectedAppointment.contact?.phone_number && (
                  <p className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                    Remember to call back {selectedAppointment.contact.display_name} at {selectedAppointment.contact.phone_number} to confirm.
                  </p>
                )}
              </div>
            )}

            {(selectedAppointment.status === 'approved' || selectedAppointment.status === 'declined') && selectedAppointment.contact?.phone_number && (
              <div className="mt-4 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                Call back {selectedAppointment.contact.display_name} at {selectedAppointment.contact.phone_number} to notify them.
              </div>
            )}

            <button
              onClick={() => setSelectedAppointment(null)}
              className="mt-4 w-full rounded-xl border border-neutral-200 py-2 text-sm text-neutral-500 transition-all hover:bg-neutral-50 dark:border-white/10 dark:hover:bg-white/5"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Upcoming list */}
      <div className="mt-8">
        <h2 className="font-display text-lg font-bold text-neutral-950 dark:text-white">Upcoming</h2>
        {appointments.filter(a => ['pending', 'approved'].includes(a.status) && !isBefore(new Date(a.scheduled_at), new Date())).length === 0 ? (
          <p className="mt-4 text-sm text-neutral-400">No upcoming reservations.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {appointments
              .filter(a => ['pending', 'approved'].includes(a.status) && !isBefore(new Date(a.scheduled_at), new Date()))
              .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
              .map((apt) => (
                <div key={apt.id} className={`rounded-2xl border px-5 py-3 ${statusBg[apt.status] || 'border-neutral-200 dark:border-white/10'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-950 dark:text-white">{apt.title}</p>
                      <p className="text-xs text-neutral-500">
                        {format(new Date(apt.scheduled_at), 'MMM d, yyyy · h:mm a')} · {apt.duration_minutes}min
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                        apt.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
                        apt.status === 'approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                        'bg-neutral-100 text-neutral-500 dark:bg-neutral-800'
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
