'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { VotePanel } from './VotePanel';
import { CopyButton } from './CopyButton';
import { CreatorControls } from './CreatorControls';
import { ViewerCount } from './ViewerCount';
import { ExportPanel } from './ExportPanel';
import { fadeUp, staggerContainer } from '@/lib/motion';

interface Props {
  poll: {
    id: string; shortId: string; question: string;
    type: 'single' | 'multiple'; anonymous: boolean;
    deadline: string | null; closed: boolean;
    totalVotes: number;
    results: { id: string; label: string; position: number; count: number; percentage: number }[];
  };
  pollUrl: string;
  justCreated: boolean;
  shortId: string;
}

export function PollPageAnimated({ poll, pollUrl, justCreated, shortId }: Props) {
  return (
    <motion.main
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      style={{
        position: 'relative', zIndex: 1,
        padding: '120px 24px 100px', minHeight: '100vh',
      }}
    >
      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        {/* Just-created banner */}
        <AnimatePresence>
          {justCreated && (
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                background: 'rgba(107,255,228,0.07)',
                border: '1px solid rgba(107,255,228,0.22)',
                borderRadius: 8, padding: '16px 20px', marginBottom: 32,
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
              }}
            >
              <div>
                <div style={{
                  fontFamily: 'Syne, sans-serif', fontWeight: 700,
                  color: '#6BFFE4', fontSize: 14, marginBottom: 4,
                }}>
                  ✓ Poll created — share the link to collect votes
                </div>
                <div style={{
                  fontSize: 12, color: '#6B6B8A',
                  fontFamily: 'DM Mono, monospace', wordBreak: 'break-all',
                }}>
                  {pollUrl}
                </div>
              </div>
              <CopyButton text={pollUrl} label="Copy link" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vote / Results */}
        <motion.div variants={fadeUp} custom={0}>
          <VotePanel poll={poll} />
        </motion.div>

        {/* Divider */}
        <motion.div
          variants={fadeUp}
          custom={1}
          style={{ height: 1, background: '#1E1E2E', margin: '40px 0' }}
        />

        {/* Share row */}
        <motion.div
          variants={fadeUp}
          custom={2}
          style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
            marginBottom: 14,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 12, color: '#6B6B8A', fontFamily: 'DM Mono, monospace' }}>
              Share poll
            </span>
            <ViewerCount shortId={shortId} closed={poll.closed} />
          </div>
          <CopyButton text={pollUrl} label="Copy link" />
        </motion.div>

        {/* Export */}
        <motion.div variants={fadeUp} custom={3}>
          <ExportPanel shortId={shortId} question={poll.question} totalVotes={poll.totalVotes} />
        </motion.div>

        {/* Creator controls */}
        <motion.div variants={fadeUp} custom={4}>
          <CreatorControls shortId={shortId} pollId={poll.id} closed={poll.closed} />
        </motion.div>
      </div>
    </motion.main>
  );
}
