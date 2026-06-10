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
  /** Optional right-aligned count badge (e.g. `12`). */
  count?: number;
  /** Pulsing teal dot indicating active runs (Jobs only). */
  live?: boolean;
}

export function SidebarNavLink({ href, label, icon, count, live }: SidebarNavLinkProps) {
  const pathname = usePathname();
  const { collapsed } = useSidebar();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  const link = (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "group relative flex h-8 w-full items-center gap-2.5 rounded-md text-body font-regular text-muted-foreground",
        collapsed ? "justify-center px-0" : "px-2",
        isActive
          ? "bg-primary-glow text-primary font-medium before:absolute before:left-0 before:top-1 before:bottom-1 before:w-0.5 before:rounded-full before:bg-primary"
          : "hover:bg-hover hover:text-foreground",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex shrink-0",
          isActive ? "text-primary" : "text-foreground",
        )}
      >
        {icon}
      </span>
      <span className={cn("truncate", collapsed && "sr-only")}>{label}</span>
      {(!collapsed && live) &&(
        <LiveDot />
      )}
      {(!collapsed && typeof count === "number") && (
        <span
          className={cn(
            "ml-auto font-mono text-caption tabular-nums",
            isActive ? "text-primary" : "text-meta-foreground",
          )}
        >
          {count}
        </span>
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
