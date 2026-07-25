# CourseApp — AI Course Newspaper (Drexel)

## Repo mirror (STANDING INSTRUCTION from user)
- This repo memory is MIRRORED into the repo at `.copilot/memory/courseapp.md` and committed to git.
- After any meaningful update to this file, re-copy it to that path and `git add`/`commit` (and push per
  the user's workflow). User said: "make the memory file part of the repo ... update the git version in the future."
- Sync = copy this workspaceStorage file (…/GitHub.copilot-chat/memory-tool/memories/repo/courseapp.md)
  to `.copilot/memory/courseapp.md`, then commit. Keep the two byte-identical.

## What it is
Static **Astro** newspaper on **Netlify** turning 33 course PDFs (4 courses) into
in-depth per-lecture feature articles. Interactive "Dig deeper" chat via Netlify
Function proxy -> Claude Haiku 4.5 (key server-side only). Chat threads persist in
Netlify Blobs. Daily scheduled function (13:00 UTC) pulls arXiv + Hacker News,
ranks, caches "Latest in AI". Netlify Identity (invite-only) + OWASP hardening.
NO RAG. Articles authored directly (no build-time API cost).

## Courses (src/lib/courses.ts)
- applications-of-ml  -> Documents/ApplicationsofML (10 PDFs: L01-L11, no L04)
- applied-ai          -> Documents/AppliedAI (9 PDFs: Week 1-9)
- applied-ml-data-science -> Documents/AppliedMachineLearningforDataScience (10: Lecture_02-10, Week1LectureSlides)
- human-ai            -> Documents/HumanAI (4 PDFs: week1-4)

## Toolchain gotchas (VERIFIED)
- npm cache ~/.npm is root-owned in sandbox -> use `export npm_config_cache="$TMPDIR/courseapp-npm-cache"` before npm install
- Astro resolved to v7, TS to v7 initially — TS 7 (native) breaks ts-api-utils ("reading 'Intrinsic'"). MUST pin typescript@5 (5.9.3 works).
- Astro 7 new default Markdown processor: install @astrojs/markdown-remark and use
  `markdown: { processor: unified({ remarkPlugins, rehypePlugins }), shikiConfig }` in astro.config.mjs
- Astro 6+ requires content config at src/content.config.ts (NOT src/content/config.ts)
- Build verified passing: `npx astro build` -> dist/ + netlify SSR function emitted
- SANDBOX telemetry gotcha (VERIFIED FIX): `astro build`/`sync` EPERM on ~/Library/Preferences/astro/config.json. `ASTRO_TELEMETRY_DISABLED=1` ALONE is NOT enough (store still writes). Working fix: `mkdir -p "$TMPDIR/ah/Library/Preferences" && HOME="$TMPDIR/ah" ASTRO_TELEMETRY_DISABLED=1 npx astro sync|build`. `astro sync` validates content-collection frontmatter (Zod) fast.
- SANDBOX zsh mangles awk `&&` and sed `!` (escapes them); use python3 for text munging/word counts. Terminal also intermittently replays STALE buffered output + returns empty logs this session -> redirect to $TMPDIR/*.log with a unique marker and cat the log.
- Reading single-line extracted .txt: read_file truncates long lines at 2000 chars; use `fold -s -w 200 in.txt > $TMPDIR/x.folded.txt` then read_file the folded file.

## Phase status
- P0 scaffold: DONE (config files exist)
- P0.5 deps: DONE (installed; package.json now has deps; build passes)
- P1 extract-pdfs.mjs: DONE (33 lectures -> content/_extracted/, manifest.json)
- P2 articles: DONE — all 33 authored (10+9+10+4), full build validates. Exemplar =
  applications-of-ml/l08-transformers.md. Spec = content/_extracted/_AUTHORING_SPEC.md.
  Article `id` = "<course-slug>/<fileSlug>" (e.g. applications-of-ml/l08-transformers).
  Note: extracted .txt is ONE giant line -> read_file truncates @2000ch.
- P3 UI: DONE — src/pages/courses/[course].astro, src/pages/courses/[course]/[lecture].astro,
  src/components/ConceptChat.astro, layout auth control + Identity widget. 39 pages build.
- P4 auth+chat: DONE — netlify/functions/{chat,threads}.ts (v1 Handler, clientContext.user),
  netlify/lib/{http,identity,validate,blobs,anthropic,ratelimit}.ts. Blobs store "chat-threads"
  keyed user/<id>/... ; daily cap store "rate-limits". ConceptChat wired w/ download+delete.
- P5 news: DONE — netlify/functions/{news-refresh(schedule 0 13 * * *),get-news}.ts,
  netlify/lib/news.ts (arXiv Atom + HN Algolia -> prefilter 48h -> Haiku rank), src/pages/latest.astro.
- P6 security: DONE — CSP + headers in netlify.toml [[headers]] (style-src 'unsafe-inline' for KaTeX;
  script/connect/frame allow identity.netlify.com). Input validation, injection-resistant system prompt,
  textContent rendering (no XSS), user-scoped blob keys, per-user daily cap.
- P7 verify: build EXIT 0, 39 pages, NO secrets in dist/. npm audit: 18 vulns ALL in build-time/unused
  image tooling (esbuild via zip-it-and-ship-it; sharp/ipx/@netlify/images). Force-fix downgrades
  @astrojs/netlify to 6.x (breaks Astro 7) -> LEFT AS-IS intentionally. Local server can't bind ports
  in sandbox (dev/preview fail) -> user runs `npm run dev` themselves.

## Visuals + width (post-launch revision, user-requested)
- Widened lecture reading column: --measure 68->74ch, .feature max-width 1180px,
  .feature .article max-width:none, body 80ch, keyterms rail 18rem. (was narrow long-scroll)
- Figure system: inline SVG line-art in .md, styled by `.article__body figure`/`figcaption`
  + helper classes .dgm-accent/.dgm-accent-2/.dgm-muted/.dgm-fill/.dgm-soft (currentColor themed,
  dark-mode aware). Astro 7 unified() processor renders raw SVG in markdown (rehype-raw). VERIFIED
  in prod build + browser. Exemplar diagrams in applications-of-ml/l08-transformers.md (encoder-
  decoder + scaled-dot-product attention). Spec updated in content/_extracted/_AUTHORING_SPEC.md.
- Diagram rollout to other 32 articles: DONE via 10 subagents (1 retried after net error).
  All 33 lecture pages now have 1-3 inline SVG diagrams (86 figures total). Build EXIT 0.
  Verified visually: CNN pipeline, reliability diagram (plots + schematics both render, dark-mode OK).
  Course FRONT pages (4) correctly have no figures. Dev server (Astro 7 daemon) runs unsandboxed
  on :4321 — must run UNSANDBOXED (sandbox blocks socket bind). `astro dev status/stop/logs` control it.
  Done manually: applied-ml-data-science/lecture-04-1 (SVM margin+SVs, kNN scatter),
  lecture-05-1 (tree splits, bagging/RF pipeline, boosting seq), lecture-06-1
  (perceptron LTU, XOR unit-square, MLP layers+backprop). Build EXIT 0, svg renders.
  NOTE: inline SVG in .md always throws MD033 markdownlint warnings — harmless, not build errors.
  Done w/ verified build: applied-ml-data-science lecture-07-1 (conv/pool/dropout),
  08-1 (PCA/KMeans), 09-1 (DBSCAN/dendrogram/GMM), 10-1 (reliability diagram).
  NOTE: unified() rewrites `&amp;` -> `&#x26;` in dist (both valid); figures w/o
  arrows correctly emit no <marker>. Verify: grep '<svg'/'<figure'/'marker id' in dist page.
- Verifying diagrams in built HTML: grep '<figure' and 'marker id' (unique per svg) — NOT '<svg':
  KaTeX renders \sqrt radicals as inline <svg>, so '<svg' overcounts on math-heavy pages
  (e.g. lecture-02-1 shows svg=10 for 3 figures). figure/marker counts are the reliable check.
- dgm helper classes set `color` (accent/accent-2/muted) or fill (dgm-fill=currentColor,
  dgm-soft=10% currentColor); put dgm-soft on the shape itself (no fill="none") for faint fill.
- applications-of-ml l01/l02/l03 diagrams ADDED + build-verified (EXIT0): l01=3 (areas map,
  course arc, ImageNet depth), l02=3 (MLP node graph, fwd/back flow, GD loop), l03=2 (conv
  sliding->feature map using worked-ex X/K/F=50,57,60,63; CNN pipeline). Marker ids unique/svg.
  NOTE: KaTeX renders bmatrix brackets as <svg>, so grep '<svg' > figure count on math-heavy pages.

## Deploy checklist (user does on Netlify)
- Enable Identity (invite-only), Blobs. Set ANTHROPIC_API_KEY (Functions scope), optional CHAT_MODEL/
  NEWS_MODEL/CHAT_DAILY_CAP/CHAT_MAX_INPUT_CHARS. Scheduled fn auto-registers. "Run now" news-refresh to seed.

## Local full-stack (netlify dev) — WIRED + VERIFIED this session
- Installed netlify-cli (devDep, v26.2.0). Run: `ASTRO_TELEMETRY_DISABLED=1 ASTRO_DEV_BACKGROUND=1 netlify dev` UNSANDBOXED.
- CRITICAL: Astro 7 auto-backgrounds dev when it detects an AI-agent env (isRunByAgent in
  node_modules/astro/dist/cli/dev/index.js). That makes `astro dev` exit 0 and netlify dev shuts down.
  FIX: set ASTRO_DEV_BACKGROUND=1 -> astro runs FOREGROUND -> netlify dev stays up. Proxy on :8888, astro on 4321/4322.
- Verified via curl on :8888: POST /api/chat no-auth ->401 {"error":"Sign in required."}; GET /api/threads ->401;
  GET /api/news ->200 {generatedAt:null,items:[]} (graceful, Blobs unconfigured); GET / ->200. All 4 functions load; /api/* redirects work.
- LIMITATIONS (need linked Netlify site, not code bugs): Blobs (MissingBlobsEnvironmentError unlinked),
  Identity JWT login, real ANTHROPIC_API_KEY. So full chat/news data can't run locally unlinked.
- Dev-only CSP friction: on :8888 netlify applies prod CSP; Astro DEV uses inline+blob-worker HMR scripts -> blocked
  (e.g. /latest stuck "Loading..."). PROD build uses external bundled scripts -> unaffected. For local UI use astro dev :4321 (no CSP).

## LOGIN REMOVED (user request, this session)
- Netlify Identity fully removed from UI: layout widget script, "Sign in" nav button, auth-control script gone.
  ConceptChat: no JWT/gate; input always enabled; uses anonymous localStorage visitorId sent as X-Visitor-Id.
- Functions chat.ts/threads.ts: dropped getUser/401. Scope Blobs by visitorId (getVisitorId). Cost guardrail now
  per client IP (getClientIp -> consumeDailyQuota). identity.ts keeps getUser + adds getVisitorId/getClientIp (re-enable later).
- ratelimit.ts fail-opens if Blobs unavailable. chat.ts + threads.ts make Blobs BEST-EFFORT (try/catch store) so
  a Blobs outage/unlinked-local doesn't 500 — chat still replies, threads list returns [].
- CSP tightened: removed identity.netlify.com + frame-src (netlify.toml). README updated.
- VERIFIED via curl on :8888 (login gone): POST /api/chat -> 502 "assistant unavailable" (missing key only, was 401);
  GET /api/threads -> 200 {"threads":[]}. Nav has no Sign in. Build EXIT 0.
- To re-enable login: restore Identity widget+button+script, swap getVisitorId->getUser (+401) in both functions, re-add identity.netlify.com to CSP.


## Git / remote
- Remote: origin = https://github.com/sudhamanc/Coursenews.git ; branch `main` (renamed from master).
- Initial commit 14f8920 pushed (68 files). Documents/*.pdf EXCLUDED via .gitignore (copyrighted; user chose exclude).
  .env ignored (only .env.example committed). content/_extracted/ + dist/ + node_modules ignored.
- Netlify deploy: LIVE/working as of this session. Two build fixes were needed (prod install omits devDeps + Node):
  f6a1716 moved typescript & @netlify/functions to dependencies; 4a36825 set Node 22 (netlify.toml NODE_VERSION=22,
  .nvmrc, engines>=22.12.0) since Astro 7 needs >=22.12.0. No NODE_VERSION UI override exists (netlify.toml governs).
- git push HANGS when sandboxed (credential helper/keychain blocked) -> push UNSANDBOXED.

## Netlify Blobs + v1 functions gotcha (VERIFIED root cause of "history not saving")
- v1 (Lambda-compat, `export const handler`) functions do NOT get the Blobs context ambiently.
  MUST call `connectLambda(event)` from '@netlify/blobs' at handler start BEFORE any getStore().
  Otherwise getStore() throws MissingBlobsEnvironmentError even on DEPLOYED Netlify -> best-effort
  try/catch swallowed it, so chat replied but nothing persisted (History empty).
- Fixed in chat.ts, threads.ts, get-news.ts, refresh-news.ts, news-refresh.ts (scheduled: async (event) =>).
  chat.ts response now includes `saved` boolean for diagnostics. Local unlinked = still no Blobs (no regression).
- On-demand news: netlify/functions/refresh-news.ts GET|POST /api/refresh-news, secret NEWS_REFRESH_KEY.

## CSP inline-script gotcha (VERIFIED root cause of "/latest stuck Loading" + dead chat on PROD)
- Astro 7 INLINES small self-contained module scripts (no imports) directly into HTML instead of
  emitting external /_astro/*.js. Both latest.astro's news loader AND ConceptChat's panel script
  are inlined. Prod CSP `script-src 'self'` (no 'unsafe-inline') BLOCKS all inline scripts ->
  /latest never fetches /api/news, chat panel never wires up. Backend was fine (/api/news, /api/refresh-news OK).
- FIX (netlify.toml [[headers]] CSP): `script-src 'self'` -> `script-src 'self' 'unsafe-inline'`.
  Safe here: inline scripts are first-party (Astro's own) and ALL dynamic content is rendered via
  textContent (no innerHTML sink), CSP still blocks external script origins/framing/objects.
  COMMITTED + PUSHED: commit c836ede -> origin/main (2445beb..c836ede) -> triggers Netlify redeploy.
- Astro 7 HAS native `security.csp` (auto-hashes inline scripts) BUT docs say Shiki is incompatible
  (Shiki + KaTeX use inline style="" attrs that its CSP can't hash) -> NOT usable here. style-src
  already needs 'unsafe-inline' for KaTeX/Shiki for the same reason. So 'unsafe-inline' is the pragmatic fit.

## TOOLING gotcha this session (read_file/grep/edit STALE CACHE)
- read_file, grep_search, and replace_string_in_file served a PRE-COMPACTION snapshot of netlify.toml
  (old 34-line scaffold: Node 20, no [[headers]]). Terminal (cat/grep/git show) showed the TRUE current
  file. touch + vscode.open(revert) did NOT refresh the tool cache. Edit tools failed to match real text.
- WORKAROUND: edited via guarded python3 (assert exact single match of old string BEFORE write, print
  unified diff), then verified with terminal grep + `python3 -c "import tomllib..."`. Only resort to
  terminal edits when the editor tool cache is provably stale; keep them minimal + assertion-guarded.
- DATA-LOSS INCIDENT + RECOVERY (this session): editing src/styles/newspaper.css via the normal edit tool
  wrote a STALE 420-line buffer to disk, TRUNCATING the real 943-line file (lost the diagram/.dgm-/.figure
  helpers AND the --measure:74ch width fix). Build STILL PASSED (missing CSS != error), so it nearly shipped.
  Caught only at commit: `git diff --stat` showed ~639 deletions. RECOVERY: `git restore --source=HEAD
  --worktree -- <file>` to get the 943-line version back, then re-applied the intended edits via guarded
  python at disk level. LESSON: for any file that subagents/terminal touched in a PRIOR session, the main
  editor buffer can be silently stale and truncate on save. ALWAYS compare working-vs-HEAD line counts
  (`wc -l <f>` vs `git show HEAD:<f> | wc -l`) and grep for expected selectors/symbols BEFORE committing.
  VS Code eventually reloaded the buffer after git restore + disk writes (file-watcher), re-syncing read_file.

## News arXiv fix + FT theme (this session, build-verified; NOT yet committed)
- ROOT CAUSE "all news from HN, none from arXiv": (1) old fetchArxiv used
  http://export.arxiv.org/api/query?search_query=cat:cs.AI OR ...&sortBy=submittedDate — that
  sorted query took ~30s live (sorts 389k results); fetchArxiv aborted at 12s -> returned [] every run.
  (2) prefilter sorted ALL candidates by points desc then slice(0,30); arXiv has no points (=0) so HN
  always crowded arXiv out before the ranker.
- FIX in netlify/lib/news.ts:
  * fetchArxiv now uses arXiv RSS: https://rss.arxiv.org/rss/cs.AI+cs.LG+cs.CL+cs.DB (HTTP 200 in ~1.5s,
    574 items). Parse with fast-xml-parser: doc.rss.channel.item[]. Fields: title, link (=/abs/ID url),
    description (embeds "arXiv:ID", "Announce Type: new|replace|cross", "Abstract: ..."), dc:creator, pubDate.
    Drop announce type 'replace' (revisions); keep new+cross. id from /\/abs\/([^/\s?#]+)/. Timeout 15s.
    VERIFIED parse vs live feed: 574 raw -> drop 176 replace -> 398 kept; ids/titles/authors/abstracts OK.
    NOTE author names carry LaTeX escapes (e.g. Mo\"ell) but authors aren't displayed, only abstract used for ranking.
  * prefilter rewritten: split by source, HN keeps 48h window + RELEVANCE regex, arXiv exempt (RSS=latest batch,
    on-topic by category). Per-source quota PER_SOURCE=18 -> [...hn.slice(0,18), ...arxiv.slice(0,18)] (<=36) to ranker.
  * rss.arxiv.org is the official 2024+ arXiv RSS host (export.arxiv.org/rss/* 301-redirects). Faster than API => also
    helps the scheduled/refresh functions stay well under Netlify's function timeout.
- FT THEME (user wanted a light "regular" mode like the Financial Times + a toggle):
  * src/styles/newspaper.css: replaced `@media (prefers-color-scheme: dark)` with `:root[data-theme="dark"]`.
    Light `:root` is now FT: --paper #fff1e5 (salmon), --paper-2 #fff8f1, --ink #33302e, --rule #e6d7c5,
    --accent #990f3d (claret), --accent-2/--link #0f5499 (Oxford blue). Dark vars unchanged, moved under [data-theme=dark].
    Added .theme-toggle styles (absolute top-right in .paper{position:relative}; sun/moon SVGs swapped via
    [data-theme=dark] .theme-toggle__sun/moon display rules).
  * src/layouts/Newspaper.astro: <html lang="en" data-theme="light"> default; is:inline head script sets
    data-theme from localStorage('theme') pre-paint (no FOUC), defaults light unless stored 'dark'; toggle
    <button id="theme-toggle"> (moon+sun svg) added as first child of .paper; is:inline wiring script at end of
    body flips data-theme + persists localStorage. Relies on CSP script-src 'unsafe-inline' (added earlier this session).
- DREXEL REMOVED from website: Newspaper.astro description ("my graduate coursework") + masthead kicker
  ("Vol. I · Graduate Studies · Artificial Intelligence Desk"). dist/ grep = no 'drexel'. (Only remaining ref is
  content/_extracted/_AUTHORING_SPEC.md, which is gitignored/not shipped and merely instructs stripping Drexel.)
- Build EXIT 0 (39 pages + SSR fn). Verified in dist: no drexel, data-theme="light" + theme-toggle in HTML,
  #fff1e5 + [data-theme=dark] in bundled CSS.
- POST-DEPLOY follow-ups (commit f23c242): (1) "no arXiv after running refresh" was NOT a code bug —
  live /api/refresh-news then /api/news returned arXiv:18/HN:17 with real titles. Cause = get-news
  CDN/browser cache (was `max-age=300, stale-while-revalidate=1800` => stale up to ~30min after a
  manual refresh). Lowered to `max-age=120, stale-while-revalidate=600` so manual refreshes surface
  within ~2min while normal visitors still get cached responses. (2) Saved-conversation title invisible
  in FT LIGHT mode: `.chat__thread` is a <button> and `.chat__thread-title` had NO explicit color ->
  inherited the OS system ButtonText color (LIGHT when the OS is in dark mode) -> invisible on salmon
  paper, only shown on hover (:hover set --accent); fine in dark theme. Fix: add `color: var(--ink);`
  to `.chat__thread`. LESSON: always give <button>-based text an explicit themed color; never rely on
  inherited/UA button color, or it breaks when the site theme and OS theme disagree.

## Reusable/shareable refactor (this session)
- SINGLE SOURCE OF TRUTH: courses.config.json (repo root) + courses.schema.json. Consumed by
  src/lib/courses.ts (import JSON), netlify/lib/validate.ts (import JSON -> COURSES map),
  scripts/extract-pdfs.mjs (reads JSON). Add a course = edit this one file + add Documents/<dir> + extract + author md.
- extract-pdfs.mjs now: reads config, INCREMENTAL (skips cached .txt), MERGES manifest, supports
  `npm run extract -- <slug> [--force]` for per-course delta. Verified: re-run = all cached, no re-extract.
- Scripts (scripts/*.sh, chmod +x, bash -n clean): setup.sh, serve.sh (start|stop|restart|status,
  clears ports 4321/4322/8888 via lsof+pkill, ASTRO_DEV_BACKGROUND=1, nohup + .dev-server.pid/.log),
  deploy.sh (--prod; netlify deploy --build). npm scripts: setup/dev/start/stop/restart/status/build/
  preview/extract/netlify:dev/deploy/deploy:prod. `npm stop` VERIFIED (freed port, status clean).
- .gitignore adds .dev-server.pid/.log.
- README fully rewritten: features, how-it-works diagram, stack, prereqs, quick start, scripts table,
  structure, ADD CONTENT (delta) section, local dev, config table, DEPLOY TO NETLIFY (Git + CLI options,
  env, Blobs, scheduled fn, custom domain), security/cost, auth-disabled + re-enable, troubleshooting, audit note.
- Final build EXIT 0, 39 pages, 4 courses from JSON.
- Content collection `articles` via glob loader; schema in src/content/config.ts
  (course, lectureId, title, deck, order, date?, readingTime?, concepts[], tags[])
- Newspaper CSS classes: .paper .masthead .topnav .flag .grid--lede/3/2 .headline--xl/lg/md/sm
  .deck .byline .card .article .article__body .tag .rule--heavy
- API redirects in netlify.toml: /api/chat /api/threads /api/news
- Env: ANTHROPIC_API_KEY, CHAT_MODEL, NEWS_MODEL, CHAT_DAILY_CAP, CHAT_MAX_INPUT_CHARS
- Node 25 local, netlify NODE_VERSION=20. Git: all staged, never committed.

## Article authoring notes (VERIFIED)
- Spec: content/_extracted/_AUTHORING_SPEC.md; exemplar: applications-of-ml/l08-transformers.md
- Extracted .txt are SINGLE-LINE; read_file truncates long lines at 2000 chars.
  Wrap first: `fold -s -w 150 file.txt > $TMPDIR/x.txt` then read.
- Frontmatter style (schema in src/content.config.ts): title/deck/definition quoted; term unquoted;
  tags quoted array; lectureId unquoted (L08/W7). OMIT date unless clearly in text (manifest has NO dates).
- readingTime: ~11 for ~1100-word body (match exemplar rate, not literal 200wpm).
- Fenced code needs a language (```text) or md lint MD040 fires.
- applied-ai decks are review-heavy (repeat prior topics) -> give each a distinct center of gravity:
  W7=learning signals (AutoRec/LLM-train/RL/RLHF), W8=inference-time scaffolding (RAG/self-consistency/CoT/LRM/MCP),
  W9=alignment+machine ethics (pluralistic/DMA/frameworks/eval).


## Locked decisions
- Option A: one feature per lecture, concepts as H2/H3 sections
- News: 13:00 UTC daily, rolling 48h + dedupe, headline link + 1-2 sentence AI summary,
  top ~12 shown rest expandable; HN summary from title/meta, arXiv from abstract
- Chat non-streaming v1; per-user daily message cap -> 429
