'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function CopyButton({ text, label = 'Copy link' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: copied ? 'rgba(107,255,228,0.1)' : '#1E1E2E',
        border: `1px solid ${copied ? '#6BFFE4' : '#1E1E2E'}`,
        color: copied ? '#6BFFE4' : '#E8E8F0',
        padding: '10px 18px', borderRadius: 6,
        fontFamily: 'DM Mono, monospace', fontSize: 13,
        cursor: 'pointer', transition: 'all 0.2s',
      }}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? 'Copied!' : label}
    </button>
  );
}
