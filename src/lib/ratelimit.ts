/**
 * Sliding window rate limiter using in-memory store.
 * On Vercel serverless each function instance has its own memory,
 * so this is best-effort. For true distributed rate limiting,
 * swap the store for Upstash Redis (see comments below).
 *
 * Upstash Redis upgrade path:
 *   npm install @upstash/ratelimit @upstash/redis
 *   import { Ratelimit } from "@upstash/ratelimit";
 *   import { Redis } from "@upstash/redis";
 *   const ratelimit = new Ratelimit({
 *     redis: Redis.fromEnv(),
 *     limiter: Ratelimit.slidingWindow(10, "1 m"),
 *   });
 */

interface Window {
  hits: number[];
}

const store = new Map<string, Window>();

// Clean up old entries every 5 minutes to avoid memory growth
setInterval(() => {
  const cutoff = Date.now() - 120_000;
  for (const [key, win] of store.entries()) {
    if (win.hits.every((t) => t < cutoff)) store.delete(key);
  }
}, 300_000);

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInMs: number;
}

export function checkRateLimit(
  key: string,
  opts = { max: 10, windowMs: 60_000 }
): RateLimitResult {
  const now = Date.now();
  const win = store.get(key) ?? { hits: [] };

  // Prune expired hits
  win.hits = win.hits.filter((t) => now - t < opts.windowMs);
  win.hits.push(now);
  store.set(key, win);

  const remaining = Math.max(0, opts.max - win.hits.length);
  const oldest = win.hits[0] ?? now;
  const resetInMs = opts.windowMs - (now - oldest);

  return {
    allowed: win.hits.length <= opts.max,
    remaining,
    resetInMs,
  };
}
