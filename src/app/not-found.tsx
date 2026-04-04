import Link from 'next/link';

export default function NotFound() {
  return (
    <main style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', textAlign: 'center', padding: 24,
      position: 'relative', zIndex: 1,
    }}>
      <div>
        <div style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 800,
          fontSize: 96, color: '#1E1E2E', letterSpacing: '-4px', lineHeight: 1,
        }}>404</div>
        <h1 style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28,
          color: '#E8E8F0', letterSpacing: '-1px', marginBottom: 12,
        }}>Poll not found.</h1>
        <p style={{ color: '#6B6B8A', fontSize: 14, marginBottom: 32 }}>
          This poll may have expired or the link is incorrect.
        </p>
        <Link href="/create" style={{
          background: '#FFD447', color: '#000',
          fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 14,
          padding: '12px 28px', borderRadius: 6, textDecoration: 'none',
        }}>
          Create a new poll
        </Link>
      </div>
    </main>
  );
}
