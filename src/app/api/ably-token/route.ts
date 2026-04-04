import { NextRequest, NextResponse } from 'next/server';
import { getAblyServer } from '@/lib/ably';

/**
 * GET /api/ably-token
 * Issues a short-lived Ably token for a client.
 * This keeps ABLY_API_KEY server-side only.
 */
export async function GET(_req: NextRequest) {
  try {
    const ably = getAblyServer();
    const tokenRequest = await ably.auth.createTokenRequest({
      capability: { 'poll:*': ['subscribe'] }, // clients can only subscribe
      ttl: 3600 * 1000, // 1 hour
    });
    return NextResponse.json(tokenRequest);
  } catch (err) {
    console.error('[GET /api/ably-token]', err);
    return NextResponse.json({ error: 'Failed to issue token' }, { status: 500 });
  }
}
