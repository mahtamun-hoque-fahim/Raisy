import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

/**
 * GET /api/health
 * Used by Vercel uptime monitors and external health checkers.
 * Returns DB connectivity status.
 */
export async function GET() {
  const start = Date.now();
  try {
    await db.execute(sql`SELECT 1`);
    return NextResponse.json({
      status: 'ok',
      db: 'connected',
      latencyMs: Date.now() - start,
      timestamp: new Date().toISOString(),
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local',
    });
  } catch (err) {
    return NextResponse.json(
      {
        status: 'error',
        db: 'unreachable',
        error: err instanceof Error ? err.message : 'Unknown',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
