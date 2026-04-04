'use client';

import { useEffect, useRef, useCallback } from 'react';
import Ably from 'ably';
import { EVENTS } from '@/lib/ably';

interface OptionResult {
  id: string;
  label: string;
  position: number;
  count: number;
  percentage: number;
}

interface RealtimePayload {
  totalVotes: number;
  results: OptionResult[];
}

interface UsePollRealtimeOptions {
  shortId: string;
  onUpdate: (payload: RealtimePayload) => void;
  onClosed: () => void;
  enabled?: boolean;
}

/**
 * Subscribes to a poll's Ably channel.
 * Uses token auth so the API key is never exposed client-side.
 * Gracefully falls back (no crash) if ABLY is not configured.
 */
export function usePollRealtime({
  shortId,
  onUpdate,
  onClosed,
  enabled = true,
}: UsePollRealtimeOptions) {
  const clientRef = useRef<Ably.Realtime | null>(null);
  const channelRef = useRef<Ably.RealtimeChannel | null>(null);

  // Stable callback refs so we don't re-subscribe on every render
  const onUpdateRef = useRef(onUpdate);
  const onClosedRef = useRef(onClosed);
  onUpdateRef.current = onUpdate;
  onClosedRef.current = onClosed;

  const connect = useCallback(async () => {
    if (!enabled || !shortId) return;

    try {
      // Token auth — keeps API key server-side
      const client = new Ably.Realtime({
        authUrl: '/api/ably-token',
        authMethod: 'GET',
      });

      clientRef.current = client;

      const channel = client.channels.get(`poll:${shortId}`);
      channelRef.current = channel;

      // Subscribe to vote updates
      await channel.subscribe(EVENTS.VOTE_CAST, (msg) => {
        onUpdateRef.current(msg.data as RealtimePayload);
      });

      // Subscribe to poll close
      await channel.subscribe(EVENTS.POLL_CLOSED, () => {
        onClosedRef.current();
      });
    } catch (err) {
      console.warn('[usePollRealtime] Ably connection failed (poll will use polling fallback):', err);
    }
  }, [shortId, enabled]);

  useEffect(() => {
    connect();

    return () => {
      // Cleanup on unmount
      try {
        channelRef.current?.unsubscribe();
        clientRef.current?.close();
      } catch {}
      channelRef.current = null;
      clientRef.current = null;
    };
  }, [connect]);
}
