"use client";

import { CopyButton } from "@repo/ui/components/copy-button";
import { cn } from "@repo/ui/lib/cn";

export function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <dt className="text-body text-muted-foreground">{label}</dt>
      <dd className="flex min-w-0 items-center gap-2 text-body">{children}</dd>
    </>
  );
}

export function CopyableValue({
  value,
  displayValue,
  mono,
  ariaLabel,
}: {
  value: string;
  displayValue?: string;
  mono?: boolean;
  ariaLabel?: string;
}) {
  return (
    <>
      <span
        className={cn(
          "truncate text-foreground",
          mono && "font-mono tabular-nums",
        )}
        title={displayValue ? value : undefined}
      >
        {displayValue ?? value}
      </span>
      <CopyButton value={value} ariaLabel={ariaLabel} className="shrink-0" />
    </>
  );
}

// First 8 chars of a UUID are enough to disambiguate at a glance; the Copy
// button still hands out the full identifier.
export function truncateUuid(value: string): string {
  return value.length <= 8 ? value : `${value.slice(0, 8)}…`;
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

export function formatRelative(iso: string): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return iso;
  const delta = Date.now() - then;
  if (delta < MINUTE) return "just now";
  if (delta < HOUR) {
    const m = Math.floor(delta / MINUTE);
    return `${m} minute${m === 1 ? "" : "s"} ago`;
  }
  if (delta < DAY) {
    const h = Math.floor(delta / HOUR);
    return `${h} hour${h === 1 ? "" : "s"} ago`;
  }
  if (delta < MONTH) {
    const d = Math.floor(delta / DAY);
    return `${d} day${d === 1 ? "" : "s"} ago`;
  }
  if (delta < YEAR) {
    const mo = Math.floor(delta / MONTH);
    return `${mo} month${mo === 1 ? "" : "s"} ago`;
  }
  const y = Math.floor(delta / YEAR);
  return `${y} year${y === 1 ? "" : "s"} ago`;
}
