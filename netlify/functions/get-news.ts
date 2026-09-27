/**
 * GET /api/news  ->  /.netlify/functions/get-news
 *
 * Returns the cached "Latest in AI" feed produced by the scheduled
 * `news-refresh` function. Public and cacheable — it only exposes already-public
 * headlines and never touches the Anthropic key.
 */
import type { Handler } from '@netlify/functions';
import { connectLambda } from '@netlify/blobs';
import { readLatest } from '../lib/news';
import { json, error } from '../lib/http';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') return error(405, 'Method not allowed.');
  connectLambda(event as any);

  try {
    const feed = await readLatest();
    return json(200, feed ?? { generatedAt: null, items: [] }, {
      'Cache-Control': 'public, max-age=120, stale-while-revalidate=600',
      // Serve repeat requests from Netlify's shared CDN cache without invoking
      // this function. `durable` shares the cached copy across edge nodes, so a
      // flood of reads costs one invocation per window rather than one each.
      // The wire only changes once a day, so ten minutes of staleness is free.
      'Netlify-CDN-Cache-Control': 'public, durable, s-maxage=600, stale-while-revalidate=3600',
    });
  } catch (err) {
    console.error('get-news error', err);
    return json(200, { generatedAt: null, items: [] }, { 'Cache-Control': 'public, max-age=60' });
  }
};
