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
 *
 * On AWS the work is handed to the jobs function (JOBS_FUNCTION_NAME) and the
 * call answers 202 at once: a research refresh takes 40-60s, past this API
 * function's 30s limit, and the jobs function has 120s. Locally it runs inline
 * and answers with the result.
 */
import type { Handler } from '../lib/types';
import { timingSafeEqual } from 'node:crypto';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { refreshWires, refreshBriefing, type WireChoice } from '../lib/jobs';
import { json, error } from '../lib/http';

let lambda: LambdaClient | null = null;

/** Start the job asynchronously on the jobs function, which logs its outcome. */
async function handOff(fn: string, payload: { job: 'news' | 'briefing'; wire?: WireChoice }): Promise<void> {
  lambda ??= new LambdaClient({});
  await lambda.send(
    new InvokeCommand({ FunctionName: fn, InvocationType: 'Event', Payload: Buffer.from(JSON.stringify(payload)) }),
  );
}

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
    const jobsFn = process.env.JOBS_FUNCTION_NAME;
    if (jobsFn) {
      await handOff(jobsFn, wire === 'briefing' ? { job: 'briefing' } : { job: 'news', wire: wire as WireChoice });
      return json(202, { ok: true, started: wire, note: 'Running on the jobs function; see its logs for the result.' });
    }
    if (wire === 'briefing') return json(200, { ok: true, briefing: await refreshBriefing() });
    const wires = await refreshWires(wire as WireChoice);
    const failed = Object.values(wires).some((w) => 'error' in w);
    return json(failed ? 502 : 200, { ok: !failed, ...wires });
  } catch (err) {
    console.error('manual refresh failed', err);
    return error(502, 'Refresh failed.');
  }
};
