// shadcn-source: radix-wrap:ToggleGroup (n/a, 2026-05-31)
"use client"

import * as React from "react"
import { ToggleGroup } from "radix-ui"
import { cva } from "class-variance-authority"

import { cn } from "@repo/ui/lib/cn"

// ── Ref composition ───────────────────────────────────────────────────────────
// Composes two refs (forwarded + local) onto the same DOM node.

function composeRefs<T>(
  ...refs: Array<React.Ref<T> | undefined>
): React.RefCallback<T> {
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue
      if (typeof ref === "function") {
        ref(node)
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(ref as any).current = node
      }
    }
  }
}

// ── Sliding indicator hook ────────────────────────────────────────────────────
// Measures the active item's offsetLeft + offsetWidth. Runs in useLayoutEffect
// (before paint) to avoid flicker on initial mount. MutationObserver re-fires
// when any child's data-state attribute changes.

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
    const active = list.querySelector<HTMLElement>("[data-state='on']")
    if (!active) return
    setGeo({ x: active.offsetLeft, width: active.offsetWidth, ready: true })
  }, [listRef])

  React.useLayoutEffect(() => {
    measure()
  }, [measure])

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

export const segmentedControlRootVariants = cva(
  [
    "inline-flex items-center justify-center",
    "h-8 rounded-md border border-border p-0.5",
    "bg-background text-muted-foreground",
  ],
  {
    variants: {
      disabled: {
        true:  "opacity-50 pointer-events-none",
        false: "",
      },
    },
    defaultVariants: {
      disabled: false,
    },
  }
)

export const segmentedControlItemVariants = cva([
  "relative z-10 inline-flex h-full items-center justify-center gap-1.5",
  "rounded-sm px-3",
  "text-body font-medium select-none",
  "text-foreground/60",
  "hover:text-foreground",
  // Active text color — thumb (indicator) now owns the background.
  "data-[state=on]:text-foreground",
  "data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:pointer-events-none",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
  // Text color fades simultaneously with the thumb slide.
  "transition-colors prop-(--motion-state-change)",
])

export interface SegmentedControlProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof ToggleGroup.Root>,
    "type" | "value" | "onValueChange" | "defaultValue"
  > {
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
  className?: string
  children?: React.ReactNode
}

export interface SegmentedControlOption
  extends Omit<
    React.ComponentPropsWithoutRef<typeof ToggleGroup.Item>,
    "value"
  > {
  value: string
  disabled?: boolean
  className?: string
  children?: React.ReactNode
}

interface SegmentedControlContextValue {
  currentValue: string
}

const SegmentedControlContext =
  React.createContext<SegmentedControlContextValue>({
    currentValue: "",
  })

const SegmentedControlRoot = React.forwardRef<
  React.ElementRef<typeof ToggleGroup.Root>,
  SegmentedControlProps
>(function SegmentedControlRoot(
  {
    value,
    onValueChange,
    disabled = false,
    className,
    children,
    ...props
  },
  ref
) {
  const warnedRef = React.useRef(false)
  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production" && !warnedRef.current) { // eslint-disable-line turbo/no-undeclared-env-vars -- NODE_ENV is Next.js/Node.js-provided, not a repo env var
      const label = props["aria-label"]
      const labelledBy = props["aria-labelledby"]
      if (!label && !labelledBy) {
        warnedRef.current = true
        console.warn(
          "[SegmentedControl] Root requires an aria-label or aria-labelledby for screen-reader users. Example: <SegmentedControl aria-label=\"Theme\">."
        )
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Deselect guard: Radix fires onValueChange("") when the active segment is
  // clicked again. Intercept and discard — selection is always required.
  const handleValueChange = (v: string) => {
    if (v) onValueChange(v)
  }

  // Local ref for indicator measurement; composed with the forwarded ref so
  // consumers can still get a handle on the root element.
  const listRef = React.useRef<HTMLElement | null>(null)
  const geo = useSlideIndicator(listRef)

  // Sliding thumb indicator style (inline CSS — uses var() directly).
  // --motion-state-change = var(--duration-fast) var(--ease-out-standard).
  const thumbStyle: React.CSSProperties = geo.ready
    ? {
        transform: `translateX(${geo.x}px)`,
        width: `${geo.width}px`,
        transition: `transform var(--motion-state-change), width var(--motion-state-change)`,
      }
    : { opacity: 0 }

  return (
    <SegmentedControlContext.Provider value={{ currentValue: value }}>
      <ToggleGroup.Root
        ref={composeRefs(ref, listRef as React.Ref<HTMLElement>)}
        type="single"
        value={value}
        onValueChange={handleValueChange}
        disabled={disabled}
        data-slot="segmented-control"
        className={cn(
          "relative",
          segmentedControlRootVariants({ disabled }),
          className
        )}
        {...props}
      >
        {/* Sliding thumb — behind items via z-10 on items */}
        <span
          aria-hidden
          data-slot="segmented-control-indicator"
          className="absolute top-0.5 bottom-0.5 left-0 rounded-sm bg-control-raised shadow-chip pointer-events-none"
          style={thumbStyle}
        />
        {children}
      </ToggleGroup.Root>
    </SegmentedControlContext.Provider>
  )
})

SegmentedControlRoot.displayName = "SegmentedControl"

const SegmentedControlItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroup.Item>,
  SegmentedControlOption
>(function SegmentedControlItem(
  { value, disabled = false, className, children, ...props },
  ref
) {
  const { currentValue } = React.useContext(SegmentedControlContext)

  const isActive = value === currentValue
  const effectiveDisabled = isActive ? false : disabled

  return (
    <ToggleGroup.Item
      ref={ref}
      value={value}
      disabled={effectiveDisabled}
      data-slot="segmented-control-item"
      className={cn(segmentedControlItemVariants(), className)}
      {...props}
    >
      {children}
    </ToggleGroup.Item>
  )
})

SegmentedControlItem.displayName = "SegmentedControl.Item"

export const SegmentedControl = Object.assign(SegmentedControlRoot, {
  Item: SegmentedControlItem,
})
