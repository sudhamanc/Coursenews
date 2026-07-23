/**
 * Scheduled: rebuilds the "Latest in AI" feed once a day at 13:00 UTC.
 * (Also invocable on demand from the Netlify UI for verification.)
 *
 * This is the only place besides chat that spends Anthropic budget — one ranking
 * call per run.
 */
import { schedule } from '@netlify/functions';
import { buildFeed, writeLatest } from '../lib/news';

export const handler = schedule('0 13 * * *', async () => {
  try {
    const feed = await buildFeed();
    await writeLatest(feed);
    console.log(`news-refresh: cached ${feed.items.length} items at ${feed.generatedAt}`);
  } catch (err) {
    console.error('news-refresh failed', err);
  }
  return { statusCode: 200 };
});
