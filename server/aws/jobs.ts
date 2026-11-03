/**
 * Lambda entry point for the scheduled /latest refreshes. EventBridge
 * Scheduler invokes it with `{"job":"news"}` daily at 13:00 UTC and
 * `{"job":"briefing"}` on weekdays at 13:30 UTC (see infra/lib/site-stack.ts).
 * /api/refresh-news hands its manual refreshes here too, with an optional
 * `wire` (research | ecosystem | both).
 */
import { loadSecrets } from '../lib/config';
import { refreshBriefing, refreshWires, type WireChoice } from '../lib/jobs';

const WIRES: WireChoice[] = ['research', 'ecosystem', 'both'];

export const handler = async (ev: { job?: string; wire?: string }) => {
  await loadSecrets();
  if (ev?.job === 'news') return refreshWires(WIRES.find((w) => w === ev.wire) ?? 'both');
  if (ev?.job === 'briefing') return refreshBriefing();
  throw new Error(`Unknown job: ${JSON.stringify(ev)}`);
};
