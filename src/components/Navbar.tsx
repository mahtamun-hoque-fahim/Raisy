'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export function Navbar() {
  const path = usePathname();
  const onPoll = path?.startsWith('/poll/');

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '16px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #1E1E2E',
        background: 'rgba(10,10,15,0.88)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <Link href="/" style={{ textDecoration: 'none' }}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20,
            color: '#FFD447', letterSpacing: '-0.5px',
            display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
          }}
        >
          <span style={{
            display: 'inline-block', transformOrigin: '70% 70%',
            animation: 'wave 2.4s infinite',
          }}>✋</span>
          Raisy
        </motion.div>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {onPoll && (
          <motion.span
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              fontSize: 11, color: '#6B6B8A',
              fontFamily: 'DM Mono, monospace',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <span style={{
              width: 6, height: 6, borderRadius: '50%', background: '#6BFFE4',
              display: 'inline-block', animation: 'pulse-dot 1.4s infinite',
            }} />
            live
          </motion.span>
        )}

        <Link href="/create" style={{ textDecoration: 'none' }}>
          <motion.div
            whileHover={{ scale: 1.04, opacity: 0.9 }}
            whileTap={{ scale: 0.97 }}
            style={{
              background: '#FFD447', color: '#000',
              fontFamily: 'Syne, sans-serif', fontWeight: 800,
              fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase',
              padding: '8px 18px', borderRadius: 4, cursor: 'pointer',
            }}
          >
            + New Poll
          </motion.div>
        </Link>
      </div>

      <style>{`
        @keyframes wave {
          0%,60%,100% { transform: rotate(0deg); }
          10%,30% { transform: rotate(18deg); }
          20% { transform: rotate(-6deg); }
        }
        @keyframes pulse-dot {
          0%,100% { opacity:1; transform:scale(1); }
          50% { opacity:0.5; transform:scale(1.4); }
        }
      `}</style>
    </motion.nav>
  );
}
