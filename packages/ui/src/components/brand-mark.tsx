// shadcn-source: from-scratch-approved:operator-2026-05-29 (n/a, 2026-05-29)
// BrandMark — Instrument Precision v1.
// Composite: brand gold square mark ("H") + "HUD" mono wordmark.
// Spec: docs/design/components/brand-mark/instrument-precision-v1.md

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@repo/ui/lib/cn"

// ── Mark (gold square) ──────────────────────────────────────────────────────

const markVariants = cva(
  "inline-flex items-center justify-center select-none shrink-0",
  {
    variants: {
      size: {
        default: "size-[26px] rounded-[7px] text-[14px]", // eslint-disable-line no-restricted-syntax -- bespoke brand mark dimensions: 26px size, 7px radius, 14px text; no tokens for these values
        sm:      "size-5 rounded-[5px] text-[11px]", // eslint-disable-line no-restricted-syntax -- bespoke brand mark sm: 5px radius, 11px text; no tokens for these values
      },
    },
    defaultVariants: { size: "default" },
  }
)

// ── Wordmark ──────────────────────────────────────────────────────────────────

const wordmarkVariants = cva(
  "font-mono font-semibold tracking-[.06em] text-foreground select-none",
  {
    variants: {
      size: {
        default: "text-[14px]", // eslint-disable-line no-restricted-syntax -- brand wordmark 14px; text-body also 14px but carries line-height that breaks the mark layout
        sm:      "text-[12px]", // eslint-disable-line no-restricted-syntax -- brand wordmark sm 12px; text-code/caption also 12px but carry line-height that breaks the mark layout
      },
    },
    defaultVariants: { size: "default" },
  }
)

// ── Composite wrapper ─────────────────────────────────────────────────────────

const brandMarkVariants = cva(
  "inline-flex items-center gap-2 select-none",
  {
    variants: {
      size: {
        default: "",
        sm:      "",
      },
    },
    defaultVariants: { size: "default" },
  }
)

// ── Props ─────────────────────────────────────────────────────────────────────

export interface BrandMarkProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof brandMarkVariants> {
  /** Render the gradient (brand → brand-hover). false → solid bg-brand only. Default: true */
  gradient?: boolean
  /** Render the outer glow halo. The inset highlight is always present. Default: true */
  glow?: boolean
  /** Render the "HUD" wordmark beside the mark. Default: true */
  wordmark?: boolean
}

// ── Component ─────────────────────────────────────────────────────────────────

const BrandMark = React.forwardRef<HTMLSpanElement, BrandMarkProps>(
  (
    {
      className,
      size = "default",
      gradient = true,
      glow = true,
      wordmark = true,
      ...props
    },
    ref
  ) => {
    // Box shadow: outer glow (optional) + inset highlight (always)
    const markShadow = glow
      ? "0 0 12px var(--color-brand-glow), inset 0 1px 0 rgba(255,255,255,.25)"
      : "inset 0 1px 0 rgba(255,255,255,.25)"

    // Background: gradient or solid brand
    const markBg = gradient
      ? "bg-gradient-to-br from-brand to-brand-hover"
      : "bg-brand"

    return (
      <span
        ref={ref}
        data-slot="brand-mark"
        data-size={size ?? "default"}
        aria-label="HUD"
        role="img"
        className={cn(brandMarkVariants({ size }), className)}
        {...props}
      >
        {/* Mark — gold square with "H" */}
        <span
          aria-hidden="true"
          className={cn(markVariants({ size }), markBg, "font-mono font-bold text-brand-foreground")}
          style={{ boxShadow: markShadow }}
        >
          H
        </span>

        {/* Wordmark — uppercase "HUD" */}
        {wordmark && (
          <span aria-hidden="true" className={wordmarkVariants({ size })}>
            HUD
          </span>
        )}
      </span>
    )
  }
)
BrandMark.displayName = "BrandMark"

// BrandMarkSquare — mark only (convenience; equivalent to wordmark={false})
const BrandMarkSquare = React.forwardRef<
  HTMLSpanElement,
  Omit<BrandMarkProps, "wordmark">
>((props, ref) => <BrandMark ref={ref} wordmark={false} {...props} />)
BrandMarkSquare.displayName = "BrandMarkSquare"

export { BrandMark, BrandMarkSquare, brandMarkVariants }
