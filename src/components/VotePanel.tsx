'use client';

import { useState, useEffect, useRef } from 'react';
import { usePollRealtime } from '@/hooks/usePollRealtime';
import { LiveBadge } from '@/components/LiveBadge';

interface OptionResult {
  id: string;
  label: string;
  position: number;
  count: number;
  percentage: number;
}

interface PollData {
  id: string;
  shortId: string;
  question: string;
  type: 'single' | 'multiple';
  anonymous: boolean;
  deadline: string | null;
  closed: boolean;
  totalVotes: number;
  results: OptionResult[];
}

const COLORS = [
  '#FFD447', '#6BFFE4', '#FF6B6B', '#C56CF0',
  '#FF9F43', '#00D4FF', '#A8FF78', '#FF6B9D',
  '#FFD447', '#6BFFE4',
];

function generateFingerprint(): string {
  const nav = navigator;
  const raw = [
    nav.userAgent, nav.language, screen.width, screen.height,
    screen.colorDepth, new Date().getTimezoneOffset(),
    nav.hardwareConcurrency,
  ].join('|');
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
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

  // Animated bar widths — keyed by option id
  const [barWidths, setBarWidths] = useState<Record<string, number>>({});
  const animFrameRef = useRef<Record<string, number>>({});

  // Check already voted
  useEffect(() => {
    if (localStorage.getItem(`raisy_voted_${poll.id}`)) setVoted(true);
  }, [poll.id]);

  // Animate bars smoothly
  const animateBars = (results: OptionResult[]) => {
    results.forEach((opt) => {
      const target = opt.percentage;
      if (animFrameRef.current[opt.id]) cancelAnimationFrame(animFrameRef.current[opt.id]);
      setBarWidths((prev) => {
        const current = prev[opt.id] ?? 0;
        const step = () => {
          setBarWidths((latest) => {
            const curr = latest[opt.id] ?? 0;
            const diff = target - curr;
            if (Math.abs(diff) < 0.5) return { ...latest, [opt.id]: target };
            return { ...latest, [opt.id]: curr + diff * 0.12 };
          });
          if (Math.abs((barWidths[opt.id] ?? 0) - target) > 0.5) {
            animFrameRef.current[opt.id] = requestAnimationFrame(step);
          }
        };
        animFrameRef.current[opt.id] = requestAnimationFrame(step);
        return prev;
      });
    });
  };

  // Initialize bar widths
  useEffect(() => {
    const init: Record<string, number> = {};
    initialPoll.results.forEach((r) => { init[r.id] = 0; });
    setBarWidths(init);
    // Animate in after mount
    const t = setTimeout(() => animateBars(initialPoll.results), 150);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Realtime subscription
  usePollRealtime({
    shortId: poll.shortId,
    enabled: !poll.closed,
    onUpdate: ({ totalVotes, results }) => {
      setIsLive(true);
      setPoll((prev) => ({ ...prev, totalVotes, results }));
      animateBars(results);
    },
    onClosed: () => {
      setPoll((prev) => ({ ...prev, closed: true }));
      setIsLive(false);
    },
  });

  // Mark realtime connected after a brief delay
  useEffect(() => {
    if (poll.closed) return;
    const t = setTimeout(() => setIsLive(true), 2000);
    return () => clearTimeout(t);
  }, [poll.closed]);

  // Fallback polling every 8s (safety net if Ably not configured)
  useEffect(() => {
    if (poll.closed) return;
    const id = setInterval(async () => {
      try {
        const res = await fetch(`/api/polls/${poll.shortId}`);
        if (res.ok) {
          const data = await res.json();
          setPoll(data);
          animateBars(data.results);
        }
      } catch {}
    }, 8000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poll.shortId, poll.closed]);

  const toggleOption = (id: string) => {
    if (poll.type === 'single') {
      setSelected([id]);
    } else {
      setSelected((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    }
  };

  const handleVote = async () => {
    if (selected.length === 0) return setError('Please select an option.');
    if (!poll.anonymous && !voterName.trim()) return setError('Please enter your name.');
    setLoading(true);
    setError('');

    const fingerprint = generateFingerprint();
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pollId: poll.id,
          optionIds: selected,
          voterName: voterName.trim() || null,
          fingerprint,
        }),
      });
      const data = await res.json();

      if (res.status === 409) {
        localStorage.setItem(`raisy_voted_${poll.id}`, '1');
        setVoted(true);
        return;
      }
      if (!res.ok) return setError(data.error || 'Failed to submit vote.');

      localStorage.setItem(`raisy_voted_${poll.id}`, '1');
      setVoted(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showResults = voted || poll.closed;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      {/* Live badge */}
      <div style={{ marginBottom: 16 }}>
        <LiveBadge
          isLive={isLive}
          totalVotes={poll.totalVotes}
          deadline={poll.deadline}
          closed={poll.closed}
        />
      </div>

      {/* Question */}
      <h1 style={{
        fontFamily: 'Syne, sans-serif', fontWeight: 800,
        fontSize: 'clamp(22px, 4vw, 34px)', letterSpacing: '-1px',
        color: '#E8E8F0', marginBottom: 28, lineHeight: 1.2,
      }}>
        {poll.question}
      </h1>

      {/* Name input */}
      {!poll.anonymous && !voted && !poll.closed && (
        <div style={{ marginBottom: 20 }}>
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
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#FFD447')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#1E1E2E')}
          />
        </div>
      )}

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {poll.results.map((opt, i) => {
          const color = COLORS[i % COLORS.length];
          const isSelected = selected.includes(opt.id);
          const width = barWidths[opt.id] ?? 0;

          if (showResults) {
            return (
              <div key={opt.id} style={{
                background: '#111118',
                border: `1px solid ${isSelected ? color : '#1E1E2E'}`,
                borderRadius: 8, padding: '14px 16px',
                transition: 'border-color 0.3s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 14, color: '#E8E8F0', fontFamily: 'DM Mono, monospace' }}>
                    {isSelected && (
                      <span style={{ color, marginRight: 6 }}>✓</span>
                    )}
                    {opt.label}
                  </span>
                  <span style={{
                    color, fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15,
                    minWidth: 42, textAlign: 'right',
                    transition: 'color 0.3s',
                  }}>
                    {opt.percentage}%
                  </span>
                </div>
                <div style={{ height: 5, background: '#1E1E2E', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${width}%`,
                    background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                    borderRadius: 3,
                    boxShadow: `0 0 10px ${color}50`,
                    transition: 'width 0.05s linear',
                  }} />
                </div>
                <div style={{ marginTop: 5, fontSize: 11, color: '#6B6B8A' }}>
                  {opt.count} vote{opt.count !== 1 ? 's' : ''}
                </div>
              </div>
            );
          }

          return (
            <button
              key={opt.id}
              onClick={() => toggleOption(opt.id)}
              style={{
                background: isSelected ? `${color}12` : '#111118',
                border: `1px solid ${isSelected ? color : '#1E1E2E'}`,
                borderRadius: 8, padding: '16px',
                color: '#E8E8F0', textAlign: 'left', cursor: 'pointer',
                fontFamily: 'DM Mono, monospace', fontSize: 14,
                transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', gap: 14,
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.borderColor = color;
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.borderColor = '#1E1E2E';
              }}
            >
              <span style={{
                width: 20, height: 20,
                borderRadius: poll.type === 'single' ? '50%' : 4,
                border: `2px solid ${isSelected ? color : '#6B6B8A'}`,
                background: isSelected ? color : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all 0.15s',
              }}>
                {isSelected && (
                  <span style={{ color: '#000', fontSize: 10, fontWeight: 900, lineHeight: 1 }}>✓</span>
                )}
              </span>
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Hint for multiple choice */}
      {poll.type === 'multiple' && !voted && !poll.closed && (
        <p style={{ fontSize: 11, color: '#6B6B8A', marginBottom: 16 }}>
          Select all that apply
        </p>
      )}

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.25)',
          color: '#FF6B6B', padding: '10px 14px', borderRadius: 6,
          fontSize: 13, marginBottom: 16,
        }}>
          {error}
        </div>
      )}

      {/* Submit */}
      {!showResults && (
        <button
          onClick={handleVote}
          disabled={loading || selected.length === 0}
          style={{
            width: '100%', padding: '15px 0',
            background: selected.length > 0 && !loading ? '#FFD447' : '#1E1E2E',
            color: selected.length > 0 && !loading ? '#000' : '#6B6B8A',
            border: 'none', borderRadius: 6,
            fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15,
            letterSpacing: '-0.5px', cursor: selected.length > 0 ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { if (selected.length > 0 && !loading) e.currentTarget.style.opacity = '0.88'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
        >
          {loading ? 'Submitting...' : '✋ Cast Vote'}
        </button>
      )}

      {voted && (
        <div style={{
          textAlign: 'center', padding: '14px',
          color: '#6BFFE4', fontSize: 13, fontFamily: 'DM Mono, monospace',
        }}>
          ✓ Your vote has been counted · results update live
        </div>
      )}

      <style>{`
        @keyframes pulse-dot {
          0%,100% { opacity:1; transform:scale(1); }
          50% { opacity:0.5; transform:scale(1.4); }
        }
      `}</style>
    </div>
  );
}
