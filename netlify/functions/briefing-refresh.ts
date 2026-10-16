/**
 * Scheduled: writes the "Agentic AI Intelligence Briefing" on weekdays at
 * 13:30 UTC, half an hour after the two wires (news-refresh).
 * (Also invocable on demand via /api/refresh-news?wire=briefing.)
 *
 * Kept separate from news-refresh so the briefing's one Sonnet call gets its
 * own 30 s budget. A quiet day (or any failure) publishes nothing and leaves
 * the previous briefing current.
 */
import { schedule } from '@netlify/functions';
import { connectLambda } from '@netlify/blobs';
import { buildBriefing, writeBriefing } from '../lib/briefing';
import { archiveEdition, pruneEditions } from '../lib/editions';
import { purgeLatest } from '../lib/wire-endpoint';

export const handler = schedule('30 13 * * 1-5', async (event) => {
  connectLambda(event as any);
  const t0 = Date.now();
  try {
    const briefing = await buildBriefing();
    if (!briefing) {
      console.log('briefing-refresh: nothing published; previous briefing stays current');
    } else {
      await writeBriefing(briefing);
      await archiveEdition('briefing', briefing);
      console.log(`briefing-refresh: published ${briefing.developments.length} developments in ${Date.now() - t0} ms`);
    }
    await pruneEditions();
    await purgeLatest();
  } catch (err) {
    console.error('briefing-refresh failed', err);
  }
  return { statusCode: 200 };
});
