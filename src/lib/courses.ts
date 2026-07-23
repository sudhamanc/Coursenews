/**
 * Canonical course registry. Course entries live in `courses.config.json` at
 * the repo root — the SINGLE SOURCE OF TRUTH shared by the site, the PDF
 * extraction script, and the Netlify Functions. To add a course, add an entry
 * there (no code changes needed here).
 *
 * The `dir` values map to the source PDF folders under `Documents/`. Slugs are
 * the URL-safe identifiers used throughout the site and validated server-side
 * in Netlify Functions (never trust client input — see `netlify/lib/validate.ts`).
 */
import coursesConfig from '../../courses.config.json';

export interface CourseMeta {
  /** URL-safe identifier, e.g. `applications-of-ml`. */
  slug: string;
  /** Full display title. */
  title: string;
  /** Compact title for nav / cards. */
  shortTitle: string;
  /** Source folder name under `Documents/`. */
  dir: string;
  /** One-line standfirst shown on the section front. */
  blurb: string;
}

export const COURSES: CourseMeta[] = coursesConfig.courses;

export const COURSE_SLUGS = COURSES.map((c) => c.slug);

export const COURSE_BY_SLUG: Record<string, CourseMeta> = Object.fromEntries(
  COURSES.map((c) => [c.slug, c]),
);

export const COURSE_BY_DIR: Record<string, CourseMeta> = Object.fromEntries(
  COURSES.map((c) => [c.dir, c]),
);

export function isValidCourseSlug(slug: string): boolean {
  return Object.prototype.hasOwnProperty.call(COURSE_BY_SLUG, slug);
}
