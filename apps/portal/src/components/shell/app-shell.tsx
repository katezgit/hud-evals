"use client";

import { useState, type ReactNode } from "react";
import {
  ArrowUpRightIcon,
  BarChart3,
  BookOpen,
  Bot,
  Box,
  BrainCircuit,
  ListChecks,
  Menu,
  ShoppingBag,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
} from "@repo/ui/components/drawer";
import { IconButton } from "@repo/ui/components/icon-button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/cn";
import { RoleProvider } from "@/lib/mock/role-context";
import { currentOrg, currentUser, orgList } from "@/lib/mock";
import type { CreditState, Org, OrgMembership } from "@/lib/mock/types";
import { AvatarMenu, AvatarMenuCollapsed } from "@/components/shell/avatar-menu";
import { BrandMark } from "@/components/shell/brand-mark";
import { CreditsPill, CreditsIconButton } from "@/components/shell/credits-pill";
import { DevRoleSwitcher } from "@/components/shell/dev-role-switcher";
import { MobileCreditsChip } from "@/components/shell/mobile-credits-chip";
import { SidebarProvider } from "@/components/shell/sidebar-context";
import { SidebarNavLink } from "@/components/shell/sidebar-nav-link";
import { useActiveJobs } from "@/components/shell/use-active-jobs";
import { useCreditsBalance } from "@/components/shell/use-credits-balance";
import { useSidebarShortcut } from "@/components/shell/use-sidebar-shortcut";
import { useSidebarState } from "@/components/shell/use-sidebar-state";

interface NavItem {
  href: string;
  label: string;
  Icon: LucideIcon;
  count?: number;
  live?: boolean;
}

const WORKSPACE_ITEMS: ReadonlyArray<NavItem> = [
  { href: "/jobs", label: "Jobs", Icon: BarChart3 },
  { href: "/tasksets", label: "Tasksets", Icon: ListChecks, count: 12 },
  { href: "/environments", label: "Environments", Icon: Box, count: 8 },
  { href: "/models", label: "Models", Icon: BrainCircuit, count: 5 },
  { href: "/agents", label: "Agents", Icon: Bot, count: 4 },
  { href: "/library", label: "Library", Icon: BookOpen },
];

const EXTERNAL_ITEMS = [
  { href: "https://vendor.hud.ai", label: "Marketplace", Icon: ShoppingBag },
  { href: "https://docs.hud.ai", label: "Documentation", Icon: BookOpen },
] as const;

const MOBILE_DRAWER_ID = "shell-mobile-drawer";

interface AppShellProps {
  email: string;
  name: string;
  children: ReactNode;
}

export function AppShell({ email, name, children }: AppShellProps) {
  const { collapsed, toggle } = useSidebarState();
  useSidebarShortcut(toggle);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const user = { name: name || currentUser.name, email };
  const creditState = useCreditsBalance();
  const { hasActive } = useActiveJobs();
  const workspaceItems = WORKSPACE_ITEMS.map((item) =>
    item.href === "/jobs" ? { ...item, live: hasActive } : item,
  );

  return (
    <RoleProvider>
      <TooltipProvider>
        <div className="flex h-screen overflow-hidden text-foreground">
          <SkipToContent />

          {/* md viewport: rail is breakpoint-locked, not user-controlled. Cmd+B
              still flips localStorage but cannot change layout here — the user
              toggle is consumed by the lg+ sidebar only. */}
          <aside
            aria-label="Workspace navigation rail"
            className="hidden w-[52px] shrink-0 flex-col border-r border-border md:flex lg:hidden"
          >
            <SidebarProvider collapsed={true} toggle={toggle}>
              <SidebarBody
                collapsed={true}
                user={user}
                currentOrg={currentOrg}
                orgs={orgList}
                creditState={creditState}
                workspaceItems={workspaceItems}
              />
            </SidebarProvider>
          </aside>

          <aside
            className={cn(
              "hidden shrink-0 flex-col border-r border-border transition-[width] duration-subtle ease-out-standard lg:flex",
              collapsed ? "lg:w-[52px]" : "lg:w-[248px]",
            )}
          >
            <SidebarProvider collapsed={collapsed} toggle={toggle}>
              <SidebarBody
                collapsed={collapsed}
                user={user}
                currentOrg={currentOrg}
                orgs={orgList}
                creditState={creditState}
                workspaceItems={workspaceItems}
              />
            </SidebarProvider>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <MobileTopBar
              drawerOpen={drawerOpen}
              onOpenDrawer={() => setDrawerOpen(true)}
              user={user}
              currentOrg={currentOrg}
              orgs={orgList}
              creditState={creditState}
            />

            <main
              id="main-content"
              className="flex-1 overflow-y-auto bg-grid-backdrop pb-16 md:pb-24"
            >
              {children}
            </main>
          </div>

          {/* Drawer carries the full lg+ layout (NOT a degraded mobile nav) per
              app-shell.wireframe.md § 5: "Drawer rules". */}
          <Drawer
            direction="left"
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
          >
            <DrawerContent
              id={MOBILE_DRAWER_ID}
              size="sm"
              className="data-[vaul-drawer-direction=left]:w-[280px] bg-muted-surface"
              aria-label="Main navigation"
            >
              <DrawerTitle className="sr-only">Main navigation</DrawerTitle>
              <div
                onClickCapture={(event) => {
                  // Close the drawer whenever a nav link is activated. Anchor tags
                  // inside the panel trigger Next.js client navigation — without an
                  // explicit close the drawer would remain open over the new route.
                  const target = event.target as HTMLElement;
                  if (target.closest("a[href]")) setDrawerOpen(false);
                }}
                className="flex h-full flex-col"
              >
                <SidebarProvider collapsed={false} toggle={toggle}>
                  <SidebarBody
                    collapsed={false}
                    user={user}
                    currentOrg={currentOrg}
                    orgs={orgList}
                    creditState={creditState}
                    workspaceItems={workspaceItems}
                    headerTrailing={
                      <DrawerClose asChild>
                        <IconButton
                          variant="ghost"
                          size="md"
                          aria-label="Close navigation"
                        >
                          <X />
                        </IconButton>
                      </DrawerClose>
                    }
                  />
                </SidebarProvider>
              </div>
            </DrawerContent>
          </Drawer>

          <DevRoleSwitcher />
        </div>
      </TooltipProvider>
    </RoleProvider>
  );
}

interface SidebarBodyProps {
  collapsed: boolean;
  user: { name: string; email: string };
  currentOrg: Org;
  orgs: ReadonlyArray<OrgMembership>;
  creditState: CreditState;
  workspaceItems: ReadonlyArray<NavItem>;
  headerTrailing?: ReactNode;
}

function SidebarBody({
  collapsed,
  user,
  currentOrg,
  orgs,
  creditState,
  workspaceItems,
  headerTrailing,
}: SidebarBodyProps) {
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

      <nav
        aria-label="Workspace navigation"
        className="flex flex-1 flex-col min-w-0 overflow-y-auto overflow-x-hidden pb-1"
      >
        <NavZone
          label="Workspace"
          items={workspaceItems}
          collapsed={collapsed}
        />

        <div className="mt-auto flex flex-col">
          {collapsed ? <MarketDocsRowCollapsed /> : <MarketDocsRow />}
        </div>
      </nav>

      {collapsed ? (
        <CreditsIconButton state={creditState} />
      ) : (
        <CreditsPill state={creditState} />
      )}
      {collapsed ? (
        <div className="mx-1.5 mb-3 mt-1">
          <AvatarMenuCollapsed user={user} currentOrg={currentOrg} orgs={orgs} />
        </div>
      ) : (
        <div className="px-2 pb-2">
          <AvatarMenu user={user} currentOrg={currentOrg} orgs={orgs} />
        </div>
      )}
    </>
  );
}

interface NavZoneProps {
  label?: string;
  items: ReadonlyArray<NavItem>;
  collapsed: boolean;
  className?: string;
}

function NavZone({ label, items, collapsed, className }: NavZoneProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      {label && !collapsed && (
        <div className="px-4 pt-3 pb-0 font-mono font-medium text-meta text-meta-foreground uppercase">
          {label}
        </div>
      )}
      <ul className={cn("flex flex-col gap-1 mt-0.5", collapsed ? "px-1.5" : "px-2")}>
        {items.map(({ href, label: itemLabel, Icon, count, live }) => (
          <li key={href}>
            <SidebarNavLink
              href={href}
              label={itemLabel}
              icon={<Icon className="size-4 shrink-0" />}
              count={count}
              live={live}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function MarketDocsRow() {
  return (
    <div className="flex flex-col border-t border-border px-2 py-1.5">
      {EXTERNAL_ITEMS.map(({ href, label, Icon }) => (
        <a
          key={href}
          href={href}
          target="_blank"
          rel="noreferrer"
          className="group flex items-center justify-between rounded-md px-2 py-2 text-label text-muted-foreground hover:bg-hover-surface hover:text-foreground"
        >
          <span className="flex items-center gap-2.5">
            <Icon
              className="size-4 shrink-0 text-meta-foreground group-hover:text-foreground"
              aria-hidden="true"
            />
            {label}
          </span>
          <ArrowUpRightIcon
            aria-hidden="true"
            className="size-3 text-meta-foreground transition-colors group-hover:text-foreground"
          />
        </a>
      ))}
    </div>
  );
}

function MarketDocsRowCollapsed() {
  return (
    <ul className="flex flex-col gap-1 px-1.5 pt-1 pb-2">
      {EXTERNAL_ITEMS.map(({ href, label, Icon }) => (
        <li key={href}>
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="group flex h-7 w-full items-center justify-center rounded-md font-regular text-meta-foreground hover:bg-hover-surface hover:text-foreground"
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
              </a>
            </TooltipTrigger>
            <TooltipContent side="right">{label}</TooltipContent>
          </Tooltip>
        </li>
      ))}
    </ul>
  );
}

interface MobileTopBarProps {
  drawerOpen: boolean;
  onOpenDrawer: () => void;
  user: { name: string; email: string };
  currentOrg: Org;
  orgs: ReadonlyArray<OrgMembership>;
  creditState: CreditState;
}

function MobileTopBar({
  drawerOpen,
  onOpenDrawer,
  user,
  currentOrg,
  orgs,
  creditState,
}: MobileTopBarProps) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-muted-surface px-3 md:hidden">
      <div className="flex items-center gap-1">
        <IconButton
          variant="ghost"
          size="md"
          aria-label="Open navigation"
          aria-expanded={drawerOpen}
          aria-controls={MOBILE_DRAWER_ID}
          onClick={onOpenDrawer}
        >
          <Menu />
        </IconButton>
        <BrandMark />
      </div>
      <div className="flex items-center gap-1">
        <MobileCreditsChip state={creditState} />
        <AvatarMenuCollapsed user={user} currentOrg={currentOrg} orgs={orgs} />
      </div>
    </header>
  );
}

function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-overlay focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
    >
      Skip to main content
    </a>
  );
}
