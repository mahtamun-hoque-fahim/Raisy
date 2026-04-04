import Ably from 'ably';

// ── SERVER-SIDE CLIENT (REST only, for publishing) ─────────────────────────
let serverClient: Ably.Rest | null = null;

export function getAblyServer(): Ably.Rest {
  if (!serverClient) {
    serverClient = new Ably.Rest({ key: process.env.ABLY_API_KEY! });
  }
  return serverClient;
}

// ── CHANNEL NAME HELPER ────────────────────────────────────────────────────
export function pollChannel(shortId: string): string {
  return `poll:${shortId}`;
}

// ── EVENT NAMES ────────────────────────────────────────────────────────────
export const EVENTS = {
  VOTE_CAST: 'vote-cast',    // new vote landed → broadcast updated results
  POLL_CLOSED: 'poll-closed', // creator closed poll
} as const;
