import Link from 'next/link';
import { Navbar } from '@/components/Navbar';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main style={{ position: 'relative', zIndex: 1 }}>
        {/* Hero */}
        <section style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center',
          justifyContent: 'center', padding: '120px 24px 80px',
          textAlign: 'center',
        }}>
          <div style={{ maxWidth: 800 }}>
            <div style={{
              fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase',
              color: '#FFD447', marginBottom: 24,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}>
              <span style={{ width: 30, height: 1, background: '#FFD447', display: 'inline-block' }} />
              Real-time group polling
              <span style={{ width: 30, height: 1, background: '#FFD447', display: 'inline-block' }} />
            </div>

            <h1 style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 800,
              fontSize: 'clamp(56px, 10vw, 108px)', lineHeight: 0.95,
              letterSpacing: '-4px', color: '#E8E8F0', marginBottom: 28,
            }}>
              Raise your<br />
              <span style={{
                fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontWeight: 300,
                color: '#FFD447',
              }}>hand.</span>
            </h1>

            <p style={{
              fontSize: 17, color: '#6B6B8A', maxWidth: 500,
              lineHeight: 1.8, margin: '0 auto 48px',
              fontFamily: 'DM Mono, monospace',
            }}>
              No sign-up. No noise. Create a poll, share the link,
              and watch votes roll in — live.
            </p>

            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/create"
                style={{
                  background: '#FFD447', color: '#000',
                  fontFamily: 'Syne, sans-serif', fontWeight: 800,
                  fontSize: 16, letterSpacing: '-0.5px',
                  padding: '16px 40px', borderRadius: 6,
                  textDecoration: 'none', transition: 'opacity 0.2s',
                }}
              >
                ✋ Create a Poll
              </Link>
              <a
                href="#how"
                style={{
                  background: 'transparent', color: '#E8E8F0',
                  border: '1px solid #1E1E2E',
                  fontFamily: 'DM Mono, monospace', fontSize: 14,
                  padding: '16px 32px', borderRadius: 6,
                  textDecoration: 'none', transition: 'border-color 0.2s',
                }}
              >
                How it works
              </a>
            </div>

            {/* Stats */}
            <div style={{
              display: 'flex', gap: 48, justifyContent: 'center',
              marginTop: 80, flexWrap: 'wrap',
            }}>
              {[
                { value: '0', label: 'Sign-ups needed' },
                { value: '< 5s', label: 'To cast a vote' },
                { value: '100%', label: 'Anonymous option' },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{
                    fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 32,
                    color: '#FFD447', letterSpacing: '-1.5px',
                  }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: '#6B6B8A', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" style={{
          padding: '100px 24px',
          borderTop: '1px solid #1E1E2E',
          maxWidth: 900, margin: '0 auto',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#FFD447', marginBottom: 12 }}>
              How it works
            </div>
            <h2 style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 800,
              fontSize: 'clamp(28px, 4vw, 44px)', letterSpacing: '-1.5px',
              color: '#E8E8F0',
            }}>
              Three steps. That's it.
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {[
              { num: '01', icon: '✏️', title: 'Create', desc: 'Write your question, add options, set a deadline if you need one.' },
              { num: '02', icon: '🔗', title: 'Share', desc: 'Copy the link and drop it anywhere — chat, email, Slack, anywhere.' },
              { num: '03', icon: '📊', title: 'Results', desc: 'Watch live results animate in real time as your group votes.' },
            ].map((s) => (
              <div key={s.num} style={{
                background: '#111118', border: '1px solid #1E1E2E',
                borderRadius: 8, padding: '28px', transition: 'border-color 0.2s',
              }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#FFD447')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#1E1E2E')}
              >
                <div style={{ fontSize: 11, color: '#6B6B8A', fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: 16 }}>
                  {s.num}
                </div>
                <div style={{ fontSize: 28, marginBottom: 14 }}>{s.icon}</div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, color: '#E8E8F0', marginBottom: 8 }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: 13, color: '#6B6B8A', lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{
          padding: '100px 24px',
          borderTop: '1px solid #1E1E2E',
          textAlign: 'center',
        }}>
          <h2 style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 800,
            fontSize: 'clamp(32px, 5vw, 56px)', letterSpacing: '-2px',
            color: '#E8E8F0', marginBottom: 24,
          }}>
            Ready to decide?
          </h2>
          <Link
            href="/create"
            style={{
              display: 'inline-block',
              background: '#FFD447', color: '#000',
              fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16,
              letterSpacing: '-0.5px', padding: '18px 48px', borderRadius: 6,
              textDecoration: 'none',
            }}
          >
            ✋ Raise It Now
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '32px 24px', textAlign: 'center',
        borderTop: '1px solid #1E1E2E',
        fontSize: 12, color: '#6B6B8A',
        position: 'relative', zIndex: 1,
      }}>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#FFD447' }}>Raisy</span>
        {' '}— Raise your hand. · Built by{' '}
        <span style={{ color: '#E8E8F0' }}>MAHTAMUN</span>
      </footer>
    </>
  );
}
