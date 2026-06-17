/**
 * Relative-time formatter for the Logs tab `Created` column.
 *
 * Compact form matching the wireframe samples: `3 min ago`, `2 hr ago`,
 * `5 days ago`. Pure derivation from an ISO timestamp + a reference `now`.
 * The reference is passed in (not read off `Date.now()`) so the formatter is
 * deterministic in tests and stable across the table's render pass — every
 * row computes against the same `now`, keeping labels coherent.
 */
export function formatRelativeTime(iso: string, now: number): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return iso;
  const diffMs = now - then;
  if (diffMs < 60_000) return "just now";
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} mo ago`;
  const years = Math.floor(months / 12);
  return `${years} yr${years === 1 ? "" : "s"} ago`;
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

/**
 * Compact variant used in page-header meta lines ("2h ago", "5d ago").
 * Reads `Date.now()` directly — fine for header chrome that re-renders on nav,
 * unlike the Logs table which threads a single `now` reference per render pass.
 */
export function formatRelative(iso: string): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return iso;
  const delta = Date.now() - then;
  if (delta < MINUTE) return "just now";
  if (delta < HOUR) {
    const m = Math.floor(delta / MINUTE);
    return `${m} min ago`;
  }
  if (delta < DAY) {
    const h = Math.floor(delta / HOUR);
    return `${h}h ago`;
  }
  if (delta < MONTH) {
    const d = Math.floor(delta / DAY);
    return `${d}d ago`;
  }
  if (delta < YEAR) {
    const mo = Math.floor(delta / MONTH);
    return `${mo}mo ago`;
  }
  const y = Math.floor(delta / YEAR);
  return `${y}y ago`;
}
