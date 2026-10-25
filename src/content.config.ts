import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * `articles` — one long-form "feature" per lecture. Files live under
 * `src/content/articles/<course-slug>/<lecture>.md`. Concepts are authored as
 * H2/H3 sections in the body; the `concepts[]` frontmatter drives the
 * "Dig deeper" chat entry points and the Key Terms sidebar.
 */
const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    /** Course slug — must match an entry in `src/lib/courses.ts`. */
    course: z.string(),
    /** Lecture identifier within the course, e.g. `L01`, `week-1`. */
    lectureId: z.string(),
    /** Headline. */
    title: z.string(),
    /** Standfirst / deck shown under the headline. */
    deck: z.string(),
    /** Ordering within the course front (ascending). */
    order: z.number(),
    /**
     * Book title, for sections that catalogue books rather than lectures (e.g.
     * `bedrock`). Articles sharing a `book` are grouped under it on the section
     * front, which turns the two-level section → article structure into
     * section → book → chapter. Omit elsewhere.
     */
    book: z.string().optional(),
    /**
     * The book's own part/division, e.g. `II · Problem-solving`. Used as a
     * subhead within a book group. Only meaningful alongside `book`.
     */
    part: z.string().optional(),
    /**
     * Chapter number within `book`. Shown on the card, because a book's own
     * chapter numbering is part of the text rather than course numbering —
     * which is why it bypasses `displayId`.
     */
    chapter: z.number().optional(),
    /** Optional publish/lecture date. */
    date: z.coerce.date().optional(),
    /** Estimated reading time in minutes (computed at authoring time). */
    readingTime: z.number().optional(),
    /** Concepts covered — power the Key Terms rail and chat deep-dives. */
    concepts: z
      .array(
        z.object({
          id: z.string(),
          term: z.string(),
          definition: z.string(),
        }),
      )
      .default([]),
    tags: z.array(z.string()).default([]),
    /**
     * The public work a feature summarizes, for articles written from an
     * outside source rather than the section's own material. Renders a
     * "Read the original" link under the byline and an attribution card at the
     * end, with the license when the source asks for one (e.g. CC BY-SA).
     * URLs must be https so a typo can never ship a `javascript:` link.
     */
    source: z
      .object({
        title: z.string(),
        author: z.string(),
        url: z.string().url().startsWith('https://'),
        license: z.string().optional(),
        licenseUrl: z.string().url().startsWith('https://').optional(),
      })
      .optional(),
  }),
});

export const collections = { articles };
