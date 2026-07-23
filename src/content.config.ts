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
  }),
});

export const collections = { articles };
