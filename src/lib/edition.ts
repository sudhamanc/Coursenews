/**
 * Client-side helpers for the /latest edition history. The page is static; the
 * edition being read lives in the URL as `?date=YYYY-MM-DD` (a UTC day).
 */
const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** The edition date in the URL, or null for today's edition. */
export function editionDate(): string | null {
  const d = new URLSearchParams(window.location.search).get('date');
  return d && DATE.test(d) ? d : null;
}

/** Query string for the read endpoints: `?date=…` or ''. */
export function editionQuery(): string {
  const d = editionDate();
  return d ? `?date=${d}` : '';
}

/** Today's UTC day, the unit editions are filed under. */
export const todayUtc = (): string => new Date().toISOString().slice(0, 10);

/** "Friday, October 16, 2026" — formatted in UTC so the day never shifts. */
export function formatDay(date: string, style: 'long' | 'short' = 'long'): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    ...(style === 'long'
      ? { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
      : { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
  });
}

export const safeHref = (url: string): string | null => {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : null;
  } catch {
    return null;
  }
};
