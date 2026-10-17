/**
 * Lambda entry point for the scheduled /latest refreshes. EventBridge
 * Scheduler invokes it with `{"job":"news"}` daily at 13:00 UTC and
 * `{"job":"briefing"}` on weekdays at 13:30 UTC (see infra/lib/site-stack.ts).
 */
import { loadSecrets } from '../lib/config';
import { refreshBriefing, refreshWires } from '../lib/jobs';

export const handler = async (ev: { job?: string }) => {
  await loadSecrets();
  if (ev?.job === 'news') return refreshWires('both');
  if (ev?.job === 'briefing') return refreshBriefing();
  throw new Error(`Unknown job: ${JSON.stringify(ev)}`);
};
