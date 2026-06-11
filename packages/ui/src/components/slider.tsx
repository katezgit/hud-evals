// shadcn-source: radix-wrap:Slider (n/a, 2026-06-02)
import * as React from "react"
import { Slider as SliderPrimitive } from "radix-ui"

import { cn } from "@repo/ui/lib/cn"

export interface SliderProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>,
    "value" | "onValueChange" | "defaultValue"
  > {
  /** Controlled single value. */
  value?: number
  /** Callback fired with the new single value. */
  onValueChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(
  (
    {
      className,
      value,
      onValueChange,
      min = 0,
      max = 100,
      step = 1,
      ...props
    },
    ref,
  ) => {
    // Radix Slider uses arrays internally; we expose a single-value API
    const radixValue = value !== undefined ? [value] : undefined
    const handleValueChange = React.useCallback(
      (vals: number[]) => {
        const first = vals[0]
        if (first !== undefined) {
          onValueChange?.(first)
        }
      },
      [onValueChange],
    )

    return (
      <SliderPrimitive.Root
        ref={ref}
        data-slot="slider"
        min={min}
        max={max}
        step={step}
        value={radixValue}
        onValueChange={handleValueChange}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          className,
        )}
        {...props}
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="relative h-1 w-full grow overflow-hidden rounded-full bg-secondary-surface"
        >
          <SliderPrimitive.Range
            data-slot="slider-range"
            className="absolute h-full bg-primary"
          />
        </SliderPrimitive.Track>

        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          className={cn(
            "block size-[14px] rounded-full",
            "border-2 border-primary bg-background",
            "cursor-pointer",
            "disabled:pointer-events-none disabled:opacity-50",
            // *:focus-visible in base.css owns the focus ring globally — no per-component rule needed
          )}
        />
      </SliderPrimitive.Root>
    )
  },
)

Slider.displayName = "Slider"

export { Slider }
