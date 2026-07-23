/**
 * /api/threads            (GET)            -> list saved conversations
 * /api/threads/:id        (GET)            -> full transcript (JSON)
 * /api/threads/:id?format=txt (GET)        -> downloadable plain-text transcript
 * /api/threads/:id        (DELETE)         -> delete a conversation
 *
 * Operations are scoped to an anonymous per-browser visitor id (sent as
 * `X-Visitor-Id`). This is not a security boundary — with login disabled,
 * history is simply namespaced per browser.
 */
import type { Handler } from '@netlify/functions';
import { connectLambda } from '@netlify/blobs';
import { getVisitorId } from '../lib/identity';
import { isValidThreadId } from '../lib/validate';
import {
  threadsStore,
  readIndex,
  writeIndex,
  readThread,
  threadKey,
  type Thread,
} from '../lib/blobs';
import { json, text, error } from '../lib/http';

/** Pull a thread id from the request path (`…/threads/<id>`) or `?id=`. */
function extractThreadId(path: string, query: Record<string, string | undefined> | null): string | null {
  const m = path.match(/\/threads\/([^/?]+)/);
  if (m && m[1]) return decodeURIComponent(m[1]);
  const q = query?.id;
  return q ? decodeURIComponent(q) : null;
}

function transcriptToText(t: Thread): string {
  const header = [
    `# ${t.title || 'Conversation'}`,
    `Course: ${t.context.courseTitle} — ${t.context.lectureTitle} (${t.context.lectureId})`,
    `Started: ${t.createdAt}`,
    `Updated: ${t.updatedAt}`,
    '',
  ].join('\n');
  const body = t.messages
    .map((m) => `${m.role === 'user' ? 'You' : 'The Desk'} · ${m.ts}\n${m.content}\n`)
    .join('\n');
  return `${header}\n${body}`;
}

export const handler: Handler = async (event) => {
  connectLambda(event as any);
  const visitorId = getVisitorId(event);
  const id = extractThreadId(event.path, event.queryStringParameters);

  // Storage is best-effort: if Blobs is unavailable, degrade gracefully rather
  // than 500 (list -> empty, item -> not found).
  let store: ReturnType<typeof threadsStore>;
  try {
    store = threadsStore();
  } catch (err) {
    console.error('blobs unavailable', err);
    if (!id) return json(200, { threads: [] });
    return error(404, 'Conversation not found.');
  }

  // ---- Collection: list --------------------------------------------------
  if (!id) {
    if (event.httpMethod !== 'GET') return error(405, 'Method not allowed.');
    const index = await readIndex(store, visitorId);
    return json(200, { threads: index.threads });
  }

  if (!isValidThreadId(id)) return error(400, 'Invalid thread id.');

  // ---- Item: delete ------------------------------------------------------
  if (event.httpMethod === 'DELETE') {
    await store.delete(threadKey(visitorId, id));
    const index = await readIndex(store, visitorId);
    await writeIndex(store, visitorId, { threads: index.threads.filter((t) => t.id !== id) });
    return json(200, { ok: true });
  }

  if (event.httpMethod !== 'GET') return error(405, 'Method not allowed.');

  // ---- Item: get / download ----------------------------------------------
  const thread = await readThread(store, visitorId, id);
  if (!thread) return error(404, 'Conversation not found.');

  if (event.queryStringParameters?.format === 'txt') {
    return text(200, transcriptToText(thread), {
      'Content-Disposition': `attachment; filename="conversation-${id}.txt"`,
    });
  }

  return json(200, {
    id: thread.id,
    title: thread.title,
    createdAt: thread.createdAt,
    updatedAt: thread.updatedAt,
    context: thread.context,
    messages: thread.messages.map((m) => ({ role: m.role, content: m.content, ts: m.ts })),
  });
};
