// shadcn-source: radix-wrap:Slot (n/a, 2026-05-29)
import * as React from "react"
import { Slot } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@repo/ui/lib/cn"
import { buttonBaseClasses } from "./button-base"

const iconButtonVariants = cva(
  [...buttonBaseClasses, "aspect-square"],
  {
    variants: {
      variant: {
        primary: [
          "bg-primary text-primary-foreground",
          "hover:bg-primary-hover",
          "active:bg-primary-hover",
          "disabled:bg-muted",
        ],

        secondary: [
          "bg-transparent text-foreground border border-border",
          "hover:bg-secondary",
          "active:bg-selected",
          "disabled:bg-transparent",
        ],

        ghost: [
          "bg-transparent text-foreground",
          "hover:bg-hover",
          "active:bg-selected",
          "disabled:bg-transparent",
        ],

        destructive: [
          "bg-destructive text-destructive-foreground",
          "hover:bg-destructive-hover",
          "active:bg-destructive-active",
          "disabled:bg-state-errored-subtle disabled:text-state-errored-text",
        ],

        "destructive-ghost": [
          "bg-transparent text-state-errored",
          "hover:bg-state-errored-subtle hover:text-state-errored-text",
          "active:bg-state-errored-subtle",
          "disabled:bg-transparent",
        ],
      },
      // Two sizes only — see .intermediate/design/sizing/primitives-2026-06-08.md
      // md (32px): toolbar, card-header actions — aligns exactly with Button and Input
      // sm (24px): table-row trailing actions only — no adjacent Button in the same band
      size: {
        md: ["size-8", "rounded-md", "[&_svg]:size-4"],
        sm: ["size-6", "rounded-sm", "[&_svg]:size-3.5"],
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
)

type IconButtonProps =
  React.ComponentPropsWithoutRef<"button"> &
  VariantProps<typeof iconButtonVariants> & {
    "aria-label": string          // REQUIRED at the type level
    asChild?: boolean
    children: React.ReactNode
  }

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot.Root : "button"
    return (
      <Comp
        ref={ref}
        data-slot="icon-button"
        data-variant={variant}
        data-size={size}
        className={cn(iconButtonVariants({ variant, size, className }))}
        {...props}
      />
    )
  }
)
IconButton.displayName = "IconButton"

export { IconButton, iconButtonVariants }
export type { IconButtonProps }
