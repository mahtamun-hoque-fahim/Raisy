'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { DeadlinePicker } from './DeadlinePicker';

export function CreatePollForm() {
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [opts, setOpts] = useState(['', '']);
  const [type, setType] = useState<'single' | 'multiple'>('single');
  const [anonymous, setAnonymous] = useState(true);
  const [deadlineHours, setDeadlineHours] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const addOption = () => { if (opts.length < 10) setOpts([...opts, '']); };
  const removeOption = (i: number) => { if (opts.length > 2) setOpts(opts.filter((_, idx) => idx !== i)); };
  const updateOption = (i: number, val: string) => {
    const next = [...opts]; next[i] = val; setOpts(next);
  };

  // Drag-to-reorder
  const onDragStart = (i: number) => setDragIdx(i);
  const onDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === i) return;
    const next = [...opts];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(i, 0, moved);
    setOpts(next);
    setDragIdx(i);
  };
  const onDragEnd = () => setDragIdx(null);

  const handleSubmit = async () => {
    setError('');
    const filled = opts.filter((o) => o.trim());
    if (!question.trim()) return setError('Please enter a question.');
    if (filled.length < 2) return setError('Add at least 2 options.');

    setLoading(true);
    try {
      const res = await fetch('/api/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.trim(),
          options: filled,
          type, anonymous, deadlineHours,
        }),
      });
      const data = await res.json();
      if (!res.ok) return setError(typeof data.error === 'string' ? data.error : 'Something went wrong.');
      localStorage.setItem(`raisy_creator_${data.shortId}`, data.creatorToken);
      router.push(`/poll/${data.shortId}?created=1`);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', background: '#111118',
    border: '1px solid #1E1E2E', borderRadius: 6,
    padding: '12px 16px', color: '#E8E8F0',
    fontFamily: 'DM Mono, monospace', fontSize: 14,
    outline: 'none', transition: 'border-color 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 11, letterSpacing: '0.12em',
    textTransform: 'uppercase', color: '#6B6B8A', marginBottom: 10,
    fontFamily: 'Syne, sans-serif', fontWeight: 600,
  };

  const toggleBtnStyle = (active: boolean, color = '#FFD447'): React.CSSProperties => ({
    flex: 1, padding: '10px 0', borderRadius: 6, cursor: 'pointer',
    fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 12,
    letterSpacing: '0.06em', textTransform: 'capitalize',
    background: active ? color : '#111118',
    color: active ? '#000' : '#6B6B8A',
    border: `1px solid ${active ? color : '#1E1E2E'}`,
    transition: 'all 0.2s',
  });

  return (
    <div style={{ maxWidth: 620, margin: '0 auto' }}>

      {/* ── Question ───────────────────────────────────────────────── */}
      <div style={{ marginBottom: 32 }}>
        <label style={labelStyle}>Your question</label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. Where should we have the team lunch?"
          maxLength={280}
          rows={3}
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#FFD447')}
          onBlur={(e) => (e.currentTarget.style.borderColor = '#1E1E2E')}
        />
        <div style={{ fontSize: 11, color: '#6B6B8A', textAlign: 'right', marginTop: 4 }}>
          {question.length}/280
        </div>
      </div>

      {/* ── Options (drag to reorder) ──────────────────────────────── */}
      <div style={{ marginBottom: 32 }}>
        <label style={labelStyle}>Options · drag to reorder</label>
        {opts.map((opt, i) => (
          <div
            key={i}
            draggable
            onDragStart={() => onDragStart(i)}
            onDragOver={(e) => onDragOver(e, i)}
            onDragEnd={onDragEnd}
            style={{
              display: 'flex', gap: 8, marginBottom: 10,
              opacity: dragIdx === i ? 0.5 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            {/* Drag handle */}
            <div style={{
              width: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#2E2E4E', cursor: 'grab', flexShrink: 0,
              transition: 'color 0.15s',
            }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#6B6B8A')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#2E2E4E')}
            >
              <GripVertical size={14} />
            </div>

            {/* Letter badge */}
            <div style={{
              width: 26, height: 44, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 11, color: '#6B6B8A',
              flexShrink: 0, fontFamily: 'Syne, sans-serif', fontWeight: 700,
            }}>
              {String.fromCharCode(65 + i)}
            </div>

            <input
              type="text"
              value={opt}
              onChange={(e) => updateOption(i, e.target.value)}
              placeholder={`Option ${String.fromCharCode(65 + i)}`}
              maxLength={120}
              style={{ ...inputStyle, flex: 1 }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#FFD447')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#1E1E2E')}
            />

            {opts.length > 2 && (
              <button
                onClick={() => removeOption(i)}
                style={{
                  background: 'none', border: '1px solid #1E1E2E',
                  color: '#6B6B8A', borderRadius: 6, padding: '0 12px',
                  cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#FF6B6B';
                  e.currentTarget.style.color = '#FF6B6B';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#1E1E2E';
                  e.currentTarget.style.color = '#6B6B8A';
                }}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}

        {opts.length < 10 && (
          <button
            onClick={addOption}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'none', border: '1px dashed #1E1E2E',
              color: '#6B6B8A', borderRadius: 6, padding: '10px 16px',
              cursor: 'pointer', fontSize: 13, fontFamily: 'DM Mono, monospace',
              width: '100%', justifyContent: 'center', marginTop: 4,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#FFD447';
              e.currentTarget.style.color = '#FFD447';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#1E1E2E';
              e.currentTarget.style.color = '#6B6B8A';
            }}
          >
            <Plus size={14} /> Add option {opts.length}/10
          </button>
        )}
      </div>

      {/* ── Vote type + Identity ───────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        <div>
          <label style={labelStyle}>Vote type</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['single', 'multiple'] as const).map((t) => (
              <button key={t} onClick={() => setType(t)} style={toggleBtnStyle(type === t)}>
                {t}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 11, color: '#6B6B8A', marginTop: 8, fontFamily: 'DM Mono, monospace' }}>
            {type === 'single' ? 'One option per voter' : 'Multiple options allowed'}
          </div>
        </div>

        <div>
          <label style={labelStyle}>Identity</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[true, false].map((anon) => (
              <button
                key={String(anon)}
                onClick={() => setAnonymous(anon)}
                style={toggleBtnStyle(anonymous === anon, anon ? '#FFD447' : '#6BFFE4')}
              >
                {anon ? 'Anon' : 'Named'}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 11, color: '#6B6B8A', marginTop: 8, fontFamily: 'DM Mono, monospace' }}>
            {anonymous ? 'Voters stay anonymous' : 'Voters enter their name'}
          </div>
        </div>
      </div>

      {/* ── Deadline ──────────────────────────────────────────────── */}
      <div style={{ marginBottom: 40 }}>
        <label style={labelStyle}>Deadline (optional)</label>
        <DeadlinePicker value={deadlineHours} onChange={setDeadlineHours} />
      </div>

      {/* ── Error ─────────────────────────────────────────────────── */}
      {error && (
        <div style={{
          background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.25)',
          color: '#FF6B6B', padding: '12px 16px', borderRadius: 6,
          fontSize: 13, marginBottom: 20,
        }}>
          {error}
        </div>
      )}

      {/* ── Submit ────────────────────────────────────────────────── */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          width: '100%', padding: '17px 0',
          background: loading ? '#1E1E2E' : '#FFD447',
          color: loading ? '#6B6B8A' : '#000',
          border: 'none', borderRadius: 6, cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'Syne, sans-serif', fontWeight: 800,
          fontSize: 16, letterSpacing: '-0.5px', transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = '0.9'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
      >
        {loading ? 'Creating poll...' : '✋ Raise It'}
      </button>

      <p style={{ textAlign: 'center', fontSize: 11, color: '#6B6B8A', marginTop: 14 }}>
        No account needed · Results update live · Share with any link
      </p>
    </div>
  );
}
