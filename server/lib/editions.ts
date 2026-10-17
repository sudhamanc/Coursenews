/**
 * The /latest archive: one dated copy of each wire per day, kept for 30 days.
 *
 * The live keys (`latest.json`, `ecosystem.json`, `briefing.json`) stay the
 * source of truth for "today"; this module only adds dated snapshots beside
 * them, so the current page never depends on the archive working.
 *
 *   editions/<kind>/<YYYY-MM-DD>.json   (date = UTC day of `generatedAt`)
 *
 * A re-run on the same day overwrites that day's snapshot.
 */
import { getStore, type Store } from './store';

export type EditionKind = 'research' | 'ecosystem' | 'briefing';
export const EDITION_KINDS: EditionKind[] = ['research', 'ecosystem', 'briefing'];

export const KEEP_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export const isEditionDate = (s: unknown): s is string =>
  typeof s === 'string' && DATE.test(s) && !isNaN(Date.parse(`${s}T00:00:00Z`));

/** UTC calendar day of an ISO timestamp. */
export const utcDate = (iso: string | number | Date): string => new Date(iso).toISOString().slice(0, 10);

function store(): Store {
  return getStore('news');
}

const keyFor = (kind: EditionKind, date: string) => `editions/${kind}/${date}.json`;

export async function archiveEdition(kind: EditionKind, feed: { generatedAt: string }): Promise<void> {
  await store().setJSON(keyFor(kind, utcDate(feed.generatedAt)), feed);
}

export async function readEdition<T>(kind: EditionKind, date: string): Promise<T | null> {
  return (await store().get(keyFor(kind, date), { type: 'json' })) as T | null;
}

/** Every archived (kind, date) pair, parsed from the blob keys. */
async function listKeys(): Promise<Array<{ key: string; kind: EditionKind; date: string }>> {
  const { blobs } = await store().list({ prefix: 'editions/' });
  const out: Array<{ key: string; kind: EditionKind; date: string }> = [];
  for (const b of blobs) {
    const m = /^editions\/(research|ecosystem|briefing)\/(\d{4}-\d{2}-\d{2})\.json$/.exec(b.key);
    if (m) out.push({ key: b.key, kind: m[1] as EditionKind, date: m[2] });
  }
  return out;
}

/** Archived days, newest first, with the wires each day has. */
export async function listEditions(): Promise<Array<{ date: string; kinds: EditionKind[] }>> {
  const byDate = new Map<string, EditionKind[]>();
  for (const { kind, date } of await listKeys()) {
    byDate.set(date, [...(byDate.get(date) ?? []), kind]);
  }
  return [...byDate.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, kinds]) => ({ date, kinds: EDITION_KINDS.filter((k) => kinds.includes(k)) }));
}

/**
 * The newest edition of `kind` on or before `date`. Briefings publish on
 * weekdays only, so a Saturday edition shows Friday's briefing.
 */
export async function readEditionOnOrBefore<T>(kind: EditionKind, date: string): Promise<T | null> {
  const dates = (await listKeys())
    .filter((k) => k.kind === kind && k.date <= date)
    .map((k) => k.date)
    .sort();
  const pick = dates[dates.length - 1];
  return pick ? readEdition<T>(kind, pick) : null;
}

/** Delete snapshots older than KEEP_DAYS (today counts as day one). */
export async function pruneEditions(): Promise<number> {
  const cutoff = utcDate(Date.now() - (KEEP_DAYS - 1) * DAY_MS);
  const stale = (await listKeys()).filter((k) => k.date < cutoff);
  await Promise.all(stale.map((k) => store().delete(k.key)));
  return stale.length;
}
