# The Course Ledger

A static **newspaper** that turns a folder of source PDFs into long-form, in-depth
feature articles — concepts explained as sections with KaTeX math and hand-drawn
SVG diagrams. A **"Dig deeper"** assistant (Claude Haiku, via a serverless proxy)
lets you interrogate any concept, and a daily **"Latest in AI"** page runs two
wires: fresh research from arXiv and Hacker News, and an **ecosystem** wire
tracking model releases, protocol versions, libraries, and design patterns.

It ships with several AI courses out of the box, but it's built to be reused: point
it at your own PDFs, edit one config file, and you have your own edition.

---

## Contents

- [Features](#features)
- [How it works](#how-it-works)
- [The two `/latest` wires](#the-two-latest-wires)
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
- [Deploy to Netlify](#deploy-to-netlify)
- [Security & cost controls](#security--cost-controls)
- [Authentication (disabled)](#authentication-disabled)
- [Troubleshooting](#troubleshooting)
- [Dependency audit note](#dependency-audit-note)

## Features

- **In-depth feature articles** authored from the source PDFs, with KaTeX math
  and themed inline SVG diagrams (light/dark aware).
- **Newspaper UI** — front page, per-course section fronts, feature pages with a
  Key Terms rail.
- **Curated front page** — a generic home page (no hard-coded course count) with
  *Editor's Picks* and *Top Stories* that surface standout features from every desk.
- **Reader themes** — a light default styled after the *Financial Times* (salmon
  paper, claret flags, Oxford-blue links) with a one-click light/dark toggle,
  remembered per browser.
- **"Dig deeper" chat** — a Netlify Function proxies to Claude Haiku; the API key
  never reaches the browser. Conversations are saved and can be reopened,
  downloaded, or deleted.
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
- **Incremental content pipeline** — adding a feature or a course is a delta, never
  a full rebuild.
- **Installable** — a real PWA: web app manifest, maskable Android icons, an
  iOS `apple-touch-icon`, and a `theme-color` that follows the light/dark toggle.
- **Reads on a phone** — wide diagrams scroll at legible size instead of shrinking,
  the section nav is a one-line scroll strip, and safe-area insets keep content
  clear of notches and the home indicator in standalone mode.
- **Scripted lifecycle** — setup, start/stop (with port cleanup), build, deploy.

## How it works

```text
Documents/<Course>/*.pdf
        │  npm run extract  (incremental)
        ▼
content/_extracted/<slug>/*.txt  +  manifest.json      (gitignored, regenerable)
        │  authored into
        ▼
src/content/articles/<slug>/*.md   ──►  Astro build  ──►  dist/ (static HTML)
                                                            │
Browser ──/api/chat──────►  netlify/functions/chat.ts  ──►  Claude Haiku
        ──/api/news──────►  netlify/functions/get-news.ts      ◄┐
        ──/api/ecosystem─►  netlify/functions/get-ecosystem.ts ◄┤
                                   │                            │
                             Netlify Blobs          news-refresh (daily cron,
                    (transcripts + both feeds)       builds both wires)
```

The single source of truth for courses is [`courses.config.json`](courses.config.json),
shared by the site, the extraction script, and the Functions.

## The two `/latest` wires

`/latest` carries two independent feeds. Both are rebuilt by the same daily
scheduled function and cached in Blobs, and each costs one Haiku call per run.

| | **Latest in AI** (research) | **The Ecosystem** (releases) |
| --- | --- | --- |
| Question | What is being *discovered*? | What is being *used*? |
| Sources | arXiv RSS, Hacker News | GitHub release feeds, GitHub Trending, Hugging Face, Show HN, subreddit + commentary RSS |
| Grouping | Ranked list, free-form category | Four fixed buckets: Models · Standards · Libraries · Patterns |
| Endpoint | `/api/news` | `/api/ecosystem` |
| Code | [`netlify/lib/news.ts`](netlify/lib/news.ts) | [`netlify/lib/ecosystem.ts`](netlify/lib/ecosystem.ts) |

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

Edit the `WATCHLIST` constant in [`netlify/lib/ecosystem.ts`](netlify/lib/ecosystem.ts) —
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
  60 requests/hour *per IP* and Netlify Functions share egress addresses, so a
  watchlist of this size would intermittently `403`. The Atom feeds have no cap
  and need no token.
- **X/Twitter is deliberately absent.** Its API returns `401` unauthenticated and
  read access starts at a paid tier, so there is no free integration to offer.
  Show HN, GitHub Trending, and subreddit feeds carry a similar signal.
- **Reddit is best-effort.** The `.json` API is blocked; the `.rss` feeds work but
  require a browser-style user agent and rate-limit concurrent requests, so
  subreddits are fetched in series. Expect it to fail sometimes from cloud IPs —
  Hacker News, GitHub Trending, and Hugging Face are the dependable sources.
- **GitHub Trending is scraped.** That page has no API, so the parser is tolerant
  and returns nothing (rather than erroring) if the markup changes.
- Every source failure degrades to an empty list, and if *all* sources fail the
  previous cached feed is kept rather than publishing an empty one.

## Installable app (PWA) and icons

The site installs as a standalone app on Android, iOS, and desktop Chrome.

**The mark** is "The Ledger Rule" — a claret serif `L` framed by the paper's
signature double rule, in the same tokens as the stylesheet (`#fff1e5` paper,
`#33302e` ink, `#990f3d` claret). It is deliberately three shapes so it still
reads at 16px in a browser tab.

Sources live in `assets/icons/` and are **not** published; `public/` gets the
rasterised output, which is committed so a Netlify build never has to run a
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
| Site        | [Astro](https://astro.build) 7 (static output) + `@astrojs/netlify` |
| Math        | `remark-math` + `rehype-katex` (KaTeX)                            |
| Serverless  | Netlify Functions (v1 handler API)                                |
| Storage     | Netlify Blobs                                                     |
| LLM         | Anthropic Claude Haiku (`@anthropic-ai/sdk`)                      |
| PDF text    | `unpdf`                                                           |
| News        | arXiv RSS + Hacker News (Algolia) via `fast-xml-parser`           |
| Ecosystem   | GitHub `releases.atom` + GitHub Trending + Hugging Face API + RSS |
| Icons       | Hand-authored SVG rasterised with `sharp` (`npm run icons`)       |

## Prerequisites

- **Node.js ≥ 22.12** (required by Astro 7) and npm.
- An **Anthropic API key** (for chat + news ranking) — [console.anthropic.com](https://console.anthropic.com).
- A **Netlify account** (for deploy). The Netlify CLI is installed as a dev
  dependency, so no global install is needed.

## Quick start

```bash
npm run setup      # installs deps, creates .env, extracts PDF text
# edit .env and set ANTHROPIC_API_KEY

npm run dev        # pages only          -> http://localhost:4321
# or
npm start          # full stack (chat + news via Functions/Blobs) -> http://localhost:8888
```

> `npm run setup` runs `npm install`, copies `.env.example` → `.env` (if missing),
> and runs `npm run extract`. Chat needs a real `ANTHROPIC_API_KEY` in `.env`, and
> Blobs-backed history/news only work once the site is linked/deployed (see
> [Troubleshooting](#troubleshooting)).

## Scripts

| Command                | What it does                                                         |
| ---------------------- | -------------------------------------------------------------------- |
| `npm run setup`        | Install deps, create `.env`, extract PDF text.                       |
| `npm run dev`          | Astro dev server (pages only) on **:4321**.                          |
| `npm start`            | Full stack via Netlify Dev on **:8888** (Functions + Blobs + redirects). |
| `npm stop`             | Stop the full-stack server and free ports 4321/4322/8888.            |
| `npm run restart`      | `stop` then `start`.                                                 |
| `npm run status`       | Report whether the server is running and which ports are busy.       |
| `npm run build`        | Production build into `dist/`.                                       |
| `npm run preview`      | Preview the built site.                                              |
| `npm run extract`      | Extract PDF text (incremental). See below for per-course usage.      |
| `npm run icons`        | Regenerate the PWA/favicon PNGs from `assets/icons/*.svg`.            |
| `npm run deploy`       | Deploy a **draft** preview to Netlify.                               |
| `npm run deploy:prod`  | Deploy to **production**.                                            |

## Project structure

```text
courses.config.json        # SINGLE SOURCE OF TRUTH for courses (slug, dir, titles)
courses.schema.json        # JSON schema for the above (editor validation)
netlify.toml               # build, functions dir, redirects, security headers/CSP
astro.config.mjs           # Astro config (KaTeX pipeline, Netlify adapter)
.copilot/memory/           # assistant repo memory (version-controlled project notes)
Documents/<Course>/*.pdf   # source PDFs (input)
content/_extracted/        # extracted text + manifest.json (gitignored, regenerable)
assets/icons/              # hand-authored icon SOURCES (not published)
  mark.svg · mark-maskable.svg · og.svg
public/                    # published verbatim; icon PNGs here are generated
  favicon.svg · favicon-32.png · apple-touch-icon.png · og.png
  manifest.webmanifest · icons/icon-{192,512}.png · icons/icon-maskable-{192,512}.png
scripts/
  extract-pdfs.mjs         # PDF -> text (incremental)
  make-icons.mjs           # SVG -> the PNG icon set (run on demand, outputs committed)
  rehype-figscroll.mjs     # wraps wide figures/tables in a scroll container at build time
  setup.sh · serve.sh · deploy.sh
src/
  content.config.ts        # `articles` collection schema (zod)
  content/articles/<slug>/*.md   # the authored feature articles
  layouts/Newspaper.astro
  components/ConceptChat.astro    # the "Dig deeper" chat island
  pages/  index.astro · latest.astro · courses/[course].astro · courses/[course]/[lecture].astro
  lib/courses.ts           # reads courses.config.json
  styles/newspaper.css
netlify/
  functions/  chat.ts · threads.ts · get-news.ts · get-ecosystem.ts · news-refresh.ts · refresh-news.ts
  lib/        identity.ts · validate.ts · blobs.ts · anthropic.ts · ratelimit.ts · http.ts
              news.ts       # research wire (arXiv + Hacker News)
              ecosystem.ts  # ecosystem wire (WATCHLIST lives here)
```

## Adding content (a delta operation)

Everything here is incremental — you never rebuild existing content.

### Add features to an existing course

1. Drop the new PDF(s) into `Documents/<Course>/`.
2. `npm run extract` — only the **new** PDFs are processed; cached text is reused,
   and the manifest is merged.
3. Author the article(s): create `src/content/articles/<slug>/<feature>.md` with
   frontmatter matching [`src/content.config.ts`](src/content.config.ts) (`course`,
   `lectureId`, `title`, `deck`, `order`, `concepts[]`, …). Astro picks up new
   files automatically — no rebuild of other articles.

To re-extract just one course: `npm run extract -- <slug>` (add `--force` to
overwrite existing text).

### Add a whole new course

1. Add an entry to [`courses.config.json`](courses.config.json) (`slug`, `title`,
   `shortTitle`, `dir`, `blurb`). This one file feeds the site nav, the extractor,
   and server-side validation.
2. Create `Documents/<dir>/` and add the PDFs.
3. `npm run extract -- <slug>`.
4. Author `src/content/articles/<slug>/*.md`.

The new desk, its section front, and its feature pages appear on the next build.

## Local development

Two servers, depending on what you're working on:

- **`npm run dev` (:4321)** — fast Astro dev server with HMR. Best for editing
  pages, articles, styles, and diagrams. Functions are **not** served here.
- **`npm start` (:8888)** — full Netlify stack (pages + Functions + Blobs +
  `/api/*` redirects). Use this to exercise chat and news. Stop with `npm stop`.

`npm start`/`npm stop` clear stale ports automatically, which matters because
Astro 7 and Netlify Dev both bind ports.

## Configuration

Environment variables (see [`.env.example`](.env.example)):

| Variable               | Required | Default            | Purpose                                    |
| ---------------------- | -------- | ------------------ | ------------------------------------------ |
| `ANTHROPIC_API_KEY`    | yes      | —                  | Chat + news ranking. **Functions-only.**   |
| `CHAT_MODEL`           | no       | `claude-haiku-4-5` | Chat model id.                             |
| `NEWS_MODEL`           | no       | `claude-haiku-4-5` | News-ranking model id.                     |
| `CHAT_DAILY_CAP`       | no       | `100`              | Max chat messages per client IP per day.   |
| `CHAT_MAX_INPUT_CHARS` | no       | `4000`             | Max characters per chat message.           |
| `NEWS_REFRESH_KEY`     | no       | — (disabled)       | Secret enabling on-demand `GET /api/refresh-news?key=…&wire=research\|ecosystem\|both`. |

Locally these come from `.env`. In production they're set in the Netlify UI.

## Deploy to Netlify

The build is fully described by [`netlify.toml`](netlify.toml) (build command,
publish dir, functions dir, redirects, security headers). Deploy either way:

### Option A — Git-based (recommended)

1. Push the repo to GitHub/GitLab/Bitbucket.
2. In Netlify: **Add new site → Import an existing project**, pick the repo.
   Build command and publish directory are detected from `netlify.toml` — accept
   the defaults.
3. **Site configuration → Environment variables** → add `ANTHROPIC_API_KEY`
   (scope: **Functions**). Optionally add `CHAT_MODEL`, `NEWS_MODEL`,
   `CHAT_DAILY_CAP`, `CHAT_MAX_INPUT_CHARS`, `NEWS_REFRESH_KEY`.
4. **Blobs** — no setup needed; it's provisioned automatically for the site.
5. **Scheduled function** — `news-refresh` self-registers to run daily at
   **13:00 UTC** and rebuilds *both* `/latest` wires (one Haiku call each). Until
   it first runs, `/latest` shows empty states. To populate immediately, set
   `NEWS_REFRESH_KEY` (a long random string) and call
   `https://<your-site>/api/refresh-news?key=<secret>` once. Add
   `&wire=ecosystem` (or `research`) to rebuild just one wire without spending a
   call on the other.
6. Deploy. Every push to the production branch redeploys.

### Option B — CLI

```bash
npx netlify login
npx netlify init          # create & link a new site (or: npx netlify link)
npx netlify env:set ANTHROPIC_API_KEY "sk-ant-..."   # Functions scope by default
npm run deploy:prod       # build + deploy to production
```

`npm run deploy` (no suffix) publishes a **draft** preview URL for testing before
going live.

### Custom domain (optional)

**Site configuration → Domain management → Add a domain**, then follow Netlify's
DNS instructions. HTTPS (including the HSTS header in `netlify.toml`) is automatic.

## Security & cost controls

- **API key isolation** — `ANTHROPIC_API_KEY` is read only inside Functions; the
  build output in `dist/` contains no secret.
- **Cost guardrail** — chat is rate-limited per client IP (`CHAT_DAILY_CAP`/day →
  `429`). Also set a **budget/spend limit in the Anthropic console** as a backstop.
- **Input validation** — message length and course slug are validated server-side;
  the system prompt is written to resist prompt injection.
- **Output safety** — assistant and wire text render via `textContent` (no HTML
  injection); every external link on both wires is protocol-validated
  (`http`/`https` only). Feed content is treated strictly as data — nothing
  fetched from a third-party source is executed or rendered as markup.
- **Headers** — a Content Security Policy and standard security headers are set in
  `netlify.toml`. The CSP allows Astro's own inlined first-party scripts and the
  inline styles KaTeX/Shiki need, while still blocking external script origins,
  framing, and objects.

## Authentication (disabled)

Login is currently **off** — chat is open to anyone who can reach the site, gated
only by the per-IP cap above. History is namespaced by an anonymous per-browser id
(`X-Visitor-Id`), which is convenience scoping, not a security boundary.

To re-enable Netlify Identity later: restore the Identity widget + sign-in control
in [`src/layouts/Newspaper.astro`](src/layouts/Newspaper.astro), swap the
`getVisitorId` calls back to the `getUser` check (kept in
[`netlify/lib/identity.ts`](netlify/lib/identity.ts)) in `chat.ts`/`threads.ts`,
and re-add `identity.netlify.com` to the CSP in `netlify.toml`.

## Troubleshooting

- **Port already in use / server won't start** → `npm stop` (clears 4321/4322/8888),
  then `npm start`. `npm run status` shows what's bound.
- **`netlify dev` exits immediately** → Astro 7 auto-backgrounds its dev server in
  agent/CI shells, which makes Netlify Dev quit. The `start` script sets
  `ASTRO_DEV_BACKGROUND=1` to keep Astro in the foreground; run via `npm start`
  rather than calling `netlify dev` directly.
- **`MissingBlobsEnvironmentError` locally** → Netlify Blobs needs a linked site.
  Chat still replies (persistence is best-effort) and news shows an empty state;
  run `npx netlify link` (or deploy) to enable Blobs-backed history and the cached
  feed.
- **Chat returns 502 locally** → `ANTHROPIC_API_KEY` isn't set in `.env` (or is a
  placeholder). Add a real key and restart.
- **Interactive pages look inert on :8888** → Netlify Dev applies the production
  CSP, and Astro's dev HMR uses blob-worker scripts it doesn't allow. Use
  `npm run dev` (:4321) for UI work. In production the CSP permits Astro's inlined
  first-party scripts, so `/latest` and the chat panel work normally.

## Dependency audit note

`npm audit` reports issues only in Netlify's build-time tooling and the unused
image-optimization chain (`esbuild` via `zip-it-and-ship-it`; `sharp`/`ipx`/
`@netlify/images`). None are reachable at runtime for this static site. The only
offered fix downgrades `@astrojs/netlify` to a version incompatible with Astro 7,
so it is intentionally not applied.

