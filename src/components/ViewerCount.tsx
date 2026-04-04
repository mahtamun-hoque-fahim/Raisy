'use client';

import { useViewerCount } from '@/hooks/useViewerCount';
import { Eye } from 'lucide-react';

export function ViewerCount({ shortId, closed }: { shortId: string; closed: boolean }) {
  const count = useViewerCount(shortId, !closed);
  if (!count || count <= 1) return null;

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 11, color: '#6B6B8A', fontFamily: 'DM Mono, monospace',
    }}>
      <Eye size={12} style={{ color: '#6BFFE4' }} />
      {count} watching
    </span>
  );
}
