// shadcn-source: https://ui.shadcn.com/docs/components/scroll-area (cli, 2026-05-26)
"use client"

import * as React from "react"
import { ScrollArea as ScrollAreaPrimitive } from "radix-ui"

import { cn } from "@repo/ui/lib/cn"

/**
 * ScrollArea — custom-styled scrollable container.
 *
 * Replaces native browser scrollbars with a thin, auto-hiding Radix scrollbar.
 * Does not set a fixed height — that is the parent container's responsibility.
 *
 * Scrollbar fades in on scroll activity or container hover; fades out after
 * ~1 s of inactivity via Radix's data-state="visible|hidden" attribute, driven
 * by the CSS transition on the scrollbar element.
 *
 * @example
 * <ScrollArea className="h-72">
 *   <LongContent />
 * </ScrollArea>
 */
const ScrollArea = React.forwardRef<
  React.ComponentRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    data-slot="scroll-area"
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport
      data-slot="scroll-area-viewport"
      className={cn(
        "size-full rounded-[inherit] outline-none", // eslint-disable-line no-restricted-syntax -- rounded-[inherit] propagates parent border-radius, not a design token
        // Focus ring — owned by *:focus-visible in base.css (WCAG 2.4.11)
        "transition-(--motion-state-change)"
      )}
    >
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar orientation="vertical" />
    <ScrollBar orientation="horizontal" />
    {/* Corner where vertical + horizontal scrollbars meet — transparent per instrument spec */}
    <ScrollAreaPrimitive.Corner className="bg-transparent" />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = "ScrollArea"

// Scrollbar thumb: muted-foreground/20 light (/15 dark) at rest → /35 light (/30 dark) on hover.
// Per-mode alpha because the ink seed flips between near-black (light) and near-white (dark);
// matching perceptual weight requires asymmetric alphas. Step is ~15pp — perceptible drag affordance.
const ScrollBar = React.forwardRef<
  React.ComponentRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    data-slot="scroll-area-scrollbar"
    orientation={orientation}
    className={cn(
      "flex touch-none select-none",
      "transition-(--motion-state-change)",
      "data-[state=hidden]:opacity-0 data-[state=visible]:opacity-100",
      "rounded-full bg-transparent",
      orientation === "vertical" && "h-full w-(--size-scrollbar) flex-col",
      orientation === "horizontal" && "h-(--size-scrollbar) flex-row",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb
      data-slot="scroll-area-thumb"
      className={cn(
        "relative flex-1 rounded-full",
        "bg-muted-foreground/20 dark:bg-muted-foreground/15",
        "hover:bg-muted-foreground/35 dark:hover:bg-muted-foreground/30"
      )}
    />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = "ScrollBar"

export { ScrollArea, ScrollBar }
