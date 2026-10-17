/**
 * Who is calling: an anonymous visitor id for chat history, and a client IP for
 * the per-IP cost guardrail. Login is disabled, so neither is an identity
 * boundary.
 */
import type { HandlerEvent } from './types';

const ID_RE = /^[A-Za-z0-9_-]{1,80}$/;

/**
 * Anonymous per-browser visitor id (sent by the client as `X-Visitor-Id`).
 * Used only to scope stored chat history when login is disabled. It is NOT a
 * security boundary — it is client-supplied and validated for shape only.
 */
export function getVisitorId(event: HandlerEvent): string {
  const raw = event.headers['x-visitor-id'];
  return typeof raw === 'string' && ID_RE.test(raw) ? raw : 'anon';
}

/**
 * Best-effort client IP. CloudFront sends `CloudFront-Viewer-Address` as
 * `<ip>:<port>` (the IP may itself be IPv6, full of colons), so drop only the
 * last segment. X-Forwarded-For is the fallback, e.g. for local dev.
 */
export function getClientIp(event: HandlerEvent): string {
  const viewer = event.headers['cloudfront-viewer-address'];
  if (typeof viewer === 'string' && viewer.includes(':')) return viewer.slice(0, viewer.lastIndexOf(':'));
  const fwd = event.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd) return fwd.split(',')[0].trim();
  return 'unknown';
}
