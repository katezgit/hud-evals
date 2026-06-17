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

// ── Sliding indicator hook ────────────────────────────────────────────────────
// Measures the active trigger's offsetLeft + offsetWidth and stores them so the
// indicator element can be positioned via inline styles. Runs in useLayoutEffect
// (before paint) to avoid a flicker on initial mount. A MutationObserver watches
// data-state attribute changes so re-measurement fires whenever the active tab
// changes, independent of controlled vs uncontrolled mode.

interface IndicatorGeometry {
  x: number
  width: number
  ready: boolean
}

function useSlideIndicator(
  listRef: React.RefObject<HTMLElement | null>
): IndicatorGeometry {
  const [geo, setGeo] = React.useState<IndicatorGeometry>({
    x: 0,
    width: 0,
    ready: false,
  })

  const measure = React.useCallback(() => {
    const list = listRef.current
    if (!list) return
    const active = list.querySelector<HTMLElement>("[data-state='active']")
    if (!active) return
    setGeo({ x: active.offsetLeft, width: active.offsetWidth, ready: true })
  }, [listRef])

  // Initial measurement — before paint to avoid slide-from-zero on appear.
  // Also:
  //   1. ResizeObserver on the active trigger — retriggers whenever the trigger
  //      reflows (web font swap, content change, container resize). This is the
  //      primary fix for the font-load race where useLayoutEffect fires with
  //      fallback-font metrics before the web font is ready.
  //   2. document.fonts.ready — belt-and-suspenders for environments where
  //      ResizeObserver fires before the font metrics settle.
  React.useLayoutEffect(() => {
    measure()

    const list = listRef.current
    if (!list) return

    // ResizeObserver: remeasure when the active trigger changes size.
    if (typeof ResizeObserver !== "undefined") {
      const activeTrigger = list.querySelector<HTMLElement>("[data-state='active']")
      if (activeTrigger) {
        const ro = new ResizeObserver(() => measure())
        ro.observe(activeTrigger)
        // font-ready remeasure (belt-and-suspenders)
        if (typeof document !== "undefined" && document.fonts?.ready) {
          document.fonts.ready.then(() => measure())
        }
        return () => ro.disconnect()
      }
    }

    // Fallback: font-ready only (no ResizeObserver available)
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(() => measure())
    }
  }, [measure, listRef])

  // Re-measure on active-trigger changes (attribute mutation on any child).
  React.useEffect(() => {
    const list = listRef.current
    if (!list) return
    const observer = new MutationObserver(() => {
      // React.startTransition keeps this update non-blocking and within React's
      // scheduler boundary, preventing act() warnings in test environments
      // where jsdom fires MutationObserver callbacks synchronously.
      React.startTransition(() => {
        measure()
      })
    })
    observer.observe(list, {
      attributes: true,
      attributeFilter: ["data-state"],
      subtree: true,
    })
    return () => observer.disconnect()
  }, [listRef, measure])

  return geo
}

// ── TabsList ──────────────────────────────────────────────────────────────────

interface TabsListProps extends React.ComponentProps<typeof TabsPrimitive.List> {
  variant?: TabsVariant
}

function TabsList({
  className,
  variant = "segmented",
  children,
  ...props
}: TabsListProps) {
  const listRef = React.useRef<HTMLDivElement>(null)
  const geo = useSlideIndicator(variant === "segmented" ? listRef : { current: null })

  // Sliding indicator — aria-hidden span positioned behind triggers.
  // transition uses CSS var() directly (not Tailwind utility) because it lives in
  // an inline style. --motion-state-change = var(--duration-fast) var(--ease-out-standard).
  const indicatorStyle: React.CSSProperties = geo.ready
    ? {
        transform: `translateX(${geo.x}px)`,
        width: `${geo.width}px`,
        transition: `transform var(--motion-state-change), width var(--motion-state-change)`,
      }
    : { opacity: 0 }

  return (
    <TabsVariantContext.Provider value={variant}>
      <TabsPrimitive.List
        ref={listRef}
        data-slot="tabs-list"
        data-variant={variant}
        className={cn(
          "relative",
          variant === "segmented" && [
            "inline-flex w-fit items-center gap-0.5 p-0.5",
            "bg-panel border border-secondary rounded-md",
          ],
          variant === "underline" && [
            "flex w-fit",
          ],
          className
        )}
        {...props}
      >
        {/* Sliding indicator — rendered first so it sits behind triggers (z-10) */}
        {variant === "segmented" && (
          <span
            aria-hidden
            data-slot="tabs-indicator"
            className="absolute top-0.5 bottom-0.5 rounded-[4px] bg-primary pointer-events-none" // eslint-disable-line no-restricted-syntax -- rounded-[4px]: no token for 4px radius on this component
            style={indicatorStyle}
          />
        )}

        {children}
      </TabsPrimitive.List>
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
          "relative z-10 cursor-pointer",
          "px-3 py-[5px] rounded-[4px] font-mono text-[11px] whitespace-nowrap", // eslint-disable-line no-restricted-syntax -- py-[5px]/rounded-[4px]/text-[11px]: no tokens for 5px padding, 4px radius, or 11px text on this component
          "text-muted-foreground",
          "hover:text-foreground",
          // Active: text flips to primary-foreground; indicator slide owns the background.
          "data-[state=active]:text-primary-foreground",
          "disabled:text-text-disabled disabled:bg-transparent disabled:cursor-not-allowed",
          // Text color fades on --motion-state-change simultaneously with indicator slide.
          "transition-colors prop-(--motion-state-change)",
          "gap-1.5 [&_svg]:size-3",
        ],
        variant === "underline" && [
          "relative z-10 cursor-pointer",
          "px-1.5 py-2 text-body font-medium whitespace-nowrap",
          // CSS-only — no measurement, no JS indicator span for this variant.
          "border-b-2 border-transparent",
          "data-[state=inactive]:hover:border-border-strong",
          "data-[state=active]:border-primary",
          "transition-colors prop-(--motion-state-change)",
          // Inactive: muted text
          "text-meta-foreground",
          // Hover inactive: foreground text
          "hover:text-foreground",
          // Active: foreground text
          "data-[state=active]:text-foreground",
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
