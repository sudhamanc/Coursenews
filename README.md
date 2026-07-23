# The Course Ledger

A static **newspaper** that turns university lecture PDFs into long-form, in-depth
feature articles — concepts explained as sections with KaTeX math and hand-drawn
SVG diagrams. A **"Dig deeper"** assistant (Claude Haiku, via a serverless proxy)
lets you interrogate any concept, and a daily **"Latest in AI"** wire ranks fresh
work from arXiv and Hacker News.

It ships with four AI courses out of the box, but it's built to be reused: point
it at your own PDFs, edit one config file, and you have your own edition.

---

## Contents

- [Features](#features)
- [How it works](#how-it-works)
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

- **Per-lecture feature articles** authored from the source PDFs, with KaTeX math
  and themed inline SVG diagrams (light/dark aware).
- **Newspaper UI** — front page, per-course section fronts, feature pages with a
  Key Terms rail.
- **"Dig deeper" chat** — a Netlify Function proxies to Claude Haiku; the API key
  never reaches the browser. Conversations are saved and can be reopened,
  downloaded, or deleted.
- **Latest in AI** — a scheduled function pulls arXiv + Hacker News daily, ranks
  them with one Haiku call, and caches the feed.
- **Incremental content pipeline** — adding lectures or a course is a delta, never
  a full rebuild.
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
Browser ──/api/chat──►  netlify/functions/chat.ts  ──►  Claude Haiku
        ──/api/news──►  netlify/functions/get-news.ts ◄─  news-refresh (daily cron)
                                   │
                             Netlify Blobs (transcripts + cached news)
```

The single source of truth for courses is [`courses.config.json`](courses.config.json),
shared by the site, the extraction script, and the Functions.

## Tech stack

| Area        | Choice                                                            |
| ----------- | ----------------------------------------------------------------- |
| Site        | [Astro](https://astro.build) 7 (static output) + `@astrojs/netlify` |
| Math        | `remark-math` + `rehype-katex` (KaTeX)                            |
| Serverless  | Netlify Functions (v1 handler API)                                |
| Storage     | Netlify Blobs                                                     |
| LLM         | Anthropic Claude Haiku (`@anthropic-ai/sdk`)                      |
| PDF text    | `unpdf`                                                           |
| News        | arXiv Atom API + Hacker News (Algolia) via `fast-xml-parser`     |

## Prerequisites

- **Node.js ≥ 20** and npm.
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
| `npm run deploy`       | Deploy a **draft** preview to Netlify.                               |
| `npm run deploy:prod`  | Deploy to **production**.                                            |

## Project structure

```text
courses.config.json        # SINGLE SOURCE OF TRUTH for courses (slug, dir, titles)
courses.schema.json        # JSON schema for the above (editor validation)
netlify.toml               # build, functions dir, redirects, security headers/CSP
astro.config.mjs           # Astro config (KaTeX pipeline, Netlify adapter)
Documents/<Course>/*.pdf   # source lecture PDFs (input)
content/_extracted/        # extracted text + manifest.json (gitignored, regenerable)
scripts/
  extract-pdfs.mjs         # PDF -> text (incremental)
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
  functions/  chat.ts · threads.ts · get-news.ts · news-refresh.ts
  lib/        identity.ts · validate.ts · blobs.ts · anthropic.ts · ratelimit.ts · http.ts
```

## Adding content (a delta operation)

Everything here is incremental — you never rebuild existing content.

### Add lectures to an existing course

1. Drop the new PDF(s) into `Documents/<Course>/`.
2. `npm run extract` — only the **new** PDFs are processed; cached text is reused,
   and the manifest is merged.
3. Author the article(s): create `src/content/articles/<slug>/<lecture>.md` with
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
   `CHAT_DAILY_CAP`, `CHAT_MAX_INPUT_CHARS`.
4. **Blobs** — no setup needed; it's provisioned automatically for the site.
5. **Scheduled function** — `news-refresh` self-registers to run daily at
   **13:00 UTC**. After the first deploy, seed the wire once via
   **Site → Functions → `news-refresh` → Run now** (or wait for the first run).
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
- **Output safety** — assistant and news text render via `textContent` (no HTML
  injection); external news links are protocol-validated (`http`/`https` only).
- **Headers** — CSP and standard security headers are set in `netlify.toml`.

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
- **Interactive pages look inert on :8888** → in dev, the production CSP blocks
  Astro's HMR inline scripts. Use `npm run dev` (:4321) for UI work; production
  builds ship external scripts and are unaffected.

## Dependency audit note

`npm audit` reports issues only in Netlify's build-time tooling and the unused
image-optimization chain (`esbuild` via `zip-it-and-ship-it`; `sharp`/`ipx`/
`@netlify/images`). None are reachable at runtime for this static site. The only
offered fix downgrades `@astrojs/netlify` to a version incompatible with Astro 7,
so it is intentionally not applied.

