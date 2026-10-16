/**
 * GET /api/news[?date=YYYY-MM-DD]  ->  /.netlify/functions/get-news
 *
 * The research wire produced by the scheduled `news-refresh` function: today's
 * by default, or an archived day's.
 */
import { readLatest, type NewsFeed } from '../lib/news';
import { readEdition } from '../lib/editions';
import { wireEndpoint } from '../lib/wire-endpoint';

export const handler = wireEndpoint<NewsFeed>({
  name: 'get-news',
  readLive: readLatest,
  readDated: (date) => readEdition<NewsFeed>('research', date),
  empty: { generatedAt: null, items: [] },
});
