/**
 * Local API server for development: runs the same /api router the Lambda runs,
 * against the filesystem store (.data/) and the secrets in .env. Astro's dev
 * server proxies /api here (see astro.config.mjs), so the site is browsed at
 * http://localhost:4321 as usual.
 *
 *   npx tsx server/dev.ts        (normally started by `npm start`)
 */
import { createServer } from 'node:http';
import { existsSync } from 'node:fs';
import { route } from './router';

if (existsSync('.env')) process.loadEnvFile('.env');
process.env.LOCAL_DEV = 'true';
delete process.env.DATA_BUCKET; // never write to the real bucket from a laptop

const PORT = Number(process.env.API_PORT || 8787);

createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);

  const headers: Record<string, string> = {};
  for (const [k, v] of Object.entries(req.headers)) if (typeof v === 'string') headers[k.toLowerCase()] = v;
  headers['x-forwarded-for'] ??= req.socket.remoteAddress ?? 'unknown';

  try {
    const out = await route({
      httpMethod: req.method ?? 'GET',
      path: url.pathname,
      headers,
      queryStringParameters: url.search ? Object.fromEntries(url.searchParams) : null,
      body: chunks.length ? Buffer.concat(chunks).toString('utf8') : null,
    });
    res.writeHead(out.statusCode, out.headers).end(out.body ?? '');
  } catch (err) {
    console.error(err);
    res.writeHead(500, { 'Content-Type': 'text/plain' }).end('Internal error');
  }
}).listen(PORT, () => console.log(`api: http://localhost:${PORT}/api/*`));
