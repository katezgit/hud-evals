"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/cn";
import { useSidebar } from "@/components/shell/sidebar-context";

interface SidebarNavLinkProps {
  href: string;
  label: string;
  icon: ReactNode;
  /** Pulsing teal dot indicating active runs (Jobs only). */
  live?: boolean;
}

export function SidebarNavLink({ href, label, icon, live }: SidebarNavLinkProps) {
  const pathname = usePathname();
  const { collapsed } = useSidebar();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  const link = (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        // CHANGED: dropped the hardcoded `text-foreground` from the base so the
        // active/inactive branches fully own the text tier.
        "group relative flex h-8 w-full items-center gap-2.5 rounded-md text-body",
        collapsed ? "justify-center px-0" : "px-2",
        isActive
          ? "bg-primary-glow text-primary font-medium"
          : // CHANGED: rest sits at the READ tier (system intent for nav) and
            // brightens to foreground on hover — gives the hover real feedback
            // instead of a background-only lift. `sidebar-row-hover` still
            // supplies the bg lift; this adds the text response on top.
            "text-muted-foreground sidebar-row-hover group-hover:text-foreground",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex shrink-0",
          // CHANGED: icon now tracks the label — muted at rest, brightens on
          // hover — so label + icon move together.
          isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
        )}
      >
        {icon}
      </span>
      <span className={cn("truncate", collapsed && "sr-only")}>{label}</span>
      {(!collapsed && live) && (
        <LiveDot />
      )}
    </Link>
  );

  if (!collapsed) return link;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

function LiveDot() {
  // Unchanged — `bg-state-running` is the correct semantic: "active runs" = running hue.
  return (
    <span aria-label="Active runs" className="ml-auto flex shrink-0 items-center">
      <span className="relative flex size-1.5">
        <span
          aria-hidden="true"
          className="absolute inline-flex h-full w-full animate-ping rounded-full bg-state-running opacity-75"
        />
        <span className="relative inline-flex size-1.5 rounded-full bg-state-running" />
      </span>
    </span>
  );
}
