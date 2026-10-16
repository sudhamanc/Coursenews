/**
 * GET|POST /api/refresh-news  ->  /.netlify/functions/refresh-news
 *
 * On-demand trigger for the /latest wires (the scheduled `news-refresh`
 * runs daily; this lets you populate it immediately). Protected by a shared
 * secret so it can't be hit anonymously to burn Anthropic budget:
 *
 *   Netlify env var:  NEWS_REFRESH_KEY = <some long random string>
 *   Call:  https://<site>/api/refresh-news?key=<secret>[&wire=research|ecosystem|both|briefing]
 *          (or send header  X-Refresh-Key: <secret>)
 *
 * If NEWS_REFRESH_KEY is not set, the endpoint is disabled (503).
 */
import type { Handler } from '@netlify/functions';
import { connectLambda } from '@netlify/blobs';
import { timingSafeEqual } from 'node:crypto';
import { buildFeed, writeLatest } from '../lib/news';
import { buildEcosystemFeed, writeEcosystem } from '../lib/ecosystem';
import { buildBriefing, writeBriefing } from '../lib/briefing';
import { archiveEdition, pruneEditions } from '../lib/editions';
import { json, error } from '../lib/http';
import { purgeLatest } from '../lib/wire-endpoint';

function keyMatches(provided: string | undefined): boolean {
  const secret = process.env.NEWS_REFRESH_KEY;
  if (!secret || !provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET' && event.httpMethod !== 'POST') {
    return error(405, 'Method not allowed.');
  }
  if (!process.env.NEWS_REFRESH_KEY) {
    return error(503, 'Manual refresh is not configured (set NEWS_REFRESH_KEY).');
  }

  const provided = event.headers['x-refresh-key'] || event.queryStringParameters?.key || undefined;
  if (!keyMatches(provided)) return error(401, 'Unauthorized.');

  connectLambda(event as any);

  // ?wire=research | ecosystem | both (default) | briefing. Lets you re-rank one
  // wire without spending Anthropic calls on the others. `both` means the two
  // wires; the briefing is only rebuilt when asked for by name.
  const wire = (event.queryStringParameters?.wire ?? 'both').toLowerCase();
  if (!['research', 'ecosystem', 'both', 'briefing'].includes(wire)) {
    return error(400, 'wire must be research, ecosystem, both, or briefing.');
  }

  const out: Record<string, unknown> = { ok: true };
  try {
    if (wire === 'briefing') {
      const b = await buildBriefing();
      if (b) {
        await writeBriefing(b);
        await archiveEdition('briefing', b);
      }
      out.briefing = b
        ? { developments: b.developments.length, candidates: b.candidates, generatedAt: b.generatedAt }
        : { published: false };
      await purgeLatest();
      return json(200, out);
    }
    if (wire !== 'ecosystem') {
      const feed = await buildFeed();
      await writeLatest(feed);
      await archiveEdition('research', feed);
      out.research = { items: feed.items.length, generatedAt: feed.generatedAt };
    }
    if (wire !== 'research') {
      const feed = await buildEcosystemFeed();
      await writeEcosystem(feed);
      await archiveEdition('ecosystem', feed);
      out.ecosystem = { items: feed.items.length, generatedAt: feed.generatedAt };
    }
    await pruneEditions();
    await purgeLatest();
    return json(200, out);
  } catch (err) {
    console.error('manual refresh failed', err);
    return error(502, 'Refresh failed.');
  }
};
