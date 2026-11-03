/**
 * Why is (or isn't) a story on the research wire?
 *
 *   npm run news:why -- <url>                  trace it through today's sources
 *   npm run news:why -- <url> --rank           ...and through the Haiku ranker (one API call)
 *   npm run news:why -- <url> --audit <file>   look it up in a saved daily audit
 *                                              (S3: news/audit/research-<date>.json)
 *
 * Without --rank nothing calls the model, and nothing is ever written.
 */
import { existsSync, readFileSync } from 'node:fs';
import { normalizeUrl } from '../server/lib/feeds';
import { qualifies, CURATOR_FEEDS } from '../server/lib/citations';
import { gatherCandidates, prefilter, describe, rankWithHaiku, type AuditRow, type NewsItem } from '../server/lib/news';

const args = process.argv.slice(2);
const raw = args.find((a) => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--audit');
const auditFile = args.includes('--audit') ? args[args.indexOf('--audit') + 1] : undefined;
const target = raw ? normalizeUrl(raw) : null;
if (!target) {
  console.error('usage: npm run news:why -- <url> [--rank] [--audit <file>]');
  process.exit(2);
}
const same = (u: string) => normalizeUrl(u) === target;
const show = (r: AuditRow) =>
  `  ${r.stage.padEnd(11)} ${r.source.padEnd(12)} ${r.reason}${r.cites?.length ? `  [cited by ${r.cites.join(', ')}]` : ''}`;

if (auditFile) {
  const { generatedAt, rows } = JSON.parse(readFileSync(auditFile, 'utf8')) as { generatedAt: string; rows: AuditRow[] };
  const hits = rows.filter((r) => same(r.url));
  console.log(`audit of ${generatedAt}: ${hits.length ? '' : 'never fetched that day'}`);
  hits.forEach((r) => console.log(show(r)));
  process.exit(0);
}

if (existsSync('.env')) process.loadEnvFile('.env');
console.log(`tracing ${target}\n`);
const { arxiv, hn, cited, index } = await gatherCandidates();

const inHn = hn.find((h) => same(h.url));
const inArxiv = arxiv.find((a) => same(a.url));
const c = index.get(target);
console.log('sources');
console.log(`  arXiv        ${inArxiv ? 'yes' : 'no'} (latest announcement, ${arxiv.length} papers)`);
console.log(`  Hacker News  ${inHn ? `yes, ${inHn.points} points: "${inHn.title}"` : 'no (not in the top 36h, >80 points)'}`);
console.log(
  `  citations    ${c ? `${c.citers.join(', ')}${qualifies(c) ? '' : ' (needs a second citer or an aggregator)'}` : 'none'}`,
);
console.log(`               curators read: ${CURATOR_FEEDS.map((f) => f.source).join(', ')}\n`);

const audit: AuditRow[] = [];
const candidates = prefilter([...arxiv, ...hn, ...cited], audit);
const cand = candidates.find((x) => same(x.url));
let final: NewsItem[] | null = null;
if (cand && args.includes('--rank')) {
  await describe(candidates);
  final = await rankWithHaiku(candidates, audit);
}

console.log('verdict');
const rows = audit.filter((r) => same(r.url));
if (rows.length) rows.forEach((r) => console.log(show(r)));
else if (!cand) console.log('  never fetched: no source above carried it');
else if (!final) console.log(`  reaches the ranker (one of ${candidates.length}); run with --rank to see where it lands`);
else {
  const at = final.findIndex((x) => same(x.url));
  console.log(`  kept at #${at + 1} of ${final.length}${at < 5 ? ' (above the fold)' : ''}: ${final[at].category ?? ''} — ${final[at].why ?? ''}`);
}
