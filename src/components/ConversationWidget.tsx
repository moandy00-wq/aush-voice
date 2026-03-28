'use client'

import { useConversation } from '@elevenlabs/react'
import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

type Status = 'idle' | 'connecting' | 'active' | 'ended'

export function ConversationWidget() {
  const [status, setStatus] = useState<Status>('idle')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [intervalId, setIntervalId] = useState<ReturnType<typeof setInterval> | null>(null)

  const conversation = useConversation({
    onConnect: () => {
      setStatus('active')
      setError(null)
      const id = setInterval(() => setElapsed((e) => e + 1), 1000)
      setIntervalId(id)
    },
    onDisconnect: () => {
      setStatus('ended')
      if (intervalId) clearInterval(intervalId)
      setTimeout(() => {
        setStatus('idle')
        setDialogOpen(false)
        setElapsed(0)
        setCustomPrompt('')
      }, 2000)
    },
    onError: (err) => {
      console.error('Conversation error:', err)
      setError('Connection error. Please try again.')
      setStatus('idle')
      if (intervalId) clearInterval(intervalId)
    },
  })

  const startConversation = useCallback(async () => {
    setError(null)
    setStatus('connecting')

    try {
      // Get signed URL from our API
      const urlRes = await fetch('/api/elevenlabs/signed-url')
      if (!urlRes.ok) throw new Error('Failed to get signed URL')
      const { signedUrl } = await urlRes.json()

      // Build overrides if custom prompt provided
      const overrides = customPrompt.trim()
        ? {
            agent: {
              prompt: {
                prompt: customPrompt.trim(),
              },
            },
          }
        : undefined

      // Start session
      const conversationId = await conversation.startSession({
        signedUrl,
        connectionType: 'websocket',
        overrides,
      })

      // Create pending call record in Supabase
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user && conversationId) {
        await supabase.from('calls').insert({
          user_id: user.id,
          elevenlabs_conversation_id: conversationId,
          status: 'initiated',
          direction: 'browser',
          custom_prompt: customPrompt.trim() || null,
        })
      }
    } catch (err) {
      console.error('Start conversation error:', err)
      setError(err instanceof Error ? err.message : 'Failed to start conversation')
      setStatus('idle')
    }
  }, [conversation, customPrompt])

  const stopConversation = useCallback(async () => {
    await conversation.endSession()
  }, [conversation])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <>
      {/* Floating button */}
      {!dialogOpen && (
        <button
          onClick={() => setDialogOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-500/30 animate-pulse-glow"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
          </svg>
        </button>
      )}

      {/* Dialog */}
      {dialogOpen && (
        <div className="fixed bottom-6 right-6 z-40 w-80 rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-neutral-950">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
              </div>
              <span className="font-display text-sm font-bold text-neutral-950 dark:text-white">Talk to Your AI</span>
            </div>
            <button
              onClick={() => {
                if (status === 'active') stopConversation()
                setDialogOpen(false)
                setStatus('idle')
                setElapsed(0)
                if (intervalId) clearInterval(intervalId)
              }}
              className="rounded-lg p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-white/5"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content based on status */}
          {status === 'idle' && (
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  Test scenario context (optional)
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="e.g., I want to book a table for 4 on Friday at 7pm"
                  rows={3}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-950 outline-none transition-all placeholder:text-neutral-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-white/10 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-600"
                />
              </div>
              {error && (
                <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">{error}</p>
              )}
              <button
                onClick={startConversation}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-amber-500/20"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
                Start Conversation
              </button>
            </div>
          )}

          {status === 'connecting' && (
            <div className="mt-6 flex flex-col items-center py-4">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
              <p className="mt-3 text-sm text-neutral-500">Connecting to your AI receptionist...</p>
            </div>
          )}

          {status === 'active' && (
            <div className="mt-4 space-y-4">
              <div className="flex flex-col items-center py-2">
                {/* Animated bars */}
                <div className="flex items-end gap-1">
                  {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 animate-pulse rounded-full bg-gradient-to-t from-amber-400 to-orange-500"
                      style={{
                        height: `${h * 6}px`,
                        animationDelay: `${i * 100}ms`,
                      }}
                    />
                  ))}
                </div>
                <p className="mt-3 text-sm font-medium text-neutral-950 dark:text-white">Conversation Active</p>
                <p className="mt-1 font-mono text-xs text-neutral-400">{formatTime(elapsed)}</p>
              </div>
              <button
                onClick={stopConversation}
                className="w-full rounded-xl bg-rose-500 py-2.5 text-sm font-semibold text-white transition-all hover:bg-rose-600"
              >
                End Conversation
              </button>
            </div>
          )}

          {status === 'ended' && (
            <div className="mt-6 flex flex-col items-center py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10">
                <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="mt-2 text-sm font-medium text-neutral-950 dark:text-white">Conversation Complete</p>
              <p className="mt-1 text-xs text-neutral-400">Processing transcript...</p>
            </div>
          )}
        </div>
      )}
    </>
  )
}
