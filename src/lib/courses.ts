/**
 * Canonical section registry. Sections live in `courses.config.json` at the
 * repo root (under the historical `courses` key) — the SINGLE SOURCE OF TRUTH
 * shared by the site, the PDF extraction script, and the Netlify Functions. To
 * add a section, add an entry there (no code changes needed here).
 *
 * The `dir` values map to the source PDF folders under `Documents/`. Slugs are
 * the URL-safe identifiers used in `/sections/<slug>` and validated server-side
 * in Netlify Functions (never trust client input — see `netlify/lib/validate.ts`).
 */
import coursesConfig from '../../courses.config.json';

export interface CourseMeta {
  /** URL-safe identifier, e.g. `deep-learning`. */
  slug: string;
  /** Full display title. */
  title: string;
  /** Compact title for nav / cards. */
  shortTitle: string;
  /** Source folder name under `Documents/`. */
  dir: string;
  /** Nav group id (see `GROUPS`). Sections without one get a top-level nav link. */
  group?: string;
  /** Top-level nav label on narrow screens (ungrouped sections only). */
  navShort?: string;
  /** One-line description shown in the nav menus. */
  tagline: string;
  /** One-line standfirst shown on the section front. */
  blurb: string;
}

export interface GroupMeta {
  id: string;
  /** Menu label, e.g. `Artificial Intelligence`. */
  label: string;
  /** Label on narrow screens, e.g. `AI`. */
  short: string;
}

export const COURSES: CourseMeta[] = coursesConfig.courses;

export const GROUPS: GroupMeta[] = coursesConfig.groups;

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

/** Sections in a nav group, in config order. */
export function sectionsInGroup(groupId: string): CourseMeta[] {
  return COURSES.filter((c) => c.group === groupId);
}

/**
 * The label to show for an article's `lectureId`, or null to show none. The
 * ids are ordering keys left over from the source material (W3, L08, R2) and
 * would read as course numbering; only publication years — the Foundational
 * Papers — are worth showing.
 */
export function displayId(lectureId: string): string | null {
  return /^\d{4}$/.test(lectureId) ? lectureId : null;
}
