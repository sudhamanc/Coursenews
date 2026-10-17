/**
 * Shared GET handler for the /latest read endpoints (news, ecosystem,
 * briefing). Public and cacheable: they only expose already-public headlines
 * and never touch the Anthropic key or trigger any fetching.
 *
 *   GET /api/<wire>                    today's edition (the live blob)
 *   GET /api/<wire>?date=YYYY-MM-DD    an archived edition (30-day history)
 */
import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';
import type { Handler } from './types';
import { isEditionDate, utcDate } from './editions';
import { json, error } from './http';

// Serve repeat requests from CloudFront's cache without invoking the function:
// `s-maxage` is CloudFront's TTL, so a flood of reads costs one invocation per
// window rather than one each. The cache key is only the `date` query (see the
// CDK cache policy), so bots appending random query strings can't bust it.
// Every refresh invalidates these paths (purgeLatest), so new content shows at
// once instead of after the ten-minute window. Browsers keep no copy of their
// own (max-age=0): an invalidation can't reach a browser's cache, and every
// reload is served by CloudFront anyway, so it costs no invocations.
export const LIVE = {
  'Cache-Control': 'public, max-age=0, s-maxage=600, stale-while-revalidate=3600',
};
// A past day's edition never changes again.
const SETTLED = {
  'Cache-Control': 'public, max-age=86400, s-maxage=604800',
};

/** The live /latest endpoints, as CloudFront invalidation paths. */
const LIVE_PATHS = ['/api/news*', '/api/ecosystem*', '/api/briefing*', '/api/editions*'];

let cloudfront: CloudFrontClient | null = null;

/**
 * Drop CloudFront's cached copies of the live /latest responses after a
 * refresh. Best-effort: a failed purge only means the old copy lives out its
 * window. Four paths per refresh stays far inside the 1,000 free a month.
 */
export async function purgeLatest(): Promise<void> {
  const id = process.env.DISTRIBUTION_ID;
  if (!id) return; // local dev: no CDN in front
  try {
    await (cloudfront ??= new CloudFrontClient({})).send(
      new CreateInvalidationCommand({
        DistributionId: id,
        InvalidationBatch: {
          CallerReference: `latest-${Date.now()}`,
          Paths: { Quantity: LIVE_PATHS.length, Items: LIVE_PATHS },
        },
      }),
    );
  } catch (err) {
    console.error('purgeLatest failed', err);
  }
}

export function wireEndpoint<T>(opts: {
  name: string;
  readLive: () => Promise<T | null>;
  readDated: (date: string) => Promise<T | null>;
  empty: unknown;
}): Handler {
  return async (event) => {
    if (event.httpMethod !== 'GET') return error(405, 'Method not allowed.');
    const date = event.queryStringParameters?.date;
    if (date !== undefined && !isEditionDate(date)) {
      return json(400, { error: 'date must be YYYY-MM-DD.' }, SETTLED);
    }

    try {
      if (date === undefined) return json(200, (await opts.readLive()) ?? opts.empty, LIVE);
      const data = await opts.readDated(date);
      // Today's (or a missing) edition can still be written by a later run.
      const settled = data !== null && date < utcDate(Date.now());
      return json(200, data ?? opts.empty, settled ? SETTLED : LIVE);
    } catch (err) {
      console.error(`${opts.name} error`, err);
      return json(200, opts.empty, { 'Cache-Control': 'public, max-age=60' });
    }
  };
}
