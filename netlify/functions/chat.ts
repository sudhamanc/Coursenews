/**
 * POST /api/chat  ->  /.netlify/functions/chat
 *
 * Public chat proxy to Claude Haiku. Validates input, enforces a per-IP daily
 * cap (cost guardrail), calls the model with an injection-resistant system
 * prompt, and persists the transcript to Netlify Blobs under an anonymous
 * per-browser visitor id. The Anthropic API key never leaves this function.
 */
import type { Handler } from '@netlify/functions';
import { getVisitorId, getClientIp } from '../lib/identity';
import { validateChatBody } from '../lib/validate';
import { consumeDailyQuota } from '../lib/ratelimit';
import { answer, makeTitle } from '../lib/anthropic';
import {
  threadsStore,
  readIndex,
  writeIndex,
  readThread,
  writeThread,
  upsertIndexEntry,
  type Thread,
  type ChatMessage,
} from '../lib/blobs';
import { json, error } from '../lib/http';

const MAX_STORED_MESSAGES = 40; // keep transcripts bounded

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return error(405, 'Method not allowed.');

  const visitorId = getVisitorId(event);

  let parsed: unknown;
  try {
    parsed = JSON.parse(event.body || '{}');
  } catch {
    return error(400, 'Malformed JSON.');
  }

  const valid = validateChatBody(parsed);
  if (!valid.ok) return error(400, valid.error);
  const { message, threadId, context: ctx } = valid.data;

  // Cost guardrail (per client IP).
  const quota = await consumeDailyQuota(getClientIp(event));
  if (!quota.allowed) return error(429, 'Rate limit reached. Please try again later.');

  // Thread storage is best-effort: if Blobs is unavailable, chat still works,
  // just without persistence.
  let store: ReturnType<typeof threadsStore> | null = null;
  let thread: Thread | null = null;
  try {
    store = threadsStore();
    thread = threadId ? await readThread(store, visitorId, threadId) : null;
  } catch (err) {
    console.error('blobs unavailable (read)', err);
    store = null;
  }
  const now = new Date().toISOString();
  const isNew = !thread;

  if (!thread) {
    thread = {
      id: threadId || crypto.randomUUID(),
      title: '',
      createdAt: now,
      updatedAt: now,
      context: ctx,
      messages: [],
    };
  }

  // Prior turns for model context (bounded).
  const history: ChatMessage[] = thread.messages.slice(-MAX_STORED_MESSAGES);

  let reply: string;
  try {
    reply = await answer(ctx, history, message);
  } catch (err) {
    console.error('anthropic error', err);
    return error(502, 'The assistant is unavailable right now.');
  }

  // Append the exchange.
  thread.messages.push({ role: 'user', content: message, ts: now });
  thread.messages.push({ role: 'assistant', content: reply, ts: new Date().toISOString() });
  if (thread.messages.length > MAX_STORED_MESSAGES) {
    thread.messages = thread.messages.slice(-MAX_STORED_MESSAGES);
  }
  thread.updatedAt = new Date().toISOString();

  if (isNew || !thread.title) {
    thread.title = await makeTitle(message, ctx.conceptTerm);
  }

  // Persist transcript + index (best-effort; skipped if storage is unavailable).
  if (store) {
    try {
      await writeThread(store, visitorId, thread);
      const index = upsertIndexEntry(await readIndex(store, visitorId), thread);
      await writeIndex(store, visitorId, index);
    } catch (err) {
      console.error('blobs write error', err);
      // The reply still succeeds even if persistence fails.
    }
  }

  return json(200, { threadId: thread.id, title: thread.title, reply, remaining: quota.remaining });
};
