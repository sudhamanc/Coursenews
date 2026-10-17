/**
 * Shared plumbing for the /latest wires: polite fetching with timeouts, bounded
 * concurrency, and a tolerant RSS/Atom reader. Every helper here returns an
 * empty result rather than throwing, so one dead source never takes a wire down.
 */
import { XMLParser } from 'fast-xml-parser';

/**
 * Reddit rejects unfamiliar user agents on its feed endpoints, so identify the
 * client honestly but with the conventional Mozilla-compatible prefix.
 */
export const UA = 'Mozilla/5.0 (compatible; LatentInferenceBot/1.0; +https://github.com/sudhamanc/Coursenews)';

export const withTimeout = (ms: number) => {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  return { signal: c.signal, done: () => clearTimeout(t) };
};

export async function getText(url: string, ms = 8000): Promise<string | null> {
  const to = withTimeout(ms);
  try {
    const res = await fetch(url, { signal: to.signal, headers: { 'User-Agent': UA } });
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  } finally {
    to.done();
  }
}

/** Run `jobs` with bounded concurrency so a long source list can't stall the function. */
export async function pool<T>(jobs: Array<() => Promise<T>>, limit = 6): Promise<T[]> {
  const out: T[] = [];
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, jobs.length) }, async () => {
    while (cursor < jobs.length) {
      const job = jobs[cursor++];
      try {
        out.push(await job());
      } catch {
        /* one dead source must not take the wire down */
      }
    }
  });
  await Promise.all(workers);
  return out;
}

export const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
export const asArray = <T,>(v: T | T[] | undefined): T[] => (v === undefined ? [] : Array.isArray(v) ? v : [v]);
export const clean = (s: unknown, max = 400): string =>
  String(s ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);

/** Pull the alternate link href out of an Atom entry (string or array form). */
export function atomLink(entry: any): string {
  const links = asArray(entry?.link);
  for (const l of links) {
    const href = typeof l === 'string' ? l : l?.['@_href'];
    const rel = typeof l === 'string' ? 'alternate' : l?.['@_rel'] ?? 'alternate';
    if (href && rel === 'alternate') return String(href);
  }
  const first = links[0];
  return String((typeof first === 'string' ? first : first?.['@_href']) ?? '');
}

/** One entry from an RSS or Atom feed, normalised. */
export interface FeedEntry {
  title: string;
  url: string;
  published: string; // ISO
  summary: string;
  /** The publishing outlet when the feed names one per item (Google News does). */
  outlet?: string;
}

/**
 * Read an Atom or RSS feed, newest first.
 *
 * Reddit throttles unpredictably and answers a rejected request with an HTML
 * page rather than an error status, so one retry is worth the second or two.
 */
export async function readFeed(url: string, limit = 20, ms = 9000): Promise<FeedEntry[]> {
  let xml = await getText(url, ms);
  if (!xml || !/<(entry|item)[\s>]/.test(xml)) {
    await new Promise((r) => setTimeout(r, 800));
    xml = await getText(url, ms);
  }
  if (!xml) return [];
  let doc: any;
  try {
    doc = parser.parse(xml);
  } catch {
    return [];
  }
  // Atom (<feed><entry>) and RSS (<rss><channel><item>) both appear here.
  const entries = asArray(doc?.feed?.entry);
  const items = asArray(doc?.rss?.channel?.item);
  // Newest first before truncating: document order is not always recency
  // (OpenAI's feed lists 1,000+ posts, slightly out of order).
  const stamp = (e: any): number =>
    new Date(String(e?.updated ?? e?.published ?? e?.pubDate ?? '')).getTime() || 0;
  const rows = (entries.length ? entries : items).sort((a, b) => stamp(b) - stamp(a));
  const out: FeedEntry[] = [];
  for (const e of rows.slice(0, limit)) {
    const title = clean(e?.title?.['#text'] ?? e?.title, 200);
    const link = entries.length ? atomLink(e) : String(e?.link ?? '');
    if (!title || !link) continue;
    const when = e?.updated ?? e?.published ?? e?.pubDate;
    const outlet = clean(e?.source?.['#text'] ?? (typeof e?.source === 'string' ? e.source : ''), 80);
    out.push({
      title,
      url: link,
      published: when && !isNaN(Date.parse(String(when))) ? new Date(String(when)).toISOString() : new Date().toISOString(),
      summary: clean(e?.summary?.['#text'] ?? e?.summary ?? e?.description ?? e?.content?.['#text'] ?? e?.content, 400),
      outlet: outlet || undefined,
    });
  }
  return out;
}
