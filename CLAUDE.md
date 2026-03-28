# AI Voice Agent Integration

A Next.js web dashboard for triggering outbound AI voice calls via ElevenLabs, receiving structured results via webhooks, and displaying call transcripts and extracted data. Built as a reusable integration pattern for agency client work.

## Tech Stack

| Library / Tool | Version | Purpose |
|---|---|---|
| Next.js | 15 | App Router, API routes, server components |
| TypeScript | 5.x | Type safety |
| Tailwind CSS v4 | 4.x | Styling |
| Supabase | latest | Postgres database + Realtime subscriptions |
| @supabase/supabase-js | 2.x | Supabase client SDK |
| @supabase/ssr | latest | Supabase server-side helpers for Next.js |
| ElevenLabs API | v1 | Conversational AI voice calls |
| shadcn/ui | latest | UI components (tables, dialogs, badges) |
| Zod | 3.x | Webhook payload validation |
| date-fns | 3.x | Date formatting |

## Build Commands

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Lint
npm run lint

# Format
npx prettier --write .
```

## Code Style

- TypeScript strict mode
- Next.js App Router (app/ directory)
- Server Components by default, 'use client' only when needed
- Server Actions for mutations
- Named exports (no default exports except pages/layouts)
- Zod schemas for all external data validation (webhook payloads, API responses)
- Tailwind for all styling

## Architecture

```
aivoice/
├── app/
│   ├── layout.tsx              # Root layout with font + providers
│   ├── page.tsx                # Dashboard — list all calls
│   ├── calls/
│   │   └── [id]/
│   │       └── page.tsx        # Call detail view
│   ├── api/
│   │   ├── calls/
│   │   │   └── route.ts        # POST: trigger new call via ElevenLabs
│   │   └── webhooks/
│   │       └── elevenlabs/
│   │           └── route.ts    # POST: receive webhook from ElevenLabs
│   └── globals.css             # Tailwind imports
├── components/
│   ├── CallTable.tsx           # Dashboard table of all calls
│   ├── CallDetail.tsx          # Full call detail view
│   ├── NewCallDialog.tsx       # Dialog to trigger a new call
│   ├── StatusBadge.tsx         # Call status badge component
│   └── ui/                    # shadcn/ui components
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser Supabase client
│   │   ├── server.ts           # Server Supabase client
│   │   └── types.ts            # Database types
│   ├── elevenlabs.ts           # ElevenLabs API client
│   ├── schemas.ts              # Zod schemas for webhooks + API
│   └── utils.ts                # Shared utilities
├── .env.local                  # Environment variables (not committed)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

**Data flow:**
1. User clicks "New Call" → enters phone number → submits
2. Next.js API route (`/api/calls`) calls ElevenLabs API to initiate outbound call
3. Call record created in Supabase with status "initiated"
4. ElevenLabs makes the call, then hits webhook (`/api/webhooks/elevenlabs`)
5. Webhook validates payload (Zod), updates Supabase record with transcript + extracted data
6. Dashboard polls or uses Supabase Realtime to show updated call
7. User clicks call row → sees full transcript + extracted fields

## Database Schema (Supabase)

```sql
create table calls (
  id uuid primary key default gen_random_uuid(),
  elevenlabs_call_id text unique,
  phone_number text not null,
  status text not null default 'initiated',  -- initiated, ringing, in-progress, completed, failed
  duration_seconds integer,
  transcript text,
  extracted_fields jsonb,
  error_message text,
  webhook_received_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for dashboard queries
create index idx_calls_created_at on calls(created_at desc);
create index idx_calls_status on calls(status);
```

## Design Tokens

- **Accent color:** emerald (emerald-400 primary, emerald-500 hover)
- **Gray family:** zinc
- **Font:** DM Sans (body + display)
- **Border radius scale:** 6/8/12/16 (modern SaaS)
- **Mood:** Minimal/professional (Linear-like)
- **Mode:** Dark mode only

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=         # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # Supabase anon/public key
SUPABASE_SERVICE_ROLE_KEY=        # Supabase service role key (server only)
ELEVENLABS_API_KEY=               # ElevenLabs API key
ELEVENLABS_AGENT_ID=              # ElevenLabs Conversational AI agent ID
WEBHOOK_SECRET=                   # Secret for webhook signature verification
NEXT_PUBLIC_APP_URL=              # Public URL for webhook callback (e.g., ngrok in dev)
```

## Testing Requirements

- Trigger a test call from the UI
- Verify webhook receives data (Chrome DevTools network tab)
- Confirm data appears in dashboard after webhook
- Test error states: invalid phone, API failure, webhook failure
- Test idempotent webhook handling (duplicate call IDs)

## Rules

- All API keys in .env.local, never hardcoded
- Webhook endpoint must validate payloads with Zod before processing
- Webhook must be idempotent (use elevenlabs_call_id as unique key)
- Never expose SUPABASE_SERVICE_ROLE_KEY or ELEVENLABS_API_KEY to the client
- Server-side API routes use service role key for Supabase writes
- Client-side uses anon key with RLS (read-only for calls table)
- Log all webhook errors to console and store error_message in the call record
- Phone numbers should be validated (E.164 format) before calling the API
