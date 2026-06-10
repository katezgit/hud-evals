// shadcn-source: https://ui.shadcn.com/docs/components/tabs (cli, 2026-05-26)
"use client"

import * as React from "react"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@repo/ui/lib/cn"

// ── Context ───────────────────────────────────────────────────────────────────
// TabsList passes its variant down to every TabsTrigger without prop-drilling.

type TabsVariant = "segmented" | "underline"

const TabsVariantContext = React.createContext<TabsVariant>("segmented")

// ── Tabs ──────────────────────────────────────────────────────────────────────

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-6", className)}
      {...props}
    />
  )
}

// ── TabsList ──────────────────────────────────────────────────────────────────

interface TabsListProps extends React.ComponentProps<typeof TabsPrimitive.List> {
  variant?: TabsVariant
}

function TabsList({
  className,
  variant = "segmented",
  ...props
}: TabsListProps) {
  return (
    <TabsVariantContext.Provider value={variant}>
      <TabsPrimitive.List
        data-slot="tabs-list"
        data-variant={variant}
        className={cn(
          variant === "segmented" && [
            "inline-flex w-fit items-center gap-0.5 p-0.5",
            "bg-panel border border-secondary rounded-md",
          ],
          variant === "underline" && [
            "flex w-fit border-b border-border",
          ],
          className
        )}
        {...props}
      />
    </TabsVariantContext.Provider>
  )
}

// ── TabsTrigger ───────────────────────────────────────────────────────────────

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  const variant = React.useContext(TabsVariantContext)

  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        variant === "segmented" && [
          "cursor-pointer",
          "px-3 py-[5px] rounded-[4px] font-mono text-[11px] whitespace-nowrap", // eslint-disable-line no-restricted-syntax -- py-[5px]/rounded-[4px]/text-[11px]: no tokens for 5px padding, 4px radius, or 11px text on this component
          "text-muted-foreground",
          "hover:bg-hover hover:text-foreground",
          "data-[state=active]:bg-primary",
          "data-[state=active]:text-primary-foreground",
          "data-[state=active]:hover:bg-primary-hover",
          "disabled:text-text-disabled disabled:bg-transparent disabled:cursor-not-allowed",
          "transition-colors duration-instant",
          "gap-1.5 [&_svg]:size-3",
        ],
        variant === "underline" && [
          "cursor-pointer",
          "px-1.5 py-2 text-body font-medium whitespace-nowrap",
          // Offset the 2px bottom border so it overlaps the list's border-b (no gap).
          "-mb-px border-b-2 border-transparent",
          "transition-colors duration-fast",
          // Inactive: muted text
          "text-meta-foreground",
          // Hover inactive: foreground text + subtle border indicator
          "hover:text-foreground hover:border-border",
          // Active: foreground + accent bottom border (no font-bold — avoids layout jitter)
          "data-[state=active]:text-foreground data-[state=active]:border-primary",
          // Disabled
          "disabled:text-text-disabled disabled:cursor-not-allowed disabled:pointer-events-none",
        ],
        className
      )}
      {...props}
    />
  )
}

// ── TabsContent ───────────────────────────────────────────────────────────────

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("bg-transparent flex-1", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
