"use client";

import { useEffect, useState } from "react";
import { cn } from "@repo/ui/lib/cn";
import { useRole } from "@/lib/mock/role-context";
import type { Role } from "@/lib/mock/types";

/**
 * Dev-only role switcher pinned to the bottom-right corner. Lets the demo
 * audience flip between owner / admin / member to see the role-tier diff
 * across settings pages. Production builds drop this entirely.
 */
// owner and admin share the same permission tier; the members table still
// renders both labels for badge differentiation, but the switcher only needs
// one entry to toggle the admin-gated UI.
const ROLES: ReadonlyArray<Role> = ["owner", "member"];

export function DevRoleSwitcher() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // eslint-disable-next-line turbo/no-undeclared-env-vars -- NODE_ENV is Next.js-provided
  if (!mounted || process.env.NODE_ENV === "production") return null;

  return <RoleSwitcherChrome />;
}

function RoleSwitcherChrome() {
  const { role, setRole } = useRole();

  return (
    <div
      role="group"
      aria-label="Demo role switcher (dev only)"
      className="fixed right-3 bottom-3 z-sticky flex items-center gap-1 rounded-md border border-border-strong bg-card p-1 shadow-popover"
    >
      <span className="px-1.5 font-mono text-caption text-meta-foreground uppercase tracking-widest">
        role
      </span>
      {ROLES.map((value) => {
        const isActive = role === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setRole(value)}
            aria-pressed={isActive}
            className={cn(
              "rounded-sm px-2 py-1 text-caption font-medium transition-colors duration-fast ease-out-standard",
              isActive
                ? "bg-selected text-foreground"
                : "text-muted-foreground hover:bg-hover hover:text-foreground",
            )}
          >
            {value}
          </button>
        );
      })}
    </div>
  );
}
