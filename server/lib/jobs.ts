/**
 * The refresh jobs behind /latest, shared by the scheduler (server/aws/jobs.ts)
 * and the on-demand trigger (/api/refresh-news).
 *
 *   refreshWires     research + ecosystem wires, daily at 13:00 UTC. Ranking
 *                    spends three Haiku calls (one for research, one per
 *                    ecosystem lane).
 *   refreshBriefing  the Agentic AI Intelligence Briefing, weekdays at 13:30
 *                    UTC. One Sonnet call. A quiet day publishes nothing and
 *                    leaves the previous briefing current.
 *
 * Each run archives what it wrote under today's date (30-day history), prunes
 * old editions, and purges the CDN's copies of the live endpoints.
 */
import { buildFeed, writeLatest } from './news';
import { buildEcosystemFeed, writeEcosystem } from './ecosystem';
import { buildBriefing, writeBriefing } from './briefing';
import { archiveEdition, pruneEditions } from './editions';
import { purgeLatest } from './wire-endpoint';

export type WireChoice = 'research' | 'ecosystem' | 'both';
type WireResult = { items: number; generatedAt: string } | { error: string };

async function finish(): Promise<void> {
  await pruneEditions().catch((err) => console.error('refresh: prune failed', err));
  await purgeLatest();
}

export async function refreshWires(which: WireChoice = 'both'): Promise<Record<string, WireResult>> {
  const jobs: Array<[string, () => Promise<{ items: unknown[]; generatedAt: string }>]> = [];
  if (which !== 'ecosystem') {
    jobs.push([
      'research',
      async () => {
        const feed = await buildFeed();
        await writeLatest(feed);
        await archiveEdition('research', feed);
        return feed;
      },
    ]);
  }
  if (which !== 'research') {
    jobs.push([
      'ecosystem',
      async () => {
        const feed = await buildEcosystemFeed();
        await writeEcosystem(feed);
        await archiveEdition('ecosystem', feed);
        return feed;
      },
    ]);
  }

  // The wires are independent: a failure in one must not blank the other.
  const settled = await Promise.allSettled(jobs.map(([, run]) => run()));
  const out: Record<string, WireResult> = {};
  settled.forEach((r, i) => {
    const name = jobs[i][0];
    if (r.status === 'fulfilled') {
      out[name] = { items: r.value.items.length, generatedAt: r.value.generatedAt };
      console.log(`refresh: ${name} wire cached ${r.value.items.length} items`);
    } else {
      out[name] = { error: String(r.reason?.message ?? r.reason) };
      console.error(`refresh: ${name} wire failed`, r.reason);
    }
  });
  await finish();
  return out;
}

export async function refreshBriefing(): Promise<
  { published: false } | { published: true; developments: number; candidates: number; generatedAt: string }
> {
  const t0 = Date.now();
  const b = await buildBriefing();
  if (b) {
    await writeBriefing(b);
    await archiveEdition('briefing', b);
    console.log(`refresh: briefing published ${b.developments.length} developments in ${Date.now() - t0} ms`);
  } else {
    console.log('refresh: no briefing published; the previous one stays current');
  }
  await finish();
  return b
    ? { published: true, developments: b.developments.length, candidates: b.candidates, generatedAt: b.generatedAt }
    : { published: false };
}
