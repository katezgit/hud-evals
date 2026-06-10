// shadcn-source: radix-wrap:n/a (n/a, 2026-05-30)
// No shadcn primitive; authored as a pure presentational component per spec.
// Sourcing: from-scratch-approved:design-system-architect-2026-05-30
import * as React from "react"
import type { ComponentType, HTMLAttributes } from "react"
import { AlertCircle } from "lucide-react"

import { cn } from "@repo/ui/lib/cn"

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ErrorStateProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /**
   * Required. Name the failed surface: "Couldn't load runs", "Couldn't load this eval."
   */
  title: string
  /**
   * Optional. What went wrong + reassurance.
   * "Something went wrong loading runs. Your data is intact."
   */
  subtitle?: string
  /**
   * Icon component.
   * undefined (default) → AlertCircle from Lucide.
   * null → suppress icon container entirely (compact contexts).
   * ComponentType → override (rare; prefer AlertCircle).
   */
  icon?: ComponentType<{ className?: string }> | null
  /**
   * Typically <Button variant="outline" onClick={reset}>Try again</Button>.
   * Two actions maximum — pass a Fragment.
   */
  action?: React.ReactNode
  className?: string
}

// ── Component ─────────────────────────────────────────────────────────────────

const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  ({ className, title, subtitle, icon, action, ...props }, ref) => {
    // icon === undefined → show default AlertCircle
    // icon === null      → suppress icon container
    // icon === SomeIcon  → show override
    const IconComponent = icon === undefined ? AlertCircle : icon
    const showIconContainer = IconComponent != null

    return (
      <div
        ref={ref}
        role="alert"
        aria-live="assertive"
        className={cn(
          "flex flex-col items-center justify-center text-center",
          "py-12 px-6 gap-4",
          className
        )}
        {...props}
      >
        {/* Icon container — shown unless icon={null} */}
        {showIconContainer && (
          <div
            className={cn(
              "flex items-center justify-center shrink-0",
              "size-12",
              "rounded-full",
              "bg-state-errored-subtle"
            )}
          >
            <IconComponent
              aria-hidden="true"
              className="size-6 text-state-errored"
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

        {/* Action slot — optional */}
        {action != null && action}
      </div>
    )
  }
)
ErrorState.displayName = "ErrorState"

export { ErrorState }
