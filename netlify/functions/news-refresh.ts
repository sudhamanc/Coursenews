/**
 * Scheduled: rebuilds both /latest wires — research and ecosystem — once a day
 * at 13:00 UTC.
 * (Also invocable on demand from the Netlify UI for verification.)
 *
 * This is the only place besides chat that spends Anthropic budget — one ranking
 * call per wire, so two per run.
 */
import { schedule } from '@netlify/functions';
import { connectLambda } from '@netlify/blobs';
import { buildFeed, writeLatest } from '../lib/news';
import { buildEcosystemFeed, writeEcosystem } from '../lib/ecosystem';

export const handler = schedule('0 13 * * *', async (event) => {
  connectLambda(event as any);
  // The two wires are independent: a failure in one must not blank the other.
  const [research, ecosystem] = await Promise.allSettled([
    (async () => {
      const feed = await buildFeed();
      await writeLatest(feed);
      return feed.items.length;
    })(),
    (async () => {
      const feed = await buildEcosystemFeed();
      await writeEcosystem(feed);
      return feed.items.length;
    })(),
  ]);

  if (research.status === 'fulfilled') console.log(`news-refresh: research wire cached ${research.value} items`);
  else console.error('news-refresh: research wire failed', research.reason);

  if (ecosystem.status === 'fulfilled') console.log(`news-refresh: ecosystem wire cached ${ecosystem.value} items`);
  else console.error('news-refresh: ecosystem wire failed', ecosystem.reason);
  return { statusCode: 200 };
});
