import { NextRequest, NextResponse } from 'next/server';
import { db, polls, options, votes } from '@/db';
import { eq, and, inArray } from 'drizzle-orm';
import { CastVoteSchema } from '@/lib/validations';
import { hashIp, calcResults } from '@/lib/utils';
import { getAblyServer, pollChannel, EVENTS } from '@/lib/ably';
import { checkRateLimit } from '@/lib/ratelimit';

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      '0.0.0.0';

    // Rate limit: 10 votes/min per IP
    const rl = checkRateLimit(`vote:${ip}`, { max: 10, windowMs: 60_000 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please slow down.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(rl.resetInMs / 1000)),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    const body = await req.json();
    const parsed = CastVoteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { pollId, optionIds, voterName, fingerprint } = parsed.data;

    const poll = await db.query.polls.findFirst({ where: eq(polls.id, pollId) });
    if (!poll) return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
    if (poll.closed) return NextResponse.json({ error: 'Poll is closed' }, { status: 410 });
    if (poll.deadline && new Date() > poll.deadline) {
      return NextResponse.json({ error: 'Poll deadline has passed' }, { status: 410 });
    }

    // Duplicate check: fingerprint per poll
    const existing = await db
      .select({ id: votes.id })
      .from(votes)
      .where(and(eq(votes.pollId, pollId), eq(votes.fingerprint, fingerprint)))
      .limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Already voted' }, { status: 409 });
    }

    // Validate options belong to this poll
    const validOptions = await db
      .select({ id: options.id })
      .from(options)
      .where(and(eq(options.pollId, pollId), inArray(options.id, optionIds)));
    if (validOptions.length !== optionIds.length) {
      return NextResponse.json({ error: 'Invalid options' }, { status: 400 });
    }

    if (poll.type === 'single' && optionIds.length > 1) {
      return NextResponse.json({ error: 'Only one option allowed' }, { status: 400 });
    }

    const ipHash = hashIp(ip);

    await db.insert(votes).values(
      optionIds.map((optionId) => ({
        pollId, optionId,
        voterName: poll.anonymous ? null : (voterName || null),
        fingerprint, ipHash,
      }))
    );

    // Broadcast updated results via Ably
    const [allOptions, allVotes] = await Promise.all([
      db.select().from(options).where(eq(options.pollId, pollId)),
      db.select({ option_id: votes.optionId }).from(votes).where(eq(votes.pollId, pollId)),
    ]);

    const results = calcResults(
      allOptions.map((o) => ({ id: o.id, label: o.label, position: o.position })),
      allVotes
    );

    try {
      const channel = getAblyServer().channels.get(pollChannel(poll.shortId));
      await channel.publish(EVENTS.VOTE_CAST, { totalVotes: allVotes.length, results });
    } catch (ablyErr) {
      console.warn('[vote] Ably publish failed (non-fatal):', ablyErr);
    }

    return NextResponse.json(
      { success: true },
      { headers: { 'X-RateLimit-Remaining': String(rl.remaining) } }
    );
  } catch (err) {
    console.error('[POST /api/vote]', err);
    return NextResponse.json({ error: 'Failed to cast vote' }, { status: 500 });
  }
}
