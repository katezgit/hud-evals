// shadcn-source: https://ui.shadcn.com/docs/components/checkbox (cli, 2026-05-26)
import * as React from "react"
import { CheckIcon, MinusIcon } from "lucide-react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@repo/ui/lib/cn"

const checkboxVariants = cva(
  [
    "relative shrink-0 inline-flex items-center justify-center",
    "border border-border",
    "transition-[background-color,border-color,box-shadow,outline] duration-fast ease-out-standard",
    "bg-transparent",
    "hover:bg-muted",
    "data-[state=checked]:bg-primary data-[state=checked]:border-primary",
    "data-[state=checked]:hover:bg-primary-hover data-[state=checked]:hover:border-primary-hover",
    "data-[state=indeterminate]:bg-primary data-[state=indeterminate]:border-primary",
    "data-[state=indeterminate]:hover:bg-primary-hover data-[state=indeterminate]:hover:border-primary-hover",
    "disabled:pointer-events-none",
    "disabled:border-border/50",
    "disabled:data-[state=checked]:bg-primary-disabled disabled:data-[state=checked]:border-primary-disabled",
    "disabled:data-[state=indeterminate]:bg-primary-disabled disabled:data-[state=indeterminate]:border-primary-disabled",
    "aria-invalid:border-state-errored",
    "aria-invalid:hover:bg-state-errored-subtle",
  ],
  {
    variants: {
      size: {
        md: "size-5 rounded-md",
        sm: "size-[18px] rounded-sm",
        xs: "size-3.5 rounded-sm",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

const checkboxIndicatorVariants = cva(
  "grid place-content-center text-primary-foreground transition-opacity duration-fast ease-out-standard",
  {
    variants: {
      size: {
        md: "size-5",
        sm: "size-[18px]",
        xs: "size-3.5",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

const checkIconVariants = cva("", {
  variants: {
    size: {
      md: "size-3.5",
      sm: "size-[13px]",
      xs: "size-2.5",
    },
  },
  defaultVariants: {
    size: "md",
  },
})

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof checkboxVariants> {}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, size, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    data-slot="checkbox"
    data-size={size ?? "md"}
    className={cn(checkboxVariants({ size }), className)}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      data-slot="checkbox-indicator"
      className={cn(checkboxIndicatorVariants({ size }))}
    >
      {/* Indeterminate — white dash */}
      <MinusIcon
        aria-hidden="true"
        className={cn(
          checkIconVariants({ size }),
          "hidden [[data-state=indeterminate]_&]:block"
        )}
      />
      {/* Checked — white checkmark */}
      <CheckIcon
        aria-hidden="true"
        className={cn(
          checkIconVariants({ size }),
          "[[data-state=indeterminate]_&]:hidden"
        )}
      />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))

Checkbox.displayName = "Checkbox"

export { Checkbox, checkboxVariants }
