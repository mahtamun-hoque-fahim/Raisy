'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, ChevronDown } from 'lucide-react';

export function CreatePollForm() {
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [opts, setOpts] = useState(['', '']);
  const [type, setType] = useState<'single' | 'multiple'>('single');
  const [anonymous, setAnonymous] = useState(true);
  const [deadlineHours, setDeadlineHours] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addOption = () => {
    if (opts.length < 10) setOpts([...opts, '']);
  };

  const removeOption = (i: number) => {
    if (opts.length > 2) setOpts(opts.filter((_, idx) => idx !== i));
  };

  const updateOption = (i: number, val: string) => {
    const next = [...opts];
    next[i] = val;
    setOpts(next);
  };

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
          type,
          anonymous,
          deadlineHours,
        }),
      });

      const data = await res.json();
      if (!res.ok) return setError(data.error || 'Something went wrong.');

      // Store creator token for managing the poll
      localStorage.setItem(`raisy_creator_${data.shortId}`, data.creatorToken);

      router.push(`/poll/${data.shortId}?created=1`);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#111118',
    border: '1px solid #1E1E2E',
    borderRadius: 6,
    padding: '12px 16px',
    color: '#E8E8F0',
    fontFamily: 'DM Mono, monospace',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#6B6B8A',
    marginBottom: 8,
    fontFamily: 'Syne, sans-serif',
    fontWeight: 600,
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      {/* Question */}
      <div style={{ marginBottom: 28 }}>
        <label style={labelStyle}>Your question</label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. Where should we have the team lunch?"
          maxLength={280}
          rows={3}
          style={{
            ...inputStyle,
            resize: 'vertical',
            lineHeight: 1.6,
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#FFD447')}
          onBlur={(e) => (e.currentTarget.style.borderColor = '#1E1E2E')}
        />
        <div style={{ fontSize: 11, color: '#6B6B8A', textAlign: 'right', marginTop: 4 }}>
          {question.length}/280
        </div>
      </div>

      {/* Options */}
      <div style={{ marginBottom: 28 }}>
        <label style={labelStyle}>Options</label>
        {opts.map((opt, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <div style={{
              width: 28, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, color: '#6B6B8A', flexShrink: 0,
              fontFamily: 'Syne, sans-serif', fontWeight: 700,
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
            <Plus size={14} /> Add option
          </button>
        )}
      </div>

      {/* Settings Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
        {/* Type */}
        <div>
          <label style={labelStyle}>Vote type</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['single', 'multiple'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 6, cursor: 'pointer',
                  fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 12,
                  letterSpacing: '0.08em', textTransform: 'capitalize',
                  background: type === t ? '#FFD447' : '#111118',
                  color: type === t ? '#000' : '#6B6B8A',
                  border: `1px solid ${type === t ? '#FFD447' : '#1E1E2E'}`,
                  transition: 'all 0.2s',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Identity */}
        <div>
          <label style={labelStyle}>Identity</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[true, false].map((anon) => (
              <button
                key={String(anon)}
                onClick={() => setAnonymous(anon)}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 6, cursor: 'pointer',
                  fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 12,
                  letterSpacing: '0.08em',
                  background: anonymous === anon ? '#FFD447' : '#111118',
                  color: anonymous === anon ? '#000' : '#6B6B8A',
                  border: `1px solid ${anonymous === anon ? '#FFD447' : '#1E1E2E'}`,
                  transition: 'all 0.2s',
                }}
              >
                {anon ? 'Anonymous' : 'Named'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Deadline */}
      <div style={{ marginBottom: 36 }}>
        <label style={labelStyle}>Deadline (optional)</label>
        <div style={{ position: 'relative' }}>
          <select
            value={deadlineHours ?? ''}
            onChange={(e) => setDeadlineHours(e.target.value ? Number(e.target.value) : null)}
            style={{
              ...inputStyle,
              appearance: 'none',
              paddingRight: 40,
              cursor: 'pointer',
            }}
          >
            <option value="">No deadline</option>
            <option value="1">1 hour</option>
            <option value="2">2 hours</option>
            <option value="6">6 hours</option>
            <option value="12">12 hours</option>
            <option value="24">24 hours</option>
            <option value="48">2 days</option>
            <option value="168">1 week</option>
          </select>
          <ChevronDown
            size={14}
            style={{
              position: 'absolute', right: 14, top: '50%',
              transform: 'translateY(-50%)', color: '#6B6B8A', pointerEvents: 'none',
            }}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)',
          color: '#FF6B6B', padding: '12px 16px', borderRadius: 6,
          fontSize: 13, marginBottom: 20,
        }}>
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          width: '100%', padding: '16px 0',
          background: loading ? '#1E1E2E' : '#FFD447',
          color: loading ? '#6B6B8A' : '#000',
          border: 'none', borderRadius: 6, cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'Syne, sans-serif', fontWeight: 800,
          fontSize: 16, letterSpacing: '-0.5px',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = '0.9'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
      >
        {loading ? 'Creating poll...' : '✋ Raise It'}
      </button>
    </div>
  );
}
