import { Navbar } from '@/components/Navbar';
import { CreatePollForm } from '@/components/CreatePollForm';

export const metadata = {
  title: 'Create a Poll — Raisy',
};

export default function CreatePage() {
  return (
    <>
      <Navbar />
      <main style={{ position: 'relative', zIndex: 1, padding: '120px 24px 80px', minHeight: '100vh' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: 48 }}>
            <div style={{
              fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase',
              color: '#FFD447', marginBottom: 14,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ width: 24, height: 1, background: '#FFD447', display: 'inline-block' }} />
              New poll
            </div>
            <h1 style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 800,
              fontSize: 'clamp(32px, 5vw, 52px)',
              letterSpacing: '-2px', color: '#E8E8F0', lineHeight: 1,
              marginBottom: 12,
            }}>
              What are we<br />
              <span style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontWeight: 300, color: '#FFD447' }}>
                deciding?
              </span>
            </h1>
            <p style={{ fontSize: 13, color: '#6B6B8A', fontFamily: 'DM Mono, monospace' }}>
              No account needed. Just fill in the form and share the link.
            </p>
          </div>

          <CreatePollForm />
        </div>
      </main>
    </>
  );
}
