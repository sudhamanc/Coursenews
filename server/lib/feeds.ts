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
  /** Outbound links in the item body, when asked for with `{ links: true }`. */
  links?: FeedLink[];
}

export interface FeedLink {
  url: string; // normalised
  text: string; // anchor text, cleaned
}

/**
 * One canonical form per resource, so the same post cited by three newsletters
 * counts once: https, no `www.`, no tracking parameters, fragment, or trailing
 * slash, and arXiv PDFs and versions folded into the abstract page.
 */
export function normalizeUrl(raw: string): string | null {
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return null;
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
  u.protocol = 'https:';
  u.hostname = u.hostname.toLowerCase().replace(/^www\./, '');
  u.hash = '';
  for (const k of [...u.searchParams.keys()]) {
    if (/^(utm_\w+|ref|ref_src|triedRedirect|publication_id|post_id|isFreemail)$/i.test(k)) u.searchParams.delete(k);
  }
  if (u.hostname === 'arxiv.org' || u.hostname === 'export.arxiv.org') {
    u.hostname = 'arxiv.org';
    const id = /^\/(?:abs|pdf|html)\/([^/?#]+?)(?:v\d+)?(?:\.pdf)?\/?$/.exec(u.pathname)?.[1];
    if (id) u.pathname = `/abs/${id}`;
  }
  const path = u.pathname.replace(/\/+$/, '');
  return `https://${u.host}${path}${u.search}`;
}

/**
 * Links that say nothing about what a newsletter is pointing at: its own pages,
 * subscribe and share buttons, social profiles, and images.
 */
const BOILERPLATE_HOST =
  /(^|\.)(substack\.com|substackcdn\.com|x\.com|twitter\.com|t\.co|linkedin\.com|facebook\.com|instagram\.com|threads\.net|bsky\.app|mastodon\.social|buttondown\.email|beehiiv\.com|mailchi\.mp|list-manage\.com|feedburner\.com|gravatar\.com|apple\.com|spotify\.com|open\.spotify\.com|podcasts\.google\.com|patreon\.com|ko-fi\.com|buymeacoffee\.com|discord\.gg|discord\.com|wikipedia\.org|google\.com)$/i;
const BOILERPLATE_PATH = /\/(subscribe|unsubscribe|share|signup|sign-up|login|account|about|tag|tags|category|author|feed|rss)(\/|$)|\.(png|jpe?g|gif|webp|svg|mp3|mp4)$/i;

export function isBoilerplateLink(url: string, feedHost: string): boolean {
  let host: string;
  let path: string;
  try {
    const u = new URL(url);
    host = u.hostname;
    path = u.pathname;
  } catch {
    return true;
  }
  const own = feedHost.replace(/^www\./, '');
  if (host === own || host.endsWith(`.${own}`)) return true;
  if (BOILERPLATE_HOST.test(host)) return true;
  if (path === '' || path === '/') return true; // a home page is a mention, not a citation
  return BOILERPLATE_PATH.test(path);
}

const decodeEntities = (s: string): string =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&#x2F;/gi, '/')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&quot;/g, '"');

/** Every outbound `<a href>` in an item body, normalised and de-boilerplated. */
export function extractLinks(html: string, feedHost: string): FeedLink[] {
  const out = new Map<string, FeedLink>();
  for (const m of html.matchAll(/<a\b[^>]*?href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const url = normalizeUrl(decodeEntities(m[1]));
    if (!url || isBoilerplateLink(url, feedHost)) continue;
    const text = clean(m[2], 160);
    const prev = out.get(url);
    if (!prev || text.length > prev.text.length) out.set(url, { url, text });
  }
  return [...out.values()];
}

/**
 * Read an Atom or RSS feed, newest first.
 *
 * Reddit throttles unpredictably and answers a rejected request with an HTML
 * page rather than an error status, so one retry is worth the second or two.
 */
export async function readFeed(
  url: string,
  limit = 20,
  ms = 9000,
  opts: { links?: boolean } = {},
): Promise<FeedEntry[]> {
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
    let links: FeedLink[] | undefined;
    if (opts.links) {
      const body = [e?.['content:encoded'], e?.content?.['#text'] ?? e?.content, e?.description, e?.summary?.['#text'] ?? e?.summary]
        .filter((v) => typeof v === 'string')
        .join(' ');
      links = extractLinks(body, new URL(url).hostname);
    }
    out.push({
      title,
      url: link,
      published: when && !isNaN(Date.parse(String(when))) ? new Date(String(when)).toISOString() : new Date().toISOString(),
      summary: clean(e?.summary?.['#text'] ?? e?.summary ?? e?.description ?? e?.content?.['#text'] ?? e?.content, 400),
      outlet: outlet || undefined,
      links,
    });
  }
  return out;
}

const unescape = (s: string): string =>
  s.replace(/&amp;/g, '&').replace(/&#0?39;|&apos;|&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

/**
 * A page's own title and description (Open Graph first, then the plain tags),
 * for links that arrive with only a headline. One GET, never throws.
 */
export async function pageMeta(url: string, ms = 7000): Promise<{ title: string; description: string }> {
  const html = await getText(url, ms);
  if (!html) return { title: '', description: '' };
  const head = html.slice(0, 200_000);
  const meta = (name: string) =>
    new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']*)["']`, 'i').exec(head)?.[1] ??
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${name}["']`, 'i').exec(head)?.[1] ??
    '';
  const title = meta('og:title') || /<title[^>]*>([\s\S]*?)<\/title>/i.exec(head)?.[1] || '';
  const description = meta('og:description') || meta('description') || meta('twitter:description');
  return { title: clean(unescape(title), 200), description: clean(unescape(description), 400) };
}

