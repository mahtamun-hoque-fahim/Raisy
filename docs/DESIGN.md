# Raisy — Design Guide

> The complete visual and interaction design system for Raisy.

---

## Concept

**"Raise your hand."**

Raisy is direct, fast, and human. The design reflects that — dark and focused with a single warm accent that commands attention. No decoration for decoration's sake. Every element earns its place.

---

## Color Palette

| Token | Hex | Usage |
|---|---|---|
| `Void` | `#0A0A0F` | Page background |
| `Surface` | `#111118` | Cards, inputs, panels |
| `Border` | `#1E1E2E` | All borders, dividers, tracks |
| `Raise` | `#FFD447` | Primary accent — CTA, highlights, active states |
| `Nay` | `#FF6B6B` | Destructive actions, deadlines, errors |
| `Signal` | `#6BFFE4` | Success, live indicator, realtime events |
| `Pulse` | `#C56CF0` | QR code, 4th option bar |
| `Text` | `#E8E8F0` | Primary text |
| `Muted` | `#6B6B8A` | Secondary text, labels, placeholders |

### Result bar color sequence
Options cycle through this order:
```
#FFD447 → #6BFFE4 → #FF6B6B → #C56CF0 → #FF9F43 → #00D4FF → #A8FF78 → #FF6B9D
```

### CSS variables
All colors are available as CSS variables in `globals.css`:
```css
--bg: #0A0A0F;
--surface: #111118;
--border: #1E1E2E;
--raise: #FFD447;
--nay: #FF6B6B;
--signal: #6BFFE4;
--pulse: #C56CF0;
--text: #E8E8F0;
--muted: #6B6B8A;
```

---

## Typography

### Font stack

| Role | Font | Weight | Usage |
|---|---|---|---|
| Display | **Syne** | 800 | Headlines, logo, CTAs, labels |
| Accent | **Fraunces** | 300 italic | Hero italic words, decorative |
| Body / UI | **DM Mono** | 400 | All body text, inputs, metadata |

Loaded from Google Fonts in `globals.css`.

### Type scale

| Element | Size | Font | Weight | Letter-spacing |
|---|---|---|---|---|
| Hero H1 | `clamp(52px, 8vw, 96px)` | Syne | 800 | `-4px` |
| Page H1 | `clamp(32px, 5vw, 60px)` | Syne | 800 | `-2.5px` |
| Poll question | `clamp(22px, 4vw, 34px)` | Syne | 800 | `-1px` |
| Section H2 | `clamp(28px, 4vw, 48px)` | Syne | 800 | `-2px` |
| Card H3 | `18px` | Syne | 700 | `-0.5px` |
| Body text | `14–16px` | DM Mono | 400 | `0` |
| Labels / eyebrows | `10–11px` | Syne | 600 | `0.12–0.18em` |
| Metadata | `11–12px` | DM Mono | 400 | `0` |

### Rules
- All section eyebrows: `uppercase`, `letter-spacing: 0.15em`, `color: #FFD447`
- Accent italic word always in Fraunces, color `#FFD447`
- Never use system fonts, Inter, Roboto, or Arial

---

## Motion System

All variants live in `src/lib/motion.ts`. Always import from there — never write inline variants.

### Variants

| Export | Effect | Use for |
|---|---|---|
| `fadeUp` | `opacity 0→1, y 28→0` | Most content reveals |
| `fadeIn` | `opacity 0→1` | Overlays, badges |
| `scaleIn` | `scale 0.92→1, opacity 0→1` | Cards, option buttons |
| `slideRight` | `x -20→0, opacity 0→1` | Sidebars, tags |
| `staggerContainer` | Staggers children by `0.07s` | Wrap any list |
| `barVariant` | `scaleX 0→pct/100` | Result bars |
| `pageVariants` | `y 16→0, opacity 0→1` | Page transitions |

### Easing
All meaningful animations use: `[0.22, 1, 0.36, 1]` (custom ease-out spring feel).
Duration: `0.4–0.5s` for reveals, `0.9s` for bar fills.

### Rules
- Use `staggerContainer` + `fadeUp` for any list of 2+ items
- Use `AnimatePresence` for anything that conditionally mounts/unmounts
- Error messages: animate in with `height: 0 → auto` + `opacity 0 → 1`
- Buttons always have `whileHover` + `whileTap` scale
- Respect `prefers-reduced-motion` — handled globally in `globals.css`

### Confetti
Fires on successful vote cast. 72 canvas particles, colors from `confettiColors` in `motion.ts`:
```ts
['#FFD447', '#6BFFE4', '#FF6B6B', '#C56CF0', '#FF9F43']
```

---

## Backgrounds & Atmosphere

Every page has two persistent overlays (set on `body` via `globals.css`):

**Noise texture** (`body::before`)
- SVG fractal noise at 4% opacity
- Adds subtle grain to the void background

**Grid lines** (`body::after`)
- `60×60px` grid of `rgba(255,212,71,0.025)` lines
- Gives depth without distraction

Do not remove these. They are part of Raisy's visual identity.

---

## Component Patterns

### Cards
```css
background: #111118;
border: 1px solid #1E1E2E;
border-radius: 8px;
padding: 28px;
transition: border-color 0.2s, transform 0.2s;
/* hover: border-color → #FFD447, translateY(-2px) */
```

### Inputs
```css
background: #111118;
border: 1px solid #1E1E2E;
border-radius: 6px;
padding: 12px 16px;
color: #E8E8F0;
font-family: DM Mono;
/* focus: border-color → #FFD447 */
```

### Primary button (Raise It / Cast Vote)
```css
background: #FFD447;
color: #000;
font-family: Syne;
font-weight: 800;
border-radius: 6px;
/* disabled: background #1E1E2E, color #6B6B8A */
```

### Toggle chips (Single/Multiple, Anon/Named)
```css
/* active */
background: #FFD447 (or accent color);
color: #000;
border: 1px solid #FFD447;

/* inactive */
background: #111118;
color: #6B6B8A;
border: 1px solid #1E1E2E;
```

### Section eyebrow
```
fontSize: 11px
letterSpacing: 0.15em
textTransform: uppercase
color: #FFD447
display: flex, alignItems: center, gap: 10px
::before — 24–30px wide #FFD447 line
```

---

## Live Indicators

| State | Color | Animation |
|---|---|---|
| Live / open | `#6BFFE4` | `pulse-dot` keyframe — scale 1→1.4, opacity 1→0.5 |
| Closed | `#6B6B8A` | None |
| Deadline warning | `#FF6B6B` | None |
| Connecting | `#6B6B8A` | None |

```css
@keyframes pulse-dot {
  0%,100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.4); }
}
```

---

## Accessibility

- **Focus visible:** `outline: 2px solid #FFD447; outline-offset: 2px; border-radius: 4px`
- **Reduced motion:** All transitions set to `0.01ms` via `@media (prefers-reduced-motion: reduce)`
- **Color contrast:** All text on `#0A0A0F` background meets WCAG AA minimum
- **Keyboard nav:** All interactive elements reachable and operable via keyboard
- **Screen readers:** All vote controls have implicit labels via button text

---

## Responsive Breakpoints

| Breakpoint | Behavior |
|---|---|
| `> 768px` | Full layout, mock poll widget visible in hero |
| `≤ 768px` | Reduced padding, hero widget hidden, single column |
| `≤ 480px` | Option buttons font-size reduced to 13px |

---

## Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Use `#FFD447` as the single dominant accent | Add a second competing accent color |
| Import motion variants from `src/lib/motion.ts` | Write inline Framer Motion variants |
| Use Syne for all headings and UI labels | Use Inter, Roboto, or system fonts |
| Keep noise + grid overlays on body | Remove the atmospheric background layers |
| Animate lists with `staggerContainer` | Animate all items simultaneously |
| Use `AnimatePresence` for conditional elements | Use CSS `display: none` for animated items |
| Show `#6BFFE4` for success/live states | Use green (`#00ff00`) for success |
| Use `border-radius: 6–8px` on cards and inputs | Use fully rounded (`border-radius: 999px`) on rectangular elements |
