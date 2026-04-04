'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePollRealtime } from '@/hooks/usePollRealtime';
import { LiveBadge } from '@/components/LiveBadge';
import { Confetti } from '@/components/Confetti';
import { fadeUp, staggerContainer, scaleIn } from '@/lib/motion';

interface OptionResult {
  id: string; label: string; position: number; count: number; percentage: number;
}
interface PollData {
  id: string; shortId: string; question: string;
  type: 'single' | 'multiple'; anonymous: boolean;
  deadline: string | null; closed: boolean;
  totalVotes: number; results: OptionResult[];
}

const COLORS = ['#FFD447','#6BFFE4','#FF6B6B','#C56CF0','#FF9F43','#00D4FF','#A8FF78','#FF6B9D','#FFD447','#6BFFE4'];

function generateFingerprint(): string {
  const nav = navigator;
  const raw = [nav.userAgent, nav.language, screen.width, screen.height,
    screen.colorDepth, new Date().getTimezoneOffset(), nav.hardwareConcurrency].join('|');
  let hash = 0;
  for (let i = 0; i < raw.length; i++) { hash = (hash << 5) - hash + raw.charCodeAt(i); hash |= 0; }
  return Math.abs(hash).toString(36) + Date.now().toString(36).slice(-4);
}

export function VotePanel({ poll: initialPoll }: { poll: PollData }) {
  const [poll, setPoll] = useState(initialPoll);
  const [selected, setSelected] = useState<string[]>([]);
  const [voterName, setVoterName] = useState('');
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [prevVotes, setPrevVotes] = useState(initialPoll.totalVotes);
  const [newVoteFlash, setNewVoteFlash] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(`raisy_voted_${poll.id}`)) setVoted(true);
  }, [poll.id]);

  // Flash when new vote comes in from someone else
  useEffect(() => {
    if (poll.totalVotes > prevVotes && voted) {
      setNewVoteFlash(true);
      setTimeout(() => setNewVoteFlash(false), 600);
    }
    setPrevVotes(poll.totalVotes);
  }, [poll.totalVotes, voted, prevVotes]);

  usePollRealtime({
    shortId: poll.shortId,
    enabled: !poll.closed,
    onUpdate: ({ totalVotes, results }) => {
      setIsLive(true);
      setPoll((prev) => ({ ...prev, totalVotes, results }));
    },
    onClosed: () => {
      setPoll((prev) => ({ ...prev, closed: true }));
      setIsLive(false);
    },
  });

  useEffect(() => {
    if (poll.closed) return;
    const t = setTimeout(() => setIsLive(true), 2000);
    return () => clearTimeout(t);
  }, [poll.closed]);

  useEffect(() => {
    if (poll.closed) return;
    const id = setInterval(async () => {
      try {
        const res = await fetch(`/api/polls/${poll.shortId}`);
        if (res.ok) { const data = await res.json(); setPoll(data); }
      } catch {}
    }, 8000);
    return () => clearInterval(id);
  }, [poll.shortId, poll.closed]);

  const toggleOption = (id: string) => {
    if (poll.type === 'single') setSelected([id]);
    else setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  };

  const handleVote = async () => {
    if (selected.length === 0) return setError('Please select an option.');
    if (!poll.anonymous && !voterName.trim()) return setError('Please enter your name.');
    setLoading(true); setError('');
    const fingerprint = generateFingerprint();
    try {
      const res = await fetch('/api/vote', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pollId: poll.id, optionIds: selected, voterName: voterName.trim() || null, fingerprint }),
      });
      const data = await res.json();
      if (res.status === 409) { localStorage.setItem(`raisy_voted_${poll.id}`, '1'); setVoted(true); return; }
      if (!res.ok) return setError(data.error || 'Failed to submit vote.');
      localStorage.setItem(`raisy_voted_${poll.id}`, '1');
      setVoted(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3500);
      const fresh = await fetch(`/api/polls/${poll.shortId}`);
      if (fresh.ok) setPoll(await fresh.json());
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  const showResults = voted || poll.closed;

  return (
    <>
      <Confetti active={showConfetti} />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{ maxWidth: 600, margin: '0 auto' }}
      >
        {/* Live badge */}
        <motion.div variants={fadeUp} custom={0} style={{ marginBottom: 18 }}>
          <LiveBadge isLive={isLive} totalVotes={poll.totalVotes} deadline={poll.deadline} closed={poll.closed} />
        </motion.div>

        {/* Question */}
        <motion.h1
          variants={fadeUp}
          custom={1}
          style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 800,
            fontSize: 'clamp(22px, 4vw, 34px)', letterSpacing: '-1px',
            color: '#E8E8F0', marginBottom: 30, lineHeight: 1.2,
          }}
        >
          {poll.question}
        </motion.h1>

        {/* Name input */}
        <AnimatePresence>
          {!poll.anonymous && !voted && !poll.closed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ marginBottom: 20, overflow: 'hidden' }}
            >
              <input
                type="text"
                placeholder="Your name"
                value={voterName}
                onChange={(e) => setVoterName(e.target.value)}
                maxLength={60}
                style={{
                  width: '100%', background: '#111118',
                  border: '1px solid #1E1E2E', borderRadius: 6,
                  padding: '10px 14px', color: '#E8E8F0',
                  fontFamily: 'DM Mono, monospace', fontSize: 13, outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#FFD447')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#1E1E2E')}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Options */}
        <motion.div
          variants={staggerContainer}
          style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}
        >
          {poll.results.map((opt, i) => {
            const color = COLORS[i % COLORS.length];
            const isSelected = selected.includes(opt.id);

            if (showResults) {
              return (
                <motion.div
                  key={opt.id}
                  variants={fadeUp}
                  custom={i}
                  animate={newVoteFlash ? { scale: [1, 1.01, 1] } : {}}
                  transition={{ duration: 0.3 }}
                  style={{
                    background: '#111118',
                    border: `1px solid ${isSelected ? color : '#1E1E2E'}`,
                    borderRadius: 8, padding: '14px 16px',
                    transition: 'border-color 0.3s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 14, color: '#E8E8F0', fontFamily: 'DM Mono, monospace' }}>
                      {isSelected && <span style={{ color, marginRight: 6 }}>✓</span>}
                      {opt.label}
                    </span>
                    <motion.span
                      key={opt.percentage}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ color, fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15 }}
                    >
                      {opt.percentage}%
                    </motion.span>
                  </div>
                  <div style={{ height: 5, background: '#1E1E2E', borderRadius: 3, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${opt.percentage}%` }}
                      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 }}
                      style={{
                        height: '100%',
                        background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                        borderRadius: 3,
                        boxShadow: `0 0 10px ${color}50`,
                      }}
                    />
                  </div>
                  <motion.div
                    key={opt.count}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ marginTop: 5, fontSize: 11, color: '#6B6B8A' }}
                  >
                    {opt.count} vote{opt.count !== 1 ? 's' : ''}
                  </motion.div>
                </motion.div>
              );
            }

            return (
              <motion.button
                key={opt.id}
                variants={scaleIn}
                custom={i}
                whileHover={{ scale: 1.015, borderColor: color }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleOption(opt.id)}
                style={{
                  background: isSelected ? `${color}12` : '#111118',
                  border: `1px solid ${isSelected ? color : '#1E1E2E'}`,
                  borderRadius: 8, padding: '16px',
                  color: '#E8E8F0', textAlign: 'left', cursor: 'pointer',
                  fontFamily: 'DM Mono, monospace', fontSize: 14,
                  display: 'flex', alignItems: 'center', gap: 14,
                  transition: 'background 0.15s, border-color 0.15s',
                }}
              >
                <motion.span
                  animate={{
                    background: isSelected ? color : 'transparent',
                    borderColor: isSelected ? color : '#6B6B8A',
                    scale: isSelected ? [1, 1.2, 1] : 1,
                  }}
                  transition={{ duration: 0.25 }}
                  style={{
                    width: 20, height: 20,
                    borderRadius: poll.type === 'single' ? '50%' : 4,
                    border: `2px solid ${isSelected ? color : '#6B6B8A'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <AnimatePresence>
                    {isSelected && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ color: '#000', fontSize: 10, fontWeight: 900, lineHeight: 1 }}
                      >
                        ✓
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.span>
                {opt.label}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Hint */}
        <AnimatePresence>
          {poll.type === 'multiple' && !voted && !poll.closed && (
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ fontSize: 11, color: '#6B6B8A', marginBottom: 16 }}
            >
              Select all that apply
            </motion.p>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.25)',
                color: '#FF6B6B', padding: '10px 14px', borderRadius: 6,
                fontSize: 13, marginBottom: 16, overflow: 'hidden',
              }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit button */}
        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.button
              key="vote-btn"
              variants={fadeUp}
              custom={5}
              whileHover={selected.length > 0 && !loading ? { scale: 1.02, opacity: 0.92 } : {}}
              whileTap={selected.length > 0 && !loading ? { scale: 0.98 } : {}}
              onClick={handleVote}
              disabled={loading || selected.length === 0}
              style={{
                width: '100%', padding: '15px 0',
                background: selected.length > 0 && !loading ? '#FFD447' : '#1E1E2E',
                color: selected.length > 0 && !loading ? '#000' : '#6B6B8A',
                border: 'none', borderRadius: 6, fontFamily: 'Syne, sans-serif',
                fontWeight: 800, fontSize: 15, letterSpacing: '-0.5px',
                cursor: selected.length > 0 ? 'pointer' : 'not-allowed',
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              {loading ? (
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  Submitting...
                </motion.span>
              ) : '✋ Cast Vote'}
            </motion.button>
          ) : voted ? (
            <motion.div
              key="voted-msg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={{
                textAlign: 'center', padding: '16px',
                color: '#6BFFE4', fontSize: 13, fontFamily: 'DM Mono, monospace',
                background: 'rgba(107,255,228,0.06)',
                border: '1px solid rgba(107,255,228,0.18)',
                borderRadius: 8,
              }}
            >
              ✓ Vote counted · results update live
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
