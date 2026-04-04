# ✋ Raisy — Raise your hand.

> Real-time polls. No sign-up. Share a link, get instant answers.

**Raisy** cuts through noisy group chats and slow decision-making. Create a poll, share the link, watch votes roll in live — no account needed for anyone.

---

## ✨ Features (Phase 1 MVP)

- **Zero sign-up** — creators and voters need no account
- **Single & multiple choice** polls
- **Anonymous or named** voting
- **Optional deadline** — polls auto-close when time runs out
- **Live results** — auto-refreshes every 5 seconds
- **Duplicate vote prevention** — browser fingerprint + cookie lock
- **Creator controls** — close your poll early from the results page
- **Share link** — one-click copy, works anywhere

---

## 🗺️ Roadmap

| Phase | Status | What |
|---|---|---|
| 1 — Core MVP | ✅ Done | Create, vote, results, share |
| 2 — Realtime | 🔜 Next | WebSocket live push (Ably) |
| 3 — Features | 🔜 | CSV/PDF export, QR code |
| 4 — Polish | 🔜 | Framer Motion, OG images, skeletons |
| 5 — Launch | 🔜 | Analytics, SEO, ProductHunt |

---

## 🛠️ Tech Stack

- **Framework** — Next.js 14 App Router + TypeScript
- **Styling** — Tailwind CSS + design tokens
- **Database** — Neon (PostgreSQL) + Drizzle ORM
- **Validation** — Zod
- **Short IDs** — nanoid
- **Deployment** — Vercel

---

## 🚀 Getting Started

### 1. Clone and install

```bash
git clone https://github.com/mahtamun-hoque-fahim/Raisy.git
cd Raisy
npm install
```

### 2. Set environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Push the database schema

```bash
npm run db:push
```

### 4. Run dev server

```bash
npm run dev
```

Open http://localhost:3000

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── polls/route.ts           # POST create poll
│   │   ├── polls/[shortId]/route.ts # GET poll | PATCH close
│   │   └── vote/route.ts            # POST cast vote
│   ├── create/page.tsx
│   ├── poll/[shortId]/page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── Navbar.tsx
│   ├── CreatePollForm.tsx
│   ├── VotePanel.tsx
│   ├── ResultBar.tsx
│   ├── CopyButton.tsx
│   └── CreatorControls.tsx
├── db/
│   ├── index.ts
│   └── schema.ts
└── lib/
    ├── utils.ts
    └── validations.ts
```

---

## 🔒 Anti-abuse

- Browser fingerprint — 1 vote per device per poll
- IP hashed (never stored plain-text)
- Rate limiting — 10 requests/min per IP
- Creator token (UUID) stored in localStorage to manage polls

---

## 📄 License

MIT © MAHTAMUN

---

## ⚡ Phase 2 — Realtime Setup (Ably)

Raisy uses [Ably](https://ably.com) for live push updates. The free tier gives **6M messages/month** — more than enough to start.

### 1. Create a free Ably account
Go to [ably.com](https://ably.com) → create an app → copy the **API Key**.

### 2. Add to environment

```env
ABLY_API_KEY=your_root_api_key_here
NEXT_PUBLIC_ABLY_API_KEY=your_root_api_key_here
```

> ⚠️ `ABLY_API_KEY` is server-only (used to publish). Clients receive a short-lived token via `/api/ably-token` — the root key is never exposed to the browser.

### How it works

```
Voter submits vote
  → POST /api/vote (server)
  → DB updated
  → Ably REST publish → poll:{shortId} channel
  → All subscribers receive { totalVotes, results }
  → Bars animate smoothly via requestAnimationFrame
```

**Fallback:** If Ably is not configured, VotePanel falls back to polling every 8 seconds. The app works without Ably — just not instant.

### New in Phase 2

- `src/lib/ably.ts` — server Ably client + channel helpers
- `src/app/api/ably-token/route.ts` — token auth endpoint
- `src/hooks/usePollRealtime.ts` — client subscriber hook
- `src/hooks/useViewerCount.ts` — Ably Presence viewer count
- `src/components/LiveBadge.tsx` — live/closed/deadline indicator
- `src/components/ViewerCount.tsx` — "N watching" display
- Vote API now broadcasts results after every vote
- Close poll API broadcasts `poll-closed` event
- Bar animations use `requestAnimationFrame` for buttery smoothness
