// shadcn-source: https://ui.shadcn.com/docs/components/button (cli, 2026-05-26)
import * as React from "react"
import { Slot } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@repo/ui/lib/cn"
import { buttonBaseClasses } from "./button-base"

const buttonVariants = cva(
  [
    ...buttonBaseClasses,
    "h-8 px-3.5 py-0 text-body font-medium rounded-lg gap-2 [&_svg]:size-4",
  ],
  {
    variants: {
      variant: {
        primary: [
          "font-mono bg-primary text-primary-foreground",
          "hover:bg-primary-hover",
          "active:bg-primary-hover",
          "disabled:bg-muted-surface",
        ],

        secondary: [
          "border border-border bg-transparent text-foreground",
          "hover:bg-secondary-surface",
          "active:bg-selected-surface",
          "disabled:bg-transparent",
        ],

        ghost: [
          "bg-transparent text-foreground",
          "hover:bg-hover-surface",
          "active:bg-selected-surface",
          "disabled:bg-transparent",
        ],

        // Teal ring clashes on a red fill — override to destructive outline + errored glow.
        destructive: [
          "bg-destructive text-destructive-foreground",
          "hover:bg-destructive-hover",
          "active:bg-destructive-active",
          "disabled:bg-state-errored-subtle disabled:text-state-errored-text",
          "focus-visible:outline-destructive focus-visible:shadow-focus-errored",
        ],

        "destructive-ghost": [
          "bg-transparent text-state-errored",
          "hover:bg-state-errored-subtle hover:text-state-errored-text",
          "active:bg-state-errored-subtle",
          "disabled:bg-transparent",
        ],

        link: [
          "bg-transparent text-foreground underline underline-offset-4",
          "hover:text-primary",
          "disabled:bg-transparent",
        ],
      },
    },
    compoundVariants: [
      // primary: semibold — appended so tailwind-merge keeps it over font-medium base
      { variant: "primary", class: "font-semibold" },
    ],
    defaultVariants: {
      variant: "primary",
    },
  }
)

export interface ButtonProps
  extends React.ComponentPropsWithoutRef<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot.Root : "button"

    return (
      <Comp
        ref={ref}
        data-slot="button"
        data-variant={variant}
        className={cn(buttonVariants({ variant, className }))}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
