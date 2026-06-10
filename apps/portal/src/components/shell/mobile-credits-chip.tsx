"use client";

import { Gauge } from "lucide-react";
import Link from "next/link";
import { cn } from "@repo/ui/lib/cn";
import type { CreditState } from "@/lib/mock/types";

/**
 * Width math: Gauge size-3.5 (14px) + gap-1 (4px) + 5-char worst case
 * (`4,230`) at `font-mono text-label` (12px, ~0.6em advance, ~36px glyphs)
 * + 2×px-1.5 (12px) padding = 66px → `w-[68px]` for ~2px safety. Icon
 * carries the "this is credits" affordance — a bare number reads as
 * ambiguous count.
 */
const CHIP_WIDTH_CLASS = "w-[68px]";

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
        "group/chip flex min-h-8 items-center justify-center gap-1 rounded-md px-1.5 font-mono text-label tabular-nums transition-colors duration-fast ease-out-standard hover:bg-hover",
        CHIP_WIDTH_CLASS,
        isZero ? "text-destructive" : "text-meta-foreground hover:text-foreground",
      )}
    >
      <Gauge aria-hidden="true" className="size-3.5 shrink-0" />
      {label}
    </Link>
  );
}
