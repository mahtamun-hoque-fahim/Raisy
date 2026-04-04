'use client';

interface LiveBadgeProps {
  isLive: boolean;
  totalVotes: number;
  deadline?: string | null;
  closed?: boolean;
}

export function LiveBadge({ isLive, totalVotes, deadline, closed }: LiveBadgeProps) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!deadline) return;
    const tick = () => {
      const diff = new Date(deadline).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft('Expired'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(h > 0 ? `${h}h ${m}m left` : m > 0 ? `${m}m ${s}s left` : `${s}s left`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      {/* Live / Closed indicator */}
      {closed ? (
        <span style={{
          fontSize: 11, color: '#6B6B8A', fontFamily: 'DM Mono, monospace',
          background: '#1E1E2E', padding: '3px 10px', borderRadius: 3,
        }}>
          Closed
        </span>
      ) : (
        <span style={{
          fontSize: 11, display: 'flex', alignItems: 'center', gap: 6,
          color: isLive ? '#6BFFE4' : '#6B6B8A',
          fontFamily: 'DM Mono, monospace',
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: isLive ? '#6BFFE4' : '#6B6B8A',
            display: 'inline-block',
            animation: isLive ? 'pulse-dot 1.4s infinite' : 'none',
          }} />
          {isLive ? 'Live' : 'Connecting...'}
        </span>
      )}

      {/* Vote count */}
      <span style={{ fontSize: 12, color: '#6B6B8A', fontFamily: 'DM Mono, monospace' }}>
        {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
      </span>

      {/* Deadline */}
      {!closed && deadline && timeLeft && (
        <span style={{
          fontSize: 11, color: '#FF6B6B', fontFamily: 'DM Mono, monospace',
          background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)',
          padding: '3px 10px', borderRadius: 3,
        }}>
          ⏱ {timeLeft}
        </span>
      )}
    </div>
  );
}

// Need useState/useEffect — add imports
import { useState, useEffect } from 'react';
