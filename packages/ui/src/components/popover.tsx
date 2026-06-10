// shadcn-source: https://ui.shadcn.com/docs/components/popover (cli, 2026-05-26)
"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@repo/ui/lib/cn"


const popoverContentVariants = cva(
  [
    "z-overlay min-w-40 max-w-80 overflow-hidden",
    "rounded-lg border border-border",
    "bg-popover text-popover-foreground",
    "shadow-popover",
    "outline-none",
    "data-[state=open]:animate-in data-[state=open]:fade-in-0",
    "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
    // Side-specific enter translate (matches spec table: 4px toward trigger)
    "data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1",
    "data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1",
    // Side-specific exit translate (2px away — half of enter)
    "data-[state=closed]:data-[side=bottom]:slide-out-to-top-0.5",
    "data-[state=closed]:data-[side=top]:slide-out-to-bottom-0.5",
    "data-[state=closed]:data-[side=left]:slide-out-to-right-0.5",
    "data-[state=closed]:data-[side=right]:slide-out-to-left-0.5",
  ],
  {
    variants: {
      variant: {
        /** Static label+value rows, cost breakdown — 12px padding */
        informational: "p-3",
        /** Checkboxes, date range, multi-select — 16px padding */
        filter: "p-4",
        /** Clickable item rows — 4px panel padding; items carry their own padding */
        action: "p-1",
      },
    },
    defaultVariants: {
      variant: "informational",
    },
  }
)


function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({
  className,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return (
    <PopoverPrimitive.Trigger
      data-slot="popover-trigger"
      className={cn("data-[state=open]:shadow-focus-ring", className)}
      {...props}
    />
  )
}

function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
}


interface PopoverContentProps
  extends React.ComponentProps<typeof PopoverPrimitive.Content>,
    VariantProps<typeof popoverContentVariants> {}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 8,
  variant = "informational",
  ...props
}: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(popoverContentVariants({ variant }), className)}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
}


function PopoverArrow({
  className,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Arrow>) {
  return (
    <PopoverPrimitive.Arrow
      data-slot="popover-arrow"
      // width=8px, height=4px per spec. Arrow fill matches --popover-bg (bg-popover).
      width={8}
      height={4}
      className={cn("fill-popover", className)}
      {...props}
    />
  )
}


function PopoverLabel({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="popover-label"
      className={cn(
        "text-label font-medium text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function PopoverValue({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="popover-value"
      className={cn("text-body font-normal text-foreground", className)}
      {...props}
    />
  )
}


function PopoverItem({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      data-slot="popover-item"
      className={cn(
        "flex w-full cursor-pointer items-center rounded-md px-2 py-1",
        "text-body font-normal text-foreground",
        "bg-transparent hover:bg-border",
        "transition-colors",
        "disabled:pointer-events-none disabled:opacity-mid",
        className
      )}
      {...props}
    />
  )
}


function PopoverSeparator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover-separator"
      role="separator"
      className={cn("my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
  PopoverArrow,
  PopoverLabel,
  PopoverValue,
  PopoverItem,
  PopoverSeparator,
  popoverContentVariants,
}
