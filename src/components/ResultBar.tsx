'use client';

import { useEffect, useState } from 'react';

interface ResultBarProps {
  label: string;
  count: number;
  percentage: number;
  total: number;
  color?: string;
  delay?: number;
}

const BAR_COLORS = ['#FFD447', '#6BFFE4', '#FF6B6B', '#C56CF0', '#FF9F43', '#00D4FF'];

export function ResultBar({
  label, count, percentage, delay = 0, color,
}: ResultBarProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(percentage), 100 + delay);
    return () => clearTimeout(t);
  }, [percentage, delay]);

  const barColor = color || BAR_COLORS[0];

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        marginBottom: 6, fontSize: 13,
      }}>
        <span style={{ color: '#E8E8F0', fontFamily: 'DM Mono, monospace' }}>{label}</span>
        <span style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ color: '#6B6B8A', fontSize: 11 }}>{count} vote{count !== 1 ? 's' : ''}</span>
          <span style={{ color: barColor, fontWeight: 600, fontFamily: 'Syne, sans-serif', minWidth: 36, textAlign: 'right' }}>
            {percentage}%
          </span>
        </span>
      </div>
      <div style={{
        height: 6, background: '#1E1E2E', borderRadius: 3, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${width}%`,
          background: barColor,
          borderRadius: 3,
          transition: 'width 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
          boxShadow: `0 0 12px ${barColor}40`,
        }} />
      </div>
    </div>
  );
}
