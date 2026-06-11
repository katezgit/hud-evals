// shadcn-source: https://ui.shadcn.com/docs/components/textarea (cli, 2026-05-26)
import * as React from "react"

import { cn } from "@repo/ui/lib/cn"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-18 w-full px-3 py-2",
        "resize-y",
        "rounded-lg",
        "border border-border bg-background text-foreground",
        // Lift bg off page canvas on focus — bg-background (#F6F8FA light) → bg-white (#FFFFFF). Functional literal, not a semantic role.
        "focus:bg-white",
        "placeholder:text-meta-foreground",
        "text-body font-sans font-normal",
        // Focus ring — *:focus-visible in base.css (WCAG 2.4.11). outline-none removed; base layer owns it.
        // Errored focus ring — [aria-invalid="true"]:focus-visible in base.css handles the red ring.
        "transition-[color,box-shadow,outline]",
        "disabled:cursor-not-allowed disabled:pointer-events-none",
        // disabled: Family 3 — value text uses --muted-foreground (not --text-disabled, which is too light for content)
        "disabled:bg-muted disabled:border-border disabled:text-muted-foreground",
        "disabled:placeholder:text-muted-foreground/70",
        "aria-invalid:border-state-errored",
        className
      )}
      {...props}
    />
  )
}

export type TextareaProps = React.ComponentProps<"textarea">

export { Textarea }
