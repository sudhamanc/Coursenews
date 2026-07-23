/**
 * GET /api/news  ->  /.netlify/functions/get-news
 *
 * Returns the cached "Latest in AI" feed produced by the scheduled
 * `news-refresh` function. Public and cacheable — it only exposes already-public
 * headlines and never touches the Anthropic key.
 */
import type { Handler } from '@netlify/functions';
import { readLatest } from '../lib/news';
import { json, error } from '../lib/http';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') return error(405, 'Method not allowed.');

  try {
    const feed = await readLatest();
    return json(200, feed ?? { generatedAt: null, items: [] }, {
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=1800',
    });
  } catch (err) {
    console.error('get-news error', err);
    return json(200, { generatedAt: null, items: [] }, { 'Cache-Control': 'public, max-age=60' });
  }
};
