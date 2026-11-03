/**
 * "Latest in AI" — fetching, prefiltering, and LLM ranking.
 *
 * Sources:
 *   - arXiv RSS (the latest cs.AI / cs.LG / cs.CL / cs.DB announcement)
 *   - Hacker News (Algolia API): the highest-scoring stories of the last 36h
 *   - Citations (./citations): links that curator newsletters and aggregators
 *     point at, which finds lab essays and blogs that have no feed of their own
 *
 * Pipeline: fetch -> merge by URL -> 48h window + prefilter (the keyword list
 * is a hint, not a gate) -> a single Haiku call drops what is off-topic, ranks
 * the rest, and writes a category and a "why it matters" note. Results are
 * cached in the JSON store, with an audit of what was dropped and why.
 */
import { getStore, type Store } from './store';
import { XMLParser } from 'fast-xml-parser';
import { getClient, NEWS_MODEL } from './anthropic';
import { normalizeUrl, pageMeta, pool } from './feeds';
import { buildCitationIndex, qualifiedCitations, CITATION_WINDOW_MS, type Citation } from './citations';
import coursesConfig from '../../courses.config.json';

export interface NewsItem {
  id: string;
  title: string;
  url: string;
  /** 'Cited' = found only through other sources' links (see ./citations). */
  source: 'arXiv' | 'Hacker News' | 'Cited';
  published: string; // ISO
  points?: number;
  authors?: string;
  abstract?: string; // arXiv only (real abstract); HN has none
  /** Every independent source that surfaced this URL, its own source included. */
  cites?: string[];
  /** How a citing newsletter described it, when it is all the ranker has. */
  context?: string;
  /** The page's own description, fetched for the ranker when there is no abstract. */
  summary?: string;
  /** Matched the topical keyword list; the ranker may not silently drop these. */
  onTopicHint?: boolean;
  category?: string; // filled by ranker
  why?: string; // filled by ranker
}

/** Why each fetched item did or didn't make the feed, for `npm run news:why`. */
export interface AuditRow {
  url: string;
  title: string;
  source: string;
  stage: 'window' | 'gate' | 'quota' | 'ranker-drop' | 'kept';
  reason: string;
  points?: number;
  cites?: string[];
}

export interface NewsFeed {
  generatedAt: string;
  items: NewsItem[];
}

const WINDOW_MS = 48 * 60 * 60 * 1000;
/**
 * Topical gate for Hacker News titles, which carry no abstract. Every term must
 * match as a whole word, so plurals and stems are spelled out: a bare `agent`
 * rejected "OpenAI Agents API", and `fine-?tun` never matched "fine-tuning".
 */
const RELEVANCE =
  /\b(ai|genai|artificial intelligence|machine learning|ml|deep learning|neural|llms?|language models?|transformers?|gpt|diffusion|reinforcement|datasets?|databases?|vectors?|embeddings?|inference|training|fine-?tun\w*|agents?|agentic|rag|multimodal|open-?source models?|chatgpt|claude|gemini|gemma|copilot|codex)\b/i;

/**
 * Company names admit a story only alongside a shipping word (`ai` cannot match
 * inside "OpenAI", so launches need this path). Alone, a name admits whatever
 * the company is in the news for: replaying the 11 Sep refresh, "Rust is tier-1
 * language at Microsoft" and a Google power deal outscored AI stories on points
 * and pushed them out of the Hacker News quota.
 */
const COMPANY = /\b(openai|anthropic|deepmind|mistral|google|microsoft|amazon|aws)\b/i;
const SHIPPING =
  /\b(models?|apis?|sdks?|launch\w*|releas\w*|announc\w*|introduc\w*|unveil\w*|open-?weights?|open-?sourc\w*)\b/i;

export const isRelevant = (text: string): boolean =>
  RELEVANCE.test(text) || (COMPANY.test(text) && SHIPPING.test(text));

/**
 * The keyword list only knows the words it was written with: "Astra can read
 * and write weights to improve Qwen" (2,900 points, 2 Nov) matched none of them
 * and never reached the ranker. So a miss is not a rejection. A story outside
 * the list still goes to the ranker when the crowd says it matters (this many
 * points) or two independent sources cite it, and the ranker decides.
 */
const LOUD_POINTS = 150;
const HN_HOURS = 36;
const HN_MIN_POINTS = 80;

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
      headers: { 'User-Agent': 'LatentInference/1.0 (AI news digest)' },
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

/**
 * The highest-scoring Hacker News stories of the last HN_HOURS. One query over
 * a time window, ranked by points, rather than a snapshot of the front page at
 * cron time: a story posted the afternoon before the 13:00 UTC run has usually
 * left the front page by then, however big it was.
 */
export async function fetchHackerNews(): Promise<NewsItem[]> {
  const since = Math.floor(Date.now() / 1000) - HN_HOURS * 3600;
  const url =
    'https://hn.algolia.com/api/v1/search?tags=story&hitsPerPage=100' +
    `&numericFilters=${encodeURIComponent(`created_at_i>${since},points>${HN_MIN_POINTS}`)}`;
  const out: NewsItem[] = [];
  const to = withTimeout(12000);
  try {
    const res = await fetch(url, { signal: to.signal });
    if (!res.ok) return [];
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
    /* no Hacker News today */
  } finally {
    to.done();
  }
  return out;
}

/** Cited links that arrived by no other route become items of their own. */
export function citedItems(citations: Citation[]): NewsItem[] {
  return citations.map((c) => ({
    id: `cite:${c.url}`,
    title: c.title,
    url: c.url,
    source: 'Cited',
    published: c.firstSeen,
    cites: c.citers,
    context: c.context,
  }));
}

const hostOf = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

/** Per-source quotas, so no source crowds another out before the ranker sees it. */
const QUOTA = { hn: 24, hnLoud: 24, arxiv: 18, cited: 14 };

/**
 * Merge, filter, and assemble a balanced candidate set.
 *
 * Items are merged by normalised URL first, so a post on Hacker News that two
 * newsletters also link to arrives once, carrying all three sources in `cites`.
 * Hacker News is held to the 48h window. The keyword list sets `onTopicHint`;
 * a miss drops a story only when it is also quiet (under LOUD_POINTS, cited
 * once). Loud off-list stories get their own small quota so a busy day of
 * unrelated news can't push on-topic stories out. Within each source, the most
 * cited come first, so an arXiv paper someone links to is never cut by the
 * quota just for sitting low in the feed.
 *
 * `audit`, when given, receives a row for every item that did not survive.
 */
export function prefilter(items: NewsItem[], audit?: AuditRow[]): NewsItem[] {
  const now = Date.now();
  const row = (it: NewsItem, stage: AuditRow['stage'], reason: string) =>
    audit?.push({ url: it.url, title: it.title, source: it.source, stage, reason, points: it.points, cites: it.cites });

  // Merge by URL. A source's own record wins over a 'Cited' one (it has the
  // points, authors, or abstract); the citations are kept either way.
  const byUrl = new Map<string, NewsItem>();
  const rank = (s: NewsItem['source']) => (s === 'Cited' ? 0 : 1);
  for (const it of items) {
    if (!it.title || !it.url) continue;
    const key = normalizeUrl(it.url) ?? it.url;
    const cites = it.cites?.length ? it.cites : [it.source];
    const prev = byUrl.get(key);
    if (!prev) {
      byUrl.set(key, { ...it, cites: [...cites] });
      continue;
    }
    const merged = [...new Set([...(prev.cites ?? []), ...cites])];
    const [keep, other] = rank(it.source) > rank(prev.source) ? [it, prev] : [prev, it];
    byUrl.set(key, { ...keep, cites: merged, context: keep.context ?? other.context });
  }

  const hn: NewsItem[] = [];
  const hnLoud: NewsItem[] = [];
  const arxiv: NewsItem[] = [];
  const cited: NewsItem[] = [];
  for (const it of byUrl.values()) {
    const ncites = it.cites?.length ?? 1;
    if (it.source === 'arXiv') {
      arxiv.push({ ...it, onTopicHint: true });
      continue;
    }
    if (now - new Date(it.published).getTime() > (it.source === 'Cited' ? CITATION_WINDOW_MS : WINDOW_MS)) {
      row(it, 'window', `published ${it.published}, outside the window`);
      continue;
    }
    const hint = isRelevant(`${it.title} ${hostOf(it.url)} ${it.context ?? ''}`);
    // Lobsters' feed is its `ai` tag, so a story it surfaced is on topic by tag.
    const tagged = it.cites?.includes('Lobsters') ?? false;
    if (!hint && !tagged && (it.points ?? 0) < LOUD_POINTS && ncites < 2) {
      row(it, 'gate', `no topical keyword, ${it.points ?? 0} points, cited by ${ncites}`);
      continue;
    }
    const next = { ...it, onTopicHint: hint || tagged };
    if (it.source === 'Cited') cited.push(next);
    else (next.onTopicHint ? hn : hnLoud).push(next);
  }

  const evidence = (a: NewsItem, b: NewsItem) =>
    (b.cites?.length ?? 1) - (a.cites?.length ?? 1) || (b.points ?? 0) - (a.points ?? 0) || b.published.localeCompare(a.published);
  hn.sort(evidence);
  hnLoud.sort(evidence);
  cited.sort(evidence);
  // arXiv keeps feed order among papers no one has cited yet (stable sort).
  arxiv.sort((a, b) => (b.cites?.length ?? 1) - (a.cites?.length ?? 1));

  const take = (list: NewsItem[], n: number, label: string) => {
    list.slice(n).forEach((it) => row(it, 'quota', `${label} quota of ${n} was full`));
    return list.slice(0, n);
  };
  return [
    ...take(hn, QUOTA.hn, 'Hacker News'),
    ...take(hnLoud, QUOTA.hnLoud, 'loud off-list Hacker News'),
    ...take(arxiv, QUOTA.arxiv, 'arXiv'),
    ...take(cited, QUOTA.cited, 'cited'),
  ];
}

/** Pages described per run, at most: every non-arXiv candidate on a normal day. */
const DESCRIBE = 60;

/**
 * Give each headline-only candidate its page's own description. A bare title
 * reads as thin to the ranker however much evidence is behind it: "Neural
 * networks are clean" (849 points, cited by three outlets) ranked last of 14
 * until the ranker could see what the essay was about.
 */
export async function describe(candidates: NewsItem[]): Promise<void> {
  const bare = candidates
    .filter((c) => !c.abstract && !c.summary && !/news\.ycombinator\.com/.test(c.url))
    .slice(0, DESCRIBE);
  await pool(
    bare.map((c) => async () => {
      c.summary = (await pageMeta(c.url, 5000)).description || undefined;
    }),
    10,
  );
}

/** What the site teaches, so "relevant" means relevant to its readers. */
const CURRICULUM = coursesConfig.courses.map((c) => `${c.title}: ${c.blurb}`).join(' | ');

/** First four words of a title, echoed back by the model to verify its index mapping. */
const titleKey = (s: string): string =>
  s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(Boolean).slice(0, 4).join(' ');

type Ranking = Array<{ i: number; t?: string; category?: string; why?: string; off_topic?: boolean }>;

/**
 * The model's JSON array. If the reply was cut off mid-array, keep every
 * complete object before the cut rather than losing the whole ranking.
 */
function parseRanking(raw: string): Ranking {
  const start = raw.indexOf('[');
  try {
    return JSON.parse(raw.slice(start, raw.lastIndexOf(']') + 1));
  } catch {
    const cut = raw.lastIndexOf('}');
    if (start < 0 || cut < start) throw new Error('ranker returned no JSON array');
    return JSON.parse(`${raw.slice(start, cut + 1)}]`);
  }
}

/**
 * Single Haiku call: rank every candidate by interest and usefulness, attach a
 * category + "why it matters", and rule on the off-list ones (`vet`), which
 * were sent precisely so the model could judge them. An off-list story marked
 * off_topic, or omitted, is dropped; an on-list one the model omits is restored
 * at the end (it ranks those, it doesn't vet them). If the output can't be
 * parsed, keep prefilter order minus off-list stories with only points behind them.
 */
export async function rankWithHaiku(candidates: NewsItem[], audit?: AuditRow[]): Promise<NewsItem[]> {
  if (candidates.length === 0) return [];

  const list = candidates.map((c, i) => ({
    i,
    t: titleKey(c.title),
    source: c.source,
    site: hostOf(c.url),
    title: c.title,
    points: c.points,
    cited_by: (c.cites?.length ?? 0) > 1 ? c.cites : undefined,
    context: c.context?.slice(0, 200),
    abstract: c.abstract?.slice(0, 400),
    summary: c.abstract ? undefined : c.summary?.slice(0, 300),
    vet: c.onTopicHint ? undefined : true,
  }));

  const system = [
    'You are the editor of an "AI, data, and engineering" news digest for graduate',
    `students of AI. What they study: ${CURRICULUM}.`,
    'Rank EVERY entry from most to least interesting and useful. Prefer substantive',
    'research, notable model or tooling releases, and rigorous engineering over hype',
    'and PR. Weigh the evidence of reach as heavily as the text: "cited_by" lists',
    'independent sources that linked to a story, and Hacker News "points" are votes; a',
    'story many people and outlets are discussing belongs near the top even when its',
    'title is short. "summary" is the page\'s own description; arXiv entries have an',
    '"abstract" instead. Entries marked "vet": true came in on points or',
    'citations alone, without a topical keyword: mark one "off_topic": true if it is not',
    'about AI, machine learning, data, or the engineering and science behind them',
    '(general tech, politics, and culture stories), but never research on how models',
    'work inside (interpretability, weights, training, data), however oblique its title.',
    'Return ONLY valid JSON: an array with one object per entry, ordered best first:',
    '{ "i": <original index>, "t": <copy the entry\'s "t" back verbatim>, "category":',
    '<2-3 word topic> }, plus "why": <one sentence, at most 25 words: what the work',
    'found or shipped and why it matters to these readers, never its points, its',
    'citations, or other entries> for the first 20 only. Put off-topic entries last as',
    'just { "i", "t",',
    '"off_topic": true }. No prose outside the JSON.',
  ].join(' ');

  try {
    const res = await getClient().messages.create({
      model: NEWS_MODEL,
      // One object per candidate (~70 on a busy day); only the top 20 carry prose.
      max_tokens: 8192,
      system,
      messages: [{ role: 'user', content: JSON.stringify(list) }],
    });
    const raw = res.content
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('');
    const ranked = parseRanking(raw);

    const ordered: NewsItem[] = [];
    const used = new Set<number>();
    for (const r of ranked) {
      const item = candidates[r.i];
      if (!item || used.has(r.i)) continue;
      // Echo check: a drifted mapping keeps the item but not another item's prose.
      const aligned = !r.t || r.t === list[r.i].t;
      // Only a vetted entry can be ruled off-topic, and only on a verified mapping.
      if (r.off_topic && aligned && !item.onTopicHint) continue;
      used.add(r.i);
      ordered.push({
        ...item,
        category: aligned ? r.category?.slice(0, 40) : undefined,
        why: aligned ? r.why?.slice(0, 320) : undefined,
      });
    }
    candidates.forEach((c, i) => {
      if (used.has(i)) return;
      if (c.onTopicHint) ordered.push(c);
      else
        audit?.push({
          url: c.url,
          title: c.title,
          source: c.source,
          stage: 'ranker-drop',
          reason: 'off-list story the ranker judged off-topic',
          points: c.points,
          cites: c.cites,
        });
    });
    return ordered;
  } catch (err) {
    console.error('research ranker failed; keeping prefilter order', err);
    return candidates.filter((c) => {
      const keep = c.onTopicHint || (c.cites?.length ?? 1) >= 2;
      if (!keep) {
        audit?.push({
          url: c.url,
          title: c.title,
          source: c.source,
          stage: 'ranker-drop',
          reason: 'ranker failed; off-list story kept out unvetted',
          points: c.points,
          cites: c.cites,
        });
      }
      return keep;
    });
  }
}

/** Fetch every source and fold citations in: the candidate pool before prefilter. */
export async function gatherCandidates(): Promise<{
  arxiv: NewsItem[];
  hn: NewsItem[];
  cited: NewsItem[];
  index: Map<string, Citation>;
}> {
  const [arxiv, hn] = await Promise.all([fetchArxiv(), fetchHackerNews()]);
  // Hacker News counts as one citer, so a story it shares with a newsletter
  // arrives with both names on it.
  const index = await buildCitationIndex(
    Date.now() - CITATION_WINDOW_MS,
    hn.map((h) => ({ url: h.url, title: h.title, source: 'Hacker News', published: h.published })),
  ).catch(() => new Map<string, Citation>());
  const cited = citedItems(await qualifiedCitations(index).catch(() => []));
  return { arxiv, hn, cited, index };
}

const AUDIT_KEY = (date: string) => `audit/research-${date}.json`;

/** The day's audit, beside the editions, pruned on the same 30-day schedule. */
export async function writeAudit(generatedAt: string, rows: AuditRow[]): Promise<void> {
  await newsStore().setJSON(AUDIT_KEY(generatedAt.slice(0, 10)), { generatedAt, rows });
}

/** Full refresh pipeline. `audit`, when given, receives a row for every item. */
export async function buildFeed(audit?: AuditRow[]): Promise<NewsFeed> {
  const { arxiv: freshArxiv, hn, cited } = await gatherCandidates();
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
  const candidates = prefilter([...arxiv, ...hn, ...cited], audit);
  await describe(candidates);
  const items = await rankWithHaiku(candidates, audit);
  for (const it of items) {
    audit?.push({ url: it.url, title: it.title, source: it.source, stage: 'kept', reason: 'in the feed', points: it.points, cites: it.cites });
  }
  return { generatedAt: new Date().toISOString(), items };
}
