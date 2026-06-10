"use client";

import Link from "next/link";
import { cn } from "@repo/ui/lib/cn";
import type { CreditState } from "@/lib/mock/types";

/**
 * Width math: 5-char worst case (`4,230`) at `font-mono text-label` (12px,
 * ~0.6em advance) = ~36px glyphs + 2×px-1.5 (12px) padding = 48px = `w-12`.
 * Skeleton and Link share `w-12` so the avatar position is stable across
 * loading → resting → format-swap (`4,230` ↔ `42k`).
 */
const CHIP_WIDTH_CLASS = "w-12";

function formatCredits(balance: number): string {
  if (balance >= 10_000) return `${Math.round(balance / 1000)}k`;
  return new Intl.NumberFormat("en-US").format(balance);
}

interface MobileCreditsChipProps {
  /** `null` = loading. `total === 0` = unlimited tier (chip hidden). */
  state: CreditState | null;
}

export function MobileCreditsChip({ state }: MobileCreditsChipProps) {
  if (state === null) {
    return (
      <div
        aria-hidden="true"
        className={cn(
          "h-4 animate-pulse rounded-sm bg-muted-foreground/20",
          CHIP_WIDTH_CLASS,
        )}
      />
    );
  }

  if (state.total === 0) return null;

  const isZero = state.balance === 0;
  const label = formatCredits(state.balance);

  return (
    <Link
      href="/manage/usage"
      aria-label={`Credits: ${label}. View usage.`}
      className={cn(
        "flex min-h-8 items-center justify-center rounded-md px-1.5 font-mono text-label tabular-nums transition-colors duration-fast ease-out-standard hover:bg-hover",
        CHIP_WIDTH_CLASS,
        isZero ? "text-destructive" : "text-meta-foreground hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}
