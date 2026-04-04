import { NextRequest, NextResponse } from 'next/server';
import { db, polls, options, votes } from '@/db';
import { eq } from 'drizzle-orm';
import { calcResults } from '@/lib/utils';

/**
 * GET /api/polls/[shortId]/export?format=csv|json
 * Returns poll results as CSV or JSON.
 * No auth required — results are already public.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { shortId: string } }
) {
  const format = req.nextUrl.searchParams.get('format') ?? 'csv';

  try {
    const poll = await db.query.polls.findFirst({
      where: eq(polls.shortId, params.shortId),
    });
    if (!poll) return NextResponse.json({ error: 'Poll not found' }, { status: 404 });

    const pollOptions = await db.query.options.findMany({
      where: eq(options.pollId, poll.id),
      orderBy: (o, { asc }) => [asc(o.position)],
    });

    const allVotes = await db
      .select({
        option_id: votes.optionId,
        voter_name: votes.voterName,
        created_at: votes.createdAt,
      })
      .from(votes)
      .where(eq(votes.pollId, poll.id))
      .orderBy(votes.createdAt);

    const results = calcResults(
      pollOptions.map((o) => ({ id: o.id, label: o.label, position: o.position })),
      allVotes.map((v) => ({ option_id: v.option_id }))
    );

    const optionMap = Object.fromEntries(pollOptions.map((o) => [o.id, o.label]));

    // ── JSON ──────────────────────────────────────────────────────────────
    if (format === 'json') {
      const payload = {
        poll: {
          question: poll.question,
          type: poll.type,
          anonymous: poll.anonymous,
          closed: poll.closed,
          deadline: poll.deadline,
          createdAt: poll.createdAt,
          shortId: poll.shortId,
          totalVotes: allVotes.length,
        },
        results,
        votes: poll.anonymous
          ? allVotes.map((v) => ({
              option: optionMap[v.option_id],
              timestamp: v.created_at,
            }))
          : allVotes.map((v) => ({
              voter: v.voter_name || 'Anonymous',
              option: optionMap[v.option_id],
              timestamp: v.created_at,
            })),
      };

      return new NextResponse(JSON.stringify(payload, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="raisy-${params.shortId}.json"`,
        },
      });
    }

    // ── CSV ───────────────────────────────────────────────────────────────
    const escape = (val: string | null | undefined) =>
      `"${String(val ?? '').replace(/"/g, '""')}"`;

    const lines: string[] = [];

    // Summary header
    lines.push('RAISY POLL EXPORT');
    lines.push(`Question,${escape(poll.question)}`);
    lines.push(`Type,${escape(poll.type)}`);
    lines.push(`Anonymous,${poll.anonymous}`);
    lines.push(`Total Votes,${allVotes.length}`);
    lines.push(`Status,${poll.closed ? 'Closed' : 'Open'}`);
    lines.push(`Created,${new Date(poll.createdAt).toISOString()}`);
    if (poll.deadline) lines.push(`Deadline,${new Date(poll.deadline).toISOString()}`);
    lines.push('');

    // Results summary
    lines.push('RESULTS SUMMARY');
    lines.push('Option,Votes,Percentage');
    for (const r of results) {
      lines.push(`${escape(r.label)},${r.count},${r.percentage}%`);
    }
    lines.push('');

    // Individual votes
    lines.push('INDIVIDUAL VOTES');
    if (poll.anonymous) {
      lines.push('Option,Timestamp');
      for (const v of allVotes) {
        lines.push(`${escape(optionMap[v.option_id])},${new Date(v.created_at!).toISOString()}`);
      }
    } else {
      lines.push('Voter,Option,Timestamp');
      for (const v of allVotes) {
        lines.push(
          `${escape(v.voter_name || 'Anonymous')},${escape(optionMap[v.option_id])},${new Date(v.created_at!).toISOString()}`
        );
      }
    }

    const csv = lines.join('\r\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="raisy-${params.shortId}.csv"`,
      },
    });
  } catch (err) {
    console.error('[GET /api/polls/[shortId]/export]', err);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
