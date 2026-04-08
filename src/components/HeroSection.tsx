'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { fadeUp, staggerContainer, scaleIn } from '@/lib/motion';

const POLL_COLORS = ['#FFD447', '#6BFFE4', '#FF6B6B'];

function MockPoll() {
  const opts = [
    { label: 'Thai Place 🍜', pct: 68, color: POLL_COLORS[0] },
    { label: 'Pizza 🍕', pct: 22, color: POLL_COLORS[1] },
    { label: 'Sandwiches 🥪', pct: 10, color: POLL_COLORS[2] },
  ];
  const [widths, setWidths] = useState([0, 0, 0]);
  const [votes, setVotes] = useState(32);

  useEffect(() => {
    const t = setTimeout(() => setWidths([68, 22, 10]), 400);
    // Simulate a new vote rolling in
    const v = setInterval(() => {
      setVotes((n) => n + 1);
      setWidths((w) => {
        const total = w[0] + w[1] + w[2] + 1;
        return [
          Math.round((w[0] / 100 * (total - 1) + 1) / total * 100),
          Math.round((w[1] / 100 * (total - 1)) / total * 100),
          Math.round((w[2] / 100 * (total - 1)) / total * 100),
        ];
      });
    }, 2800);
    return () => { clearTimeout(t); clearInterval(v); };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 32, rotate: 2 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
      style={{
        background: '#111118', border: '1px solid #1E1E2E',
        borderRadius: 12, padding: 24, width: 280, flexShrink: 0,
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
        fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, color: '#E8E8F0',
      }}>
        <span style={{
          width: 7, height: 7, borderRadius: '50%', background: '#6BFFE4',
          display: 'inline-block', animation: 'pulse-dot 1.4s infinite',
          flexShrink: 0,
        }} />
        Where should we eat?
      </div>

      {opts.map((o, i) => (
        <div key={i} style={{ marginBottom: 12 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: 12, marginBottom: 5, fontFamily: 'DM Mono, monospace',
          }}>
            <span style={{ color: '#E8E8F0' }}>{o.label}</span>
            <span style={{ color: o.color, fontWeight: 600 }}>{o.pct}%</span>
          </div>
          <div style={{ height: 5, background: '#1E1E2E', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              height: '100%', background: o.color,
              width: `${widths[i]}%`, borderRadius: 3,
              transition: 'width 0.9s cubic-bezier(0.22,1,0.36,1)',
              boxShadow: `0 0 8px ${o.color}60`,
            }} />
          </div>
        </div>
      ))}

      <div style={{
        marginTop: 14, fontSize: 11, color: '#6B6B8A',
        fontFamily: 'DM Mono, monospace',
        display: 'flex', justifyContent: 'space-between',
      }}>
        <span>
          <motion.span
            key={votes}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {votes}
          </motion.span>
          {' '}votes
        </span>
        <span style={{ color: '#FF6B6B' }}>⏱ 1h 42m left</span>
      </div>
    </motion.div>
  );
}

const STATS = [
  { value: '0', label: 'Sign-ups needed' },
  { value: '< 5s', label: 'To cast a vote' },
  { value: '∞', label: 'Voters per poll' },
];

const HOW = [
  { num: '01', icon: '✏️', title: 'Create', desc: 'Write your question, add options, pick a deadline if you need one.' },
  { num: '02', icon: '🔗', title: 'Share', desc: 'Copy the link and drop it anywhere — chat, email, presentation.' },
  { num: '03', icon: '📊', title: 'Results', desc: 'Watch live results push to every screen the instant votes come in.' },
];

export function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const heroOpacity = useTransform(scrollYProgress, [0.3, 0.8], [1, 0]);

  return (
    <>
      <Navbar />
      <main style={{ position: 'relative', zIndex: 1 }}>

        {/* ── HERO ───────────────────────────────────────────────── */}
        <section
          ref={ref}
          style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center',
            padding: '120px 48px 80px',
          }}
        >
          <motion.div style={{ y: heroY, opacity: heroOpacity, width: '100%' }}>
            <div style={{
              maxWidth: 1100, margin: '0 auto',
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', gap: 60, flexWrap: 'wrap',
            }}>
              {/* Left copy */}
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                style={{ flex: 1, minWidth: 300 }}
              >
                <motion.div
                  variants={fadeUp}
                  custom={0}
                  style={{
                    fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
                    color: '#FFD447', marginBottom: 20,
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}
                >
                  <span style={{ width: 28, height: 1, background: '#FFD447', display: 'inline-block' }} />
                  Real-time group polling · No sign-up
                </motion.div>

                <motion.h1
                  variants={fadeUp}
                  custom={1}
                  style={{
                    fontFamily: 'Syne, sans-serif', fontWeight: 800,
                    fontSize: 'clamp(52px, 8vw, 96px)', lineHeight: 0.95,
                    letterSpacing: '-4px', color: '#E8E8F0', marginBottom: 28,
                  }}
                >
                  Raise your<br />
                  <motion.span
                    style={{
                      fontFamily: 'Fraunces, serif', fontStyle: 'italic',
                      fontWeight: 300, color: '#FFD447', display: 'inline-block',
                    }}
                    animate={{ opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    hand.
                  </motion.span>
                </motion.h1>

                <motion.p
                  variants={fadeUp}
                  custom={2}
                  style={{
                    fontSize: 16, color: '#6B6B8A', maxWidth: 440,
                    lineHeight: 1.8, marginBottom: 40,
                    fontFamily: 'DM Mono, monospace',
                  }}
                >
                  No noisy threads. No slow decisions. Create a poll,
                  share the link, watch consensus form in real time.
                </motion.p>

                <motion.div
                  variants={fadeUp}
                  custom={3}
                  style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}
                >
                  <Link href="/create" style={{ textDecoration: 'none' }}>
                    <motion.div
                      whileHover={{ scale: 1.04, opacity: 0.92 }}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        background: '#FFD447', color: '#000',
                        fontFamily: 'Syne, sans-serif', fontWeight: 800,
                        fontSize: 15, letterSpacing: '-0.3px',
                        padding: '14px 36px', borderRadius: 6, cursor: 'pointer',
                      }}
                    >
                      ✋ Create a Poll
                    </motion.div>
                  </Link>
                  <a href="#how" style={{ textDecoration: 'none' }}>
                    <motion.div
                      whileHover={{ borderColor: '#FFD447', color: '#FFD447' }}
                      style={{
                        background: 'transparent', color: '#6B6B8A',
                        border: '1px solid #1E1E2E',
                        fontFamily: 'DM Mono, monospace', fontSize: 13,
                        padding: '14px 28px', borderRadius: 6, cursor: 'pointer',
                        transition: 'color 0.2s, border-color 0.2s',
                      }}
                    >
                      How it works ↓
                    </motion.div>
                  </a>
                </motion.div>

                {/* Stats */}
                <motion.div
                  variants={fadeUp}
                  custom={4}
                  style={{ display: 'flex', gap: 40, marginTop: 64, flexWrap: 'wrap' }}
                >
                  {STATS.map((s, i) => (
                    <motion.div
                      key={s.label}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 + i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div style={{
                        fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 30,
                        color: '#FFD447', letterSpacing: '-1.5px', lineHeight: 1,
                      }}>{s.value}</div>
                      <div style={{
                        fontSize: 10, color: '#6B6B8A', letterSpacing: '0.1em',
                        textTransform: 'uppercase', marginTop: 4,
                      }}>{s.label}</div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Right — mock poll widget */}
              <div style={{ flexShrink: 0 }}>
                <MockPoll />
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── HOW IT WORKS ───────────────────────────────────────── */}
        <section id="how" style={{
          padding: '100px 48px',
          borderTop: '1px solid #1E1E2E',
        }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={staggerContainer}
            >
              <motion.div
                variants={fadeUp}
                style={{
                  textAlign: 'center', fontSize: 11, letterSpacing: '0.15em',
                  textTransform: 'uppercase', color: '#FFD447', marginBottom: 16,
                }}
              >
                How it works
              </motion.div>
              <motion.h2
                variants={fadeUp}
                style={{
                  fontFamily: 'Syne, sans-serif', fontWeight: 800,
                  fontSize: 'clamp(28px, 4vw, 48px)', letterSpacing: '-2px',
                  color: '#E8E8F0', textAlign: 'center', marginBottom: 60,
                }}
              >
                Three steps. That&apos;s it.
              </motion.h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
                {HOW.map((s, i) => (
                  <motion.div
                    key={s.num}
                    variants={scaleIn}
                    custom={i}
                    whileHover={{ y: -4, borderColor: '#FFD447' }}
                    style={{
                      background: '#111118', border: '1px solid #1E1E2E',
                      borderRadius: 10, padding: 28,
                      transition: 'border-color 0.2s',
                      cursor: 'default',
                    }}
                  >
                    <div style={{
                      fontFamily: 'Syne, sans-serif', fontWeight: 700,
                      fontSize: 11, color: '#6B6B8A', marginBottom: 16,
                      letterSpacing: '0.1em',
                    }}>
                      {s.num}
                    </div>
                    <div style={{ fontSize: 28, marginBottom: 14 }}>{s.icon}</div>
                    <h3 style={{
                      fontFamily: 'Syne, sans-serif', fontWeight: 700,
                      fontSize: 18, color: '#E8E8F0', marginBottom: 8,
                    }}>
                      {s.title}
                    </h3>
                    <p style={{
                      fontSize: 13, color: '#6B6B8A', lineHeight: 1.7, margin: 0,
                    }}>
                      {s.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── CTA ────────────────────────────────────────────────── */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={staggerContainer}
          style={{
            padding: '100px 48px',
            borderTop: '1px solid #1E1E2E',
            textAlign: 'center',
          }}
        >
          <motion.h2
            variants={fadeUp}
            style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 800,
              fontSize: 'clamp(32px, 5vw, 64px)', letterSpacing: '-2.5px',
              color: '#E8E8F0', marginBottom: 12,
            }}
          >
            Ready to
            <span style={{
              fontFamily: 'Fraunces, serif', fontStyle: 'italic',
              fontWeight: 300, color: '#FFD447',
            }}> decide?</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            style={{
              fontSize: 15, color: '#6B6B8A', marginBottom: 36,
              fontFamily: 'DM Mono, monospace',
            }}
          >
            No account. No friction. Just answers.
          </motion.p>
          <motion.div variants={fadeUp}>
            <Link href="/create" style={{ textDecoration: 'none' }}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'inline-block',
                  background: '#FFD447', color: '#000',
                  fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 17,
                  letterSpacing: '-0.5px', padding: '18px 52px', borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                ✋ Raise It Now
              </motion.div>
            </Link>
          </motion.div>
        </motion.section>
      </main>

      <footer style={{
        padding: '32px 48px', borderTop: '1px solid #1E1E2E',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
        position: 'relative', zIndex: 1,
        fontSize: 12, color: '#6B6B8A', fontFamily: 'DM Mono, monospace',
      }}>
        <span>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: '#FFD447' }}>Raisy</span>
          {' '}— Raise your hand.
        </span>
        <span>Built by <span style={{ color: '#E8E8F0' }}>MAHTAMUN</span></span>
      </footer>

      <style>{`
        @keyframes pulse-dot {
          0%,100% { opacity:1; transform:scale(1); }
          50% { opacity:0.5; transform:scale(1.4); }
        }
      `}</style>
    </>
  );
}
