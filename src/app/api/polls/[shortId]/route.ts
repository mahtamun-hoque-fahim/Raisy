import { NextRequest, NextResponse } from 'next/server';
import { db, polls, options, votes } from '@/db';
import { eq } from 'drizzle-orm';
import { calcResults } from '@/lib/utils';
import { getAblyServer, pollChannel, EVENTS } from '@/lib/ably';

export async function GET(
  _req: NextRequest,
  { params }: { params: { shortId: string } }
) {
  try {
    const poll = await db.query.polls.findFirst({
      where: eq(polls.shortId, params.shortId),
    });
    if (!poll) return NextResponse.json({ error: 'Poll not found' }, { status: 404 });

    // Auto-close if deadline passed
    if (poll.deadline && new Date() > poll.deadline && !poll.closed) {
      await db.update(polls).set({ closed: true }).where(eq(polls.id, poll.id));
      poll.closed = true;
    }

    const pollOptions = await db.query.options.findMany({
      where: eq(options.pollId, poll.id),
      orderBy: (o, { asc }) => [asc(o.position)],
    });

    const pollVotes = await db
      .select({ option_id: votes.optionId })
      .from(votes)
      .where(eq(votes.pollId, poll.id));

    const results = calcResults(
      pollOptions.map((o) => ({ id: o.id, label: o.label, position: o.position })),
      pollVotes
    );

    return NextResponse.json({
      id: poll.id,
      shortId: poll.shortId,
      question: poll.question,
      type: poll.type,
      anonymous: poll.anonymous,
      deadline: poll.deadline,
      closed: poll.closed,
      createdAt: poll.createdAt,
      totalVotes: pollVotes.length,
      results,
    });
  } catch (err) {
    console.error('[GET /api/polls/[shortId]]', err);
    return NextResponse.json({ error: 'Failed to fetch poll' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { shortId: string } }
) {
  try {
    const { creatorToken } = await req.json();
    const poll = await db.query.polls.findFirst({
      where: eq(polls.shortId, params.shortId),
    });
    if (!poll) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (poll.creatorToken !== creatorToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await db.update(polls).set({ closed: true }).where(eq(polls.id, poll.id));

    // Broadcast poll-closed event
    try {
      const channel = getAblyServer().channels.get(pollChannel(params.shortId));
      await channel.publish(EVENTS.POLL_CLOSED, { closed: true });
    } catch (ablyErr) {
      console.warn('[close] Ably publish failed (non-fatal):', ablyErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[PATCH /api/polls/[shortId]]', err);
    return NextResponse.json({ error: 'Failed to close poll' }, { status: 500 });
  }
}
