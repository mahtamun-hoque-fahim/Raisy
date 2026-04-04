import { clsx, type ClassValue } from 'clsx';
import { createHash } from 'crypto';

// ── CLASSNAME MERGE ────────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// ── IP HASH (server-side) ──────────────────────────────────────────────────
export function hashIp(ip: string): string {
  return createHash('sha256').update(ip + process.env.IP_SALT || 'raisy-salt').digest('hex').slice(0, 16);
}

// ── POLL RESULT CALCULATION ────────────────────────────────────────────────
export interface OptionResult {
  id: string;
  label: string;
  position: number;
  count: number;
  percentage: number;
}

export function calcResults(
  options: { id: string; label: string; position: number }[],
  votes: { option_id: string }[]
): OptionResult[] {
  const total = votes.length;
  const counts = votes.reduce<Record<string, number>>((acc, v) => {
    acc[v.option_id] = (acc[v.option_id] || 0) + 1;
    return acc;
  }, {});

  return options
    .sort((a, b) => a.position - b.position)
    .map((opt) => ({
      id: opt.id,
      label: opt.label,
      position: opt.position,
      count: counts[opt.id] || 0,
      percentage: total > 0 ? Math.round(((counts[opt.id] || 0) / total) * 100) : 0,
    }));
}

// ── FORMAT RELATIVE TIME ───────────────────────────────────────────────────
export function formatDeadline(deadline: Date | null): string | null {
  if (!deadline) return null;
  const now = Date.now();
  const diff = deadline.getTime() - now;
  if (diff <= 0) return 'Closed';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 24) return `${Math.floor(h / 24)}d left`;
  if (h > 0) return `${h}h ${m}m left`;
  return `${m}m left`;
}
