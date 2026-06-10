// shadcn-source: radix-wrap:Toggle (n/a, 2026-06-02)
"use client"

import * as React from "react"
import { Toggle } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"
import { Star } from "lucide-react"

import { cn } from "@repo/ui/lib/cn"

// ── Variants ──────────────────────────────────────────────────────────────────

// Toggle.Root contains both star icon + count as a single interactive unit.
// Padding zeroed so gap-1 provides the only visual space between icon and count.
const starToggleVariants = cva(
  [
    // Reset + layout
    "inline-flex items-center gap-1",
    "rounded-md",
    "bg-transparent",
    // Ghost hover / active surfaces — matches IconButton ghost
    "hover:bg-hover",
    "active:bg-selected",
    // Disabled
    "disabled:pointer-events-none disabled:opacity-50",
    // Cursor
    "cursor-pointer",
    // No border
    "border-0",
    // Mono for count digit
    "font-mono",
  ],
  {
    variants: {
      size: {
        sm: ["h-7 px-1", "[&_svg]:size-3.5"],
        md: ["h-8 px-1.5", "[&_svg]:size-4"],
      },
    },
    defaultVariants: { size: "sm" },
  }
)

const starCountWrapperVariants = cva(
  "inline-flex items-center",
  {
    variants: {
      size: {
        sm: "h-7",
        md: "h-8",
      },
    },
    defaultVariants: { size: "sm" },
  }
)

const starCountLabelVariants = cva(
  "leading-none select-none",
  {
    variants: {
      size: {
        sm: "text-meta",
        md: "text-label",
      },
    },
    defaultVariants: { size: "sm" },
  }
)

// ── Types ─────────────────────────────────────────────────────────────────────

export interface StarCountProps
  extends VariantProps<typeof starToggleVariants> {
  /** Numeric count displayed next to the star (e.g. total stars). */
  count: number
  /** Whether the star is currently active (controlled). */
  pressed: boolean
  /** Called when the user toggles the star. Receives the next boolean state. */
  onPressedChange: (next: boolean) => void
  /**
   * Accessible name for the entity being starred (e.g. "hud-browser").
   * Becomes aria-label "Star {label}" or "Unstar {label}".
   */
  label: string
  /** Compact (sm, 28px) vs default (md, 32px). Defaults to sm. */
  size?: "sm" | "md"
  /**
   * When true, click events do not propagate to ancestor handlers (e.g. a
   * wrapping Card link). Defaults to true.
   */
  stopPropagation?: boolean
  className?: string
}

// ── Component ─────────────────────────────────────────────────────────────────

const StarCount = React.forwardRef<HTMLButtonElement, StarCountProps>(
  function StarCount(
    {
      count,
      pressed,
      onPressedChange,
      label,
      size = "sm",
      stopPropagation = true,
      className,
    },
    ref
  ) {
    const ariaLabel = pressed ? `Unstar ${label}` : `Star ${label}`

    const handleClick = (e: React.MouseEvent) => {
      if (stopPropagation) e.stopPropagation()
    }

    return (
      <div
        className={cn(starCountWrapperVariants({ size }), className)}
        data-slot="star-count"
      >
        <Toggle.Root
          ref={ref}
          pressed={pressed}
          onPressedChange={onPressedChange}
          onClick={handleClick}
          aria-label={ariaLabel}
          aria-pressed={pressed}
          data-slot="star-count-toggle"
          className={cn(starToggleVariants({ size }))}
        >
          <Star
            aria-hidden="true"
            className={cn(
              pressed
                ? "fill-brand text-brand"
                : "text-meta-foreground"
            )}
          />
          <span
            className={cn(starCountLabelVariants({ size }))}
            aria-hidden="true"
          >
            {count}
          </span>
        </Toggle.Root>
      </div>
    )
  }
)

StarCount.displayName = "StarCount"

export { StarCount, starToggleVariants, starCountWrapperVariants }
