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
- human-ai            -> Documents/HumanAI (6 PDFs: week1-4 + HumanValuesforAIWeek5Readings + Week5-HAII lecture)
- advanced-ai         -> Documents/AdvancedAI (5: Week1Slides + agentic survey/enterprise/cybersecurity + NeuroSymbolic)

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
- git push can 403 "Permission to sudhamanc/Coursenews denied to schand201_comcast" when the macOS keychain
  credential for github.com resolves to the Comcast WORK account instead of sudhamanc (commit author identity
  sudhamanc/outlook != push auth). Fix: clear cached cred (`printf 'protocol=https\nhost=github.com\n\n' |
  git credential-osxkeychain erase`) then push + auth as sudhamanc with a PAT, or `gh auth login/switch`.
- NETLIFY AUTO-PUBLISH IS OFF for this site (VERIFIED this session): pushing to main BUILDS but does NOT
  auto-go-live — the user must click Publish (or Trigger deploy) in the Netlify Deploys tab. Symptom of the
  gap: the pushed commit is correct and local build shows the change, but the live site still serves the old
  content with `Age: 0` + `must-revalidate` (so it is NOT a browser/CDN cache issue) until it is published.

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

## New content: human-ai Week 5 — Information Architecture (this session)
- User added Documents/HumanAI/HumanValuesforAIWeek5Readings.pdf (160p) + "update the app"; then clarified the
  Week 5 topic is INFORMATION ARCHITECTURE and to also pull from NN/g's IA study guide
  (https://www.nngroup.com/articles/ia-study-guide/).
- MISMATCH: that PDF's 3 papers are about human VALUES/ETHICS for AI, not classic IA: (1) "A Mulching Proposal"
  (Keyes et al., CHI'19) satire — the FAT checklist can bless a monstrous system; (2) TikTok mini-review —
  algorithms shaping identity/values (algorithmic literacy, folk theories, identity strainer, algorithmized self);
  (3) Varanasi & Goyal "It is currently hodgepodge" (CHI'23) — RAI values hard to operationalize, "value levers".
- RESOLUTION: wrote src/content/articles/human-ai/week5-haii.md as an IA feature grounded in NN/g (IA vs
  navigation; 4 systems organization/labeling/navigation/search; findability vs discoverability; information
  scent; flat vs deep + 3-click-rule-false + polyhierarchy; card sorting + tree testing / mental models) that
  PIVOTS to the readings as the responsible/values lens (taxonomy -> personalized p(item|you) feed; FAT critique;
  value levers). order:5, lectureId W5, 7 concepts, 3 inline SVG diagrams (markers arw-ia-nav, arw-feed), KaTeX.
  Build EXIT 0; dist page = 3 figures + katex; human-ai front lists it (now 5 weeks; 34 articles total).
- Delta pipeline: `npm run extract -- human-ai` (only new PDF -> humanvaluesforaiweek5readings.txt). Article named
  week5-haii.md for URL consistency (extract .txt slug != article slug is fine; article file path drives the URL).

## Session 2 additions (Advanced AI course + Week 5 lecture + news carry-forward)
- NEW COURSE advanced-ai (Documents/AdvancedAI) added to courses.config.json (5th course). 5 articles authored
  via 5 PARALLEL SUBAGENTS (all build-verified + grounded in source PDFs, terms confirmed via grep):
  advanced-ai/week1.md "A Crowd of Minds" (W1: neuron/Hebbian/ensembles/MoE/Switch-Transformer/wisdom-of-crowds/
  swarm/WoC-Bots — the prof's "alternative to deep learning" thesis), agentic-ai-survey.md (R1),
  agentic-ai-enterprise.md (R2: watsonx/Citigroup/FinRobot/JADA), agentic-ai-cybersecurity.md (R3: autonomous
  SOC + post-quantum), neuro-symbolic-ai.md (R4: Kautz taxonomy/AlphaGo/System1-2). Clean URL slugs chosen
  (NOT the long PDF-derived slugs). Subagents fold the single-line .txt then author per _AUTHORING_SPEC.
- Week 5 human-ai article EXPANDED with the new Week5-HAII.pdf LECTURE (the actual IA lecture; the earlier
  version used only the readings PDF + NN/g). Added: wireframes (lo/mid/hi fidelity), CONTEXT ARCHITECTURE
  (IA applied to an AI's context: prompts/history/system-instructions/guardrails/RAG/tools/memory/state), and
  the "information environments constructed through language" framing. Now 8 concepts, readingTime 11, 3 diagrams.
- NEWS FIX (root cause of "arXiv showed one day then gone"): arXiv RSS is EMPTY on non-announcement days
  (weekends/holidays) — VERIFIED 0 items on a Sunday (HTTP 200, 0 <item>). The daily 13:00 UTC refresh then
  OVERWROTE the cached feed with Hacker-News-only. FIX in netlify/lib/news.ts buildFeed: if fetchArxiv() returns
  [], carry forward the previous feed's arXiv items (readLatest() -> filter source==='arXiv') so the wire never
  collapses to HN-only. (get-news cache already lowered to 120/600 earlier.)

## Home redesign + lecture/INFO cleanup (session 2 cont.)
- src/lib/courses.ts IMPORTS courses.config.json (single source); the site reads COURSES from JSON. STALE-CACHE
  again this session: read_file served an OLD inline-array courses.ts AND an older index.astro. Got disk truth via
  terminal `cat`; wrote the new index.astro via create_file->$TMPDIR then `cp` over it (edit tools unsafe on stale buffer).
- index.astro REDESIGNED: generic headline "The Concepts Behind Modern AI" (NO hardcoded course count),
  Editor's Picks right rail (curated id list EDITORS_PICKS in index.astro; byId lookup, missing ids skipped),
  Top Stories at bottom (auto: featuresFor(slug)[0] per course = lead per desk; grows as courses are added),
  Latest-in-AI teaser, "{totalFeatures} features across {desks.length} desks" line. featurePath (renamed from
  lecturePath); desks show titles only. New CSS .pick/.pick__desk/.pick__title.
- Removed user-facing lecture/coursework wording: index.astro copy; Newspaper.astro footer -> "The Course Ledger
  — the ideas behind modern AI, explained in depth."; dropped "INFO 629/686 — " from applied-ai blurb in courses.config.json.
- NOT DONE (user said "no, just commit"): applied-ml URL slugs still contain "lecture-0X-1"/"week1lectureslides";
  the article-page template [lecture].astro still uses element ids/classes lecture-title/lecture-id. Left as-is.

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

## Session 3: "The LLM Canon" desk (37 seminal-paper features + connections graph)

- NEW 6th desk `llm-canon` "The LLM Canon" in courses.config.json (dir "LLMCanon" — NO Documents/ PDFs;
  authored DIRECTLY, extraction never run for it; renders anyway since site reads COURSES from JSON +
  articles from the content collection). validate.ts auto-allows it (imports courses.config.json).
- 37 articles src/content/articles/llm-canon/<slug>.md, order 1-37 = LINEAGE order (Attention=1 … Muon=37).
  lectureId = paper YEAR as quoted string (e.g. "2017"); DATE OMITTED. Each: strong lede, thematic H2/H3,
  KaTeX where needed, EXACTLY ONE inline SVG diagram (unique marker id arw-<slug>), penultimate
  "## Why It Matters", final "## Lineage" with Builds-on/Leads-to markdown links to sibling canon pages.
- Source = user's own paraphrase ~/Downloads/seminal-ai-papers.md (rewritten into house voice; NOT verbatim).
  Authored via 3 HAND exemplars (attention-is-all-you-need, instructgpt-rlhf, flashattention) + 7 PARALLEL
  SUBAGENTS (batches A-G) each reading source + _AUTHORING_SPEC.md + the 3 exemplars.
- CONNECTIONS GRAPH: src/components/CanonMap.astro — 7 track-lanes (architecture/pretraining/scaling/alignment/
  adaptation/efficiency/inference) x year(2017-2024); 37 clickable SVG nodes (link to each paper); edges follow
  each paper's primary parent; GPT trunk (attention->gpt-1->gpt-2->scaling-laws->{gpt-3,chinchilla}->llama)
  accented. Data-driven: PAPERS[] array in the component = graph source of truth. Rendered on desk front via
  `isCanon` in src/pages/courses/[course].astro (above the lead). Scoped <style> uses theme vars; nodes hover to
  accent. Home + nav pick up the desk automatically (generic COURSES map).
- LAYOUT gotcha: strict year->x timeline OVERLAPS in 2022 (11 papers). Fix: nodes sharing a (lane,year) cell
  stack VERTICALLY within the lane band (ROW_GAP). Graph parents set chronologically <= child so edges read L->R
  (e.g. lora GRAPH parent = gpt-3 not llama, since LoRA 2021 predates LLaMA 2023 even though MD builds_on=llama).
- VERIFIED: astro build EXIT 0, 76 pages (was 39). 37 canon pages, exactly 1 <figure> each, 0 broken lineage
  links, orders 1-37 unique, no source leakage. gpt-2.md "TL;DR" = legit (the paper's summarization prompt cue).
  MD033 inline-SVG lint warnings = harmless. Committed + pushed (efae368 -> origin/main).

## Session 3b: desk RENAME + Human-AI Week 6 (build-verified)

- RENAMED desk display (user disliked "Canon"): title "The Foundational Papers of Modern AI",
  shortTitle "Foundational Papers" (courses.config.json). SLUG UNCHANGED = llm-canon, so URLs/paths/
  CanonMap/article frontmatter all stay stable. No prose ever said "canon" (all 108 hits were slug/URLs);
  dist grep = 0 "LLM Canon". CanonMap.astro filename kept (internal, not user-visible).
- HUMAN-AI WEEK 6 = Explainable AI (XAI). User added Documents/HumanAI/Week6-HAII.pdf + "Week 6 - Info 693 -
  XAI video.pdf". Extracted via `npm run extract -- human-ai` (incremental) -> week6-haii.txt (36p) +
  week-6-info-693-xai-video.txt (39p). Authored src/content/articles/human-ai/week6-haii.md (order 6,
  lectureId W6, 3 inline SVG diagrams: transparent-vs-opaque+post-hoc, local/cohort/global, method 2x2
  scope×timing). Grounded in BOTH sources: black box, transparent/opaque (simulatable/decomposable/algo-
  transparent), interpretability vs explainability, local/cohort/global, Aristotle four-causes +
  "explanation is an interaction" (Hoffman), SHAP/LIME/Grad-CAM/counterfactuals/TCAV, model-agnostic vs
  specific, over-trust/faithfulness, Evaluative AI, ECOA/EU AI Act, State v. Loomis/COMPAS case. Excluded
  quiz/housekeeping/assignment logistics per spec.
- Build EXIT 0. human-ai front now 6 weeks (week1-6). Rename + week6 NOT yet committed.

## Session 4: Human-AI Week 7 + 5 reading features (build-verified)

- User added 6 PDFs to Documents/HumanAI: Week7-HAII.pdf plus the Week 7 reading set —
  "7 - Kore 2022 - Chapter 6.pdf", "7 - Marcus 2019.pdf", Kocielnik-2019.pdf, "Mahmood 2022.pdf",
  ai_index_report_2026_chapter_3_responsible_ai.pdf. Extracted incrementally via
  `npm run extract -- human-ai` (6 new .txt; 8 cached). Manifest now 48 lectures / 5 courses.
- IMPORTANT precedent: readings get their OWN article (like advanced-ai R1-R4), not folded into the
  week lecture. human-ai now has W1-W7 (orders 1-7) + R1-R5 (orders 8-12).
  * week7-haii.md      W7  order 7  "The Humble Machine"          3 diagrams (error pipeline, precision/recall
                                     + recovery cost, recognition-diagnosis-recovery chain)
  * handling-errors.md R1  order 8  Kore ch.6 "Tolerate the Error, Never the Failure"  2 diagrams
  * whats-at-stake.md  R2  order 9  Marcus 2019 "It Was Never Going to Be Malice"      1 diagram (bias loop)
  * imperfect-ai-expectations.md R3 order 10 Kocielnik 2019 "Fifty Percent, Twice"     2 diagrams
  * owning-mistakes-sincerely.md R4 order 11 Mahmood 2022 "No Apology Beats a Bad One" 2 diagrams
  * ai-index-responsible-ai.md   R5 order 12 AI Index 2026 ch.3 "The Instruments Are Falling Behind" 2 diagrams
- Week 7 topic = When Things Go Wrong: error vs bias, error vs failure (stakes), system/user/user-perceived
  taxonomy, context-window + long-dependency failures, expectation setting (accuracy indicator / example
  explanation / performance control), precision-recall governed by RECOVERY COST, recognition-diagnosis-
  recovery, humble machine, apology strategies, bias->discrimination + hidden proxies, FMTI 58->40,
  adversarial attacks, hallucination + belief collapse, and the "creative failure" material (cookie bot
  19%->76%, Janelle Shane, Tom White adversarial art, "Skynet" knitting). Quiz/housekeeping/mid-term-survey
  slides excluded per _AUTHORING_SPEC.
- Build EXIT 0. Verified in dev browser (:4321): all 12 human-ai entries listed in order on the course front;
  figures render light+dark, no clipping. figure/marker counts per page: week7=3/3, handling-errors=2/2,
  whats-at-stake=1/1, imperfect-ai=2/2, owning-mistakes=2/2, ai-index=2/2.

## Session 5: "The Ecosystem" — second wire on /latest (build + live-source verified)

- PROBLEM (user): /latest was purely arXiv papers. Root cause: only two sources exist
  (arXiv RSS + HN) and the ranker prompt prefers "substantive research", so HN (which has
  no abstract) is always outranked. No prompt tuning fixes it — ecosystem sources weren't
  in the input set at all.
- NEW: netlify/lib/ecosystem.ts + functions/get-ecosystem.ts + /api/ecosystem redirect +
  second section on src/pages/latest.astro ("The Ecosystem / What Shipped"). Buckets:
  Models | Standards | Libraries | Patterns (fixed enum so the UI can group reliably).
- TWO LANES (the key design):
  * tracked    = 17-repo WATCHLIST const via GitHub `releases.atom`. Dated, versioned facts.
                 Structurally blind to anything not on the list.
  * discovered = HF trending models, GitHub Trending (HTML scrape), Show HN + front page,
                 subreddit .rss, commentary RSS. Can surface an unknown project.
  User's exact complaint (a watchlist would have missed a just-released agent plugin SDK)
  is what the discovery lane exists for — verified it surfaces obra/superpowers,
  addyosmani/agent-skills, PrimeIntellect-ai/prime-agent, "Show HN: The Channels SDK".
- X/TWITTER IS NOT USABLE: api.twitter.com returns 401 unauth, read access is a paid tier.
  Nitter mirrors dead. Documented in the file header so nobody re-litigates it.
- USE `releases.atom`, NOT the GitHub REST API: unauth REST is 60 req/hr PER IP and Netlify
  functions share egress IPs -> a 17-repo watchlist would intermittently 403. Atom has no cap.
- GOTCHAS FOUND BY LIVE PROBING (all fixed, all verified):
  * prerelease regex must not require a separator: tags glue the suffix to a digit
    ("v0.27.0rc1"). Fixed regex + NOT_A_RELEASE guard (pytorch publishes `trunk/<sha>` CI
    tags through the same feed).
  * HF trending is full of re-uploads (GGUF/AWQ/Lora/INT8/MLX) of a base model that trends
    on its own -> HF_DERIVATIVE filter, else the Models bucket is all quant repos.
  * REDDIT: `.json` API is now blocked (HTML wall); `/.rss` works but ONLY with a
    Mozilla-prefixed UA, and it 429s on CONCURRENT requests from one IP -> subreddits are
    fetched IN SERIES (fetchSubreddits), not in the general pool. Still flaky from cloud IPs;
    treat HN + GitHub Trending + HF as the load-bearing discovery sources.
  * RANKER: a SINGLE Haiku call over both lanes (43 items) FAILED BADLY — dropped all 26
    discovery items and its index mapping drifted (ollama's release got crewAI's summary).
    FIX: rank each lane in its OWN call (rankLane) + an echo check ("t" = first 4 title words
    copied back; on mismatch keep the item, discard the prose). Result: 33/43 kept, 10 noise
    dropped, all four buckets populated, captions correct.
  * UI quota is PER LANE (4+4), not per bucket: ranking puts discovery first, and a flat cap
    let Show HN fill every Libraries slot and push the real version releases out of view.
- news-refresh (scheduled) now builds BOTH wires under Promise.allSettled so one failing
  wire can't blank the other. refresh-news takes ?wire=research|ecosystem|both.
  Cost: 2 Haiku calls/day instead of 1.
- Verified: astro build EXIT 0 (get-ecosystem emitted), tsc --noEmit clean, live fetch of all
  sources ~2s, ranker ~10s, and the rendered DOM checked in dev (4 groups, lane/version chips,
  computed styles correct in BOTH themes). NOTE: browser screenshots came back blank this
  session (pane hidden) — verification was DOM + computed-style, not visual.

## Session 6: PWA icon + mobile design (build + browser verified)

- PROBLEM (user): installed PWA icon was a generic "C". Root cause: ZERO PWA infra —
  public/ had only favicon.svg (and its palette was from a SUPERSEDED design), no manifest,
  no apple-touch-icon, no theme-color. Chrome synthesises a letter avatar from the origin
  (coursenews.netlify.app -> "C"). PLATFORM SPLIT: iOS ignores manifest icons and needs
  apple-touch-icon.png; Android needs the manifest. Both required.
- MARK = "The Ledger Rule": claret serif L between the signature double rule, on salmon.
  Three shapes so it survives 16px. Sources in assets/icons/ (mark, mark-maskable, og),
  rasterised by scripts/make-icons.mjs, OUTPUTS COMMITTED to public/ so Netlify never runs
  a native binary. sharp was ALREADY resolved as an optionalDependency of astro (verified);
  added explicitly to devDependencies so `--omit=optional` can't drop it.
- RASTERISATION RULES (librsvg): literal hex only (@media is ignored), letterform as <path>
  never <text> (fonts resolve against the host machine). XML gotcha: SVG COMMENTS CANNOT
  CONTAIN "--" — writing "--paper" in a comment broke the parse.
- MASKABLE: separate padded artwork. Android guarantees only a centred circle of 0.8*size,
  so at 512 all ink must be in [111,401]. make-icons.mjs reads back pixels and ASSERTS the
  ink bbox (got [111,134]-[400,377]) — substitutes for the Android check we can't run.
- theme-color CANNOT use <meta media> here (theme is localStorage-driven, not
  prefers-color-scheme). Set in TWO places in Newspaper.astro: the pre-paint script and the
  toggle's sync(). Hex HARDCODED — the pre-paint script runs before the stylesheet is
  guaranteed applied, so getComputedStyle('--paper') can be empty. public/favicon.svg is the
  ONE exception that does use prefers-color-scheme (browser chrome follows the OS).
- NO SERVICE WORKER (deliberate): not needed for installability; would sit in front of the
  metered/rate-limited /api/chat proxy; adds staleness to an actively edited corpus.
- FIGSCROLL (biggest win): diagrams were SCALING DOWN — an 820-unit viewBox in ~290px made
  11px labels render at ~3.5px. Fix = scripts/rehype-figscroll.mjs wraps figure>svg and
  table in .figscroll + a 760px min-width floor below 768px. Zero content files touched.
  * ORDERING GOTCHA: inline SVG in markdown arrives as `raw` hast nodes. rehypeRaw MUST run
    before figscroll: [rehypeKatex, rehypeRaw, rehypeFigscroll]. rehype-raw moved to
    `dependencies` (astro.config imports it at build time; Netlify prod omits devDeps).
  * ASTRO CONTENT CACHE: after changing astro.config plugins, `rm -rf .astro dist` — a stale
    cache made the wrapper look like it wasn't applying (0 wrapped) when it was.
  * GRID BLOWOUT (found by browser check, not by reading): .article__body is a grid item with
    min-width:auto, so the 760px floor blew the track to 790px and body{overflow-x:clip}
    CLIPPED the scroller instead of letting it scroll. FIX: `.feature__grid > * { min-width: 0 }`.
    minmax(0,1fr) only covers the 2-col case; the collapsed 1fr reintroduces the auto minimum.
  * VERIFIED at 375px: scroller clientW 304 / scrollW 760, scrolls:true, glyph heights 11-18px
    (was ~3.5). At 1280 min-width is 0 so desktop is unchanged.
- overflow-x: CLIP not hidden on html,body — `hidden` creates a scroll container and BREAKS
  position:sticky on .keyterms. Verified sticky survives at 1280.
- CanonMap (1264 viewBox, would be 2.7px labels): SVG hidden below 768px, replaced by
  .canon-index — 7 lanes / 37 papers off the existing PAPERS+LANES arrays, 46px tap targets.
  display:none swap also removes the hidden one from the a11y tree (no aria-hidden needed).
- .topnav -> horizontal scroll strip below 768px: 130-160px of chrome -> 38px VERIFIED.
- Also fixed: toggle/kicker collision (masthead padding-inline 2.6rem <=480px) + 44px hit
  target via ::before; .feature__nav stacks <=640; .keyterms.col-rule stray left border in
  the 621-920 window; inline KaTeX needs display:inline-block AND overflow-x (auto alone is
  a no-op on an inline box); table CSS added (there was none).
- astro.config `site` was the 'https://example.netlify.app' PLACEHOLDER -> now
  `process.env.URL || 'http://localhost:4321'` (Netlify injects URL at build), feeding new
  canonical + OG/Twitter tags. NOTE: real deployed domain still unknown to the repo.
- `astro preview` DOES NOT WORK (the netlify adapter rejects it). For local verification of
  the built output use `python3 -m http.server 4321 --directory dist`.
- NOT VERIFIABLE LOCALLY: icon at 16px by eye (screenshots blank this session), real iOS
  install, Android maskable crop, netlify.toml headers/CSP (need a deploy preview).

## Session 6b: masthead trim + nav scroll affordance
- User removed masthead furniture: the "Vol. I · Graduate Studies · Artificial Intelligence Desk"
  kicker is GONE (markup + .masthead__kicker CSS), and the dateline is now the date ALONE
  ("Concepts, Explained" / "Price: Your Curiosity" removed).
- The @media(max-width:480px){.masthead{padding-inline:2.6rem}} rule stays — it originally kept
  the theme toggle off the kicker; with the kicker gone it now protects the TITLE, which moved up
  into that space. Verified no toggle/title collision at 375px.
- NAV SCROLL AFFORDANCE: the edge fade alone was not readable as "there is more" (user report).
  Added <div class="topnav-wrap"> around <nav class="topnav">; the wrapper does NOT scroll and
  draws CSS-border chevrons via ::before/::after, toggled by data-more-left / data-more-right
  attributes set from a scroll+resize+ResizeObserver handler in Newspaper.astro. The mask fade is
  now also per-side (only the cut-off edge fades) so a chevron never sits over a half-faded word.
  Chevrons exist only under the 767px media query -> at desktop the pseudo-elements are
  `content: none`, nav still wraps centred. VERIFIED at 375: right-only at start, both mid-scroll,
  left-only at end; overflow 0. At 1280: no chevrons, no mask, nav 38px.

## Session 6c: reclaim vertical space + cap the wire lists
- HOME LEDE DEAD SPACE (user screenshot): .grid--lede is 2fr/1fr and the aside (5 Editor's Picks)
  was ~170px taller than the headline+deck column, so the left column reserved the aside's height.
  FIX: EDITORS_PICKS 5 -> 3 (index.astro) + `.grid--lede { align-items: start }`. Verified 1280px:
  left 272 / right 264 (was a ~170px gap).
- /latest: removed the "More AI, data, and engineering news breaks each day..." deck. Both sections
  are now flag + headline + rule only.
- LIST CAPS (user asked "keep to 5, ranked by LLM"):
  * news TOP 12 -> 5. "Show more stories" KEPT, so the other ~22 ranked items stay reachable.
  * ecosystem PER_LANE=4 (=up to 8/bucket) -> PER_BUCKET=5 via a new interleave(tracked, discovered, n)
    that ALTERNATES the two lanes' ranked orders instead of concatenating them. Concatenating put all
    discovered first, which buried the ranking; a flat cap (the original bug) let Show HN evict every
    tracked release. Alternating preserves each lane's LLM rank AND guarantees both lanes appear,
    with dated releases leading. VERIFIED against the live feed: Models 2 (dd), Standards 4 (tttt),
    Libraries 17->5 (tdtdt), Patterns 6->5 (tdtdt); 16 shown vs up to 32 before.
- GLOBAL VERTICAL RHYTHM (repeats on every page, so small cuts compound):
  .paper padding-bottom 4rem->2.5rem, .rule margin 1.25rem->0.9rem, .masthead padding 1.5/0.75->0.9/0.5.
- VERIFY TRICK worth reusing: the /api/* endpoints 404 on a plain static server, so
  `mkdir dist/api && curl <live>/api/news -o dist/api/news` makes python -m http.server serve the real
  feed as a static file. fetch().json() ignores the wrong content-type, so the page renders live data
  and the caps can be asserted end-to-end. Delete dist/api afterwards.
