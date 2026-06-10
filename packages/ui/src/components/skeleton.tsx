// shadcn-source: https://ui.shadcn.com/docs/components/skeleton (cli, 2026-05-26)
import * as React from "react"

import { cn } from "@repo/ui/lib/cn"

// Instrument Precision v1: bg-border + animate-pulse.
// bg-muted (#F0F2F6 light / #161D28 dark) sits too close to canvas (#F6F8FA / #0C1016) —
// the 50%→100% opacity oscillation produces almost no luminance delta.
// bg-border is an rgba alpha tint (rgba(20,30,25,.17) light / rgba(255,255,255,.17) dark)
// that composites visibly on any surface; the opacity oscillation creates a clear pulse.
// No shimmer gradient — shimmer is over-engineered for the instrument feel.
// Shape and radius are consumer-controlled via className; no variants here.
const Skeleton = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="skeleton"
        aria-hidden="true"
        className={cn("block animate-pulse bg-border motion-reduce:animate-none", className)}
        {...props}
      />
    )
  }
)
Skeleton.displayName = "Skeleton"

export { Skeleton }
