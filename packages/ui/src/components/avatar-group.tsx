// shadcn-source: radix-wrap:Avatar (n/a, 2026-05-26)
"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@repo/ui/lib/cn"
import { Avatar, AvatarImage, AvatarFallback } from "./avatar"

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AvatarGroupItem {
  /** Unique key for the avatar. */
  id: string
  /** Image src URL. When absent the fallback is shown. */
  src?: string
  /** Alt text for the avatar image. */
  alt?: string
  /** 1–2 character initials rendered in the fallback slot. */
  initials?: string
}

// ── Variants ──────────────────────────────────────────────────────────────────

/**
 * Size variant controls:
 *  - the Avatar `size` prop passed to each item
 *  - the negative-margin overlap between stacked avatars
 *  - the overflow chip size and typography
 *
 * xs:           20px avatars, -ml-1 (4px) overlap
 * sm (default): 28px avatars, -ml-2 (8px) overlap
 * md:           32px avatars, -ml-2 (8px) overlap
 * lg:           40px avatars, -ml-3 (12px) overlap
 */
const avatarGroupVariants = cva("flex items-center", {
  variants: {
    size: {
      xs: "",
      sm: "",
      md: "",
      lg: "",
    },
  },
  defaultVariants: {
    size: "sm",
  },
})

type AvatarGroupSize = "xs" | "sm" | "md" | "lg"

// Per-spec overlap class by size — applied to every avatar after the first
// and to the overflow slot.
const overlapClass: Record<AvatarGroupSize, string> = {
  xs: "-ml-1",
  sm: "-ml-2",
  md: "-ml-2",
  lg: "-ml-3",
}

// Overflow chip size class by size variant.
const overflowSizeClass: Record<AvatarGroupSize, string> = {
  xs: "size-5",
  sm: "size-7",
  md: "size-8",
  lg: "size-10",
}

// Overflow chip font class by size variant.
const overflowFontClass: Record<AvatarGroupSize, string> = {
  xs: "text-[10px] font-mono font-medium", // eslint-disable-line no-restricted-syntax -- no token for 10px; xs size only (below text-meta at 10px/mono/uppercase)
  sm: "text-label font-mono font-medium",
  md: "text-label font-mono font-medium",
  lg: "text-body font-mono font-medium",
}

// ── AvatarGroup ───────────────────────────────────────────────────────────────

export interface AvatarGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarGroupVariants> {
  /** Ordered list of avatar data items. */
  items: AvatarGroupItem[]
  /**
   * Maximum number of avatars to display before showing the overflow count.
   * @default 3
   */
  maxVisible?: number
}

const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  (
    {
      className,
      size = "sm",
      items,
      maxVisible = 3,
      ...props
    },
    ref
  ) => {
    const resolvedSize: AvatarGroupSize = (size ?? "sm") as AvatarGroupSize
    const visible = items.slice(0, maxVisible)
    const overflowCount = items.length - visible.length
    const overlap = overlapClass[resolvedSize]
    const n = visible.length

    return (
      <div
        ref={ref}
        data-slot="avatar-group"
        data-size={resolvedSize}
        className={cn(avatarGroupVariants({ size }), className)}
        {...props}
      >
        {visible.map((item, index) => (
          <Avatar
            key={item.id}
            size={resolvedSize}
            shape="circle"
            style={{ zIndex: n - index }}
            className={cn(
              // ring separator — bg-panel so ring blends with panel background
              "ring-1 ring-border bg-panel",
              // overlap on every item after the first
              index > 0 && overlap
            )}
          >
            {item.src ? (
              <AvatarImage src={item.src} alt={item.alt ?? item.initials ?? ""} />
            ) : null}
            <AvatarFallback>
              {item.initials ?? ""}
            </AvatarFallback>
          </Avatar>
        ))}

        {overflowCount > 0 && (
          // Overflow slot: same diameter circle, --secondary bg, --muted-foreground text
          // ring-1 ring-border matches the separator token used on stack avatars
          <div
            aria-label={`${overflowCount} more`}
            className={cn(
              // size matches the Avatar size variant
              overflowSizeClass[resolvedSize],
              "rounded-full",
              "bg-secondary-surface text-muted-foreground",
              "ring-1 ring-border",
              "flex items-center justify-center",
              // typography: mono medium per spec
              overflowFontClass[resolvedSize],
              // overlap
              overlap
            )}
          >
            +{overflowCount}
          </div>
        )}
      </div>
    )
  }
)

AvatarGroup.displayName = "AvatarGroup"

export { AvatarGroup }
