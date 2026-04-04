'use client';

import { useState } from 'react';
import { Clock, Calendar } from 'lucide-react';

interface DeadlinePickerProps {
  value: number | null;
  onChange: (hours: number | null) => void;
}

const PRESETS = [
  { label: 'No deadline', hours: null },
  { label: '30 min', hours: 0.5 },
  { label: '1 hour', hours: 1 },
  { label: '2 hours', hours: 2 },
  { label: '6 hours', hours: 6 },
  { label: '12 hours', hours: 12 },
  { label: '24 hours', hours: 24 },
  { label: '2 days', hours: 48 },
  { label: '1 week', hours: 168 },
];

export function DeadlinePicker({ value, onChange }: DeadlinePickerProps) {
  const [mode, setMode] = useState<'preset' | 'custom'>('preset');
  const [customDate, setCustomDate] = useState('');
  const [customTime, setCustomTime] = useState('');

  const handleCustomApply = () => {
    if (!customDate) return;
    const dt = new Date(`${customDate}T${customTime || '23:59'}`);
    const now = new Date();
    const diffHours = (dt.getTime() - now.getTime()) / 3600000;
    if (diffHours <= 0) return;
    onChange(Math.round(diffHours * 10) / 10);
  };

  // Min date for the date picker
  const minDate = new Date().toISOString().split('T')[0];

  const chipStyle = (active: boolean, color = '#FFD447'): React.CSSProperties => ({
    padding: '7px 14px', borderRadius: 20,
    border: `1px solid ${active ? color : '#1E1E2E'}`,
    background: active ? `${color}14` : 'transparent',
    color: active ? color : '#6B6B8A',
    fontFamily: 'DM Mono, monospace', fontSize: 12,
    cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
  });

  return (
    <div>
      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button
          style={chipStyle(mode === 'preset')}
          onClick={() => setMode('preset')}
        >
          <Clock size={11} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />
          Quick
        </button>
        <button
          style={chipStyle(mode === 'custom', '#6BFFE4')}
          onClick={() => setMode('custom')}
        >
          <Calendar size={11} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />
          Custom date
        </button>
      </div>

      {mode === 'preset' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {PRESETS.map((p) => (
            <button
              key={String(p.hours)}
              style={chipStyle(value === p.hours)}
              onClick={() => onChange(p.hours)}
              onMouseEnter={(e) => {
                if (value !== p.hours) {
                  e.currentTarget.style.borderColor = '#FFD447';
                  e.currentTarget.style.color = '#FFD447';
                }
              }}
              onMouseLeave={(e) => {
                if (value !== p.hours) {
                  e.currentTarget.style.borderColor = '#1E1E2E';
                  e.currentTarget.style.color = '#6B6B8A';
                }
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {mode === 'custom' && (
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <div style={{
              fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: '#6B6B8A', marginBottom: 6, fontFamily: 'Syne, sans-serif', fontWeight: 600,
            }}>
              Date
            </div>
            <input
              type="date"
              min={minDate}
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              style={{
                background: '#111118', border: '1px solid #1E1E2E',
                borderRadius: 6, padding: '9px 12px', color: '#E8E8F0',
                fontFamily: 'DM Mono, monospace', fontSize: 13, outline: 'none',
                colorScheme: 'dark',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#6BFFE4')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#1E1E2E')}
            />
          </div>
          <div>
            <div style={{
              fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: '#6B6B8A', marginBottom: 6, fontFamily: 'Syne, sans-serif', fontWeight: 600,
            }}>
              Time
            </div>
            <input
              type="time"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              style={{
                background: '#111118', border: '1px solid #1E1E2E',
                borderRadius: 6, padding: '9px 12px', color: '#E8E8F0',
                fontFamily: 'DM Mono, monospace', fontSize: 13, outline: 'none',
                colorScheme: 'dark',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#6BFFE4')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#1E1E2E')}
            />
          </div>
          <button
            onClick={handleCustomApply}
            disabled={!customDate}
            style={{
              background: customDate ? '#6BFFE4' : '#1E1E2E',
              color: customDate ? '#000' : '#6B6B8A',
              border: 'none', borderRadius: 6, padding: '10px 18px',
              fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 12,
              cursor: customDate ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
            }}
          >
            Set
          </button>
        </div>
      )}

      {/* Active deadline preview */}
      {value !== null && value !== undefined && (
        <div style={{
          marginTop: 12, fontSize: 12, color: '#6BFFE4',
          fontFamily: 'DM Mono, monospace', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Clock size={12} />
          Poll closes in {value >= 24
            ? `${Math.floor(value / 24)}d ${value % 24 > 0 ? `${value % 24}h` : ''}`
            : value === 0.5 ? '30 min'
            : `${value}h`}
          <button
            onClick={() => onChange(null)}
            style={{
              background: 'none', border: 'none', color: '#6B6B8A',
              cursor: 'pointer', fontSize: 11, padding: '0 4px',
            }}
          >
            ✕ clear
          </button>
        </div>
      )}
    </div>
  );
}
