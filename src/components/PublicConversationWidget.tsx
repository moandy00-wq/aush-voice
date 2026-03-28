'use client'

import { useConversation, ConversationProvider } from '@elevenlabs/react'
import { useState, useCallback, useRef } from 'react'

type Status = 'idle' | 'connecting' | 'active' | 'ended'

function ConversationInner({ ownerId, agentPrompt, agentFirstMessage }: { ownerId: string; agentPrompt?: string | null; agentFirstMessage?: string | null }) {
  const [status, setStatus] = useState<Status>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const conversationIdRef = useRef<string | null>(null)

  const conversation = useConversation({
    onConnect: () => {
      console.log('[AushVoice] Connected')
      setStatus('active')
      setError(null)
      intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000)

      // Create pending call when connected (even without conversationId)
      const convId = conversationIdRef.current || 'browser-' + Date.now()
      conversationIdRef.current = convId
      fetch('/api/calls/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerId, conversationId: convId }),
      }).catch(err => console.error('[AushVoice] Failed to create call record:', err))
    },
    onDisconnect: () => {
      console.log('[AushVoice] Disconnected')
      setStatus('ended')
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    },
    onError: (err) => {
      console.error('[AushVoice] Error:', err)
      setError('Connection error. Please try again.')
      setStatus('idle')
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    },
  })

  const startConversation = useCallback(async () => {
    setError(null)
    setStatus('connecting')

    try {
      // Get signed URL
      const urlRes = await fetch(`/api/elevenlabs/public-signed-url?owner=${ownerId}`)
      if (!urlRes.ok) {
        const errBody = await urlRes.text()
        console.error('[AushVoice] Signed URL error:', urlRes.status, errBody)
        throw new Error('Failed to connect')
      }
      const { signedUrl } = await urlRes.json()
      console.log('[AushVoice] Got signed URL, starting session...')

      // Build overrides only if we have a custom prompt
      const overrides = agentPrompt ? {
        agent: {
          prompt: { prompt: agentPrompt },
          ...(agentFirstMessage ? { firstMessage: agentFirstMessage } : {}),
        },
      } : agentFirstMessage ? {
        agent: {
          firstMessage: agentFirstMessage,
        },
      } : undefined

      // Test: signedUrl WITHOUT overrides to see if connection stays
      console.log('[AushVoice] Starting session (no overrides test)')
      await conversation.startSession({
        signedUrl,
      })
      console.log('[AushVoice] Session started')
    } catch (err) {
      console.error('[AushVoice] Start error:', err)
      setError(err instanceof Error ? err.message : 'Failed to start')
      setStatus('idle')
    }
  }, [conversation, ownerId, agentPrompt, agentFirstMessage])

  const stopConversation = useCallback(async () => {
    await conversation.endSession()
  }, [conversation])

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  return (
    <div className="mt-6">
      {status === 'idle' && (
        <div>
          {error && (
            <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">{error}</p>
          )}
          <button
            onClick={startConversation}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-4 text-base font-semibold text-white shadow-lg shadow-amber-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-500/30"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
            Start Conversation
          </button>
        </div>
      )}

      {status === 'connecting' && (
        <div className="flex flex-col items-center py-8">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          <p className="mt-4 text-sm text-neutral-500">Connecting to your AI receptionist...</p>
        </div>
      )}

      {status === 'active' && (
        <div className="space-y-4">
          <div className="flex flex-col items-center rounded-2xl border border-emerald-200 bg-emerald-50 py-8 dark:border-emerald-500/20 dark:bg-emerald-500/5">
            <div className="flex items-end gap-1">
              {[2, 4, 6, 3, 5, 7, 4, 6, 3, 5, 4, 6, 3].map((h, i) => (
                <div
                  key={i}
                  className="w-1.5 animate-pulse rounded-full bg-gradient-to-t from-emerald-400 to-emerald-500"
                  style={{ height: `${h * 5}px`, animationDelay: `${i * 80}ms` }}
                />
              ))}
            </div>
            <p className="mt-4 text-sm font-medium text-emerald-700 dark:text-emerald-400">Conversation Active</p>
            <p className="mt-1 font-mono text-xs text-emerald-600/60 dark:text-emerald-400/60">{formatTime(elapsed)}</p>
          </div>
          <button
            onClick={stopConversation}
            className="w-full rounded-2xl border border-rose-200 bg-rose-50 py-3 text-sm font-semibold text-rose-600 transition-all hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-500/5 dark:text-rose-400 dark:hover:bg-rose-500/10"
          >
            End Conversation
          </button>
        </div>
      )}

      {status === 'ended' && (
        <div className="flex flex-col items-center py-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10">
            <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="mt-3 text-sm font-medium text-neutral-950 dark:text-white">Thank you!</p>
          <p className="mt-1 text-xs text-neutral-400">Your conversation has been recorded. We&apos;ll follow up if needed.</p>
          <button
            onClick={() => { setStatus('idle'); setElapsed(0); setError(null) }}
            className="mt-4 text-sm font-medium text-amber-600 transition-colors hover:text-amber-500 dark:text-amber-400"
          >
            Start another conversation
          </button>
        </div>
      )}
    </div>
  )
}

export function PublicConversationWidget({ ownerId, agentPrompt, agentFirstMessage }: { ownerId: string; agentPrompt?: string | null; agentFirstMessage?: string | null }) {
  return (
    <ConversationProvider>
      <ConversationInner ownerId={ownerId} agentPrompt={agentPrompt} agentFirstMessage={agentFirstMessage} />
    </ConversationProvider>
  )
}
