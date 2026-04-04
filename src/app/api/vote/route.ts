import { NextRequest, NextResponse } from 'next/server';
import { db, polls, options, votes } from '@/db';
import { eq, and, inArray } from 'drizzle-orm';
import { CastVoteSchema } from '@/lib/validations';
import { hashIp } from '@/lib/utils';

// Simple in-memory rate limit: ip -> [timestamps]
const rateLimitMap = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const window = 60_000; // 1 minute
  const max = 10;
  const hits = (rateLimitMap.get(ip) || []).filter((t) => now - t < window);
  hits.push(now);
  rateLimitMap.set(ip, hits);
  return hits.length > max;
}

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      '0.0.0.0';

    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await req.json();
    const parsed = CastVoteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { pollId, optionIds, voterName, fingerprint } = parsed.data;

    // Fetch poll
    const poll = await db.query.polls.findFirst({
      where: eq(polls.id, pollId),
    });

    if (!poll) return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
    if (poll.closed) return NextResponse.json({ error: 'Poll is closed' }, { status: 410 });
    if (poll.deadline && new Date() > poll.deadline) {
      return NextResponse.json({ error: 'Poll deadline has passed' }, { status: 410 });
    }

    // Duplicate vote check by fingerprint
    const existing = await db
      .select({ id: votes.id })
      .from(votes)
      .where(and(eq(votes.pollId, pollId), eq(votes.fingerprint, fingerprint)))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ error: 'Already voted' }, { status: 409 });
    }

    // Validate option IDs belong to this poll
    const validOptions = await db
      .select({ id: options.id })
      .from(options)
      .where(and(eq(options.pollId, pollId), inArray(options.id, optionIds)));

    if (validOptions.length !== optionIds.length) {
      return NextResponse.json({ error: 'Invalid options' }, { status: 400 });
    }

    // Single-choice enforcement
    if (poll.type === 'single' && optionIds.length > 1) {
      return NextResponse.json({ error: 'Only one option allowed' }, { status: 400 });
    }

    const ipHash = hashIp(ip);

    // Insert votes (one row per option selected)
    const voteRows = optionIds.map((optionId) => ({
      pollId,
      optionId,
      voterName: poll.anonymous ? null : (voterName || null),
      fingerprint,
      ipHash,
    }));

    await db.insert(votes).values(voteRows);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[POST /api/vote]', err);
    return NextResponse.json({ error: 'Failed to cast vote' }, { status: 500 });
  }
}
