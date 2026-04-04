'use client';

import Link from 'next/link';

export function Navbar() {
  return (
    <nav
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '18px 48px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #1E1E2E',
        background: 'rgba(10,10,15,0.85)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <Link href="/" style={{ textDecoration: 'none' }}>
        <div style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22,
          color: '#FFD447', letterSpacing: '-0.5px',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{
            display: 'inline-block',
            transformOrigin: '70% 70%',
            animation: 'wave 2.4s infinite',
          }}>✋</span>
          Raisy
        </div>
      </Link>

      <Link
        href="/create"
        style={{
          background: '#FFD447', color: '#000',
          fontFamily: 'Syne, sans-serif', fontWeight: 700,
          fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase',
          padding: '8px 20px', borderRadius: 4,
          textDecoration: 'none', transition: 'opacity 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
      >
        Create Poll
      </Link>

      <style>{`
        @keyframes wave {
          0%,60%,100% { transform: rotate(0deg); }
          10%,30% { transform: rotate(18deg); }
          20% { transform: rotate(-6deg); }
        }
      `}</style>
    </nav>
  );
}
