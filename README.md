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
