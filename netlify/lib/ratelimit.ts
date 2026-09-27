/**
 * Daily message caps, backed by Netlify Blobs.
 *
 * Two counters keyed by UTC date, checked in order:
 *
 *   1. Per identifier (client IP) — stops one visitor monopolising the chat.
 *   2. Site-wide — a hard ceiling on total chat calls per day, whoever makes
 *      them. A per-IP cap alone does nothing against traffic spread across many
 *      IPs, and each call spends both function compute and Anthropic budget, so
 *      this is the limit that actually bounds the daily bill.
 *
 * Not a strict distributed limiter, but sufficient as a cost guardrail. Uses
 * optimistic concurrency (ETag) so parallel requests don't clobber a count.
 *
 * Fails CLOSED in production: if a counter cannot be read or settled, the call
 * is refused rather than let through uncounted. Under `netlify dev` (no linked
 * Blobs) it fails open so local development still works.
 */
import { getStore, type Store } from '@netlify/blobs';

const DAILY_CAP = Number(process.env.CHAT_DAILY_CAP || 100);
const GLOBAL_DAILY_CAP = Number(process.env.CHAT_GLOBAL_DAILY_CAP || 300);

const IS_LOCAL_DEV = process.env.NETLIFY_DEV === 'true';

function rateStore(): Store {
  return getStore('rate-limits');
}

function todayKey(identifier: string): string {
  const day = new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
  return `rate/${identifier}/${day}`;
}

export interface RateResult {
  allowed: boolean;
  remaining: number;
  cap: number;
}

type Outcome = 'allowed' | 'capped' | 'unsettled';

/** Try to increment one counter under `cap`. */
async function consume(store: Store, key: string, cap: number): Promise<{ outcome: Outcome; count: number }> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await store.getWithMetadata(key, { type: 'json' });
    const current = res && typeof (res.data as any)?.count === 'number' ? (res.data as any).count : 0;

    if (current >= cap) return { outcome: 'capped', count: current };

    try {
      const write = await store.setJSON(
        key,
        { count: current + 1 },
        res?.etag ? { onlyIfMatch: res.etag } : { onlyIfNew: true },
      );
      if (write.modified) return { outcome: 'allowed', count: current + 1 };
      // Lost the race — retry with a fresh read.
    } catch {
      // Fall through to retry.
    }
  }
  return { outcome: 'unsettled', count: 0 };
}

/** Check both caps and, if allowed, increment them. Returns whether the call may proceed. */
export async function consumeDailyQuota(identifier: string): Promise<RateResult> {
  const refused: RateResult = { allowed: false, remaining: 0, cap: DAILY_CAP };

  try {
    const store = rateStore();

    const visitor = await consume(store, todayKey(identifier), DAILY_CAP);
    if (visitor.outcome === 'capped') return refused;
    if (visitor.outcome === 'unsettled') return IS_LOCAL_DEV ? { allowed: true, remaining: 0, cap: DAILY_CAP } : refused;

    const site = await consume(store, todayKey('global'), GLOBAL_DAILY_CAP);
    if (site.outcome === 'capped') {
      console.warn(`chat: site-wide daily cap of ${GLOBAL_DAILY_CAP} reached`);
      return refused;
    }
    if (site.outcome === 'unsettled') return IS_LOCAL_DEV ? { allowed: true, remaining: 0, cap: DAILY_CAP } : refused;

    return { allowed: true, remaining: DAILY_CAP - visitor.count, cap: DAILY_CAP };
  } catch (err) {
    // Blobs unavailable. Locally that just means `netlify dev` without a linked
    // site; in production it means we cannot count, so we must not spend.
    if (IS_LOCAL_DEV) return { allowed: true, remaining: DAILY_CAP, cap: DAILY_CAP };
    console.error('chat: rate-limit store unavailable, refusing', err);
    return refused;
  }
}
