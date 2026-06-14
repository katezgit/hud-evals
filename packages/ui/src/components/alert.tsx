// shadcn-source: https://ui.shadcn.com/docs/components/alert (cli, 2026-05-26)
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@repo/ui/lib/cn"

// ── Variant context ────────────────────────────────────────────────────────────
// Passes the chosen variant down to AlertTitle so it can apply the matching
// foreground token without consumers having to repeat the prop.

type AlertVariant = "default" | "destructive" | "warning" | "success" | "info"

const AlertVariantContext = React.createContext<AlertVariant>("default")

// ── Root cva ──────────────────────────────────────────────────────────────────

const alertVariants = cva(
  "relative grid w-full grid-cols-[0_1fr] items-start gap-y-1 rounded-lg border px-4 py-3 text-body has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5",
  {
    variants: {
      variant: {
        /**
         * Neutral — no semantic tint. Uses page-card surface and standard border.
         */
        default:
          "bg-muted-surface border-border text-foreground [&>svg]:text-muted-foreground", // explicit — no base fallback

        /**
         * Error / danger. Tinted red surface + red title + red icon.
         * Lower-intensity bg (7%/8% alpha) vs state-errored-subtle (10–12%) — see spec.
         */
        destructive:
          "bg-alert-destructive-bg border-state-errored text-foreground [&>svg]:text-state-errored",

        /**
         * Amber warning. Tinted amber surface + amber title + amber icon.
         * Lower-intensity bg (7%/8% alpha) vs state-warning-subtle (12%) — see spec.
         */
        warning:
          "bg-alert-warning-bg border-state-warning text-foreground [&>svg]:text-state-warning",

        /**
         * Positive / success. Tinted green surface + green title + green icon.
         * Lower-intensity bg (7%/8% alpha) vs state-scored-subtle (11–12%) — see spec.
         */
        success:
          "bg-alert-success-bg border-state-scored text-foreground [&>svg]:text-state-scored",

        /**
         * Informational. Tinted blue surface + blue title + blue icon.
         * Maps to the running/blue token family (no dedicated info set exists).
         * Lower-intensity bg (7%/8% alpha) vs state-running-subtle (12%) — see spec.
         */
        info:
          "bg-alert-info-bg border-state-running text-foreground [&>svg]:text-state-running",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

// ── Title cva — variant-aware foreground ─────────────────────────────────────

const alertTitleVariants = cva(
  "col-start-2 line-clamp-1 min-h-4 font-semibold tracking-tight",
  {
    variants: {
      variant: {
        default:     "text-foreground",
        destructive: "text-state-errored-text",
        warning:     "text-state-warning-text",
        success:     "text-state-scored-text",
        info:        "text-state-running-text",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

// ── Components ────────────────────────────────────────────────────────────────

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  const resolvedVariant: AlertVariant = (variant ?? "default") as AlertVariant
  return (
    <AlertVariantContext.Provider value={resolvedVariant}>
      <div
        data-slot="alert"
        data-variant={resolvedVariant}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      />
    </AlertVariantContext.Provider>
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  const variant = React.useContext(AlertVariantContext)
  return (
    <div
      data-slot="alert-title"
      className={cn(alertTitleVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "col-start-2 grid justify-items-start gap-1 text-body text-muted-foreground [&_p]:leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }
