/**
 * Shared HTTP helpers for Netlify Functions (v1 handler API).
 * Centralizes JSON responses and per-response security headers.
 */
import type { HandlerResponse } from '@netlify/functions';

/** Baseline security headers applied to every function response. */
export const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Cache-Control': 'no-store',
};

export function json(
  statusCode: number,
  data: unknown,
  extraHeaders: Record<string, string> = {},
): HandlerResponse {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...SECURITY_HEADERS,
      ...extraHeaders,
    },
    body: JSON.stringify(data),
  };
}

export function text(
  statusCode: number,
  body: string,
  extraHeaders: Record<string, string> = {},
): HandlerResponse {
  return {
    statusCode,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', ...SECURITY_HEADERS, ...extraHeaders },
    body,
  };
}

export const error = (statusCode: number, message: string) => json(statusCode, { error: message });
