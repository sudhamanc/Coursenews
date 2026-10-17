/**
 * GET /api/ecosystem[?date=YYYY-MM-DD]
 *
 * The "Ecosystem" wire produced by the scheduled news job (server/lib/jobs.ts):
 * today's by default, or an archived day's.
 */
import { readEcosystem, type EcoFeed } from '../lib/ecosystem';
import { readEdition } from '../lib/editions';
import { wireEndpoint } from '../lib/wire-endpoint';

export const handler = wireEndpoint<EcoFeed>({
  name: 'get-ecosystem',
  readLive: readEcosystem,
  readDated: (date) => readEdition<EcoFeed>('ecosystem', date),
  empty: { generatedAt: null, items: [] },
});
