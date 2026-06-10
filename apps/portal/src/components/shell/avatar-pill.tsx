"use client";

import { ChevronsUpDown } from "lucide-react";
import { forwardRef } from "react";
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import { cn } from "@repo/ui/lib/cn";
import type { Org } from "@/lib/mock/types";

interface AvatarPillProps {
  name: string;
  org: Org;
  roleLabel: string;
  open: boolean;
  onClick: () => void;
}

/**
 * Bottom-anchored sidebar account row — name + "{org} · {role}" subtitle.
 * Role is always visible without opening the menu (per
 * docs/design/app-shell/app-shell.wireframe.md "Avatar pill" section).
 *
 * Cannot use the Button primitive directly: Button's sm/md sizes are fixed
 * h-7/h-8 and the pill's two-row interior (name + org·role) exceeds 32px.
 */
export const AvatarPill = forwardRef<HTMLButtonElement, AvatarPillProps>(
  function AvatarPill({ name, org, roleLabel, open, onClick }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        aria-label="Open account menu"
        aria-expanded={open}
        onClick={onClick}
        className={cn(
          "flex w-full items-center justify-between gap-2.5 rounded-md px-2.5 py-2.5 text-left text-foreground transition-colors duration-fast ease-out-standard hover:bg-hover",
          open && "bg-secondary",
        )}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <Avatar size="xs">
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-label font-regular text-foreground">{name}</span>
            <span className="truncate font-mono text-caption text-meta-foreground">
              {org.name} · {roleLabel}
            </span>
          </span>
        </span>
        <ChevronsUpDown
          className="size-3.5 shrink-0 text-meta-foreground"
          aria-hidden="true"
        />
      </button>
    );
  },
);
