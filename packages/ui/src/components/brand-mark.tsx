// shadcn-source: from-scratch-approved:operator-2026-05-29 (n/a, 2026-05-29)
// BrandMark — canonical notched-viewport mark + gold dot lockup.
// Converged from apps/portal shell identity (commit 7136caa).
// Spec: docs/design/components/brand-mark/instrument-precision-v1.md

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@repo/ui/lib/cn"

// ── Mark (notched SVG) ────────────────────────────────────────────────────────

const markVariants = cva("shrink-0 text-foreground", {
  variants: {
    size: {
      default: "size-5", // 20px — hero/onboarding context
      sm:      "size-4", // 16px — auth-card context
    },
  },
  defaultVariants: { size: "default" },
})

// ── Wordmark ──────────────────────────────────────────────────────────────────

const wordmarkVariants = cva(
  "font-mono font-medium tracking-widest text-muted-foreground select-none",
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

const brandMarkVariants = cva("inline-flex items-center gap-2 select-none", {
  variants: {
    size: {
      default: "",
      sm:      "",
    },
  },
  defaultVariants: { size: "default" },
})

// ── Props ─────────────────────────────────────────────────────────────────────

export interface BrandMarkProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof brandMarkVariants> {
  /** Render the "HUD" wordmark beside the mark. Default: true */
  wordmark?: boolean
}

// ── Component ─────────────────────────────────────────────────────────────────

const BrandMark = React.forwardRef<HTMLSpanElement, BrandMarkProps>(
  ({ className, size = "default", wordmark = true, ...props }, ref) => {
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
        {/* Notched-viewport SVG mark + gold dot */}
        <span aria-hidden="true" className="relative">
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            className={markVariants({ size })}
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 0H0V16H16V4H12V0ZM13 4H3V13H13V4Z"
            />
          </svg>
          {/* Gold dot — only chromatic occurrence in the lockup */}
          <span
            aria-hidden="true"
            className="absolute -top-0.5 -right-0.5 size-1 rounded-full bg-brand"
          />
        </span>

        {/* Wordmark — "HUD" mono */}
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
