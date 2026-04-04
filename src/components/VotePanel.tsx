'use client';

import { useState, useEffect } from 'react';

interface Option {
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
  results: Option[];
}

interface VotePanelProps {
  poll: PollData;
}

const COLORS = ['#FFD447', '#6BFFE4', '#FF6B6B', '#C56CF0', '#FF9F43', '#00D4FF', '#FFD447', '#6BFFE4', '#FF6B6B', '#C56CF0'];

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

export function VotePanel({ poll: initialPoll }: VotePanelProps) {
  const [poll, setPoll] = useState(initialPoll);
  const [selected, setSelected] = useState<string[]>([]);
  const [voterName, setVoterName] = useState('');
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState('');

  // Check if already voted
  useEffect(() => {
    const key = `raisy_voted_${poll.id}`;
    if (localStorage.getItem(key)) setVoted(true);
  }, [poll.id]);

  // Deadline countdown
  useEffect(() => {
    if (!poll.deadline) return;
    const tick = () => {
      const diff = new Date(poll.deadline!).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft('Closed'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(h > 0 ? `${h}h ${m}m left` : `${m}m ${s}s left`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [poll.deadline]);

  // Poll for live results every 5s
  useEffect(() => {
    const refresh = async () => {
      try {
        const res = await fetch(`/api/polls/${poll.shortId}`);
        if (res.ok) {
          const data = await res.json();
          setPoll(data);
        }
      } catch {}
    };
    const id = setInterval(refresh, 5000);
    return () => clearInterval(id);
  }, [poll.shortId]);

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

      // Refresh results
      const fresh = await fetch(`/api/polls/${poll.shortId}`);
      if (fresh.ok) setPoll(await fresh.json());
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showResults = voted || poll.closed;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8,
        flexWrap: 'wrap',
      }}>
        {!poll.closed && poll.deadline && (
          <span style={{
            fontSize: 11, color: '#FF6B6B', fontFamily: 'DM Mono, monospace',
            background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)',
            padding: '3px 10px', borderRadius: 3,
          }}>
            ⏱ {timeLeft}
          </span>
        )}
        {poll.closed && (
          <span style={{
            fontSize: 11, color: '#6B6B8A', fontFamily: 'DM Mono, monospace',
            background: '#1E1E2E', padding: '3px 10px', borderRadius: 3,
          }}>
            Closed
          </span>
        )}
        {!poll.closed && !poll.deadline && (
          <span style={{
            fontSize: 11, display: 'flex', alignItems: 'center', gap: 6,
            color: '#6BFFE4',
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%', background: '#6BFFE4',
              display: 'inline-block', animation: 'pulse-dot 1.4s infinite',
            }} />
            Live
          </span>
        )}
        <span style={{ fontSize: 11, color: '#6B6B8A', marginLeft: 'auto' }}>
          {poll.totalVotes} vote{poll.totalVotes !== 1 ? 's' : ''}
          {poll.anonymous ? ' · anonymous' : ' · named'}
        </span>
      </div>

      {/* Question */}
      <h1 style={{
        fontFamily: 'Syne, sans-serif', fontWeight: 800,
        fontSize: 'clamp(24px, 4vw, 36px)', letterSpacing: '-1px',
        color: '#E8E8F0', marginBottom: 32, lineHeight: 1.15,
      }}>
        {poll.question}
      </h1>

      {/* Name input for named polls */}
      {!poll.anonymous && !voted && !poll.closed && (
        <div style={{ marginBottom: 24 }}>
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
        {poll.results.map((opt, i) => {
          const color = COLORS[i % COLORS.length];
          const isSelected = selected.includes(opt.id);

          if (showResults) {
            return (
              <div key={opt.id} style={{
                background: '#111118',
                border: `1px solid ${isSelected ? color : '#1E1E2E'}`,
                borderRadius: 8, padding: '14px 16px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 14, color: '#E8E8F0', fontFamily: 'DM Mono, monospace' }}>
                    {isSelected && '✓ '}{opt.label}
                  </span>
                  <span style={{ color, fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15 }}>
                    {opt.percentage}%
                  </span>
                </div>
                <div style={{ height: 4, background: '#1E1E2E', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', background: color, borderRadius: 2,
                    width: `${opt.percentage}%`,
                    transition: 'width 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
                    boxShadow: `0 0 8px ${color}60`,
                  }} />
                </div>
                <div style={{ marginTop: 4, fontSize: 11, color: '#6B6B8A' }}>
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
                background: isSelected ? `${color}14` : '#111118',
                border: `1px solid ${isSelected ? color : '#1E1E2E'}`,
                borderRadius: 8, padding: '16px',
                color: '#E8E8F0', textAlign: 'left', cursor: 'pointer',
                fontFamily: 'DM Mono, monospace', fontSize: 14,
                transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', gap: 12,
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.borderColor = color;
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.borderColor = '#1E1E2E';
              }}
            >
              <span style={{
                width: 20, height: 20, borderRadius: poll.type === 'single' ? '50%' : 4,
                border: `2px solid ${isSelected ? color : '#6B6B8A'}`,
                background: isSelected ? color : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all 0.15s',
              }}>
                {isSelected && (
                  <span style={{ color: '#000', fontSize: 10, fontWeight: 700 }}>✓</span>
                )}
              </span>
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)',
          color: '#FF6B6B', padding: '10px 14px', borderRadius: 6,
          fontSize: 13, marginBottom: 16,
        }}>
          {error}
        </div>
      )}

      {/* Submit / Status */}
      {!showResults && (
        <button
          onClick={handleVote}
          disabled={loading || selected.length === 0}
          style={{
            width: '100%', padding: '14px 0',
            background: selected.length > 0 && !loading ? '#FFD447' : '#1E1E2E',
            color: selected.length > 0 && !loading ? '#000' : '#6B6B8A',
            border: 'none', borderRadius: 6,
            fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15,
            letterSpacing: '-0.5px', cursor: selected.length > 0 ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
          }}
        >
          {loading ? 'Submitting...' : '✋ Cast Vote'}
        </button>
      )}

      {voted && (
        <div style={{
          textAlign: 'center', padding: '16px',
          color: '#6BFFE4', fontSize: 13, fontFamily: 'DM Mono, monospace',
        }}>
          ✓ Your vote has been counted
        </div>
      )}

      <style>{`
        @keyframes pulse-dot {
          0%,100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.4); }
        }
      `}</style>
    </div>
  );
}
