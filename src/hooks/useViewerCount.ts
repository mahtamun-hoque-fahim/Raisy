'use client';

import { useEffect, useRef, useState } from 'react';
import Ably from 'ably';

/**
 * Tracks how many people are currently viewing a poll
 * using Ably Presence. Falls back to null if unavailable.
 */
export function useViewerCount(shortId: string, enabled = true): number | null {
  const [count, setCount] = useState<number | null>(null);
  const clientRef = useRef<Ably.Realtime | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let mounted = true;

    const connect = async () => {
      try {
        const client = new Ably.Realtime({ authUrl: '/api/ably-token', authMethod: 'GET' });
        clientRef.current = client;

        const channel = client.channels.get(`poll:${shortId}`);

        // Enter presence
        await channel.presence.enter({ viewing: true });

        // Subscribe to presence changes
        const updateCount = async () => {
          if (!mounted) return;
          const members = await channel.presence.get();
          if (mounted) setCount(members.length);
        };

        channel.presence.subscribe('enter', updateCount);
        channel.presence.subscribe('leave', updateCount);

        await updateCount();
      } catch (err) {
        console.warn('[useViewerCount] Presence unavailable:', err);
      }
    };

    connect();

    return () => {
      mounted = false;
      try {
        clientRef.current?.close();
      } catch {}
      clientRef.current = null;
    };
  }, [shortId, enabled]);

  return count;
}
