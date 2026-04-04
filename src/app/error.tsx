'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console in dev; swap for Sentry/Axiom in prod
    console.error('[Raisy Error]', error);
  }, [error]);

  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', textAlign: 'center', padding: 24,
        position: 'relative', zIndex: 1,
      }}
    >
      <div>
        <div style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 800,
          fontSize: 80, color: '#1E1E2E', letterSpacing: '-3px', lineHeight: 1,
          marginBottom: 4,
        }}>
          oops.
        </div>
        <h1 style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 24,
          color: '#E8E8F0', letterSpacing: '-0.5px', marginBottom: 10,
        }}>
          Something went wrong
        </h1>
        <p style={{
          color: '#6B6B8A', fontSize: 13, marginBottom: 32,
          fontFamily: 'DM Mono, monospace', lineHeight: 1.7,
        }}>
          {error.message || 'An unexpected error occurred.'}<br />
          {error.digest && (
            <span style={{ fontSize: 11, opacity: 0.6 }}>
              Error ID: {error.digest}
            </span>
          )}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={reset}
            style={{
              background: '#FFD447', color: '#000', border: 'none',
              fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 14,
              padding: '12px 28px', borderRadius: 6, cursor: 'pointer',
            }}
          >
            Try again
          </motion.button>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <motion.div
              whileHover={{ borderColor: '#FFD447', color: '#FFD447' }}
              style={{
                border: '1px solid #1E1E2E', color: '#6B6B8A',
                fontFamily: 'DM Mono, monospace', fontSize: 13,
                padding: '12px 24px', borderRadius: 6, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Go home
            </motion.div>
          </Link>
        </div>
      </div>
    </motion.main>
  );
}
