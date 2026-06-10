// shadcn-source: radix-wrap:Collapsible (n/a, 2026-06-02)
import * as React from "react"
import { Collapsible as CollapsiblePrimitive } from "radix-ui"

import { cn } from "@repo/ui/lib/cn"

export interface CollapsibleProps
  extends React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Root> {}

const Collapsible = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Root>,
  CollapsibleProps
>(({ className, ...props }, ref) => (
  <CollapsiblePrimitive.Root
    ref={ref}
    data-slot="collapsible"
    className={cn(className)}
    {...props}
  />
))

Collapsible.displayName = "Collapsible"

// UNSTYLED — callers compose their own trigger element via asChild (e.g. ghost Button + chevron).
export interface CollapsibleTriggerProps
  extends React.ComponentPropsWithoutRef<
    typeof CollapsiblePrimitive.Trigger
  > {}

const CollapsibleTrigger = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Trigger>,
  CollapsibleTriggerProps
>(({ ...props }, ref) => (
  <CollapsiblePrimitive.Trigger ref={ref} data-slot="collapsible-trigger" {...props} />
))

CollapsibleTrigger.displayName = "CollapsibleTrigger"

export interface CollapsibleContentProps
  extends React.ComponentPropsWithoutRef<
    typeof CollapsiblePrimitive.Content
  > {}

const CollapsibleContent = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Content>,
  CollapsibleContentProps
>(({ className, children, ...props }, ref) => (
  <CollapsiblePrimitive.Content
    ref={ref}
    data-slot="collapsible-content"
    // Height animation via grid-template-rows (0fr↔1fr) — GPU-friendly, no JS measurement needed.
    // Enter: duration-base (220ms) ease-out-emphasized; exit: duration-fast (120ms) ease-in-accelerated.
    className={cn(
      "overflow-hidden",
      "grid transition-[grid-template-rows,opacity]",
      "data-[state=open]:grid-rows-[1fr] data-[state=open]:duration-base data-[state=open]:ease-out-emphasized data-[state=open]:opacity-100",
      "data-[state=closed]:grid-rows-[0fr] data-[state=closed]:duration-fast data-[state=closed]:ease-in-accelerated data-[state=closed]:opacity-0",
      className,
    )}
    {...props}
  >
    {/* min-h-0 lets the grid row collapse fully to 0 height */}
    <div className="min-h-0">{children}</div>
  </CollapsiblePrimitive.Content>
))

CollapsibleContent.displayName = "CollapsibleContent"

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
