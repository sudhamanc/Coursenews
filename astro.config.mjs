// @ts-check
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// Static newspaper site. The Netlify adapter is included for local Blobs
// emulation (`netlify dev`) and future flexibility; the site itself builds to
// static HTML in `dist/`. All dynamic behavior lives in `netlify/functions/`.
//
// Astro 7 defaults to a new Markdown processor; the remark/rehype math pipeline
// (KaTeX) is opted into via the `unified()` processor from
// `@astrojs/markdown-remark`.
export default defineConfig({
  site: 'https://example.netlify.app',
  output: 'static',
  adapter: netlify(),
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
    shikiConfig: { theme: 'github-light', wrap: true },
  },
});
