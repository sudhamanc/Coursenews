/**
 * Daily message cap, backed by Netlify Blobs.
 *
 * A simple counter keyed by an identifier (client IP) + UTC date. Not a strict
 * distributed limiter, but sufficient as a cost guardrail: once the cap is hit
 * the chat function returns 429 until the next UTC day. Uses optimistic
 * concurrency (ETag) so parallel requests don't clobber the count. If Blobs is
 * unavailable (e.g. local dev without a linked site), it fails open.
 */
import { getStore, type Store } from '@netlify/blobs';

const DAILY_CAP = Number(process.env.CHAT_DAILY_CAP || 100);

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

/** Check the cap and, if allowed, increment. Returns whether the call may proceed. */
export async function consumeDailyQuota(identifier: string): Promise<RateResult> {
  const key = todayKey(identifier);

  try {
    const store = rateStore();
    for (let attempt = 0; attempt < 3; attempt++) {
      const res = await store.getWithMetadata(key, { type: 'json' });
      const current = res && typeof (res.data as any)?.count === 'number' ? (res.data as any).count : 0;

      if (current >= DAILY_CAP) {
        return { allowed: false, remaining: 0, cap: DAILY_CAP };
      }

      try {
        const write = await store.setJSON(
          key,
          { count: current + 1 },
          res?.etag ? { onlyIfMatch: res.etag } : { onlyIfNew: true },
        );
        if (write.modified) {
          return { allowed: true, remaining: DAILY_CAP - (current + 1), cap: DAILY_CAP };
        }
        // Lost the race — retry with a fresh read.
      } catch {
        // Fall through to retry.
      }
    }
  } catch {
    // Blobs unavailable (e.g. unlinked local dev) — fail open so chat still works.
    return { allowed: true, remaining: DAILY_CAP, cap: DAILY_CAP };
  }

  // If we couldn't settle the counter after retries, fail open but conservatively.
  return { allowed: true, remaining: 0, cap: DAILY_CAP };
}
