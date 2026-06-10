// shadcn-source: https://ui.shadcn.com/docs/components/tooltip (cli, 2026-05-26)
import * as React from "react"
import { Tooltip as TooltipPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@repo/ui/lib/cn"

// ── Variants ────────────────────────────────────────────────────────────────

const tooltipContentVariants = cva(
  [
    // Layout
    "z-overlay w-fit",
    // Surface — inverse dark fill per spec
    "rounded-sm bg-foreground shadow-popover",
    // Typography — 12px label size + inverse surface color.
    // text-[length:var(--text-label)] avoids tailwind-merge treating font-size
    // as a color conflict with text-background (both text-* prefix).
    "text-[length:var(--text-label)] font-medium tracking-[0.02em] text-background", // eslint-disable-line no-restricted-syntax -- [length:var(--x)] is the permitted rank-3 font-size pattern; avoids twMerge text-color conflict
    // Compact label padding: px-2 py-1.5 (8px × 6px) — 6px min vertical to read as a container
    "px-2 py-1.5",
    // Text wraps at max-width; no truncation inside the tooltip
    "text-balance break-words",
    // Enter: fade + directional slide (220ms ease-out-emphasized)
    "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:duration-base data-[state=open]:ease-out-emphasized",
    // Enter translate per side (4px offset toward trigger)
    "data-[side=top]:data-[state=open]:slide-in-from-bottom-1",
    "data-[side=bottom]:data-[state=open]:slide-in-from-top-1",
    "data-[side=left]:data-[state=open]:slide-in-from-right-1",
    "data-[side=right]:data-[state=open]:slide-in-from-left-1",
    // Exit: fade-out only — no translate (120ms ease-in-accelerated)
    "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-fast data-[state=closed]:ease-in-accelerated",
  ],
  {
    variants: {
      variant: {
        /** Clarification label for icons, badges — 200px max */
        default: "max-w-[200px]",
        /** Truncation reveal for overflowed cell text — 320px max */
        truncation: "max-w-[320px]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

// ── Provider ────────────────────────────────────────────────────────────────

function TooltipProvider({
  // 400ms delay per spec — deliberate hover, not accidental
  delayDuration = 400,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

// ── Root ────────────────────────────────────────────────────────────────────

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

// ── Trigger ─────────────────────────────────────────────────────────────────

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

// ── Content ──────────────────────────────────────────────────────────────────

interface TooltipContentProps
  extends React.ComponentProps<typeof TooltipPrimitive.Content>,
    VariantProps<typeof tooltipContentVariants> {}

function TooltipContent({
  className,
  // 8px gap from trigger to panel — 6px read tight once caret eats part of the clearance
  sideOffset = 8,
  variant = "default",
  ...props
}: TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(tooltipContentVariants({ variant }), className)}
        {...props}
      >
        {props.children}
        {/* Arrow: 6×3px, fill matches panel (foreground) — 4px height dominated the bottom edge at equal vertical padding */}
        <TooltipPrimitive.Arrow
          data-slot="tooltip-arrow"
          width={6}
          height={3}
          className="fill-foreground"
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
export type { TooltipContentProps }
export { tooltipContentVariants }
