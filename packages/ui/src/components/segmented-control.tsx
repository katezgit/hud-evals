// shadcn-source: radix-wrap:ToggleGroup (n/a, 2026-05-31)
"use client"

import * as React from "react"
import { ToggleGroup } from "radix-ui"
import { cva } from "class-variance-authority"

import { cn } from "@repo/ui/lib/cn"

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
  "relative inline-flex h-full items-center justify-center gap-1.5",
  "rounded-sm px-3",
  "text-body font-medium select-none",
  "text-foreground/60",
  "hover:text-foreground",
  "data-[state=on]:bg-control-raised data-[state=on]:text-foreground data-[state=on]:shadow-chip",
  "data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:pointer-events-none",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
  "transition-all",
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

  return (
    <SegmentedControlContext.Provider value={{ currentValue: value }}>
      <ToggleGroup.Root
        ref={ref}
        type="single"
        value={value}
        onValueChange={handleValueChange}
        disabled={disabled}
        data-slot="segmented-control"
        className={cn(
          segmentedControlRootVariants({ disabled }),
          className
        )}
        {...props}
      >
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
