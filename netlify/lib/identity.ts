/**
 * Identity extraction for Netlify Functions.
 *
 * With the v1 handler API, Netlify verifies the Netlify Identity (GoTrue) JWT
 * supplied in the `Authorization: Bearer …` header at the edge and, on success,
 * populates `context.clientContext.user`. If the token is missing/invalid, that
 * field is absent — which is our authentication boundary. We never see or need
 * the signing secret, and we never trust a client-supplied identity directly.
 */
import type { HandlerContext, HandlerEvent } from '@netlify/functions';

const ID_RE = /^[A-Za-z0-9_-]{1,80}$/;

export interface AuthUser {
  /** GoTrue subject — stable unique user id. */
  id: string;
  email?: string;
  name?: string;
}

/** Returns the verified Identity user, or `null` when unauthenticated. */
export function getUser(context: HandlerContext): AuthUser | null {
  const user = (context.clientContext as any)?.user;
  if (!user || typeof user.sub !== 'string' || user.sub.length === 0) return null;
  return {
    id: user.sub,
    email: typeof user.email === 'string' ? user.email : undefined,
    name:
      (user.user_metadata && typeof user.user_metadata.full_name === 'string'
        ? user.user_metadata.full_name
        : undefined) ?? undefined,
  };
}

/**
 * Anonymous per-browser visitor id (sent by the client as `X-Visitor-Id`).
 * Used only to scope stored chat history when login is disabled. It is NOT a
 * security boundary — it is client-supplied and validated for shape only.
 */
export function getVisitorId(event: HandlerEvent): string {
  const raw = event.headers['x-visitor-id'];
  return typeof raw === 'string' && ID_RE.test(raw) ? raw : 'anon';
}

/** Best-effort client IP, used for the per-IP cost guardrail. */
export function getClientIp(event: HandlerEvent): string {
  const nf = event.headers['x-nf-client-connection-ip'];
  if (typeof nf === 'string' && nf) return nf;
  const fwd = event.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd) return fwd.split(',')[0].trim();
  return 'unknown';
}
