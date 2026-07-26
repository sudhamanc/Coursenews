/**
 * "Latest in AI" — fetching, prefiltering, and LLM ranking.
 *
 * Sources:
 *   - arXiv Atom API (recent cs.AI / cs.LG / cs.CL / cs.DB submissions)
 *   - Hacker News (Algolia API): front page + recent AI-tagged stories
 *
 * Pipeline: fetch -> normalize -> dedupe + 48h window + heuristic prefilter ->
 * a single Haiku call ranks the top candidates and writes a category and a
 * one-to-two sentence "why it matters" note. Results are cached in Blobs.
 */
import { getStore, type Store } from '@netlify/blobs';
import { XMLParser } from 'fast-xml-parser';
import { getClient, NEWS_MODEL } from './anthropic';

export interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: 'arXiv' | 'Hacker News';
  published: string; // ISO
  points?: number;
  authors?: string;
  abstract?: string; // arXiv only (real abstract); HN has none
  category?: string; // filled by ranker
  why?: string; // filled by ranker
}

export interface NewsFeed {
  generatedAt: string;
  items: NewsItem[];
}

const WINDOW_MS = 48 * 60 * 60 * 1000;
const RELEVANCE = /\b(ai|artificial intelligence|machine learning|ml|deep learning|neural|llm|language model|transformer|gpt|diffusion|reinforcement|dataset|database|vector|embedding|inference|training|fine-?tun|agent|rag|multimodal|open-?source model)\b/i;

export function newsStore(): Store {
  return getStore('news');
}

export async function readLatest(): Promise<NewsFeed | null> {
  return (await newsStore().get('latest.json', { type: 'json' })) as NewsFeed | null;
}

export async function writeLatest(feed: NewsFeed): Promise<void> {
  await newsStore().setJSON('latest.json', feed);
}

const withTimeout = (ms: number) => {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  return { signal: c.signal, done: () => clearTimeout(t) };
};

/**
 * Recent AI-related submissions from arXiv, via the fast pre-generated RSS
 * feed. The old search API (sortBy=submittedDate over four broad categories)
 * routinely took ~30s to respond and blew past the fetch timeout, so no arXiv
 * items ever made it into the feed. The RSS feed returns the latest announced
 * batch in ~1.5s.
 */
export async function fetchArxiv(): Promise<NewsItem[]> {
  const url = 'https://rss.arxiv.org/rss/cs.AI+cs.LG+cs.CL+cs.DB';
  const to = withTimeout(15000);
  try {
    const res = await fetch(url, {
      signal: to.signal,
      headers: { 'User-Agent': 'CourseLedger/1.0 (AI news digest)' },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
    const doc = parser.parse(xml);
    const channel = doc?.rss?.channel;
    const raw = channel?.item ? (Array.isArray(channel.item) ? channel.item : [channel.item]) : [];
    const items: NewsItem[] = [];
    for (const it of raw) {
      const description = String(it.description ?? '');
      // Announce types: "new" (fresh submission), "cross" (cross-listed), or
      // "replace" (a revised version of an existing paper). Skip replacements.
      const announce = /Announce Type:\s*(\w+)/i.exec(description)?.[1]?.toLowerCase();
      if (announce === 'replace') continue;
      const link = String(it.link ?? '').trim();
      if (!link) continue;
      const arxivId = /\/abs\/([^/\s?#]+)/.exec(link)?.[1] ?? link;
      const abstract = /Abstract:\s*([\s\S]+)$/i
        .exec(description)?.[1]
        ?.replace(/\s+/g, ' ')
        .trim()
        .slice(0, 1200);
      const creators = String(it['dc:creator'] ?? '').replace(/\s+/g, ' ').trim();
      items.push({
        id: `arxiv:${arxivId}`,
        title: String(it.title ?? '').replace(/\s+/g, ' ').trim(),
        url: link,
        source: 'arXiv',
        published: it.pubDate ? new Date(it.pubDate).toISOString() : new Date().toISOString(),
        authors: creators
          ? creators.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 4).join(', ')
          : undefined,
        abstract,
      });
    }
    return items;
  } catch {
    return [];
  } finally {
    to.done();
  }
}

/** Front-page + recent AI stories from Hacker News (Algolia). */
export async function fetchHackerNews(): Promise<NewsItem[]> {
  const endpoints = [
    'https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=40',
    'https://hn.algolia.com/api/v1/search_by_date?tags=story&query=AI&numericFilters=points%3E30&hitsPerPage=40',
  ];
  const out: NewsItem[] = [];
  for (const url of endpoints) {
    const to = withTimeout(12000);
    try {
      const res = await fetch(url, { signal: to.signal });
      if (!res.ok) continue;
      const data = await res.json();
      for (const h of data.hits || []) {
        const link = h.url || `https://news.ycombinator.com/item?id=${h.objectID}`;
        out.push({
          id: `hn:${h.objectID}`,
          title: String(h.title || h.story_title || '').trim(),
          url: link,
          source: 'Hacker News',
          published: new Date((h.created_at_i ? h.created_at_i * 1000 : h.created_at) || Date.now()).toISOString(),
          points: typeof h.points === 'number' ? h.points : undefined,
        });
      }
    } catch {
      /* ignore this endpoint */
    } finally {
      to.done();
    }
  }
  return out;
}

/**
 * Dedupe, filter, and assemble a balanced candidate set. Hacker News items are
 * held to a 48h window and a topical-relevance check; arXiv items come from the
 * latest RSS batch and are on-topic by category. Crucially, we keep a per-source
 * quota so arXiv (which has no "points") is never crowded out by Hacker News
 * before the ranker sees it.
 */
export function prefilter(items: NewsItem[]): NewsItem[] {
  const now = Date.now();
  const seen = new Set<string>();
  const hn: NewsItem[] = [];
  const arxiv: NewsItem[] = [];
  for (const it of items) {
    if (!it.title || !it.url) continue;
    const key = it.id || it.url;
    if (seen.has(key) || seen.has(it.url)) continue;
    if (it.source === 'Hacker News') {
      if (now - new Date(it.published).getTime() > WINDOW_MS) continue;
      if (!RELEVANCE.test(`${it.title} ${it.abstract ?? ''}`)) continue;
    }
    seen.add(key);
    seen.add(it.url);
    (it.source === 'Hacker News' ? hn : arxiv).push(it);
  }
  hn.sort((a, b) => (b.points ?? 0) - (a.points ?? 0) || b.published.localeCompare(a.published));
  // Balanced quota per source; the Haiku ranker interleaves them afterward.
  const PER_SOURCE = 18;
  return [...hn.slice(0, PER_SOURCE), ...arxiv.slice(0, PER_SOURCE)];
}

/**
 * Single Haiku call: rank candidates by interest/usefulness and attach a
 * category + "why it matters". Returns items in ranked order; falls back to the
 * prefilter order if the model output can't be parsed.
 */
export async function rankWithHaiku(candidates: NewsItem[]): Promise<NewsItem[]> {
  if (candidates.length === 0) return [];

  const list = candidates.map((c, i) => ({
    i,
    source: c.source,
    title: c.title,
    points: c.points,
    abstract: c.abstract?.slice(0, 400),
  }));

  const system = [
    'You are the editor of an "AI, data, and engineering" news digest.',
    'Rank the supplied stories from most to least interesting and useful to a',
    'graduate student of applied AI. Prefer substantive research, notable model or',
    'tooling releases, and rigorous engineering over hype and PR.',
    'Return ONLY valid JSON: an array of objects',
    '{ "i": <original index>, "category": <2-3 word topic>, "why": <one or two',
    'sentence reason it matters> }, ordered best first. Do not include any prose',
    'outside the JSON.',
  ].join(' ');

  try {
    const res = await getClient().messages.create({
      model: NEWS_MODEL,
      max_tokens: 2048,
      system,
      messages: [{ role: 'user', content: JSON.stringify(list) }],
    });
    const raw = res.content
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('');
    const jsonStr = raw.slice(raw.indexOf('['), raw.lastIndexOf(']') + 1);
    const ranked = JSON.parse(jsonStr) as Array<{ i: number; category?: string; why?: string }>;

    const ordered: NewsItem[] = [];
    const used = new Set<number>();
    for (const r of ranked) {
      const item = candidates[r.i];
      if (!item || used.has(r.i)) continue;
      used.add(r.i);
      ordered.push({ ...item, category: r.category?.slice(0, 40), why: r.why?.slice(0, 320) });
    }
    // Append any candidates the model omitted.
    candidates.forEach((c, i) => {
      if (!used.has(i)) ordered.push(c);
    });
    return ordered;
  } catch {
    return candidates;
  }
}

/** Full refresh pipeline. */
export async function buildFeed(): Promise<NewsFeed> {
  const [freshArxiv, hn] = await Promise.all([fetchArxiv(), fetchHackerNews()]);
  let arxiv = freshArxiv;
  // arXiv only announces Sun–Thu, so its RSS feed is EMPTY on weekends/holidays.
  // Without this guard, a refresh on an empty day overwrites the cached feed with
  // a Hacker-News-only one (the "arXiv vanished after a day" bug). Carry forward
  // the most recent arXiv items from the last good feed instead.
  if (arxiv.length === 0) {
    try {
      const prev = await readLatest();
      arxiv = (prev?.items ?? []).filter((i) => i.source === 'arXiv');
    } catch {
      /* no previous feed available — fall back to Hacker News only */
    }
  }
  const candidates = prefilter([...arxiv, ...hn]);
  const items = await rankWithHaiku(candidates);
  return { generatedAt: new Date().toISOString(), items };
}
