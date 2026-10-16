/**
 * GET /api/editions  ->  /.netlify/functions/get-editions
 *
 * The days in the /latest archive (newest first, at most 30), for the page's
 * edition picker.
 */
import type { Handler } from '@netlify/functions';
import { connectLambda } from '@netlify/blobs';
import { listEditions } from '../lib/editions';
import { json, error } from '../lib/http';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') return error(405, 'Method not allowed.');
  connectLambda(event as any);
  try {
    return json(200, { editions: await listEditions() }, {
      'Cache-Control': 'public, max-age=120, stale-while-revalidate=600',
      'Netlify-CDN-Cache-Control': 'public, durable, s-maxage=600, stale-while-revalidate=3600',
    });
  } catch (err) {
    console.error('get-editions error', err);
    return json(200, { editions: [] }, { 'Cache-Control': 'public, max-age=60' });
  }
};
