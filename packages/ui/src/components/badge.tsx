// shadcn-source: https://ui.shadcn.com/docs/components/badge (cli, 2026-05-26)
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@repo/ui/lib/cn"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1 overflow-hidden rounded-badge border px-2 py-0.5 text-label font-medium font-mono whitespace-nowrap",
  {
    variants: {
      variant: {
        success:
          "border-state-scored-subtle bg-state-scored-subtle text-state-scored-text",
        running:
          "border-state-running-subtle bg-state-running-subtle text-state-running-text",
        info:
          "border-state-running bg-transparent text-state-running-text",
        beta:
          "border-state-running bg-transparent text-state-running-text",
        warning:
          "border-state-warning bg-state-warning-subtle text-state-warning-text",
        destructive:
          "border-state-errored-subtle bg-state-errored-subtle text-state-errored-text",
        neutral:
          "border-border bg-muted text-muted-foreground",
        "brand-soft":
          "border-primary-border bg-primary-soft text-primary",
      },
      size: {
        default: "px-2 py-0.5",
        sm: "px-1 py-px",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "default",
    },
  }
)

const dotVariants = cva("size-1.5 shrink-0 rounded-full", {
  variants: {
    variant: {
      success: "bg-state-scored",
      running: "animate-running-pulse bg-state-running",
      info: "hidden",
      beta: "hidden",
      warning: "bg-state-warning",
      destructive: "bg-state-errored",
      neutral: "hidden",
      "brand-soft": "hidden",
    },
  },
  defaultVariants: {
    variant: "neutral",
  },
})

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Show the status dot (only renders for success/running/warning/destructive variants) */
  showDot?: boolean
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "neutral", size = "default", showDot = false, children, ...props }, ref) => {
    const hasDot = showDot && variant !== "info" && variant !== "beta" && variant !== "neutral" && variant !== "brand-soft"

    return (
      <span
        ref={ref}
        data-slot="badge"
        data-variant={variant}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      >
        {hasDot && (
          <span
            aria-hidden="true"
            className={cn(dotVariants({ variant }))}
          />
        )}
        {children}
      </span>
    )
  }
)

Badge.displayName = "Badge"

export { Badge, badgeVariants }
