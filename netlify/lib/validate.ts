/**
 * Server-side input validation and course metadata.
 *
 * SECURITY: never trust client input. Every field the client sends is validated
 * here before it reaches the model or storage. Course slugs/titles come from the
 * shared `courses.config.json` (single source of truth) so this stays in sync
 * with the site automatically.
 */
import coursesConfig from '../../courses.config.json';

/** slug -> title, built from the canonical config. */
export const COURSES: Record<string, string> = Object.fromEntries(
  coursesConfig.courses.map((c) => [c.slug, c.title]),
);

export const MAX_INPUT_CHARS = Number(process.env.CHAT_MAX_INPUT_CHARS || 4000);
const MAX_HISTORY_ECHO = 20; // hard cap on stored/echoed turns

/** A short, safe identifier: letters, digits, hyphen, underscore. */
const ID_RE = /^[A-Za-z0-9_-]{1,80}$/;

export interface ChatContext {
  course: string;
  courseTitle: string;
  lectureId: string;
  lectureTitle: string;
  conceptId?: string;
  conceptTerm?: string;
}

export interface ChatBody {
  message: string;
  threadId?: string;
  context: ChatContext;
}

export type ValidationResult<T> = { ok: true; data: T } | { ok: false; error: string };

function clampString(v: unknown, max: number): string {
  return typeof v === 'string' ? v.slice(0, max) : '';
}

/** Collapse control characters and trim; keeps normal whitespace/newlines. */
function sanitizeText(v: string): string {
  return v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim();
}

export function validateChatBody(raw: unknown): ValidationResult<ChatBody> {
  if (typeof raw !== 'object' || raw === null) return { ok: false, error: 'Invalid body.' };
  const b = raw as Record<string, unknown>;

  const message = sanitizeText(clampString(b.message, MAX_INPUT_CHARS + 1));
  if (!message) return { ok: false, error: 'Message is required.' };
  if (message.length > MAX_INPUT_CHARS) {
    return { ok: false, error: `Message exceeds ${MAX_INPUT_CHARS} characters.` };
  }

  const ctxRaw = (b.context ?? {}) as Record<string, unknown>;
  const course = clampString(ctxRaw.course, 80);
  if (!Object.prototype.hasOwnProperty.call(COURSES, course)) {
    return { ok: false, error: 'Unknown course.' };
  }

  const threadId = b.threadId === undefined || b.threadId === null ? undefined : clampString(b.threadId, 80);
  if (threadId !== undefined && !ID_RE.test(threadId)) {
    return { ok: false, error: 'Invalid threadId.' };
  }

  const conceptId = clampString(ctxRaw.conceptId, 80);
  if (conceptId && !ID_RE.test(conceptId)) {
    return { ok: false, error: 'Invalid conceptId.' };
  }

  const context: ChatContext = {
    course,
    courseTitle: COURSES[course],
    lectureId: clampString(ctxRaw.lectureId, 40) || '—',
    lectureTitle: sanitizeText(clampString(ctxRaw.lectureTitle, 240)) || 'this feature',
    conceptId: conceptId || undefined,
    conceptTerm: sanitizeText(clampString(ctxRaw.conceptTerm, 160)) || undefined,
  };

  return { ok: true, data: { message, threadId, context } };
}

/** Validate a thread id taken from a URL path/query. */
export function isValidThreadId(id: string): boolean {
  return ID_RE.test(id);
}

export { MAX_HISTORY_ECHO };
