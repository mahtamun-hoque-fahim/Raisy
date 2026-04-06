# Raisy — Project Context

> Full context for AI assistants and new contributors. Read this before making any changes.

---

## What Raisy Is

**Raisy** (`✋ Raise your hand.`) is a real-time polling web app. The core idea: no sign-up for anyone, create a poll in seconds, share a link, watch votes roll in live.

**Problem solved:** Slow decision-making in group chats and noisy chat threads.
**Solution:** A shareable poll link — anyone clicks it, votes, sees live results. No accounts, no friction.

**Live URL:** https://raisy-polling.vercel.app
**Repo:** https://github.com/mahtamun-hoque-fahim/Raisy
**Developer:** Mahtamun Hoque Fahim (MAHTAMUN) — independent designer & developer, Bangladesh

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 App Router + TypeScript |
| Styling | Tailwind CSS + inline design tokens |
| Fonts | Syne (display) · DM Mono (body/UI) · Fraunces (accent italic) |
| Animations | Framer Motion 12 |
| Database | Neon (PostgreSQL serverless) + Drizzle ORM |
| Realtime | Ably WebSocket — Pub/Sub + Presence (token auth) |
| Validation | Zod |
| Short IDs | nanoid |
| OG Images | @vercel/og (Edge runtime) |
| Analytics | Plausible (optional, privacy-first, env-gated) |
| Deployment | Vercel |

---

## Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | ✅ | Neon PostgreSQL connection string |
| `NEXT_PUBLIC_APP_URL` | ✅ | Full app URL (no trailing slash) — used for share links, QR, OG |
| `ABLY_API_KEY` | ✅ | Ably root API key (server-side only, never `NEXT_PUBLIC_`) |
| `IP_SALT` | ✅ | Random secret for SHA-256 IP hashing |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Optional | Plausible analytics domain — leave blank to disable |

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── ably-token/route.ts      # Issues restricted Ably tokens to clients
│   │   ├── health/route.ts          # DB ping + latency check → /api/health
│   │   ├── og/route.tsx             # Dynamic OG images (Edge, @vercel/og)
│   │   ├── polls/
│   │   │   ├── route.ts             # POST — create poll
│   │   │   └── [shortId]/
│   │   │       ├── route.ts         # GET poll+results | PATCH close poll
│   │   │       ├── export/route.ts  # GET ?format=csv|json
│   │   │       └── qr/route.ts      # GET QR code SVG
│   │   └── vote/route.ts            # POST — cast vote
│   ├── create/page.tsx              # Poll creation page
│   ├── poll/[shortId]/page.tsx      # Vote + results page
│   ├── error.tsx                    # Global error boundary
│   ├── not-found.tsx                # 404 page
│   ├── robots.ts                    # SEO robots
│   ├── sitemap.ts                   # SEO sitemap
│   ├── layout.tsx                   # Root layout — SEO metadata + Analytics
│   ├── page.tsx                     # Landing page (renders HeroSection)
│   └── globals.css                  # Design tokens, noise/grid overlays, resets
│
├── components/
│   ├── Analytics.tsx                # Plausible script (env-gated)
│   ├── Confetti.tsx                 # Canvas particle burst on successful vote
│   ├── CopyButton.tsx               # One-click clipboard copy with feedback
│   ├── CreatePollForm.tsx           # Full creation form — drag reorder, deadline, type
│   ├── CreatorControls.tsx          # Close poll button (checks localStorage for token)
│   ├── DeadlinePicker.tsx           # Preset chips (30m→1w) + custom date/time picker
│   ├── ExportPanel.tsx              # CSV download, JSON download, QR code reveal
│   ├── HeroSection.tsx              # Animated landing — parallax, mock poll widget
│   ├── LiveBadge.tsx                # Live dot / Closed badge / deadline countdown
│   ├── Navbar.tsx                   # Top nav — animated, live indicator on poll pages
│   ├── PageWrapper.tsx              # Framer Motion page transition wrapper
│   ├── PollPageAnimated.tsx         # Client stagger wrapper for poll page sections
│   ├── ResultBar.tsx                # (legacy) static result bar — VotePanel uses inline
│   ├── Skeletons.tsx                # Shimmer loading states: poll page, create form
│   ├── ViewerCount.tsx              # Ably Presence "N watching" indicator
│   └── VotePanel.tsx                # Core voting UI + live results + confetti trigger
│
├── db/
│   ├── index.ts                     # Neon serverless connection + Drizzle instance
│   └── schema.ts                    # polls, options, votes tables + TypeScript types
│
├── hooks/
│   ├── usePollRealtime.ts           # Subscribes to Ably poll channel (vote-cast, poll-closed)
│   └── useViewerCount.ts           # Ably Presence — counts live viewers on a poll
│
└── lib/
    ├── ably.ts                      # Server REST client, pollChannel(), EVENTS constants
    ├── motion.ts                    # All Framer Motion variants + confettiColors
    ├── ratelimit.ts                 # Sliding window rate limiter (Upstash upgrade path included)
    ├── utils.ts                     # cn(), hashIp(), calcResults(), formatDeadline()
    └── validations.ts               # Zod schemas: CreatePollSchema, CastVoteSchema
```

---

## Database Schema

```sql
-- polls
polls (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_id        TEXT NOT NULL UNIQUE,         -- nanoid(8), used in URLs
  question        TEXT NOT NULL,
  type            TEXT NOT NULL DEFAULT 'single', -- 'single' | 'multiple'
  anonymous       BOOLEAN NOT NULL DEFAULT true,
  deadline        TIMESTAMPTZ,                  -- null = no deadline
  creator_token   TEXT NOT NULL,                -- UUID stored in client localStorage
  closed          BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
)

-- options
options (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id  UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  label    TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0           -- display order
)

-- votes
votes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id     UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_id   UUID NOT NULL REFERENCES options(id) ON DELETE CASCADE,
  voter_name  TEXT,                             -- null if anonymous poll
  fingerprint TEXT NOT NULL,                   -- browser fingerprint for dedup
  ip_hash     TEXT NOT NULL,                   -- SHA-256(ip + IP_SALT)
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
)
```

---

## API Reference

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/polls` | None | Create poll — returns `shortId`, `creatorToken` |
| `GET` | `/api/polls/:shortId` | None | Fetch poll data + live results |
| `PATCH` | `/api/polls/:shortId` | `creatorToken` in body | Close poll early |
| `POST` | `/api/vote` | None | Cast vote — fingerprint dedup enforced |
| `GET` | `/api/polls/:shortId/export?format=csv` | None | Download CSV results |
| `GET` | `/api/polls/:shortId/export?format=json` | None | Download JSON results |
| `GET` | `/api/polls/:shortId/qr` | None | QR code SVG (cached 24h) |
| `GET` | `/api/og?q=...&v=...&o=...` | None | Dynamic OG image (cached 1h) |
| `GET` | `/api/ably-token` | None | Short-lived restricted Ably token |
| `GET` | `/api/health` | None | DB ping + latency + git SHA |

---

## Realtime Architecture

```
Voter submits vote
  → POST /api/vote (Next.js server)
  → Row inserted in Neon DB
  → Ably REST publish to channel poll:{shortId}
        ↓  (WebSocket push, ~50ms)
  All browser tabs subscribed to that channel
  → onUpdate({ totalVotes, results }) fires
  → VotePanel animates bars to new widths via Framer Motion
```

**Token auth flow:**
- Client calls `GET /api/ably-token` on mount
- Server creates a restricted token (subscribe-only, 1h TTL) using root `ABLY_API_KEY`
- Client connects to Ably using this token — root key never reaches the browser

**Fallback:** VotePanel polls `GET /api/polls/:shortId` every 8 seconds if Ably is unavailable. Zero crashes.

**Events:**
- `vote-cast` — payload: `{ totalVotes: number, results: OptionResult[] }`
- `poll-closed` — payload: `{ closed: true }`

---

## Anti-abuse & Security

| Mechanism | Implementation |
|---|---|
| 1 vote per device per poll | Browser fingerprint stored in `votes.fingerprint`, checked on each vote |
| IP rate limiting | 10 requests/min per IP via sliding window in `src/lib/ratelimit.ts` |
| IP privacy | Raw IPs never stored — SHA-256 hashed with `IP_SALT` |
| Creator authentication | UUID `creatorToken` returned on poll creation, stored in `localStorage` |
| Ably key protection | Root key server-side only — clients get restricted tokens via `/api/ably-token` |
| Security headers | `X-Frame-Options: DENY`, `X-Content-Type-Options`, `Referrer-Policy` in `vercel.json` |

---

## Key Design Decisions

**No accounts for voters** — the entire UX is built around zero friction. A voter sees the poll and votes in under 5 seconds.

**Creator token in localStorage** — creators get a UUID token when they create a poll. This is stored in their browser's localStorage. If they clear localStorage, they lose the ability to close that poll — that's an intentional tradeoff for zero-auth simplicity.

**Ably Pub/Sub over Server-Sent Events** — SSE requires persistent connections which are expensive on serverless. Ably's WebSocket infrastructure handles scale without per-connection cost.

**`calcResults()` runs on every GET** — results are never cached in the DB, always computed fresh from vote rows. Keeps the schema simple and results always accurate.

**nanoid(8) for short IDs** — 8 characters from a 64-character alphabet gives ~281 trillion combinations. Collision probability is negligible at any reasonable scale.

---

## Build Phases

| Phase | Commit | Key deliverables |
|---|---|---|
| 1 — Core MVP | `bada12a` | Create poll, vote, results, short links, anti-abuse |
| 2 — Realtime | `a931c60` | Ably WebSocket push, viewer presence |
| 3 — Features | `67278d8` | CSV/JSON export, QR code, deadline picker, drag reorder |
| 4 — Polish | `58fa960` | Framer Motion, confetti, skeletons, animated hero |
| 5 — Launch | `0639964` | OG images, SEO, analytics, error boundary, health check |
| Fix | `78ade3b` | Load `.env.local` in `drizzle.config.ts` |
| Fix | `8b109a5` | Add `dotenv` dependency |

---

## Docs in This Repo

| File | Contents |
|---|---|
| `README.md` | Setup guide, deploy instructions, API reference |
| `docs/DESIGN.md` | Full design system — colors, typography, motion, components |
| `docs/CONTEXT.md` | This file — architecture, decisions, full project context |
| `.env.example` | All environment variables documented with sources |
