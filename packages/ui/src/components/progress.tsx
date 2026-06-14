// shadcn-source: https://ui.shadcn.com/docs/components/progress (cli, 2026-05-26)
import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@repo/ui/lib/cn"

// ── Variants ─────────────────────────────────────────────────────────────────

const progressTrackVariants = cva(
  // base: track — 3px radius per v1 mockup (explicit, not rounded-full)
  "relative w-full overflow-hidden rounded-[3px] bg-muted-surface", // eslint-disable-line no-restricted-syntax -- 3px radius is intentional design spec; no token exists between radius-none(0) and radius-sm(4px)
  {
    variants: {
      size: {
        sm: "h-1",    // 4px — default per v1 spec
        md: "h-1.5",  // 6px
      },
    },
    defaultVariants: {
      size: "sm",
    },
  }
)

const progressFillVariants = cva(
  // base: fill bar — 3px radius matches track; transition on width for determinate
  [
    "h-full rounded-[3px]", // eslint-disable-line no-restricted-syntax -- 3px radius matches track; no token between radius-none(0) and radius-sm(4px)
    "transition-[width] duration-subtle ease-out-standard",
  ].join(" "),
  {
    variants: {
      // `state` maps to semantic fill color only — structural tree is identical
      state: {
        default: [
          // teal gradient: primary-hover (deeper) → primary (brighter)
          "bg-gradient-to-r from-primary-hover to-primary",
          // glow: primary-glow is .10–.14 alpha — imperceptible in light, subtle in dark
          "shadow-[0_0_6px_var(--color-primary-glow)]", // eslint-disable-line no-restricted-syntax -- bespoke glow effect; no shadow token exists for primary-glow spread
        ].join(" "),
        success:  "bg-state-scored",
        warning:  "bg-state-warning",
        error:    "bg-state-errored",
        neutral:  "bg-progress-fill-neutral",
      },
    },
    defaultVariants: {
      state: "default",
    },
  }
)

// ── Types ─────────────────────────────────────────────────────────────────────

type RadixProgressProps = React.ComponentProps<typeof ProgressPrimitive.Root>

export interface ProgressProps
  extends RadixProgressProps,
    VariantProps<typeof progressTrackVariants> {
  /** Semantic fill state. "default" renders the teal gradient (in-progress + complete). "neutral" renders a passive flat fill with no glow or complete bump. */
  state?: "default" | "success" | "warning" | "error" | "neutral"
  /** Pass `true` (or omit `value`) to render the indeterminate sweep animation. */
  indeterminate?: boolean
  /** Left descriptor rendered above the track in a label row. */
  label?: string
  /** Right value rendered above the track (e.g. "47%"). */
  valueLabel?: string
}

// ── Component ─────────────────────────────────────────────────────────────────

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(
  (
    {
      className,
      value,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      max: _max,
      size,
      state = "default",
      indeterminate,
      label,
      valueLabel,
      ...props
    },
    ref
  ) => {
    const max = 100
    const isIndeterminate = indeterminate === true || value == null
    const isComplete = !isIndeterminate && value >= max

    // Width: determinate → percentage; indeterminate → 40% animated bar
    const fillWidth = isIndeterminate
      ? "40%"
      : `${Math.min(100, Math.max(0, (value / max) * 100))}%`

    // Complete state bumps the glow slightly; only applies for "default" state
    const fillClass = cn(
      progressFillVariants({ state }),
      state === "default" && isComplete && "shadow-[0_0_8px_var(--color-primary-glow)]", // eslint-disable-line no-restricted-syntax -- bespoke complete-state glow; no shadow token for primary-glow spread
      // Indeterminate: override transition with continuous sweep animation
      isIndeterminate && [
        "!transition-none",
        // animation: indeterminate-sweep var(--motion-continuous)
        // --motion-continuous = 1800ms ease-linear infinite (semantic/motion.css)
        // @media prefers-reduced-motion: --motion-continuous = none → static bar
        "animate-[indeterminate-sweep_var(--motion-continuous)]",
      ]
    )

    return (
      <div data-slot="progress-wrapper" className="flex w-full flex-col">
        {/* Keyframe for indeterminate sweep — scoped to this component tree.
            translateX preserves border-radius (vs scaleX). Travel -100%→350%
            on a 40%-wide bar gives clean off-screen-left to off-screen-right sweep.
            prefers-reduced-motion: --motion-continuous collapses to none → no animation. */}
        <style>{`@keyframes indeterminate-sweep{0%{transform:translateX(-100%)}100%{transform:translateX(350%)}}`}</style>
        {(label != null || valueLabel != null) && (
          <div
            data-slot="progress-label-row"
            className="mb-1.5 flex justify-between font-mono text-meta"
          >
            <span className="text-muted-foreground">{label}</span>
            <span className="font-semibold text-foreground">{valueLabel}</span>
          </div>
        )}
        <ProgressPrimitive.Root
          ref={ref}
          data-slot="progress"
          data-complete={isComplete || undefined}
          data-indeterminate={isIndeterminate || undefined}
          value={isIndeterminate ? undefined : value}
          max={max}
          className={cn(progressTrackVariants({ size }), className)}
          {...props}
        >
          <ProgressPrimitive.Indicator
            data-slot="progress-indicator"
            data-state={
              isIndeterminate ? "indeterminate" : isComplete ? "complete" : "running"
            }
            className={fillClass}
            style={isIndeterminate ? undefined : { width: fillWidth }}
          />
        </ProgressPrimitive.Root>
      </div>
    )
  }
)

Progress.displayName = "Progress"

export { Progress, progressTrackVariants, progressFillVariants }
