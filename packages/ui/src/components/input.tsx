// shadcn-source: https://ui.shadcn.com/docs/components/input (cli, 2026-05-26)
import * as React from "react"

import { cn } from "@repo/ui/lib/cn"
import { formFieldBoxVariants } from "@repo/ui/lib/form-field-box"

const inputBaseClasses = [
  "w-full min-w-0 py-0",
  "text-foreground",
  "font-sans font-normal",
  "placeholder:text-meta-foreground",
  "file:inline-flex file:h-8 file:border-0 file:bg-transparent file:text-body file:font-medium file:text-foreground",
  "disabled:pointer-events-none",
  "disabled:placeholder:text-muted-foreground/70",
] as const

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  /**
   * Leading slot — icon, avatar, or any node rendered left of the value text.
   * Recommended icon size: `size-4`.
   * When provided, the component renders a flex shell that owns the border/bg/radius/focus ring.
   */
  leading?: React.ReactNode
  /**
   * Trailing slot — rendered right of the value text.
   * Pass a styled `<kbd>` with class
   * `font-mono text-meta bg-panel border border-border rounded-sm px-1.5 py-px text-muted-foreground`
   * for the v1 cmd-bar look.
   * When provided, the component renders a flex shell that owns the border/bg/radius/focus ring.
   */
  trailing?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, leading, trailing, ...props }, ref) => {
    const hasSlots = leading != null || trailing != null

    if (hasSlots) {
      return (
        <div
          data-slot="input-shell"
          className={cn(
            "flex items-center gap-2",
            "w-full min-w-0",
            formFieldBoxVariants({ size: "md" }),
            // focus-within: shell div is not focusable itself; only the inner input is.
            "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
            // Lift bg off page canvas on focus — bg-background (#F6F8FA light) → bg-white (#FFFFFF). Functional literal, not a semantic role.
            "focus-within:bg-white",
            "has-[[aria-invalid=true]]:border-state-errored",
            "has-[[aria-invalid=true]]:focus-within:ring-state-errored",
            className
          )}
        >
          {leading}
          <input
            ref={ref}
            type={type}
            data-slot="input"
            className={cn(
              "flex-1 min-w-0 bg-transparent border-none outline-none focus-visible:shadow-none",
              "text-foreground font-sans font-normal text-body",
              "placeholder:text-meta-foreground",
              "disabled:pointer-events-none disabled:cursor-not-allowed disabled:text-muted-foreground",
              "disabled:placeholder:text-muted-foreground/70",
              "aria-invalid:border-state-errored",
            )}
            {...props}
          />
          {trailing}
        </div>
      )
    }

    return (
      <input
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(
          formFieldBoxVariants({ size: "md" }),
          // Lift bg off page canvas on focus — bg-background (#F6F8FA light) → bg-white (#FFFFFF). Functional literal, not a semantic role.
          "focus:bg-white",
          ...inputBaseClasses,
          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
