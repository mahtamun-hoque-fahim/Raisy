# ✋ Raisy — Raise your hand.

> Real-time polls. No sign-up. Share a link, get instant answers.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mahtamun-hoque-fahim/Raisy)

**Raisy** cuts through noisy group chats and slow decision-making. Create a poll, share the link, watch votes roll in live — no account needed for anyone.

---

## ✨ Features

| Feature | Status |
|---|---|
| Zero sign-up — creators and voters | ✅ |
| Single & multiple choice polls | ✅ |
| Anonymous or named voting | ✅ |
| Optional deadline with auto-close | ✅ |
| Live results via Ably WebSocket push | ✅ |
| Smooth Framer Motion animations | ✅ |
| Confetti burst on vote | ✅ |
| Duplicate vote prevention (fingerprint) | ✅ |
| Drag-to-reorder options | ✅ |
| CSV & JSON export | ✅ |
| QR code share (SVG, downloadable) | ✅ |
| Creator close-poll control | ✅ |
| Live viewer count (Ably Presence) | ✅ |
| OG images for link previews | ✅ |
| Plausible analytics (privacy-first) | ✅ |
| Health check endpoint | ✅ |
| Security headers (Vercel) | ✅ |

---

## 🛠️ Tech Stack

- **Framework** — Next.js 14 App Router + TypeScript
- **Styling** — Tailwind CSS + design tokens (Syne / DM Mono / Fraunces)
- **Animations** — Framer Motion 12
- **Database** — Neon (PostgreSQL) + Drizzle ORM
- **Realtime** — Ably WebSocket (token auth, Presence)
- **Validation** — Zod
- **Short IDs** — nanoid
- **OG Images** — @vercel/og (Edge runtime)
- **Analytics** — Plausible (optional, privacy-first)
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

| Variable | Required | Where to get it |
|---|---|---|
| `DATABASE_URL` | ✅ | [neon.tech](https://neon.tech) → Connection string |
| `NEXT_PUBLIC_APP_URL` | ✅ | `http://localhost:3000` in dev, your domain in prod |
| `ABLY_API_KEY` | ✅ for realtime | [ably.com](https://ably.com) → Root API Key |
| `IP_SALT` | ✅ | Any random secret string |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Optional | Your domain on Plausible |

### 3. Push the database schema

```bash
npm run db:push
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## ☁️ Deploy to Vercel

### One-click

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mahtamun-hoque-fahim/Raisy)

### Manual

```bash
npm i -g vercel
vercel --prod
```

Set the required environment variables in **Vercel Dashboard → Settings → Environment Variables**.

After deploying, update `NEXT_PUBLIC_APP_URL` to your production URL and redeploy.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── ably-token/route.ts      # Token auth (keeps root key server-side)
│   │   ├── health/route.ts          # DB health check
│   │   ├── og/route.tsx             # OG image (Edge, @vercel/og)
│   │   ├── polls/
│   │   │   ├── route.ts             # POST create poll
│   │   │   └── [shortId]/
│   │   │       ├── route.ts         # GET poll | PATCH close
│   │   │       ├── export/route.ts  # GET ?format=csv|json
│   │   │       └── qr/route.ts      # GET QR code SVG
│   │   └── vote/route.ts            # POST cast vote
│   ├── create/page.tsx
│   ├── poll/[shortId]/page.tsx
│   ├── error.tsx                    # Global error boundary
│   ├── not-found.tsx
│   ├── robots.ts
│   ├── sitemap.ts
│   ├── layout.tsx                   # SEO + Analytics
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── Analytics.tsx                # Plausible script
│   ├── Confetti.tsx                 # Canvas particle burst
│   ├── CopyButton.tsx
│   ├── CreatePollForm.tsx           # Full form w/ drag reorder
│   ├── CreatorControls.tsx          # Close poll (creator only)
│   ├── DeadlinePicker.tsx           # Preset chips + custom date
│   ├── ExportPanel.tsx              # CSV, JSON, QR download
│   ├── HeroSection.tsx              # Animated landing page
│   ├── LiveBadge.tsx                # Live/Closed/Countdown
│   ├── Navbar.tsx
│   ├── PageWrapper.tsx
│   ├── PollPageAnimated.tsx
│   ├── ResultBar.tsx
│   ├── Skeletons.tsx                # Shimmer loading states
│   ├── ViewerCount.tsx              # Ably Presence count
│   └── VotePanel.tsx                # Voting + live results
├── db/
│   ├── index.ts
│   └── schema.ts
├── hooks/
│   ├── usePollRealtime.ts           # Ably subscriber
│   └── useViewerCount.ts           # Ably Presence
└── lib/
    ├── ably.ts
    ├── motion.ts                    # Framer Motion variants
    ├── ratelimit.ts                 # Sliding window rate limiter
    ├── utils.ts
    └── validations.ts
```

---

## 🔌 API Reference

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/polls` | Create a poll |
| `GET` | `/api/polls/:shortId` | Fetch poll + results |
| `PATCH` | `/api/polls/:shortId` | Close poll (creator token required) |
| `POST` | `/api/vote` | Cast vote |
| `GET` | `/api/polls/:shortId/export?format=csv` | Download CSV results |
| `GET` | `/api/polls/:shortId/export?format=json` | Download JSON results |
| `GET` | `/api/polls/:shortId/qr` | QR code SVG |
| `GET` | `/api/og?q=...&v=...&o=...` | OG image |
| `GET` | `/api/ably-token` | Short-lived Ably token |
| `GET` | `/api/health` | DB health check |

---

## 🔒 Security

- **No raw IPs stored** — IPs are SHA-256 hashed with a salt
- **Rate limiting** — 10 votes/minute per IP (upgradeable to Upstash Redis)
- **Token auth for Ably** — clients receive restricted tokens, never the root key
- **Creator token** — UUID stored in localStorage, required to close a poll
- **Security headers** — `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` via `vercel.json`
- **HTTPS only** — enforced by Vercel

---

## 🗺️ Build Phases

| Phase | What shipped |
|---|---|
| 1 ✅ | Create poll, vote, results, short links, anti-abuse |
| 2 ✅ | Ably WebSocket push, viewer presence |
| 3 ✅ | CSV/JSON export, QR code, deadline picker, drag reorder |
| 4 ✅ | Framer Motion, confetti, skeletons, animated hero |
| 5 ✅ | OG images, SEO, analytics, error boundary, health check, rate limit module, vercel.json |

---

## 📄 License

MIT © [MAHTAMUN](https://mahtamunhoquefahim.pages.dev)
