'use client';

import { useEffect, useState } from 'react';

interface CreatorControlsProps {
  shortId: string;
  pollId: string;
  closed: boolean;
}

export function CreatorControls({ shortId, pollId, closed }: CreatorControlsProps) {
  const [isCreator, setIsCreator] = useState(false);
  const [closing, setClosing] = useState(false);
  const [done, setDone] = useState(closed);

  useEffect(() => {
    const token = localStorage.getItem(`raisy_creator_${shortId}`);
    if (token) setIsCreator(true);
  }, [shortId]);

  if (!isCreator || done) return null;

  const handleClose = async () => {
    setClosing(true);
    const token = localStorage.getItem(`raisy_creator_${shortId}`);
    try {
      await fetch(`/api/polls/${shortId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorToken: token }),
      });
      setDone(true);
      window.location.reload();
    } catch {
      setClosing(false);
    }
  };

  return (
    <div style={{
      marginTop: 20, padding: '16px 20px',
      background: 'rgba(255,212,71,0.05)', border: '1px solid rgba(255,212,71,0.15)',
      borderRadius: 8, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', gap: 12,
    }}>
      <span style={{ fontSize: 12, color: '#6B6B8A', fontFamily: 'DM Mono, monospace' }}>
        👑 You created this poll
      </span>
      <button
        onClick={handleClose}
        disabled={closing}
        style={{
          background: 'none', border: '1px solid rgba(255,107,107,0.4)',
          color: '#FF6B6B', padding: '7px 16px', borderRadius: 4,
          fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 12,
          cursor: closing ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
          letterSpacing: '0.05em',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,107,107,0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'none';
        }}
      >
        {closing ? 'Closing...' : 'Close Poll'}
      </button>
    </div>
  );
}
