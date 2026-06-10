// shadcn-source: radix-wrap:n/a (n/a, 2026-05-30)
// No shadcn primitive; authored as a pure presentational component per spec.
// Sourcing: from-scratch-approved:design-system-architect-2026-05-30
import * as React from "react"
import type { ComponentType, HTMLAttributes } from "react"

import { cn } from "@repo/ui/lib/cn"

// ── Types ─────────────────────────────────────────────────────────────────────

export type EmptyStateVariant = "zero-state" | "no-results"
export type EmptyStateSize = "md" | "sm"

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  variant: EmptyStateVariant
  /**
   * Lucide icon component.
   * Required for zero-state + size="md". Suppressed for no-results or size="sm".
   * Dev-mode warning logged if variant="zero-state" + size="md" + no icon.
   */
  icon?: ComponentType<{ className?: string }>
  title: string
  subtitle?: string
  /** Button element; caller controls label + onClick. One max. */
  cta?: React.ReactNode
  /** @default "md" */
  size?: EmptyStateSize
  className?: string
}

// ── Component ─────────────────────────────────────────────────────────────────

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, variant, icon: Icon, title, subtitle, cta, size = "md", ...props }, ref) => {
    if (
      // eslint-disable-next-line turbo/no-undeclared-env-vars -- NODE_ENV is Next.js/Node.js-provided, not a repo env var
      process.env.NODE_ENV === "development" &&
      variant === "zero-state" &&
      size === "md" &&
      Icon == null
    ) {
      console.warn(
        "[EmptyState] zero-state/md rendered without icon prop — icon container suppressed."
      )
    }

    // Icon container shows only for zero-state + md + icon provided
    const showIconContainer = variant === "zero-state" && size === "md" && Icon != null

    return (
      <div
        ref={ref}
        role="status"
        className={cn(
          "flex flex-col items-center justify-center text-center",
          size === "md" ? "py-12 px-6 gap-4" : "py-6 px-4 gap-3",
          className
        )}
        {...props}
      >
        {/* Icon container — zero-state + md only */}
        {showIconContainer && (
          <div
            className={cn(
              "flex items-center justify-center shrink-0",
              "size-12",
              "rounded-lg",
              "bg-muted"
            )}
          >
            <Icon
              aria-hidden="true"
              className="size-6 text-muted-foreground"
            />
          </div>
        )}

        {/* Text block */}
        <div className="flex flex-col items-center gap-1">
          <p className="text-body font-medium text-foreground">
            {title}
          </p>
          {subtitle != null && (
            <p className="text-caption text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>

        {/* CTA slot — optional */}
        {cta != null && cta}
      </div>
    )
  }
)
EmptyState.displayName = "EmptyState"

export { EmptyState }
