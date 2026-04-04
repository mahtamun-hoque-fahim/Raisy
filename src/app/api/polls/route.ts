import { NextRequest, NextResponse } from 'next/server';
import { db, polls, options } from '@/db';
import { CreatePollSchema } from '@/lib/validations';
import { nanoid } from 'nanoid';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreatePollSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { question, options: optionLabels, type, anonymous, deadlineHours } = parsed.data;

    const shortId = nanoid(8);
    const creatorToken = randomUUID();

    let deadline: Date | null = null;
    if (deadlineHours && deadlineHours > 0) {
      deadline = new Date(Date.now() + deadlineHours * 3600 * 1000);
    }

    // Insert poll
    const [poll] = await db
      .insert(polls)
      .values({ shortId, question, type, anonymous, deadline, creatorToken })
      .returning();

    // Insert options
    const optionRows = optionLabels.map((label, i) => ({
      pollId: poll.id,
      label: label.trim(),
      position: i,
    }));

    await db.insert(options).values(optionRows);

    return NextResponse.json({
      pollId: poll.id,
      shortId: poll.shortId,
      creatorToken: poll.creatorToken,
      url: `${process.env.NEXT_PUBLIC_APP_URL}/poll/${poll.shortId}`,
    });
  } catch (err) {
    console.error('[POST /api/polls]', err);
    return NextResponse.json({ error: 'Failed to create poll' }, { status: 500 });
  }
}
