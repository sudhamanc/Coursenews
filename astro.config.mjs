// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeFigscroll from './scripts/rehype-figscroll.mjs';

// Static newspaper site: builds to static HTML in `dist/` (served from S3 via
// CloudFront), and all dynamic behavior lives in `server/` (one Lambda behind
// /api/*).
//
// Deliberately NO adapter. A server adapter registers a function on `/*`, so
// every URL without a static file — each bot probing for /wp-login.php or
// /.env — would invoke a function and bill compute. A static build needs no
// server: missing URLs get `404.html` straight from the CDN.
//
// Astro 7 defaults to a new Markdown processor; the remark/rehype math pipeline
// (KaTeX) is opted into via the `unified()` processor from
// `@astrojs/markdown-remark`.
export default defineConfig({
  // The deploy script sets SITE_URL (the CloudFront address, or a custom domain
  // later) so canonical/OG absolute URLs are correct. The fallback only applies
  // to local builds.
  site: process.env.SITE_URL || 'http://localhost:4321',
  output: 'static',
  // In dev, /api/* goes to the local API server (server/dev.ts).
  vite: { server: { proxy: { '/api': `http://localhost:${process.env.API_PORT || 8787}` } } },
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      // Order matters. Inline SVG authored in markdown arrives as `raw` hast
      // nodes, so rehypeRaw must parse them into real elements before
      // rehypeFigscroll can find them. figscroll runs after katex so it can
      // recognise (and skip) KaTeX's own inline <svg> output.
      rehypePlugins: [rehypeKatex, rehypeRaw, rehypeFigscroll],
    }),
    shikiConfig: { theme: 'github-light', wrap: true },
  },
});
