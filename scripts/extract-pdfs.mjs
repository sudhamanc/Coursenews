/**
 * PDF text extraction (Phase 1).
 *
 * Walks every course folder under `Documents/`, extracts raw text from each PDF
 * with `unpdf`, normalizes whitespace, and writes it to
 * `content/_extracted/<course-slug>/<lecture>.txt` (gitignored, regenerable).
 *
 * It also emits `content/_extracted/manifest.json` — the index the article
 * authoring step (Phase 2) consumes to know which lectures exist, their source
 * paths, page counts, and text sizes.
 *
 * Incremental by design (a DELTA operation, never a full rebuild): existing
 * `.txt` files are reused, so re-running only extracts newly added PDFs, and the
 * manifest is merged (untouched courses are preserved).
 *
 * Usage:
 *   npm run extract                  extract new PDFs for every course
 *   npm run extract -- --force       re-extract everything (overwrite .txt)
 *   npm run extract -- <slug>        only this course, e.g. `applied-ai`
 *   npm run extract -- <slug> --force  re-extract just that course
 *
 * Courses come from `courses.config.json` (the single source of truth shared
 * with the site and the Netlify Functions).
 */
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractText, getDocumentProxy } from 'unpdf';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(ROOT, 'Documents');
const OUT_DIR = path.join(ROOT, 'content', '_extracted');
const CONFIG_PATH = path.join(ROOT, 'courses.config.json');
const MANIFEST_PATH = path.join(OUT_DIR, 'manifest.json');

// Single source of truth for courses (shared with the site + Netlify Functions).
const COURSES = JSON.parse(await readFile(CONFIG_PATH, 'utf8')).courses;

const ARGS = process.argv.slice(2);
const FORCE = ARGS.includes('--force');
// Optional positional course slug(s) limit the run to those courses (a faster
// delta run), e.g. `npm run extract -- applied-ai`. With none, every course in
// the config is processed. Extraction is ALWAYS incremental: existing .txt files
// are reused unless --force is given.
const ONLY = ARGS.filter((a) => !a.startsWith('--'));

/** Turn a PDF filename into a URL/file-safe slug (no extension). */
function toFileSlug(filename) {
  return filename
    .replace(/\.pdf$/i, '')
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, ' ') // parens, etc. -> space
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
}

/** Collapse the noisy whitespace PDF extraction tends to produce. */
function normalizeText(raw) {
  return raw
    .replace(/\r\n?/g, '\n')
    .replace(/\u00a0/g, ' ') // non-breaking spaces
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function extractOne(absPdfPath) {
  const buf = await readFile(absPdfPath);
  const pdf = await getDocumentProxy(new Uint8Array(buf));
  const { totalPages, text } = await extractText(pdf, { mergePages: true });
  return { totalPages, text: normalizeText(text) };
}

async function main() {
  if (!existsSync(DOCS_DIR)) {
    console.error(`No Documents/ directory found at ${DOCS_DIR}`);
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });

  const selected = ONLY.length ? COURSES.filter((c) => ONLY.includes(c.slug)) : COURSES;
  if (ONLY.length && selected.length === 0) {
    console.error(`No course in courses.config.json matches: ${ONLY.join(', ')}`);
    process.exit(1);
  }

  // Start from the existing manifest so a partial (per-course) run preserves the
  // entries for courses we're not touching this time (delta-friendly).
  const manifest = { generatedAt: new Date().toISOString(), courses: [] };
  if (existsSync(MANIFEST_PATH)) {
    try {
      const prev = JSON.parse(await readFile(MANIFEST_PATH, 'utf8'));
      if (Array.isArray(prev.courses)) manifest.courses = prev.courses;
    } catch {
      /* ignore a corrupt manifest; it will be rebuilt */
    }
  }

  for (const { slug, dir } of selected) {
    const courseDir = path.join(DOCS_DIR, dir);
    if (!existsSync(courseDir)) {
      console.warn(`  ! skipping ${slug} (Documents/${dir} not found)`);
      continue;
    }

    const files = (await readdir(courseDir))
      .filter((f) => f.toLowerCase().endsWith('.pdf'))
      .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));

    const outCourseDir = path.join(OUT_DIR, slug);
    await mkdir(outCourseDir, { recursive: true });

    console.log(`\n${slug}  (${files.length} PDFs)`);
    const lectures = [];
    let added = 0;

    for (const file of files) {
      const fileSlug = toFileSlug(file);
      const outPath = path.join(outCourseDir, `${fileSlug}.txt`);
      const relOut = path.relative(ROOT, outPath);

      if (!FORCE && existsSync(outPath)) {
        const existing = await readFile(outPath, 'utf8');
        lectures.push({
          fileSlug,
          source: path.relative(ROOT, path.join(courseDir, file)),
          extracted: relOut,
          chars: existing.length,
          skipped: true,
        });
        console.log(`  = ${file} -> ${fileSlug}.txt (cached)`);
        continue;
      }

      try {
        const { totalPages, text } = await extractOne(path.join(courseDir, file));
        await writeFile(outPath, text, 'utf8');
        added++;
        lectures.push({
          fileSlug,
          source: path.relative(ROOT, path.join(courseDir, file)),
          extracted: relOut,
          pages: totalPages,
          chars: text.length,
        });
        console.log(`  + ${file} -> ${fileSlug}.txt (${totalPages}p, ${text.length} chars)`);
      } catch (err) {
        console.error(`  ! FAILED ${file}: ${err.message}`);
        lectures.push({
          fileSlug,
          source: path.relative(ROOT, path.join(courseDir, file)),
          error: String(err.message || err),
        });
      }
    }

    // Upsert this course's manifest entry (preserves other courses).
    const entry = { slug, dir, lectureCount: lectures.length, lectures };
    const at = manifest.courses.findIndex((c) => c.slug === slug);
    if (at >= 0) manifest.courses[at] = entry;
    else manifest.courses.push(entry);
    if (added === 0 && !FORCE) console.log(`  (no new PDFs — nothing to extract)`);
  }

  // Keep the manifest ordered to match the config.
  const order = new Map(COURSES.map((c, i) => [c.slug, i]));
  manifest.courses.sort((a, b) => (order.get(a.slug) ?? 999) - (order.get(b.slug) ?? 999));
  manifest.generatedAt = new Date().toISOString();

  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');

  const total = manifest.courses.reduce((n, c) => n + c.lectureCount, 0);
  console.log(
    `\nDone. Processed ${selected.length} course(s); manifest now covers ` +
      `${total} lectures across ${manifest.courses.length} courses.`,
  );
  console.log(`Manifest: ${path.relative(ROOT, MANIFEST_PATH)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
