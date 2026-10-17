# Latent Inference

A static **newspaper** that turns a folder of source PDFs into long-form, in-depth
feature articles — concepts explained as sections with KaTeX math and hand-drawn
SVG diagrams. A **"Dig deeper"** assistant (Claude Haiku, via a serverless proxy)
lets you interrogate any concept, and a daily **"Latest in AI"** page leads with
an **Agentic AI Intelligence Briefing** on enterprise adoption, then runs two
wires: fresh research from arXiv and Hacker News, and an **ecosystem** wire
tracking model releases, protocol versions, libraries, and design patterns. The
last 30 days of editions stay browsable.

It ships with seven sections of AI and machine-learning explainers, but it's built to
be reused: point it at your own PDFs, edit one config file, and you have your own edition.

---

## Contents

- [Features](#features)
- [How it works](#how-it-works)
- [The two `/latest` wires](#the-two-latest-wires)
- [The Agentic AI Intelligence Briefing](#the-agentic-ai-intelligence-briefing)
- [Edition history](#edition-history)
- [Installable app (PWA) and icons](#installable-app-pwa-and-icons)
- [Authoring diagrams](#authoring-diagrams)
- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [Adding content (a delta operation)](#adding-content-a-delta-operation)
- [Local development](#local-development)
- [Configuration](#configuration)
- [Deploy to AWS](#deploy-to-aws)
- [Security & cost controls](#security--cost-controls)
- [Authentication (disabled)](#authentication-disabled)
- [Troubleshooting](#troubleshooting)
- [Dependency audit note](#dependency-audit-note)

## Features

- **In-depth feature articles** authored from the source PDFs, with KaTeX math
  and themed inline SVG diagrams (light/dark aware).
- **Newspaper UI** — front page, section fronts, feature pages with a Key Terms
  rail, and a one-line nav that groups sections into pull-down menus.
- **Curated front page** — a generic home page (no hard-coded section count) with
  *Editor's Picks* and *Top Stories* that surface standout features from every desk.
- **Reader themes** — a light default styled after the *Financial Times* (salmon
  paper, claret flags, Oxford-blue links) with a one-click light/dark toggle,
  remembered per browser.
- **"Dig deeper" chat** — a Lambda function proxies to Claude Haiku; the API key
  never reaches the browser. Conversations are saved and can be reopened,
  downloaded, or deleted.
- **Agentic AI Intelligence Briefing** — each weekday, one Sonnet call reads
  enterprise vendor newsrooms, trade press, analysts, and targeted Google News
  searches, and writes a thesis plus the three developments that support it.
  See [The Agentic AI Intelligence Briefing](#the-agentic-ai-intelligence-briefing).
- **Latest in AI (research wire)** — a scheduled function pulls fresh work from
  arXiv (RSS) and Hacker News daily, keeps a balanced mix from each source, ranks
  them with one Haiku call, and caches the feed. It carries arXiv forward on days
  that feed is empty (arXiv announces only Sun–Thu), so the wire never collapses
  to one source.
- **The Ecosystem (releases wire)** — what *shipped*, in four buckets: Models,
  Standards, Libraries, Patterns. Runs a **tracked** lane (a watchlist of repos
  read via GitHub release feeds) alongside a **discovered** lane (trending models
  and repos, launches, community feeds) so brand-new projects can surface too.
  See [The two `/latest` wires](#the-two-latest-wires).
- **Edition history** — every wire is archived by day for 30 days; `/latest`
  has a date picker and shareable `?date=YYYY-MM-DD` links.
- **Incremental content pipeline** — adding a feature or a section is a delta, never
  a full rebuild.
- **Installable** — a real PWA: web app manifest, maskable Android icons, an
  iOS `apple-touch-icon`, and a `theme-color` that follows the light/dark toggle.
- **Reads on a phone** — wide diagrams scroll at legible size instead of shrinking,
  the nav shortens its labels to stay on one line, and safe-area insets keep content
  clear of notches and the home indicator in standalone mode.
- **Scripted lifecycle** — setup, start/stop (with port cleanup), build, deploy.

## How it works

```text
Documents/<Section>/*.pdf
        │  npm run extract  (incremental)
        ▼
content/_extracted/<slug>/*.txt  +  manifest.json      (gitignored, regenerable)
        │  authored into
        ▼
src/content/articles/<slug>/*.md   ──►  Astro build  ──►  dist/ (static HTML)
                                                            │
Browser ─► CloudFront ─┬─ pages ──► S3 (dist/)
                       └─ /api/* ─► Lambda "api" (server/router.ts)
                                      ├─ chat · threads ──────────► Claude Haiku
                                      └─ news · ecosystem · briefing · editions ◄┐
                                                   │                             │  EventBridge Scheduler
                                                   │                             │  → Lambda "jobs"
                                                   │                             │  (13:00 UTC wires,
                                                   ▼                             │   13:30 UTC briefing)
                                         S3 "data" bucket  ──────────────────────┘
                              (transcripts, feeds, 30 days of editions)
```

The single source of truth for sections is [`courses.config.json`](courses.config.json)
(the file keeps its original name), shared by the site, the extraction script, and the
Functions. Pages live at `/sections/<slug>/<article>`; old `/courses/...` URLs redirect
permanently via [`public/_redirects`](public/_redirects).

## The two `/latest` wires

Below the briefing, `/latest` carries two independent feeds. Both are rebuilt by
the same daily scheduled job and cached in the data store. The research wire costs
one Haiku call per run and the ecosystem wire two (one per lane).

| | **Latest in AI** (research) | **The Ecosystem** (releases) |
| --- | --- | --- |
| Question | What is being *discovered*? | What is being *used*? |
| Sources | arXiv RSS, Hacker News | GitHub release feeds, GitHub Trending, Hugging Face, Show HN, subreddit + commentary RSS, AI vendor announcement RSS |
| Grouping | Ranked list, free-form category | Four fixed buckets: Models · Standards · Libraries · Patterns |
| Endpoint | `/api/news` | `/api/ecosystem` |
| Code | [`server/lib/news.ts`](server/lib/news.ts) | [`server/lib/ecosystem.ts`](server/lib/ecosystem.ts) |

### Two lanes, because they fail in opposite ways

- **Tracked** — a fixed watchlist of repositories read via GitHub's
  `releases.atom`. Every item is a dated, versioned fact. Its blind spot is
  structural: a project not on the list can never appear.
- **Discovered** — open-ended sources that rank by trend or votes, so a project
  nobody has listed can still surface. Its cost is noise, which the ranker filters.

Each lane is ranked in its **own** Haiku call. Ranking both together was tried
first and failed badly: asked to handle one mixed list, the model dropped every
discovery item and its index mapping drifted, captioning releases with other
releases' summaries. Per-lane calls plus a title echo check fixed both.

### Changing what is tracked

Edit the `WATCHLIST` constant in [`server/lib/ecosystem.ts`](server/lib/ecosystem.ts) —
it is the single source of truth for that lane:

```ts
export const WATCHLIST: Array<{ repo: string; hint: EcoBucket }> = [
  { repo: 'modelcontextprotocol/modelcontextprotocol', hint: 'Standards' },
  { repo: 'vllm-project/vllm', hint: 'Libraries' },
  // add: owner/repo — any repo that publishes GitHub Releases
];
```

`hint` seeds the bucket; the ranker may override it. Pre-releases (`rc`, `beta`,
`nightly`, …) and CI tags are filtered out, and each repo contributes at most two
releases so a chatty monorepo cannot flood the lane.

### Source notes and limitations

- **GitHub Atom feeds, not the REST API.** Unauthenticated REST allows only
  60 requests/hour *per IP* and Lambda functions share egress addresses, so a
  watchlist of this size would intermittently `403`. The Atom feeds have no cap
  and need no token.
- **X/Twitter is deliberately absent.** Its API returns `401` unauthenticated and
  read access starts at a paid tier, so there is no free integration to offer.
  Show HN, GitHub Trending, and subreddit feeds carry a similar signal.
- **Reddit is best-effort.** The `.json` API is blocked; the `.rss` feeds work but
  require a browser-style user agent and rate-limit concurrent requests, so
  subreddits are fetched in series. Expect it to fail sometimes from cloud IPs —
  Hacker News, GitHub Trending, and Hugging Face are the dependable sources.
- **Vendor announcement feeds.** A launch like OpenAI's Agents API ships as a blog
  post, not a GitHub release, so the discovery lane reads first-party RSS from
  OpenAI, Google (AI blog and DeepMind), Microsoft Azure, Mistral, and AWS. Those
  feeds are mostly customer stories and tutorials, so only announcement-style
  titles are taken — at most 4 per vendor and 8 in all, with unused slots going
  back to the other discovery sources. Anthropic and Meta publish no feed and
  surface through Hacker News.
- **Keyword gates match whole words.** Both wires drop Hacker News stories whose
  title misses a topical term list, so plurals and stems must be spelled out
  (`agents?`, `quantiz\w*`) — a bare `agent` is why the Agents API launch never
  reached the ranker. Company names (OpenAI, Anthropic, Google, Microsoft,
  Mistral, Amazon/AWS) count in the research wire only alongside a shipping word
  such as *model*, *API*, or *release*: on their own they admitted the companies'
  non-AI news, which outscored real AI stories on points.
- **GitHub Trending is scraped.** That page has no API, so the parser is tolerant
  and returns nothing (rather than erroring) if the markup changes.
- Every source failure degrades to an empty list, and if *all* sources fail the
  previous cached feed is kept rather than publishing an empty one.

## The Agentic AI Intelligence Briefing

The first section on `/latest`. Where the wires list items, the briefing makes
an argument: a dateline, **Today's headline** (a one-sentence thesis about how
the enterprise is changing), and the three developments that support it, each
with a label, a takeaway, what it means for a technology leader, and its sources.

| | |
| --- | --- |
| Schedule | `briefing-refresh`, weekdays at 13:30 UTC (Monday's covers the weekend) |
| Window | Everything since the previous briefing (at least 24 h, at most 96 h) |
| Model | One call to `BRIEFING_MODEL` (default `claude-sonnet-5-5`), structured JSON output |
| Endpoint | `/api/briefing[?date=YYYY-MM-DD]` |
| Code | [`server/lib/briefing.ts`](server/lib/briefing.ts) |

**Sources** (the `BRIEFING_SOURCES` constant):

- **Vendor newsrooms:** Salesforce, SAP, Microsoft, Google Cloud, AWS,
  Databricks, Snowflake, OpenAI, Anthropic (via a community mirror, since it
  publishes no feed).
- **Trade press:** TechCrunch AI, SiliconANGLE, The Register, CIO Dive.
- **Analysts:** Latent Space, Import AI, Interconnects.
- **Google News searches:** six queries, for example enterprise AI agents and
  agentic commerce. These reach companies with no feed, such as Workday,
  ServiceNow, Shopify and JPMorgan.
- **Hacker News**, filtered to stories with enterprise terms.

ServiceNow, Workday, and IBM newsrooms and VentureBeat refuse feed readers, and
paywalled outlets can't be read, so they are not sources.

**How it stays honest.**
- The model only ever cites items by number. Every link is mapped back
  server-side from the fetched list, so it can't invent a URL.
- Items the previous briefing already cited are excluded.
- A quiet day (fewer than 8 candidates), a refusal, or ungrounded output
  publishes nothing, and the previous briefing stays current.

To rebuild it on demand: `/api/refresh-news?key=<secret>&wire=briefing`.

## Edition history

Each refresh also writes a dated snapshot beside the live keys in the `news`
store, as `editions/<research|ecosystem|briefing>/<YYYY-MM-DD>.json` (UTC
day). Snapshots older than 30 days are pruned on every refresh.

- `/api/editions` lists the archived days.
- `/api/news`, `/api/ecosystem`, and `/api/briefing` take `?date=YYYY-MM-DD`.
  A weekend date returns the most recent weekday briefing.
- `/latest?date=YYYY-MM-DD` renders that edition, with Older/Newer links and a
  date picker.

The page itself stays static. Past days are immutable, so their responses are
CDN-cached for a week, and the cache key varies only on `date`.

## Installable app (PWA) and icons

The site installs as a standalone app on Android, iOS, and desktop Chrome.

**The mark** is "The Ledger Rule" — a claret serif `L` framed by the paper's
signature double rule, in the same tokens as the stylesheet (`#fff1e5` paper,
`#33302e` ink, `#990f3d` claret). It is deliberately three shapes so it still
reads at 16px in a browser tab.

Sources live in `assets/icons/` and are **not** published; `public/` gets the
rasterised output, which is committed so a deploy build never has to run a
native image binary. Regenerate after editing a source:

```bash
npm run icons
```

Two constraints on the rasterisation sources, both enforced by convention:
literal hex fills only (librsvg ignores `@media`) and the letterform as a
`<path>`, never `<text>` (librsvg resolves fonts against the host machine).

`mark-maskable.svg` is separate artwork on purpose. Android crops maskable icons
to a circle of diameter `0.8 x size`, so at 512 every pixel of ink must sit
inside `[111, 401]` on both axes — the full-bleed mark's serifs and rule ends
would be sliced. `make-icons.mjs` reads back the rendered pixels and asserts the
ink bounding box against that window, so the geometry is checked on every run
rather than eyeballed.

**`theme-color` is driven by JavaScript**, not the `<meta media>` pattern: the
theme here is `localStorage`-driven rather than `prefers-color-scheme`. It is set
in two places in `src/layouts/Newspaper.astro` — the pre-paint script and the
toggle's `sync()` — with the two hex values hardcoded, because the pre-paint
script runs before the stylesheet is guaranteed to be applied. Keep them in sync
with `--paper` in `src/styles/newspaper.css`.

`public/favicon.svg` is the one place in the project that follows
`prefers-color-scheme`: browser chrome tracks the OS, not the site's stored
preference.

**No service worker**, deliberately. Chrome no longer requires one for
installability, and it would sit in front of the `/api/*` functions — including a
metered, rate-limited Anthropic proxy — while adding staleness to a corpus that
is actively edited.

> After changing the icons, an already-installed app will not repaint. Android
> may defer the manifest update for days; the reliable check is uninstall and
> reinstall. On iOS, re-add to the home screen.

## Authoring diagrams

Inline SVG figures are wrapped at build time by `scripts/rehype-figscroll.mjs`
in a `.figscroll` container, so on a phone they **scroll at readable size**
rather than scaling down to unreadable. Below 768px the SVG is pinned to a 760px
floor; an 820-unit `viewBox` then renders at 0.93x, so an 11px label lands at
about 10px.

**Author new diagrams with `viewBox` width ≤ 640 and `font-size` ≥ 14** and the
floor never has to bite — the figure fits a phone column without scrolling at
all.

The plugin wraps `figure > svg` and `table`, skips KaTeX's own inline `<svg>`,
and is idempotent. `<figcaption>` stays outside the scroller so the caption never
scrolls away from its figure.

## Tech stack

| Area        | Choice                                                            |
| ----------- | ----------------------------------------------------------------- |
| Site        | [Astro](https://astro.build) 7 (static output, no adapter)        |
| Math        | `remark-math` + `rehype-katex` (KaTeX)                            |
| Hosting     | AWS: CloudFront + S3 (pages), Lambda (API + jobs), EventBridge Scheduler |
| Storage     | S3 JSON documents (`server/lib/store.ts`)                         |
| Infra       | AWS CDK (TypeScript, `infra/`), deployed by GitHub Actions        |
| LLM         | Anthropic Claude Haiku (`@anthropic-ai/sdk`)                      |
| PDF text    | `unpdf`                                                           |
| News        | arXiv RSS + Hacker News (Algolia) via `fast-xml-parser`           |
| Ecosystem   | GitHub `releases.atom` + GitHub Trending + Hugging Face API + RSS |
| Icons       | Hand-authored SVG rasterised with `sharp` (`npm run icons`)       |

## Prerequisites

- **Node.js ≥ 22.12** (required by Astro 7) and npm.
- An **Anthropic API key** (for chat + news ranking) — [console.anthropic.com](https://console.anthropic.com).
- An **AWS account** and the AWS CLI v2 (for deploy). CDK is installed as a dev
  dependency, so no global install is needed.

## Quick start

```bash
npm run setup      # installs deps, creates .env, extracts PDF text
# edit .env and set ANTHROPIC_API_KEY

npm run dev        # pages only          -> http://localhost:4321
# or
npm start          # full stack (pages + /api, local file store) -> http://localhost:4321
```

> `npm run setup` runs `npm install`, copies `.env.example` → `.env` (if missing),
> and runs `npm run extract`. Chat and the news refresh need a real
> `ANTHROPIC_API_KEY` in `.env`. Locally, chat history and the feeds are stored as
> JSON files under `.data/` (gitignored).

## Scripts

| Command                | What it does                                                         |
| ---------------------- | -------------------------------------------------------------------- |
| `npm run setup`        | Install deps, create `.env`, extract PDF text.                       |
| `npm run dev`          | Astro dev server (pages only) on **:4321**.                          |
| `npm start`            | Full stack on **:4321**: Astro plus the local API server (`server/dev.ts`, :8787). |
| `npm stop`             | Stop both servers and free ports 4321/8787.                          |
| `npm run restart`      | `stop` then `start`.                                                 |
| `npm run status`       | Report whether the server is running and which ports are busy.       |
| `npm run build`        | Production build into `dist/`.                                       |
| `npm run preview`      | Preview the built site.                                              |
| `npm run extract`      | Extract PDF text (incremental). See below for per-section usage.     |
| `npm run icons`        | Regenerate the PWA/favicon PNGs from `assets/icons/*.svg`.            |
| `npm run api`          | Only the local API server (:8787).                                   |
| `npm run synth`        | Synthesize the CDK stack (bundles the Lambdas; no AWS calls).        |
| `npm run deploy`       | Deploy to AWS: infrastructure, build, upload, invalidate.           |

## Project structure

```text
courses.config.json        # SINGLE SOURCE OF TRUTH for sections and nav groups
courses.schema.json        # JSON schema for the above (editor validation)
cdk.json                   # CDK app entry (infra/bin/app.ts)
astro.config.mjs           # Astro config (KaTeX pipeline, dev /api proxy)
.copilot/memory/           # assistant repo memory (version-controlled project notes)
Documents/<Section>/*.pdf   # source PDFs (input)
content/_extracted/        # extracted text + manifest.json (gitignored, regenerable)
assets/icons/              # hand-authored icon SOURCES (not published)
  mark.svg · mark-maskable.svg · og.svg
public/                    # published verbatim; icon PNGs here are generated
  favicon.svg · favicon-32.png · apple-touch-icon.png · og.png
  manifest.webmanifest · icons/icon-{192,512}.png · icons/icon-maskable-{192,512}.png
  _redirects               # 301s from the old /courses/ URLs
scripts/
  extract-pdfs.mjs         # PDF -> text (incremental)
  make-icons.mjs           # SVG -> the PNG icon set (run on demand, outputs committed)
  rehype-figscroll.mjs     # wraps wide figures/tables in a scroll container at build time
  setup.sh · serve.sh · deploy.sh · migrate-blobs.sh (one-off Netlify → S3 copy)
src/
  content.config.ts        # `articles` collection schema (zod)
  content/articles/<slug>/*.md   # the authored feature articles
  layouts/Newspaper.astro
  components/ConceptChat.astro    # the "Dig deeper" chat island
  pages/  index.astro · latest.astro · sections/[section].astro · sections/[section]/[article].astro
  lib/courses.ts           # reads courses.config.json
  lib/edition.ts           # /latest edition-date helpers (client side)
  styles/newspaper.css
server/
  router.ts   # /api/* routes, shared by the Lambda and the dev server
  dev.ts      # local API server (npm start)
  aws/        api.ts (Function URL entry) · jobs.ts (scheduled refreshes)
  handlers/   chat.ts · threads.ts · get-news.ts · get-ecosystem.ts · get-briefing.ts · get-editions.ts · refresh-news.ts
  lib/        identity.ts · validate.ts · blobs.ts · anthropic.ts · ratelimit.ts · http.ts · types.ts
              store.ts      # JSON store: S3 in production, files in .data/ locally
              config.ts     # loads secrets from SSM Parameter Store
              jobs.ts       # the /latest refresh jobs
              feeds.ts      # shared RSS/Atom reader and fetch helpers
              news.ts       # research wire (arXiv + Hacker News)
              ecosystem.ts  # ecosystem wire (WATCHLIST lives here)
              briefing.ts   # enterprise briefing (BRIEFING_SOURCES lives here)
              editions.ts   # 30-day dated archive
              wire-endpoint.ts  # shared cached GET handler for the /latest endpoints
infra/
  bin/app.ts · lib/site-stack.ts   # the whole AWS stack
  lib/redirects.ts                 # public/_redirects → CloudFront Function
.github/workflows/deploy.yml       # deploy on push to main
```

## Adding content (a delta operation)

Everything here is incremental — you never rebuild existing content.

### Add features to an existing section

1. Drop the new PDF(s) into `Documents/<Section>/`.
2. `npm run extract` — only the **new** PDFs are processed; cached text is reused,
   and the manifest is merged.
3. Author the article(s): create `src/content/articles/<slug>/<feature>.md` with
   frontmatter matching [`src/content.config.ts`](src/content.config.ts) (`course`,
   `lectureId`, `title`, `deck`, `order`, `concepts[]`, …). Astro picks up new
   files automatically — no rebuild of other articles.

To re-extract just one section: `npm run extract -- <slug>` (add `--force` to
overwrite existing text).

### Add a whole new section

1. Add an entry to [`courses.config.json`](courses.config.json) (`slug`, `title`,
   `shortTitle`, `dir`, `tagline`, `blurb`, and optionally `group`). This one file
   feeds the site nav, the extractor, and server-side validation. A `group` (one of
   the `groups` ids, such as `ai` or `ml`) places the section in that nav pull-down;
   without one it gets its own top-level nav link.
2. Create `Documents/<dir>/` and add the PDFs.
3. `npm run extract -- <slug>`.
4. Author `src/content/articles/<slug>/*.md`.

The new desk, its section front, and its feature pages appear on the next build.

## Local development

Two ways to run it, depending on what you're working on:

- **`npm run dev` (:4321)** — Astro alone, with HMR. Best for editing pages,
  articles, styles, and diagrams. `/api` calls fail here.
- **`npm start` (:4321)** — Astro plus the local API server
  ([`server/dev.ts`](server/dev.ts), :8787), which runs the same router as the
  Lambda against JSON files in `.data/`. Astro proxies `/api` to it. Use this to
  exercise chat and the news wires. Stop with `npm stop`.

To fill the wires locally, set `NEWS_REFRESH_KEY` in `.env` and call
`http://localhost:4321/api/refresh-news?wire=both` (or `wire=briefing`) with the
header `X-Refresh-Key: <key>`.

## Configuration

Environment variables (see [`.env.example`](.env.example)):

| Variable               | Required | Default            | Purpose                                    |
| ---------------------- | -------- | ------------------ | ------------------------------------------ |
| `ANTHROPIC_API_KEY`    | yes      | —                  | Chat + news ranking. **Server-only.**      |
| `CHAT_MODEL`           | no       | `claude-haiku-4-5` | Chat model id.                             |
| `NEWS_MODEL`           | no       | `claude-haiku-4-5` | News-ranking model id.                     |
| `BRIEFING_MODEL`       | no       | `claude-sonnet-5-5` | Briefing synthesis model id (one call per weekday). |
| `CHAT_DAILY_CAP`       | no       | `100`              | Max chat messages per client IP per day.   |
| `CHAT_GLOBAL_DAILY_CAP`| no       | `300`              | Max chat messages per day, site-wide.      |
| `CHAT_MAX_INPUT_CHARS` | no       | `4000`             | Max characters per chat message.           |
| `NEWS_REFRESH_KEY`     | no       | — (disabled)       | Secret enabling on-demand `GET /api/refresh-news?key=…&wire=research\|ecosystem\|both\|briefing`. |

Locally these come from `.env`. In production the two secrets
(`ANTHROPIC_API_KEY`, `NEWS_REFRESH_KEY`) are SSM Parameter Store SecureStrings
under `/latent-inference/`, read by the Lambdas at cold start. The models and caps
are plain Lambda environment variables set in
[`infra/lib/site-stack.ts`](infra/lib/site-stack.ts).

## Deploy to AWS

Everything is defined in [`infra/lib/site-stack.ts`](infra/lib/site-stack.ts)
(AWS CDK, `us-east-1`):

- **CloudFront** serves the pages from a private S3 bucket, and `/api/*` from the
  `api` Lambda's Function URL.
  - A CloudFront Function applies the legacy 301s from
    [`public/_redirects`](public/_redirects) and maps `/dir/` URLs to
    `index.html`.
  - A response-headers policy sets the CSP and security headers.
- **EventBridge Scheduler** runs the `jobs` Lambda for the news wires daily at
  13:00 UTC and the briefing on weekdays at 13:30 UTC.
- **An S3 data bucket** holds the feeds, the edition archive, and chat threads.
- **A monthly AWS Budget** sends email alerts (set `BUDGET_EMAIL`).

**Cost:** at this site's traffic, everything stays inside AWS's always-free
tiers (CloudFront 1 TB / 10M requests, Lambda 1M requests / 400K GB-s, and so
on). Expect about $0–1 a month, plus Anthropic usage.

### First deploy (once, from a laptop)

```bash
aws login                                   # your AWS account
npx cdk bootstrap aws://<account-id>/us-east-1
aws ssm put-parameter --region us-east-1 --type SecureString \
  --name /latent-inference/ANTHROPIC_API_KEY --value "sk-ant-..."
aws ssm put-parameter --region us-east-1 --type SecureString \
  --name /latent-inference/NEWS_REFRESH_KEY --value "$(openssl rand -hex 24)"
BUDGET_EMAIL=you@example.com npm run deploy
```

The deploy prints the site URL (`https://<id>.cloudfront.net`). Then in the
GitHub repo, under **Settings → Secrets and variables → Actions → Variables**, add:

- `AWS_DEPLOY_ROLE_ARN`: the stack's `DeployRoleArn` output.
- `BUDGET_EMAIL` (optional).

### After that

Every push to `main` deploys through
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). It signs in with
GitHub's OIDC token, so no AWS keys are stored in GitHub.

### Custom domain (later)

Request an ACM certificate in `us-east-1`, then add `domainNames` and
`certificate` to the distribution in the stack. Point the domain's DNS at the
CloudFront address and set `SITE_URL` to match.

## Security & cost controls

- **API key isolation** — `ANTHROPIC_API_KEY` lives in SSM and is read only
  inside the Lambdas; the build output in `dist/` contains no secret.
- **Origin lock** — CloudFront adds a secret header (the stack's UUID) to every
  `/api` request, and the Lambda refuses anything without it. The Function URL
  can't be called around the CDN.
- **Cost guardrail** — chat is rate-limited per client IP (`CHAT_DAILY_CAP`/day →
  `429`) and site-wide (`CHAT_GLOBAL_DAILY_CAP`). AWS has no hard spend cap, so
  the stack adds a budget alert. Also set a **spend limit in the Anthropic
  console** as a backstop.
- **Input validation** — message length and section slug are validated server-side;
  the system prompt is written to resist prompt injection.
- **Output safety** — assistant and wire text render via `textContent` (no HTML
  injection); every external link on both wires is protocol-validated
  (`http`/`https` only). Feed content is treated strictly as data — nothing
  fetched from a third-party source is executed or rendered as markup.
- **Headers** — a Content Security Policy and standard security headers are set by
  a CloudFront response-headers policy. The CSP allows Astro's own inlined first-party scripts and the
  inline styles KaTeX/Shiki need, while still blocking external script origins,
  framing, and objects.

## Authentication (disabled)

Login is currently **off** — chat is open to anyone who can reach the site, gated
only by the per-IP cap above. History is namespaced by an anonymous per-browser id
(`X-Visitor-Id`), which is convenience scoping, not a security boundary.

Re-enabling login would mean adding an identity provider (for example Amazon
Cognito) and checking its token in `server/handlers/chat.ts` and `threads.ts`
in place of `getVisitorId`.

## Troubleshooting

- **Port already in use / server won't start** → `npm stop` (clears 4321/8787),
  then `npm start`. `npm run status` shows what's bound.
- **Astro exits immediately under `npm start`** → Astro 7 auto-backgrounds its dev
  server in agent/CI shells. The `start` script sets `ASTRO_DEV_BACKGROUND=1` to
  keep it in the foreground; run via `npm start`.
- **Chat returns 502** → `ANTHROPIC_API_KEY` isn't set (in `.env` locally, or the
  SSM parameter in AWS). Check the `api` function's CloudWatch logs.
- **A new briefing doesn't show** → the refresh invalidates the live `/api` paths
  in CloudFront; invalidations take a few seconds to a minute.
- **`cdk deploy` fails with "not bootstrapped"** → run `npx cdk bootstrap` once
  for the account and `us-east-1`.

## Dependency audit note

No server adapter is used, deliberately. An adapter registers a server function
on `/*`, so every request for a URL without a static file — bot probes for
`/wp-login.php`, `/.env`, and the like — would invoke a function and bill
compute. The site is fully static; missing URLs get `404.html` from CloudFront.
Do not add an adapter unless a page genuinely needs on-demand rendering.
