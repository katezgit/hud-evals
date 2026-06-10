// shadcn-source: https://ui.shadcn.com/docs/components/label (radix-wrap:Label, 2026-05-26)
import * as React from "react"
import { Label as LabelPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@repo/ui/lib/cn"

const labelVariants = cva("select-none leading-none", {
  variants: {
    variant: {
      default: [
        "font-sans text-label font-medium text-foreground",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        "group-data-[disabled=true]:opacity-50",
      ],
      section: [
        "font-mono text-meta font-semibold tracking-[.16em] uppercase",
        "text-meta-foreground",
      ],
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

interface LabelProps extends VariantProps<typeof labelVariants> {
  className?: string
  children: React.ReactNode
  htmlFor?: string
}

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps & Omit<React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>, "children">
>(({ className, variant, children, htmlFor, ...props }, ref) => {
  if (variant === "section") {
    return (
      <div
        role="presentation"
        data-slot="label"
        data-variant="section"
        className={cn(labelVariants({ variant }), className)}
      >
        {children}
      </div>
    )
  }

  return (
    <LabelPrimitive.Root
      ref={ref}
      data-slot="label"
      htmlFor={htmlFor}
      className={cn(labelVariants({ variant }), className)}
      {...props}
    >
      {children}
    </LabelPrimitive.Root>
  )
})

Label.displayName = "Label"

export { Label, labelVariants }
