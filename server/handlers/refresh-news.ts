/**
 * GET|POST /api/refresh-news
 *
 * On-demand trigger for the /latest refresh jobs (the scheduler runs them
 * daily; this lets you populate them immediately). Protected by a shared
 * secret so it can't be hit anonymously to burn Anthropic budget:
 *
 *   SSM SecureString:  NEWS_REFRESH_KEY = <some long random string>
 *   Call:  https://<site>/api/refresh-news?key=<secret>[&wire=research|ecosystem|both|briefing]
 *          (or send header  X-Refresh-Key: <secret>)
 *
 * If NEWS_REFRESH_KEY is not set, the endpoint is disabled (503).
 */
import type { Handler } from '../lib/types';
import { timingSafeEqual } from 'node:crypto';
import { refreshWires, refreshBriefing, type WireChoice } from '../lib/jobs';
import { json, error } from '../lib/http';

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

  // ?wire=research | ecosystem | both (default) | briefing. Lets you re-rank one
  // wire without spending Anthropic calls on the others. `both` means the two
  // wires; the briefing is only rebuilt when asked for by name.
  const wire = (event.queryStringParameters?.wire ?? 'both').toLowerCase();
  if (!['research', 'ecosystem', 'both', 'briefing'].includes(wire)) {
    return error(400, 'wire must be research, ecosystem, both, or briefing.');
  }

  try {
    if (wire === 'briefing') return json(200, { ok: true, briefing: await refreshBriefing() });
    const wires = await refreshWires(wire as WireChoice);
    const failed = Object.values(wires).some((w) => 'error' in w);
    return json(failed ? 502 : 200, { ok: !failed, ...wires });
  } catch (err) {
    console.error('manual refresh failed', err);
    return error(502, 'Refresh failed.');
  }
};
