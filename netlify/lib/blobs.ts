/**
 * Netlify Blobs persistence for chat threads.
 *
 * Storage layout (all keys are namespaced by the authenticated user id, so one
 * user can never address another user's data):
 *   user/<userId>/index.json                — lightweight list of the user's threads
 *   user/<userId>/threads/<threadId>.json   — full transcript for one thread
 *
 * Titles are stored in the index for fast listing (no need to read every blob).
 */
import { getStore, type Store } from '@netlify/blobs';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  ts: string;
}

export interface Thread {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  context: {
    course: string;
    courseTitle: string;
    lectureId: string;
    lectureTitle: string;
    conceptId?: string;
    conceptTerm?: string;
  };
  messages: ChatMessage[];
}

export interface IndexEntry {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  course: string;
  lectureId: string;
}

export interface ThreadIndex {
  threads: IndexEntry[];
}

/** The site-wide store holding chat threads (persists across deploys). */
export function threadsStore(): Store {
  return getStore('chat-threads');
}

export const indexKey = (userId: string) => `user/${userId}/index.json`;
export const threadKey = (userId: string, threadId: string) =>
  `user/${userId}/threads/${threadId}.json`;

export async function readIndex(store: Store, userId: string): Promise<ThreadIndex> {
  const idx = (await store.get(indexKey(userId), { type: 'json' })) as ThreadIndex | null;
  return idx && Array.isArray(idx.threads) ? idx : { threads: [] };
}

export async function writeIndex(store: Store, userId: string, index: ThreadIndex): Promise<void> {
  await store.setJSON(indexKey(userId), index);
}

export async function readThread(
  store: Store,
  userId: string,
  threadId: string,
): Promise<Thread | null> {
  return (await store.get(threadKey(userId, threadId), { type: 'json' })) as Thread | null;
}

export async function writeThread(store: Store, userId: string, thread: Thread): Promise<void> {
  await store.setJSON(threadKey(userId, thread.id), thread);
}

/** Upsert an index entry derived from a thread and keep it sorted newest-first. */
export function upsertIndexEntry(index: ThreadIndex, thread: Thread): ThreadIndex {
  const entry: IndexEntry = {
    id: thread.id,
    title: thread.title,
    createdAt: thread.createdAt,
    updatedAt: thread.updatedAt,
    course: thread.context.course,
    lectureId: thread.context.lectureId,
  };
  const rest = index.threads.filter((t) => t.id !== thread.id);
  return { threads: [entry, ...rest].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)) };
}
