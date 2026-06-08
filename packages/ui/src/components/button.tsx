// shadcn-source: https://ui.shadcn.com/docs/components/button (cli, 2026-05-26)
import * as React from "react"
import { Slot } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@repo/ui/lib/cn"
import { buttonBaseClasses } from "./button-base"

const buttonVariants = cva(
  buttonBaseClasses,
  {
    variants: {
      variant: {
        // Primary: teal fill (--color-primary). font-mono per Instrument Precision v1.
        // Disabled: neutral muted bg + disabled text (not primary-glow).
        primary: [
          "font-mono bg-primary text-primary-foreground",
          "hover:bg-primary-hover",
          "active:bg-primary-hover",
          "disabled:bg-muted",
        ],

        // Secondary: outline — border at rest, transparent bg; fill steps in on hover.
        // active steps to --selected — one step darker than hover.
        // Disabled: preserves outline identity — transparent bg, border visible, dim text.
        secondary: [
          "border border-border bg-transparent text-foreground",
          "hover:bg-secondary",
          "active:bg-selected",
          "disabled:bg-transparent",
        ],

        // Ghost: truly borderless — no border at rest, no border on hover.
        // Transparent at rest; hover reveals --hover bg. Cancel / inline action tier.
        ghost: [
          "bg-transparent text-foreground",
          "hover:bg-hover",
          "active:bg-selected",
          "disabled:bg-transparent",
        ],

        // Destructive: red fill.
        // Disabled: pale pink fill + darker red text (~6:1 contrast). Reads as "inert red."
        // Focus override: base.css fires teal --color-ring outline on all :focus-visible targets.
        // On a red filled button the teal clashes — override to destructive outline + errored glow.
        // --color-destructive is in @theme inline → outline-destructive generates a utility.
        // --shadow-focus-errored is in @theme → shadow-focus-errored generates a utility.
        destructive: [
          "bg-destructive text-destructive-foreground",
          "hover:bg-destructive-hover",
          "active:bg-destructive-active",
          "disabled:bg-state-errored-subtle disabled:text-state-errored-text",
          "focus-visible:outline-destructive focus-visible:shadow-focus-errored",
        ],

        // Destructive ghost: red text, no fill at rest (icon-only delete contexts).
        "destructive-ghost": [
          "bg-transparent text-state-errored",
          "hover:bg-state-errored-subtle hover:text-state-errored-text",
          "active:bg-state-errored-subtle",
          "disabled:bg-transparent",
        ],

        // Link: foreground text + underline, no background ever.
        link: [
          "bg-transparent text-foreground underline underline-offset-4",
          "hover:text-primary",
          "disabled:bg-transparent",
        ],
      },

      size: {
        // md: 32px height (default) — medium weight base; compoundVariant overrides to semibold for primary
        md: "h-8 px-3.5 py-0 text-body font-medium rounded-lg gap-2 [&_svg]:size-4",
        // sm: 28px height — medium weight, label text, md radius
        sm: "h-7 px-2.5 py-0 text-label font-medium rounded-md gap-1.5 [&_svg]:size-3.5",
      },
    },
    compoundVariants: [
      // primary + md: semibold override — appended after size so tailwind-merge keeps it
      { variant: "primary", size: "md", class: "font-semibold" },
    ],
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends React.ComponentPropsWithoutRef<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot.Root : "button"

    return (
      <Comp
        ref={ref}
        data-slot="button"
        data-variant={variant}
        data-size={size}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
