/**
 * GET /api/briefing[?date=YYYY-MM-DD]  ->  /.netlify/functions/get-briefing
 *
 * The "Agentic AI Intelligence Briefing" produced by `briefing-refresh`.
 * Briefings publish on weekdays only, so a dated request returns the newest
 * briefing on or before that day; the page labels it with its own date.
 */
import { readBriefing, type Briefing } from '../lib/briefing';
import { readEditionOnOrBefore } from '../lib/editions';
import { wireEndpoint } from '../lib/wire-endpoint';

export const handler = wireEndpoint<Briefing>({
  name: 'get-briefing',
  readLive: readBriefing,
  readDated: (date) => readEditionOnOrBefore<Briefing>('briefing', date),
  empty: null,
});
