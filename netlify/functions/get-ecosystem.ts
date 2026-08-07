/**
 * GET /api/ecosystem  ->  /.netlify/functions/get-ecosystem
 *
 * Returns the cached "Ecosystem" wire produced by the scheduled `news-refresh`
 * function. Public and cacheable — like get-news it only exposes already-public
 * headlines and never touches the Anthropic key.
 */
import type { Handler } from '@netlify/functions';
import { connectLambda } from '@netlify/blobs';
import { readEcosystem } from '../lib/ecosystem';
import { json, error } from '../lib/http';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') return error(405, 'Method not allowed.');
  connectLambda(event as any);

  try {
    const feed = await readEcosystem();
    return json(200, feed ?? { generatedAt: null, items: [] }, {
      'Cache-Control': 'public, max-age=120, stale-while-revalidate=600',
    });
  } catch (err) {
    console.error('get-ecosystem error', err);
    return json(200, { generatedAt: null, items: [] }, { 'Cache-Control': 'public, max-age=60' });
  }
};
