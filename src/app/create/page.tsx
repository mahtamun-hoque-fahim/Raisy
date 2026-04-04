'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { CreatePollForm } from '@/components/CreatePollForm';
import { fadeUp, staggerContainer } from '@/lib/motion';

export default function CreatePage() {
  return (
    <>
      <Navbar />
      <motion.main
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{
          position: 'relative', zIndex: 1,
          padding: '120px 48px 80px', minHeight: '100vh',
        }}
      >
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          {/* Header */}
          <motion.div variants={fadeUp} custom={0} style={{ marginBottom: 52 }}>
            <div style={{
              fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase',
              color: '#FFD447', marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <motion.span
                style={{ width: 24, height: 1, background: '#FFD447', display: 'inline-block' }}
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              />
              New poll
            </div>
            <h1 style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 800,
              fontSize: 'clamp(36px, 5vw, 60px)',
              letterSpacing: '-2.5px', color: '#E8E8F0', lineHeight: 1,
              marginBottom: 14,
            }}>
              What are we{' '}
              <span style={{
                fontFamily: 'Fraunces, serif', fontStyle: 'italic',
                fontWeight: 300, color: '#FFD447',
              }}>
                deciding?
              </span>
            </h1>
            <p style={{
              fontSize: 13, color: '#6B6B8A',
              fontFamily: 'DM Mono, monospace', lineHeight: 1.7,
            }}>
              No account needed · Share a link · Results update live for everyone
            </p>
          </motion.div>

          <motion.div variants={fadeUp} custom={1}>
            <CreatePollForm />
          </motion.div>
        </div>
      </motion.main>
    </>
  );
}
