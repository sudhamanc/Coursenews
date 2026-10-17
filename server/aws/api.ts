/**
 * Lambda entry point for /api/*, behind CloudFront via a Function URL.
 *
 * CloudFront adds a secret `X-Origin-Verify` header to every request it
 * forwards; anything without it (someone calling the Function URL directly)
 * is refused before any work is done.
 */
import { timingSafeEqual } from 'node:crypto';
import type { LambdaFunctionURLEvent, LambdaFunctionURLResult } from 'aws-lambda';
import { loadSecrets } from '../lib/config';
import { route } from '../router';

function fromCloudFront(provided: string | undefined): boolean {
  const secret = process.env.ORIGIN_SECRET;
  if (!secret || !provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const handler = async (ev: LambdaFunctionURLEvent): Promise<LambdaFunctionURLResult> => {
  await loadSecrets();
  // Function URL header names arrive lowercased.
  if (!fromCloudFront(ev.headers['x-origin-verify'])) return { statusCode: 403, body: 'Forbidden' };

  const res = await route({
    httpMethod: ev.requestContext.http.method,
    path: ev.rawPath,
    headers: ev.headers,
    queryStringParameters: ev.queryStringParameters ?? null,
    body: ev.body ? (ev.isBase64Encoded ? Buffer.from(ev.body, 'base64').toString('utf8') : ev.body) : null,
  });
  return { statusCode: res.statusCode, headers: res.headers, body: res.body ?? '' };
};
