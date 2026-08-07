/**
 * "The Ecosystem" — the second wire on /latest.
 *
 * The research wire (lib/news.ts) answers *what is being discovered*. This one
 * answers *what shipped* — models, protocol versions, library releases, and the
 * architectural patterns practitioners are actually arguing about.
 *
 * It runs in TWO LANES, because they fail in opposite ways:
 *
 *   tracked    A fixed watchlist of repositories, read from GitHub's
 *              `releases.atom` feeds. Every item is a dated, versioned fact.
 *              Blind spot: a project that is not on the list cannot appear, so
 *              this lane can never surface something genuinely new.
 *
 *   discovered Open-ended sources — Hugging Face trending, GitHub Trending,
 *              Show HN, subreddit feeds, and a few commentary feeds. These can
 *              surface a project nobody has heard of, at the cost of noise the
 *              ranker has to filter.
 *
 * Deliberately NOT a source: X/Twitter. Its API returns 401 unauthenticated and
 * read access starts at a paid tier, so there is no honest free integration.
 * Show HN + r/LocalLLaMA + GitHub Trending carry substantially the same
 * "practitioners are excited about this" signal.
 *
 * Everything here uses public feeds with no API keys. GitHub's *Atom* feeds are
 * used rather than its REST API on purpose: the unauthenticated REST API allows
 * only 60 requests/hour per IP, and Netlify functions share egress addresses, so
 * a watchlist this size would intermittently 403. The Atom feeds have no such cap.
 */
import { getStore, type Store } from '@netlify/blobs';
import { XMLParser } from 'fast-xml-parser';
import { getClient, NEWS_MODEL } from './anthropic';

export type EcoBucket = 'Models' | 'Standards' | 'Libraries' | 'Patterns';
export type EcoLane = 'tracked' | 'discovered';

export interface EcoItem {
  id: string;
  title: string;
  url: string;
  source: string;
  lane: EcoLane;
  published: string; // ISO
  /** Release tag, model id, or similar — shown as a chip next to the title. */
  version?: string;
  /** Short source-provided blurb, fed to the ranker (never rendered raw). */
  summary?: string;
  points?: number;
  bucket?: EcoBucket; // filled by ranker
  why?: string; // filled by ranker
}

export interface EcoFeed {
  generatedAt: string;
  items: EcoItem[];
}

export const ECO_BUCKETS: EcoBucket[] = ['Models', 'Standards', 'Libraries', 'Patterns'];

/**
 * The tracked watchlist. Edit this list to change what the "tracked" lane
 * follows — it is the single source of truth for that lane.
 *
 * `hint` seeds the ranker's bucketing; the model may override it.
 */
export const WATCHLIST: Array<{ repo: string; hint: EcoBucket }> = [
  // Protocol + reference implementations
  { repo: 'modelcontextprotocol/modelcontextprotocol', hint: 'Standards' },
  { repo: 'modelcontextprotocol/servers', hint: 'Standards' },
  { repo: 'modelcontextprotocol/python-sdk', hint: 'Standards' },
  { repo: 'modelcontextprotocol/typescript-sdk', hint: 'Standards' },
  // Agent frameworks / orchestration
  { repo: 'langchain-ai/langchain', hint: 'Libraries' },
  { repo: 'run-llama/llama_index', hint: 'Libraries' },
  { repo: 'stanfordnlp/dspy', hint: 'Libraries' },
  { repo: 'pydantic/pydantic-ai', hint: 'Libraries' },
  { repo: 'crewAIInc/crewAI', hint: 'Libraries' },
  // Serving + local runtimes
  { repo: 'vllm-project/vllm', hint: 'Libraries' },
  { repo: 'ollama/ollama', hint: 'Libraries' },
  { repo: 'ggml-org/llama.cpp', hint: 'Libraries' },
  { repo: 'sgl-project/sglang', hint: 'Libraries' },
  // Core ML
  { repo: 'huggingface/transformers', hint: 'Libraries' },
  { repo: 'huggingface/diffusers', hint: 'Libraries' },
  { repo: 'pytorch/pytorch', hint: 'Libraries' },
  { repo: 'jax-ml/jax', hint: 'Libraries' },
];

/** Discovery: subreddits whose Atom feeds are read for release chatter. */
const SUBREDDITS = ['LocalLLaMA', 'MachineLearning'];

/** Discovery: commentary feeds for the architecture/patterns bucket. */
const COMMENTARY: Array<{ url: string; source: string }> = [
  { url: 'https://huggingface.co/blog/feed.xml', source: 'HF Blog' },
  { url: 'https://simonwillison.net/atom/everything/', source: 'Simon Willison' },
];

/**
 * Reddit rejects unfamiliar user agents on its feed endpoints, so identify the
 * client honestly but with the conventional Mozilla-compatible prefix.
 */
const UA = 'Mozilla/5.0 (compatible; CourseLedgerBot/1.0; +https://github.com/sudhamanc/Coursenews)';

const TRACKED_WINDOW_MS = 21 * 24 * 60 * 60 * 1000; // releases are sparse; look back 3 weeks
const DISCOVER_WINDOW_MS = 5 * 24 * 60 * 60 * 1000;

/**
 * Release tags we skip. Pre-releases are noise between real versions, and the
 * suffix is usually glued straight onto a digit ("v0.27.0rc1"), so the pattern
 * cannot require a separator before it.
 */
const PRERELEASE = /(?:rc|alpha|beta|dev|nightly|preview)\d*$|[-._\s](?:rc|alpha|beta|dev|nightly|preview)\b/i;

/**
 * Some repos (notably pytorch) publish CI tags through the same feed. A tag
 * carrying a path segment or a bare commit SHA is not a release.
 */
const NOT_A_RELEASE = /\/|^[0-9a-f]{7,40}$/i;

/**
 * Hugging Face is full of re-uploads: quantizations, LoRAs, and format
 * conversions of a base model that trends on its own. Drop the derivatives so
 * the Models bucket shows original releases.
 */
const HF_DERIVATIVE = /\b(gguf|awq|gptq|exl2|exl3|mlx|int4|int8|fp8|bnb|lora|quantiz|-w4a16)\b/i;

/** Topical gate for the open discovery lane. */
const ECO_RELEVANCE =
  /\b(llm|language model|gpt|claude|gemini|llama|mistral|qwen|deepseek|kimi|model|agent|agentic|mcp|model context protocol|plugin|sdk|toolkit|framework|library|release|launch|open-?weights?|fine-?tun|inference|serving|quantiz|embedding|vector|rag|knowledge graph|context window|orchestrat|protocol|spec)\b/i;

export function ecoStore(): Store {
  return getStore('news');
}

export async function readEcosystem(): Promise<EcoFeed | null> {
  return (await ecoStore().get('ecosystem.json', { type: 'json' })) as EcoFeed | null;
}

export async function writeEcosystem(feed: EcoFeed): Promise<void> {
  await ecoStore().setJSON('ecosystem.json', feed);
}

const withTimeout = (ms: number) => {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  return { signal: c.signal, done: () => clearTimeout(t) };
};

async function getText(url: string, ms = 8000): Promise<string | null> {
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

/** Run `jobs` with bounded concurrency so a 17-repo watchlist can't stall the function. */
async function pool<T>(jobs: Array<() => Promise<T>>, limit = 6): Promise<T[]> {
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

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
const asArray = <T,>(v: T | T[] | undefined): T[] => (v === undefined ? [] : Array.isArray(v) ? v : [v]);
const clean = (s: unknown, max = 400): string =>
  String(s ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);

/** Pull the alternate link href out of an Atom entry (string or array form). */
function atomLink(entry: any): string {
  const links = asArray(entry?.link);
  for (const l of links) {
    const href = typeof l === 'string' ? l : l?.['@_href'];
    const rel = typeof l === 'string' ? 'alternate' : l?.['@_rel'] ?? 'alternate';
    if (href && rel === 'alternate') return String(href);
  }
  const first = links[0];
  return String((typeof first === 'string' ? first : first?.['@_href']) ?? '');
}

/* ------------------------------------------------------------------ tracked */

/** One repo's recent releases, from its Atom feed. */
export async function fetchReleases(repo: string, hint: EcoBucket): Promise<EcoItem[]> {
  const xml = await getText(`https://github.com/${repo}/releases.atom`);
  if (!xml) return [];
  const entries = asArray(parser.parse(xml)?.feed?.entry).slice(0, 6);
  const now = Date.now();
  const out: EcoItem[] = [];
  for (const e of entries) {
    const tag = clean(e?.title, 60);
    if (!tag || PRERELEASE.test(tag) || NOT_A_RELEASE.test(tag)) continue;
    const url = atomLink(e);
    if (!url) continue;
    const published = e?.updated ? new Date(String(e.updated)).toISOString() : new Date().toISOString();
    if (now - new Date(published).getTime() > TRACKED_WINDOW_MS) continue;
    out.push({
      id: `gh:${repo}:${tag}`,
      title: `${repo.split('/')[1]} ${tag}`,
      url,
      source: repo,
      lane: 'tracked',
      published,
      version: tag,
      summary: clean(e?.content?.['#text'] ?? e?.content, 500) || `New release of ${repo}.`,
      bucket: hint,
    });
  }
  // At most two releases per repo, so a chatty monorepo cannot flood the lane.
  return out.slice(0, 2);
}

export async function fetchWatchlist(): Promise<EcoItem[]> {
  const results = await pool(WATCHLIST.map(({ repo, hint }) => () => fetchReleases(repo, hint)));
  return results.flat();
}

/* --------------------------------------------------------------- discovered */

/** Trending models on Hugging Face — discovery, not a fixed list. */
export async function fetchTrendingModels(): Promise<EcoItem[]> {
  const raw = await getText(
    'https://huggingface.co/api/models?sort=trendingScore&direction=-1&limit=20',
  );
  if (!raw) return [];
  try {
    const models = JSON.parse(raw) as any[];
    return models
      .filter((m) => m?.modelId || m?.id)
      .filter((m) => !HF_DERIVATIVE.test(String(m.modelId ?? m.id)))
      .map((m) => {
        const id = String(m.modelId ?? m.id);
        return {
          id: `hf:${id}`,
          title: id,
          url: `https://huggingface.co/${id}`,
          source: 'Hugging Face',
          lane: 'discovered' as const,
          published: m.lastModified ? new Date(m.lastModified).toISOString() : new Date().toISOString(),
          version: m.pipeline_tag ? String(m.pipeline_tag) : undefined,
          summary: `Trending model. Task: ${m.pipeline_tag ?? 'unspecified'}. Downloads: ${m.downloads ?? 0}.`,
          bucket: 'Models' as EcoBucket,
        };
      })
      .slice(0, 12);
  } catch {
    return [];
  }
}

/**
 * GitHub Trending. There is no API for this page, so it is scraped — tolerantly,
 * and returning [] on any surprise rather than throwing. This is the lane's best
 * shot at a brand-new project that has no release history yet.
 */
export async function fetchGithubTrending(): Promise<EcoItem[]> {
  const html = await getText('https://github.com/trending?since=daily', 10000);
  if (!html) return [];
  const rows = html.split('<article');
  const out: EcoItem[] = [];
  for (const row of rows.slice(1)) {
    const repo = /<h2[^>]*>\s*<a[^>]*href="\/([^"?]+)"/.exec(row)?.[1];
    if (!repo || repo.split('/').length !== 2) continue;
    const desc = /<p[^>]*class="col-9[^"]*"[^>]*>\s*([^<]{10,300})/.exec(row)?.[1];
    out.push({
      id: `ght:${repo}`,
      title: repo,
      url: `https://github.com/${repo}`,
      source: 'GitHub Trending',
      lane: 'discovered',
      published: new Date().toISOString(),
      summary: clean(desc, 300) || `Trending repository ${repo}.`,
    });
    if (out.length >= 15) break;
  }
  return out;
}

/** Show HN + AI-tagged front page stories: where new SDKs and tools get announced. */
export async function fetchLaunches(): Promise<EcoItem[]> {
  const endpoints = [
    'https://hn.algolia.com/api/v1/search_by_date?tags=show_hn&numericFilters=points%3E15&hitsPerPage=30',
    'https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=30',
  ];
  const out: EcoItem[] = [];
  for (const url of endpoints) {
    const raw = await getText(url, 8000);
    if (!raw) continue;
    try {
      for (const h of JSON.parse(raw).hits ?? []) {
        const title = String(h.title || h.story_title || '').trim();
        if (!title) continue;
        out.push({
          id: `hn:${h.objectID}`,
          title,
          url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
          source: 'Hacker News',
          lane: 'discovered',
          published: new Date(
            (h.created_at_i ? h.created_at_i * 1000 : h.created_at) || Date.now(),
          ).toISOString(),
          points: typeof h.points === 'number' ? h.points : undefined,
          summary: clean(h.story_text ?? h._highlightResult?.title?.value, 300) || title,
        });
      }
    } catch {
      /* skip this endpoint */
    }
  }
  return out;
}

/**
 * Generic Atom/RSS reader used for subreddits and commentary feeds.
 *
 * Reddit throttles unpredictably and answers a rejected request with an HTML
 * page rather than an error status, so one retry is worth the second or two —
 * r/LocalLLaMA is the highest-signal discovery feed on the list.
 */
export async function fetchFeed(url: string, source: string): Promise<EcoItem[]> {
  let xml = await getText(url, 9000);
  if (!xml || !/<(entry|item)[\s>]/.test(xml)) {
    await new Promise((r) => setTimeout(r, 800));
    xml = await getText(url, 9000);
  }
  if (!xml) return [];
  const doc = parser.parse(xml);
  // Atom (<feed><entry>) and RSS (<rss><channel><item>) both appear here.
  const entries = asArray(doc?.feed?.entry);
  const items = asArray(doc?.rss?.channel?.item);
  const rows = entries.length ? entries : items;
  const out: EcoItem[] = [];
  for (const e of rows.slice(0, 20)) {
    const title = clean(e?.title, 200);
    const link = entries.length ? atomLink(e) : String(e?.link ?? '');
    if (!title || !link) continue;
    const when = e?.updated ?? e?.published ?? e?.pubDate;
    out.push({
      id: `feed:${source}:${link}`,
      title,
      url: link,
      source,
      lane: 'discovered',
      published: when ? new Date(String(when)).toISOString() : new Date().toISOString(),
      summary: clean(e?.summary?.['#text'] ?? e?.summary ?? e?.description ?? e?.content, 400),
    });
  }
  return out;
}

/**
 * Subreddit feeds, fetched IN SERIES on purpose. Reddit throttles concurrent
 * requests from one address, and Netlify functions egress from shared IPs — run
 * these in the general pool and the second subreddit reliably comes back empty.
 */
async function fetchSubreddits(): Promise<EcoItem[]> {
  const out: EcoItem[] = [];
  for (const s of SUBREDDITS) {
    out.push(...(await fetchFeed(`https://www.reddit.com/r/${s}/top/.rss?t=week`, `r/${s}`)));
  }
  return out;
}

export async function fetchDiscovery(): Promise<EcoItem[]> {
  const jobs: Array<() => Promise<EcoItem[]>> = [
    () => fetchTrendingModels(),
    () => fetchGithubTrending(),
    () => fetchLaunches(),
    () => fetchSubreddits(),
    ...COMMENTARY.map((c) => () => fetchFeed(c.url, c.source)),
  ];
  return (await pool(jobs, 5)).flat();
}

/* ------------------------------------------------------------------ shaping */

/**
 * Dedupe and quota. Both lanes get guaranteed slots: without a per-lane quota
 * the 17-repo watchlist would swamp the discovery sources that are the whole
 * reason this wire exists.
 */
export function prefilterEco(items: EcoItem[]): EcoItem[] {
  const now = Date.now();
  const seen = new Set<string>();
  const tracked: EcoItem[] = [];
  const discovered: EcoItem[] = [];

  for (const it of items) {
    if (!it.title || !it.url) continue;
    const key = it.url.replace(/[#?].*$/, '').toLowerCase();
    if (seen.has(key) || seen.has(it.id)) continue;

    if (it.lane === 'discovered') {
      if (now - new Date(it.published).getTime() > DISCOVER_WINDOW_MS) continue;
      // Hugging Face entries are on-topic by construction; everything else has
      // to mention something in the ecosystem vocabulary.
      if (it.source !== 'Hugging Face' && !ECO_RELEVANCE.test(`${it.title} ${it.summary ?? ''}`)) {
        continue;
      }
    }

    seen.add(key);
    seen.add(it.id);
    (it.lane === 'tracked' ? tracked : discovered).push(it);
  }

  tracked.sort((a, b) => b.published.localeCompare(a.published));
  discovered.sort(
    (a, b) => (b.points ?? 0) - (a.points ?? 0) || b.published.localeCompare(a.published),
  );

  return [...tracked.slice(0, 20), ...discovered.slice(0, 26)];
}

/** First few words of a title, lowercased — used to verify index alignment. */
const titleKey = (s: string): string =>
  s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(Boolean).slice(0, 4).join(' ');

const BUCKET_RULES = [
  'Assign every entry exactly one bucket:',
  '"Models" (a model or weights release),',
  '"Standards" (protocols and specs — MCP, schemas, interop),',
  '"Libraries" (SDKs, frameworks, plugins, serving and tooling),',
  '"Patterns" (architecture and technique — agent loops, knowledge graphs, memory,',
  'context engineering, retrieval design).',
].join(' ');

/**
 * Rank ONE lane. The lanes are ranked in separate calls on purpose.
 *
 * A single call over both lanes failed badly in testing: asked to rank 43 mixed
 * items at once, the model dropped all 26 discovery items — the entire reason
 * this wire exists — and its index mapping drifted, so descriptions were
 * attached to the wrong releases. Smaller, single-purpose lists fix both, and
 * the echo check below catches any residual drift.
 */
async function rankLane(candidates: EcoItem[], lane: EcoLane): Promise<EcoItem[]> {
  if (candidates.length === 0) return [];

  const list = candidates.map((c, i) => ({
    i,
    t: titleKey(c.title),
    source: c.source,
    title: c.title,
    version: c.version,
    points: c.points,
    summary: c.summary?.slice(0, 260),
  }));

  const laneRules =
    lane === 'tracked'
      ? [
          'These are dated releases from a watched set of repositories. Keep ALL of them —',
          'they are facts, not candidates. Rank by consequence: a major or minor version with',
          'real features outranks a patch or a per-package bump in a monorepo.',
        ].join(' ')
      : [
          'These came from open discovery, so some are irrelevant. KEEP anything about AI',
          'models, agents, protocols, SDKs, plugins, inference, retrieval, or AI architecture —',
          'especially a project you have not seen before, since surfacing genuinely new work is',
          'the point of this lane. DROP only clear noise: unrelated software, job and funding',
          'posts, hardware business news, and pure marketing. Prefer first releases of novel',
          'tools over incremental updates. Aim to keep at least half the entries.',
        ].join(' ');

  const system = [
    'You are the editor of an "AI ecosystem" wire for a graduate applied-AI newspaper.',
    'It covers what SHIPPED and what practitioners adopt — not research papers.',
    laneRules,
    BUCKET_RULES,
    'Return ONLY valid JSON: an array of { "i": <the entry\'s index>, "t": <copy the',
    'entry\'s "t" value back verbatim>, "bucket": <one of the four>, "why": <one sentence,',
    'max 200 chars, on why it matters> }, ordered best first. Copying "t" back is required',
    'so the mapping can be verified. No prose outside the JSON.',
  ].join(' ');

  const res = await getClient().messages.create({
    model: NEWS_MODEL,
    max_tokens: 3000,
    system,
    messages: [{ role: 'user', content: JSON.stringify(list) }],
  });
  const raw = res.content
    .filter((b: any) => b.type === 'text')
    .map((b: any) => b.text)
    .join('');
  const ranked = JSON.parse(raw.slice(raw.indexOf('['), raw.lastIndexOf(']') + 1)) as Array<{
    i: number;
    t?: string;
    bucket?: string;
    why?: string;
  }>;

  const ordered: EcoItem[] = [];
  const used = new Set<number>();
  for (const r of ranked) {
    const item = candidates[r.i];
    if (!item || used.has(r.i)) continue;
    // Echo check: if the returned title key doesn't match the item at that index,
    // the model's mapping has drifted — keep the item but discard its prose rather
    // than captioning one release with another's description.
    const aligned = !r.t || r.t === list[r.i].t;
    used.add(r.i);
    ordered.push({
      ...item,
      bucket: (aligned && ECO_BUCKETS.find((b) => b === r.bucket)) || item.bucket || 'Libraries',
      why: aligned ? r.why?.slice(0, 240) : undefined,
    });
  }

  // Tracked releases are facts: restore any the model forgot. Discovery items it
  // omitted were judged noise, which is the ranker doing its job.
  if (lane === 'tracked') {
    candidates.forEach((c, i) => {
      if (!used.has(i)) ordered.push({ ...c, bucket: c.bucket ?? 'Libraries' });
    });
  }
  return ordered;
}

/**
 * Rank both lanes and interleave. Each lane is ranked independently so neither
 * can be squeezed out of the feed by the other.
 */
export async function rankEcosystem(candidates: EcoItem[]): Promise<EcoItem[]> {
  if (candidates.length === 0) return [];
  const tracked = candidates.filter((c) => c.lane === 'tracked');
  const discovered = candidates.filter((c) => c.lane === 'discovered');

  const [t, d] = await Promise.all([
    rankLane(tracked, 'tracked').catch(() => tracked.map((c) => ({ ...c, bucket: c.bucket ?? ('Libraries' as EcoBucket) }))),
    rankLane(discovered, 'discovered').catch(() => discovered.map((c) => ({ ...c, bucket: c.bucket ?? ('Libraries' as EcoBucket) }))),
  ]);

  // Discovery first within each bucket — the new thing is the story; the version
  // bump is the record. The UI groups by bucket and preserves this order.
  return [...d, ...t];
}

/** Full refresh pipeline for the ecosystem wire. */
export async function buildEcosystemFeed(): Promise<EcoFeed> {
  const [tracked, discovered] = await Promise.all([fetchWatchlist(), fetchDiscovery()]);
  const all = [...tracked, ...discovered];

  // If every live source failed, keep the previous feed rather than publishing an
  // empty one (the same carry-forward guard the research wire needed for arXiv).
  if (all.length === 0) {
    const prev = await readEcosystem().catch(() => null);
    if (prev?.items?.length) return prev;
  }

  const items = await rankEcosystem(prefilterEco(all));
  return { generatedAt: new Date().toISOString(), items };
}
