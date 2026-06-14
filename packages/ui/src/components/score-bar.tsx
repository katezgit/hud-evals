// shadcn-source: radix-wrap:n/a (n/a, 2026-06-13)
// Formalized from apps/portal RewardBar (PR #45). No Radix primitive needed —
// pure presentational track + fill with no interaction semantics.

import * as React from "react"
import { cn } from "@repo/ui/lib/cn"

export interface ScoreBarProps {
  /** Score percentage 0–100. Values are clamped to range. */
  value: number
  /** Threshold for high/low fill swap. Default 50. */
  threshold?: number
  className?: string
}

export const ScoreBar = React.forwardRef<HTMLSpanElement, ScoreBarProps>(
  ({ value, threshold = 50, className }, ref) => {
    const pct = Math.max(0, Math.min(100, value))
    const fill = pct >= threshold ? "bg-state-scored" : "bg-state-warning"
    return (
      <span
        ref={ref}
        aria-hidden="true"
        className={cn(
          "block h-2 w-16 overflow-hidden rounded-sm bg-secondary-surface",
          className,
        )}
      >
        <span
          className={cn("block h-full rounded-sm", fill)}
          style={{ width: `${pct}%` }}
        />
      </span>
    )
  },
)
ScoreBar.displayName = "ScoreBar"
