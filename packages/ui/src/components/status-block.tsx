// shadcn-source: radix-wrap:n/a (n/a, 2026-06-02)
// StatusBlock — tinted container primitive.
// No Radix primitive maps to a passive tinted card; this is a styled div
// with cva tone variants. No interaction, no ARIA role beyond the default div.
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@repo/ui/lib/cn"

// ── Variants ──────────────────────────────────────────────────────────────────
//
// Text-inheritance design choice: `tone="destructive"` applies `text-destructive`
// directly on the container div. Tailwind v4 generates a utility from the
// `--color-destructive` @theme token, so children inherit without needing to
// repeat the color class. This is idiomatic: the container owns the semantic
// context, children override only when they need a different treatment
// (e.g. a muted sub-label within a destructive block can still set
// `text-muted-foreground` and it wins via specificity).

const statusBlockVariants = cva(
  // base: card-like surface with top-border accent, rounded corners, padding
  "rounded-md border-t px-1 pt-2 pb-1",
  {
    variants: {
      tone: {
        /**
         * Neutral — standard card surface, hairline top border.
         * Children manage their own text colors.
         */
        default:
          "border-border bg-card",

        /**
         * Destructive — red-tinted surface + red top border.
         * Container sets `text-destructive` so children inherit by default;
         * individual children may override with any text color class.
         */
        destructive:
          "border-destructive/30 bg-destructive/5 text-destructive",
      },
    },
    defaultVariants: {
      tone: "default",
    },
  },
)

// ── Types ─────────────────────────────────────────────────────────────────────

export interface StatusBlockProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof statusBlockVariants> {}

// ── Component ─────────────────────────────────────────────────────────────────

const StatusBlock = React.forwardRef<HTMLDivElement, StatusBlockProps>(
  ({ className, tone, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="status-block"
      data-tone={tone ?? "default"}
      className={cn(statusBlockVariants({ tone }), className)}
      {...props}
    />
  ),
)

StatusBlock.displayName = "StatusBlock"

export { StatusBlock, statusBlockVariants }
