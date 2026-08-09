// @ts-check
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeFigscroll from './scripts/rehype-figscroll.mjs';

// Static newspaper site. The Netlify adapter is included for local Blobs
// emulation (`netlify dev`) and future flexibility; the site itself builds to
// static HTML in `dist/`. All dynamic behavior lives in `netlify/functions/`.
//
// Astro 7 defaults to a new Markdown processor; the remark/rehype math pipeline
// (KaTeX) is opted into via the `unified()` processor from
// `@astrojs/markdown-remark`.
export default defineConfig({
  // Netlify injects URL (the site's primary address) at build time, so the
  // canonical/OG absolute URLs are correct on every deploy without hardcoding a
  // domain. The fallback only applies to local builds.
  site: process.env.URL || 'http://localhost:4321',
  output: 'static',
  adapter: netlify(),
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
