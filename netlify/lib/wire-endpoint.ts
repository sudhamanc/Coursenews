/**
 * Shared GET handler for the /latest read endpoints (news, ecosystem,
 * briefing). Public and cacheable: they only expose already-public headlines
 * and never touch the Anthropic key or trigger any fetching.
 *
 *   GET /api/<wire>                    today's edition (the live blob)
 *   GET /api/<wire>?date=YYYY-MM-DD    an archived edition (30-day history)
 */
import type { Handler } from '@netlify/functions';
import { connectLambda } from '@netlify/blobs';
import { isEditionDate, utcDate } from './editions';
import { json, error } from './http';

// Serve repeat requests from Netlify's shared CDN cache without invoking the
// function. `durable` shares the cached copy across edge nodes, so a flood of
// reads costs one invocation per window rather than one each. Only `date`
// varies the cache key, so bots appending random query strings can't bust it.
const LIVE = {
  'Cache-Control': 'public, max-age=120, stale-while-revalidate=600',
  'Netlify-CDN-Cache-Control': 'public, durable, s-maxage=600, stale-while-revalidate=3600',
  'Netlify-Vary': 'query=date',
};
// A past day's edition never changes again.
const SETTLED = {
  'Cache-Control': 'public, max-age=86400',
  'Netlify-CDN-Cache-Control': 'public, durable, s-maxage=604800',
  'Netlify-Vary': 'query=date',
};

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
    connectLambda(event as any);

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
