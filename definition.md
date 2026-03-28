# AI Voice Agent Integration — Product Definition

## What is the end product?

A web dashboard that triggers outbound AI voice calls via ElevenLabs Conversational AI, receives structured conversation data via webhooks when calls complete, and displays all call results in a searchable dashboard with detail views. This is a client-facing integration pattern for voice agent workflows.

## What does the user see and do?

1. Land on a dashboard showing all completed voice calls (table view)
2. Click "New Call" — enter a phone number and optional context/prompt
3. The system triggers an outbound AI voice call via ElevenLabs
4. Call status updates in real-time (ringing → in-progress → completed)
5. When the call ends, a webhook fires with transcript + extracted data
6. The call appears in the dashboard with: phone number, duration, timestamp, status
7. Click into any call to see full transcript, extracted fields, and metadata
8. Error states are clearly shown (failed calls, webhook errors, API errors)

## Who is the user?

Agency operators or client teams who manage AI voice campaigns. They need to trigger calls, monitor results, and review transcripts. Could also be the developer (you) demoing the integration to clients.

## Core Features

- **Trigger outbound AI voice call** — API route calls ElevenLabs (or similar) to initiate a call to a phone number
- **Webhook receiver** — API endpoint that ElevenLabs hits when a call completes, containing transcript and extracted data
- **Supabase storage** — All call data persisted: caller phone, duration, transcript, extracted fields, timestamp, status
- **Dashboard view** — Table of all calls with sorting, status badges, click-to-detail
- **Detail view** — Full transcript, extracted fields, call metadata, duration
- **Real-time updates** — Dashboard reflects new calls as webhooks arrive (Supabase realtime or polling)
- **Error handling** — Webhook failures retry/log, API errors shown in UI, failed calls tracked
- **Environment variables** — All API keys and secrets in .env (never committed)

## Tech Stack

See CLAUDE.md for detailed stack.

**Key components:** Next.js (App Router), Supabase (Postgres + Realtime), ElevenLabs Conversational AI API, webhooks.

## Acceptance Criteria

- [ ] "New Call" button triggers an outbound AI voice call via ElevenLabs API
- [ ] Call status updates visible in the UI
- [ ] Webhook endpoint receives POST from ElevenLabs with transcript + data
- [ ] Webhook data is parsed and stored in Supabase
- [ ] Dashboard lists all calls with phone, duration, status, timestamp
- [ ] Clicking a call shows full transcript and extracted fields
- [ ] Failed calls and webhook errors are logged and visible
- [ ] All API keys are in environment variables
- [ ] Test call triggers from UI → webhook stores data → dashboard updates
- [ ] Chrome DevTools can inspect webhook payload structure

## Constraints

- Must use ElevenLabs (or equivalent conversational AI voice API)
- Must use Supabase for data storage
- Must handle webhook reliability (idempotency, error logging)
- All secrets in .env, never hardcoded
- 5-day estimated build time

## Edge Cases / What Could Go Wrong

- **ElevenLabs API is down** — Show error, don't create a call record until confirmed
- **Webhook never arrives** — Call stuck in "pending" state. Add timeout/cleanup logic.
- **Duplicate webhooks** — Must be idempotent (check call ID before inserting)
- **Invalid phone number** — Validate before sending to API
- **Webhook payload format changes** — Defensive parsing with fallbacks
- **Supabase connection issues** — Retry webhook processing, log failures
- **Rate limiting on ElevenLabs** — Handle 429 responses gracefully
- **Long transcripts** — Supabase text column handles large content, but paginate in UI
