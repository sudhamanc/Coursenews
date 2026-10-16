/**
 * Scheduled: rebuilds both /latest wires — research and ecosystem — once a day
 * at 13:00 UTC.
 * (Also invocable on demand from the Netlify UI for verification.)
 *
 * Ranking spends Anthropic budget: one Haiku call for the research wire and two
 * for the ecosystem wire (one per lane), so three per run. The briefing has its
 * own scheduled function (briefing-refresh).
 *
 * Each wire is also archived under its date for the 30-day edition history.
 */
import { schedule } from '@netlify/functions';
import { connectLambda } from '@netlify/blobs';
import { buildFeed, writeLatest } from '../lib/news';
import { buildEcosystemFeed, writeEcosystem } from '../lib/ecosystem';
import { archiveEdition, pruneEditions } from '../lib/editions';

export const handler = schedule('0 13 * * *', async (event) => {
  connectLambda(event as any);
  // The two wires are independent: a failure in one must not blank the other.
  const [research, ecosystem] = await Promise.allSettled([
    (async () => {
      const feed = await buildFeed();
      await writeLatest(feed);
      await archiveEdition('research', feed);
      return feed.items.length;
    })(),
    (async () => {
      const feed = await buildEcosystemFeed();
      await writeEcosystem(feed);
      await archiveEdition('ecosystem', feed);
      return feed.items.length;
    })(),
  ]);

  if (research.status === 'fulfilled') console.log(`news-refresh: research wire cached ${research.value} items`);
  else console.error('news-refresh: research wire failed', research.reason);

  if (ecosystem.status === 'fulfilled') console.log(`news-refresh: ecosystem wire cached ${ecosystem.value} items`);
  else console.error('news-refresh: ecosystem wire failed', ecosystem.reason);

  await pruneEditions().catch((err) => console.error('news-refresh: prune failed', err));
  return { statusCode: 200 };
});
