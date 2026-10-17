/**
 * Key-value JSON storage for the server code.
 *
 * Mirrors the small slice of the Netlify Blobs API this code was written
 * against, so the callers did not have to change shape:
 *
 *   get(key, {type:'json'})            → value | null
 *   getWithMetadata(key, {type:'json'}) → {data, etag} | null
 *   setJSON(key, value, {onlyIfMatch | onlyIfNew}) → {modified}
 *   list({prefix})                     → {blobs: [{key}]}
 *   delete(key)
 *
 * Two drivers:
 *
 *   s3   when DATA_BUCKET is set (production). Each store is a key prefix,
 *        `<store>/<key>`. S3 reads are strongly consistent, and conditional
 *        writes (If-Match / If-None-Match) give the rate limiter its
 *        compare-and-swap.
 *   fs   otherwise (local dev): JSON files under STORE_DIR (default `.data/`).
 */
import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

export interface Store {
  get(key: string, opts: { type: 'json' }): Promise<unknown | null>;
  getWithMetadata(key: string, opts: { type: 'json' }): Promise<{ data: unknown; etag: string } | null>;
  setJSON(key: string, value: unknown, opts?: { onlyIfMatch?: string; onlyIfNew?: boolean }): Promise<{ modified: boolean }>;
  list(opts?: { prefix?: string }): Promise<{ blobs: Array<{ key: string }> }>;
  delete(key: string): Promise<void>;
}

/* ---------------------------------------------------------------------- s3 */

let s3: S3Client | null = null;
const client = () => (s3 ??= new S3Client({}));

const isMissing = (err: any) => err?.name === 'NoSuchKey' || err?.$metadata?.httpStatusCode === 404;
const isConflict = (err: any) =>
  err?.name === 'PreconditionFailed' ||
  err?.name === 'ConditionalRequestConflict' ||
  err?.$metadata?.httpStatusCode === 412 ||
  err?.$metadata?.httpStatusCode === 409;

function s3Store(bucket: string, name: string): Store {
  const k = (key: string) => `${name}/${key}`;

  async function read(key: string): Promise<{ data: unknown; etag: string } | null> {
    try {
      const res = await client().send(new GetObjectCommand({ Bucket: bucket, Key: k(key) }));
      const body = await res.Body!.transformToString();
      return { data: JSON.parse(body), etag: res.ETag ?? '' };
    } catch (err) {
      if (isMissing(err)) return null;
      throw err;
    }
  }

  return {
    async get(key) {
      return (await read(key))?.data ?? null;
    },
    getWithMetadata: (key) => read(key),
    async setJSON(key, value, opts = {}) {
      try {
        await client().send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: k(key),
            Body: JSON.stringify(value),
            ContentType: 'application/json',
            ...(opts.onlyIfMatch ? { IfMatch: opts.onlyIfMatch } : {}),
            ...(opts.onlyIfNew ? { IfNoneMatch: '*' } : {}),
          }),
        );
        return { modified: true };
      } catch (err) {
        if (isConflict(err)) return { modified: false };
        throw err;
      }
    },
    async list({ prefix = '' } = {}) {
      const blobs: Array<{ key: string }> = [];
      let token: string | undefined;
      do {
        const res = await client().send(
          new ListObjectsV2Command({ Bucket: bucket, Prefix: k(prefix), ContinuationToken: token }),
        );
        for (const o of res.Contents ?? []) if (o.Key) blobs.push({ key: o.Key.slice(name.length + 1) });
        token = res.IsTruncated ? res.NextContinuationToken : undefined;
      } while (token);
      return { blobs };
    },
    async delete(key) {
      await client().send(new DeleteObjectCommand({ Bucket: bucket, Key: k(key) }));
    },
  };
}

/* ---------------------------------------------------------------------- fs */

function fsStore(root: string, name: string): Store {
  const base = resolve(root, name);
  const path = (key: string) => {
    const p = resolve(base, key);
    if (p !== base && !p.startsWith(base + sep)) throw new Error(`Bad key: ${key}`);
    return p;
  };
  const etagOf = (text: string) => `"${createHash('md5').update(text).digest('hex')}"`;

  async function read(key: string): Promise<{ data: unknown; etag: string } | null> {
    try {
      const text = await readFile(path(key), 'utf8');
      return { data: JSON.parse(text), etag: etagOf(text) };
    } catch (err: any) {
      if (err?.code === 'ENOENT') return null;
      throw err;
    }
  }

  async function walk(dir: string): Promise<string[]> {
    const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
    const out: string[] = [];
    for (const e of entries) {
      const p = join(dir, e.name);
      if (e.isDirectory()) out.push(...(await walk(p)));
      else out.push(relative(base, p).split(sep).join('/'));
    }
    return out;
  }

  return {
    async get(key) {
      return (await read(key))?.data ?? null;
    },
    getWithMetadata: (key) => read(key),
    async setJSON(key, value, opts = {}) {
      const current = await read(key);
      if (opts.onlyIfNew && current) return { modified: false };
      if (opts.onlyIfMatch && current?.etag !== opts.onlyIfMatch) return { modified: false };
      await mkdir(dirname(path(key)), { recursive: true });
      await writeFile(path(key), JSON.stringify(value));
      return { modified: true };
    },
    async list({ prefix = '' } = {}) {
      return { blobs: (await walk(base)).filter((key) => key.startsWith(prefix)).map((key) => ({ key })) };
    },
    async delete(key) {
      await rm(path(key), { force: true });
    },
  };
}

export function getStore(name: string): Store {
  const bucket = process.env.DATA_BUCKET;
  return bucket ? s3Store(bucket, name) : fsStore(process.env.STORE_DIR || '.data', name);
}
