// shadcn-source: radix-wrap:Tooltip (n/a, 2026-06-04)
"use client"

import * as React from "react"
import { Globe, Lock } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@repo/ui/lib/cn"
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip"

const visibilityIconVariants = cva("", {
  variants: {
    size: {
      sm: "size-3.5",
      md: "size-4",
    },
  },
  defaultVariants: { size: "sm" },
})

export interface VisibilityIconProps
  extends VariantProps<typeof visibilityIconVariants> {
  /** "public" renders a Globe icon; "private" renders a Lock icon. */
  visibility: "public" | "private"
  /** Compact (sm, 14px) vs default (md, 16px). Defaults to sm. */
  size?: "sm" | "md"
  /** Forwarded to the trigger span for caller spacing adjustments. */
  className?: string
}

/**
 * Displays a labeled visibility icon (Globe = public, Lock = private) with a
 * tooltip. The aria-label conveys state; the tooltip conveys meaning — the two
 * strings are intentionally different to avoid double-announcement on SR focus.
 *
 * Requires an ancestor `<TooltipProvider>` (provided by the design-system root
 * in `apps/portal`).
 */
const VisibilityIcon = React.forwardRef<HTMLSpanElement, VisibilityIconProps>(
  function VisibilityIcon({ visibility, size = "sm", className }, ref) {
    // Short state label — announced as "Public, image" / "Private, image" by SR.
    const ariaLabel = visibility === "public" ? "Public" : "Private"
    // Human-readable explanation — sighted tooltip + SR aria-describedby (via Tooltip).
    const tooltipText =
      visibility === "public"
        ? "Visible to anyone"
        : "Visible only to your organization"
    const Icon = visibility === "public" ? Globe : Lock

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {/* span + role="img": informational graphic, not an action — no button semantics */}
          <span
            ref={ref}
            role="img"
            aria-label={ariaLabel}
            tabIndex={0}
            className={cn(
              "inline-flex shrink-0 items-center rounded-sm text-muted-foreground",
              className
            )}
          >
            <Icon
              aria-hidden="true"
              className={visibilityIconVariants({ size })}
            />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top">{tooltipText}</TooltipContent>
      </Tooltip>
    )
  }
)

VisibilityIcon.displayName = "VisibilityIcon"

export { VisibilityIcon, visibilityIconVariants }
