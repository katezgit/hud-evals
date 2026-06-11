"use client";

import Link from "next/link";
import { ArrowLeftIcon, Lock, Settings } from "lucide-react";
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/cn";
import { BrandMark } from "@/components/shell/brand-mark";
import { SidebarNavLink } from "@/components/shell/sidebar-nav-link";
import { useSidebar } from "@/components/shell/sidebar-context";
import { useRole } from "@/lib/mock/role-context";
import {
  ORG_ROUTES,
  PERSONAL_ROUTES,
  type ManageRoute,
} from "@/app/(manage)/_lib/manage-routes";
import type { ReactNode } from "react";

interface ManageSidebarBodyProps {
  user: { name: string; email: string };
  /**
   * Optional trailing slot rendered to the right of the BrandMark — used by the
   * mobile Drawer to dock a close button into the brand row. Keeps a single
   * BrandMark on the left rather than splitting layout between two components.
   */
  headerTrailing?: ReactNode;
}

/**
 * Sidebar content (brand, back link, settings header, nav, user footer). Owns
 * NO width or outer `<aside>` — the parent provides the chrome:
 *  - ManageShell renders an `<aside>` with the breakpoint-correct width.
 *  - The mobile Drawer renders this body without a width wrapper (the Drawer
 *    panel already owns the width).
 *
 * Decoupling width from content is what makes the three-band responsive shell
 * possible without a `mode` prop. Reads `collapsed` from SidebarContext so each
 * mount band can drive its own collapse state.
 */
export function ManageSidebarBody({ user, headerTrailing }: ManageSidebarBodyProps) {
  const { isAdmin } = useRole();
  const { collapsed } = useSidebar();

  return (
    <>
      {headerTrailing ? (
        <div className="flex items-center justify-between pr-3">
          <BrandMark collapsed={collapsed} />
          {headerTrailing}
        </div>
      ) : (
        <BrandMark collapsed={collapsed} />
      )}
      {collapsed ? <BackToAppCollapsed /> : <BackToAppFull />}
      {collapsed ? <SettingsHeaderCollapsed /> : <SettingsHeaderFull />}

      <nav
        aria-label="Settings navigation"
        className="flex flex-1 flex-col overflow-y-auto pb-3"
      >
        <NavGroup label="Personal" items={PERSONAL_ROUTES} isAdmin={isAdmin} />
        <NavGroup
          label="Organization"
          items={ORG_ROUTES}
          isAdmin={isAdmin}
          className="mt-3"
        />
        {!collapsed && !isAdmin && <LockedNote />}
      </nav>

      {collapsed ? <UserFooterCollapsed user={user} /> : <UserFooterFull user={user} />}
    </>
  );
}

function BackToAppFull() {
  return (
    <Link
      href="/jobs"
      className="focus-inset flex h-12 shrink-0 items-center gap-2 border-b border-border px-4 text-label text-muted-foreground transition-colors duration-fast ease-out-standard hover:text-foreground"
    >
      <ArrowLeftIcon aria-hidden="true" className="size-3.5" />
      Back to app
    </Link>
  );
}

function BackToAppCollapsed() {
  return (
    <div className="flex h-12 shrink-0 items-center justify-center border-b border-border">
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href="/jobs"
            aria-label="Back to app"
            className="focus-inset flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-hover-surface hover:text-foreground"
          >
            <ArrowLeftIcon aria-hidden="true" className="size-3.5" />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">Back to app</TooltipContent>
      </Tooltip>
    </div>
  );
}

function SettingsHeaderFull() {
  // pl-[11px]: chip is 24px wide with a 14px glyph centered inside; offset by 5px
  // (half the chip-glyph delta) so the glyph's visual left edge sits at 16px,
  // aligned with section labels below. No 11px utility on the spacing scale.
  return (
    <div className="flex items-center gap-2 pt-3 pr-3 pb-1 pl-[11px]">
      <span
        aria-hidden="true"
        className="flex size-6 items-center justify-center rounded-md bg-muted-surface text-muted-foreground"
      >
        <Settings className="size-3.5" />
      </span>
      <span className="text-body font-semibold text-foreground">Settings</span>
    </div>
  );
}

function SettingsHeaderCollapsed() {
  return (
    <div className="flex items-center justify-center px-1.5 pt-3 pb-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            aria-label="Settings"
            className="flex size-6 items-center justify-center rounded-md bg-muted-surface text-muted-foreground"
          >
            <Settings aria-hidden="true" className="size-3.5" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="right">Settings</TooltipContent>
      </Tooltip>
    </div>
  );
}

interface NavGroupProps {
  label: string;
  items: ReadonlyArray<ManageRoute>;
  isAdmin: boolean;
  className?: string;
}

function NavGroup({ label, items, isAdmin, className }: NavGroupProps) {
  const { collapsed } = useSidebar();
  const visible = items.filter((item) => !item.adminOnly || isAdmin);
  if (visible.length === 0) return null;

  return (
    <div className={cn("flex flex-col", className)}>
      {!collapsed && (
        <div className="px-4 pt-2 pb-1 font-mono text-meta text-meta-foreground uppercase">
          {label}
        </div>
      )}
      <ul className={cn("flex flex-col gap-1", collapsed ? "px-1.5" : "px-2")}>
        {visible.map(({ href, label: itemLabel, Icon }) => (
          <li key={href}>
            <SidebarNavLink
              href={href}
              label={itemLabel}
              icon={<Icon className="size-4 shrink-0" />}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function LockedNote() {
  return (
    <div className="mx-3 mt-3 flex gap-2 rounded-md bg-muted-surface px-3 py-2 text-caption text-meta-foreground leading-snug">
      <Lock aria-hidden="true" className="mt-1 size-3 shrink-0" />
      <span>Billing, limits, and secrets are managed by an owner.</span>
    </div>
  );
}

interface UserFooterProps {
  user: { name: string; email: string };
}

function UserFooterFull({ user }: UserFooterProps) {
  return (
    <div className="flex items-center gap-2 border-t border-border px-4 py-2">
      <Avatar size="xs">
        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-label font-semibold text-foreground">
          {user.name}
        </span>
        <span className="truncate font-mono text-caption text-meta-foreground">
          {user.email}
        </span>
      </div>
    </div>
  );
}

function UserFooterCollapsed({ user }: UserFooterProps) {
  return (
    <div className="flex items-center justify-center border-t border-border px-1.5 py-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            aria-label={`${user.name} (${user.email})`}
            className="flex size-7 items-center justify-center rounded-md"
          >
            <Avatar size="xs">
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </span>
        </TooltipTrigger>
        <TooltipContent side="right">
          {user.name} · {user.email}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
