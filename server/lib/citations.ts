/**
 * What the field is pointing at: a citation index over curator feeds.
 *
 * The research wire's own sources (arXiv, Hacker News) only see what is posted
 * to them. Much of the best work is a lab essay or a personal blog with no feed
 * of its own, and it reaches readers because newsletters and link aggregators
 * point at it. So instead of keeping a list of every site worth watching, read
 * the people who already watch them and count who links to what.
 *
 *   - Newsletters (Latent Space, Import AI, ...): every outbound link in an
 *     item body is a citation by that newsletter. One newsletter alone is weak
 *     evidence; two independent ones are strong.
 *   - Aggregators (lobste.rs, Hacker News): each item IS one link, curated by a
 *     community vote, so a single aggregator citation is enough.
 *
 * Nothing here fetches the cited pages: the links come out of the feed bodies
 * the wire downloads anyway. Only a link with no usable anchor text costs one
 * small fetch for its <title>, and those are capped.
 */
import { readFeed, pool, pageMeta, normalizeUrl, type FeedEntry } from './feeds';

export type CuratorKind = 'newsletter' | 'aggregator';

export const CURATOR_FEEDS: Array<{ url: string; source: string; kind: CuratorKind }> = [
  { url: 'https://lobste.rs/t/ai.rss', source: 'Lobsters', kind: 'aggregator' },
  { url: 'https://www.latent.space/feed', source: 'Latent Space', kind: 'newsletter' },
  { url: 'https://importai.substack.com/feed', source: 'Import AI', kind: 'newsletter' },
  { url: 'https://www.interconnects.ai/feed', source: 'Interconnects', kind: 'newsletter' },
  { url: 'https://simonwillison.net/atom/everything/', source: 'Simon Willison', kind: 'newsletter' },
  { url: 'https://www.alignmentforum.org/feed.xml', source: 'Alignment Forum', kind: 'newsletter' },
  { url: 'https://the-decoder.com/feed/', source: 'The Decoder', kind: 'newsletter' },
  { url: 'https://huggingface.co/blog/feed.xml', source: 'HF Blog', kind: 'newsletter' },
];

/** Newsletters are weekly at best, so look back further than the 48h news window. */
export const CITATION_WINDOW_MS = 4 * 24 * 60 * 60 * 1000;
/** Bare links whose <title> we will fetch, at most, per run. */
const TITLE_FETCHES = 10;

export interface Citation {
  url: string; // normalised
  /** Best title we have: an aggregator's headline, else the longest anchor text. */
  title: string;
  /** Distinct sources that pointed here, in the order first seen. */
  citers: string[];
  /** True when any citer is a link-per-item aggregator. */
  aggregated: boolean;
  /** A short phrase from a citer describing the link (anchor text or item title). */
  context?: string;
  /** Earliest citation time, ISO. */
  firstSeen: string;
}

/** A citation made outside the curator feeds (the research wire's own HN hits). */
export interface ExternalCite {
  url: string;
  title: string;
  source: string;
  published: string;
}

type Index = Map<string, Citation>;

/** Anchor text that names nothing: "here", "link", a bare URL, a footnote number. */
const weakAnchor = (t: string): boolean =>
  t.length < 12 || /^(here|link|this|source|paper|post|blog|thread|read more|\[?\d+\]?)$/i.test(t) || /^https?:\/\//.test(t);

function cite(index: Index, url: string, source: string, kind: CuratorKind, title: string, when: string, context?: string): void {
  const prev = index.get(url);
  if (!prev) {
    index.set(url, {
      url,
      title,
      citers: [source],
      aggregated: kind === 'aggregator',
      context: context || undefined,
      firstSeen: when,
    });
    return;
  }
  if (!prev.citers.includes(source)) prev.citers.push(source);
  if (when < prev.firstSeen) prev.firstSeen = when;
  // An aggregator headline beats an anchor; otherwise prefer the more informative text.
  if (kind === 'aggregator' && !prev.aggregated) prev.title = title;
  else if (!prev.aggregated && title.length > prev.title.length) prev.title = title;
  if (kind === 'aggregator') prev.aggregated = true;
  if (!prev.context && context) prev.context = context;
}

/**
 * Read every curator feed and index who links to what since `sinceMs`.
 * `external` folds in citations the caller already has (Hacker News hits).
 */
export async function buildCitationIndex(sinceMs: number, external: ExternalCite[] = []): Promise<Index> {
  const fetched = await pool(
    CURATOR_FEEDS.map((f) => async () => ({ f, entries: await readFeed(f.url, 30, 9000, { links: true }) })),
    6,
  );
  const index: Index = new Map();
  for (const { f, entries } of fetched) {
    for (const e of entries as FeedEntry[]) {
      if (new Date(e.published).getTime() < sinceMs) continue;
      if (f.kind === 'aggregator') {
        const url = normalizeUrl(e.url);
        if (url) cite(index, url, f.source, f.kind, e.title, e.published, e.summary.slice(0, 200));
        continue;
      }
      for (const l of e.links ?? []) {
        cite(index, l.url, f.source, f.kind, weakAnchor(l.text) ? '' : l.text, e.published, e.title);
      }
    }
  }
  for (const x of external) {
    const url = normalizeUrl(x.url);
    if (url) cite(index, url, x.source, 'aggregator', x.title, x.published);
  }
  return index;
}

/** Cited at least twice independently, or once by a community-curated aggregator. */
export const qualifies = (c: Citation): boolean => c.citers.length >= 2 || c.aggregated;

/**
 * The qualifying citations, best-evidenced first, with a title for each. Any
 * citation still untitled after the capped title fetches is dropped: the
 * ranker cannot judge a bare URL.
 */
export async function qualifiedCitations(index: Index): Promise<Citation[]> {
  const picked = [...index.values()]
    .filter(qualifies)
    .sort((a, b) => b.citers.length - a.citers.length || b.firstSeen.localeCompare(a.firstSeen));
  const untitled = picked.filter((c) => !c.title).slice(0, TITLE_FETCHES);
  await pool(
    untitled.map((c) => async () => {
      c.title = (await pageMeta(c.url)).title;
    }),
    5,
  );
  return picked.filter((c) => c.title);
}
