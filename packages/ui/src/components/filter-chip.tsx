// shadcn-source: radix-wrap:n/a (n/a, 2026-06-12)
// Composition: raw <button> instead of composing Button.
// Button applies [&_svg]:size-4 globally which would override the spec's size-3.5 leading icon.
// We replicate Button's base + secondary variant classes directly.
//
// Accessible name: computed from visible content (label span + optional count span).
// A visually-hidden ", " separator is inserted before the count for screen-reader prosody.
// This is the canonical AccName pattern — single source of truth, satisfies WCAG 2.5.3.

import * as React from "react"
import { Check } from "lucide-react"
import { cva } from "class-variance-authority"

import { cn } from "@repo/ui/lib/cn"

const filterChipVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center",
    "cursor-pointer",
    "whitespace-nowrap",
    "font-sans",
    "transition-colors duration-150",
    "disabled:cursor-not-allowed disabled:text-text-disabled",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
    "h-8 px-3 py-0 text-body font-medium rounded-lg gap-1.5",
    "border border-border bg-transparent text-foreground",
    "hover:bg-secondary-surface",
    "active:bg-primary-soft",
    "disabled:bg-transparent",
  ],
  {
    variants: {
      selected: {
        true: "bg-primary-soft hover:bg-primary-soft active:bg-primary-soft",
        false: "",
      },
    },
    defaultVariants: {
      selected: false,
    },
  },
)

export interface FilterChipProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "children"> {
  label: string
  selected: boolean
  onSelectedChange: (next: boolean) => void
  count?: number
  disabled?: boolean
  className?: string
}

const FilterChip = React.forwardRef<HTMLButtonElement, FilterChipProps>(
  (
    { label, selected, onSelectedChange, count, disabled, className, onClick, ...props },
    ref,
  ) => {
    const hasCount = typeof count === "number"

    function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
      onClick?.(e)
      if (!e.defaultPrevented) {
        onSelectedChange(!selected)
      }
    }

    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={selected}
        disabled={disabled}
        className={cn(filterChipVariants({ selected }), className)}
        onClick={handleClick}
        {...props}
      >
        {selected && (
          <Check className="size-3.5 text-foreground" aria-hidden="true" />
        )}
        <span>{label}</span>
        {hasCount && (
          <>
            <span className="sr-only">, </span>
            <span
              className={cn(
                "font-mono text-meta tabular-nums",
                selected ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {count}
            </span>
          </>
        )}
      </button>
    )
  },
)
FilterChip.displayName = "FilterChip"

export { FilterChip, filterChipVariants }
