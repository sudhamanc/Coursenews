/**
 * /api/* routing, shared by the Lambda entry point (server/aws/api.ts) and the
 * local dev server (server/dev.ts).
 */
import type { HandlerEvent, HandlerResponse, Handler } from './lib/types';
import { handler as chat } from './handlers/chat';
import { handler as threads } from './handlers/threads';
import { handler as news } from './handlers/get-news';
import { handler as ecosystem } from './handlers/get-ecosystem';
import { handler as briefing } from './handlers/get-briefing';
import { handler as editions } from './handlers/get-editions';
import { handler as refreshNews } from './handlers/refresh-news';
import { error } from './lib/http';

const ROUTES: Array<[RegExp, Handler]> = [
  [/^\/api\/chat\/?$/, chat],
  [/^\/api\/threads(?:\/.*)?$/, threads],
  [/^\/api\/news\/?$/, news],
  [/^\/api\/ecosystem\/?$/, ecosystem],
  [/^\/api\/briefing\/?$/, briefing],
  [/^\/api\/editions\/?$/, editions],
  [/^\/api\/refresh-news\/?$/, refreshNews],
];

export async function route(event: HandlerEvent): Promise<HandlerResponse> {
  const match = ROUTES.find(([re]) => re.test(event.path));
  return match ? match[1](event) : error(404, 'Not found.');
}
