// shadcn-source: https://ui.shadcn.com/docs/components/switch (cli, 2026-05-26)
"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@repo/ui/lib/cn"

const switchTrackVariants = cva(
  [
    "relative inline-flex shrink-0 items-center rounded-full",
    "cursor-pointer",
    "bg-border",
    "enabled:hover:bg-border-strong",
    "data-[state=checked]:border-transparent data-[state=checked]:bg-primary",
    "enabled:data-[state=checked]:hover:bg-primary-hover",
    "disabled:cursor-not-allowed",
    // Disabled-off: absolute token avoids canvas-bleed; lighter than enabled bg-border in both themes.
    "disabled:data-[state=unchecked]:bg-border-disabled",
    // Disabled-on: absolute washed teal avoids the alpha-on-dark inversion (38% over dark → near-black).
    "disabled:data-[state=checked]:bg-primary-disabled",
    "transition-[background-color,border-color] duration-[180ms] ease-out-standard",
  ],
  {
    variants: {
      size: {
        md: "w-[40px] h-[22px]",
        sm: "w-[32px] h-[18px]",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

const switchThumbVariants = cva(
  [
    "pointer-events-none block rounded-full",
    // bg-(--neutral-50): theme-agnostic near-white; bg-white unavailable (--color-*: initial wipes it);
    // bg-primary-foreground resolves dark teal in dark mode — wrong for a thumb.
    "bg-(--neutral-50)",
    // Off-state: shadow is the sole separation mechanism (white on #d9d9e0 is ~1.05:1 color-only).
    "data-[state=unchecked]:shadow-sw-thumb-off",
    "data-[state=checked]:shadow-chip",
    "transition-[transform,box-shadow] duration-[180ms] ease-out-standard",
  ],
  {
    variants: {
      size: {
        // md: 16px thumb, 3px gutter; on: translateX(40 - 16 - 3) = 21px
        md: "size-[16px] data-[state=checked]:translate-x-[21px] data-[state=unchecked]:translate-x-[3px]",
        // sm: 14px thumb, 2px gutter; on: translateX(32 - 14 - 2) = 16px
        sm: "size-[14px] data-[state=checked]:translate-x-[16px] data-[state=unchecked]:translate-x-[2px]",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>,
    VariantProps<typeof switchTrackVariants> {}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ className, size = "md", ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    data-slot="switch"
    data-size={size}
    className={cn(switchTrackVariants({ size }), className)}
    {...props}
  >
    <SwitchPrimitive.Thumb
      data-slot="switch-thumb"
      data-size={size}
      className={cn(switchThumbVariants({ size }))}
    />
  </SwitchPrimitive.Root>
))

Switch.displayName = "Switch"

export { Switch, switchTrackVariants }
