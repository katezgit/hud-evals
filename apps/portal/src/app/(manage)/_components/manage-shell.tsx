"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
} from "@repo/ui/components/drawer";
import { IconButton } from "@repo/ui/components/icon-button";
import { TooltipProvider } from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/cn";
import { RoleProvider } from "@/lib/mock/role-context";
import { BrandMark } from "@/components/shell/brand-mark";
import { DevRoleSwitcher } from "@/components/shell/dev-role-switcher";
import { SidebarProvider } from "@/components/shell/sidebar-context";
import { useSidebarShortcut } from "@/components/shell/use-sidebar-shortcut";
import { useSidebarState } from "@/components/shell/use-sidebar-state";
import { currentUser } from "@/lib/mock";
import { ManageSidebarBody } from "@/app/(manage)/_components/manage-sidebar";

interface ManageShellProps {
  email: string;
  name: string;
  children: ReactNode;
}

const MOBILE_DRAWER_ID = "manage-mobile-drawer";

/**
 * Settings full-view-swap shell. Replaces the app shell entirely while the
 * user is inside `/manage/*`. Pressing `Esc` (or clicking Back to app) returns
 * to `/jobs` — see docs/design/screens/settings.wireframe.md "Exit paths".
 *
 * Three-band responsive layout mirrors AppShell:
 *  - `<md`     hide sidebar; render a MobileTopBar with hamburger → left Drawer
 *              carrying the full uncollapsed sidebar body
 *  - `md→lg-1` breakpoint-locked 52px rail (no user toggle)
 *  - `lg+`     user-controlled width (52px ↔ 248px) via useSidebarState
 *
 * Sidebar collapse state is shared with AppShell via `useSidebarState` (same
 * localStorage key) so Cmd+B works identically in both shells and the preference
 * survives "Back to app" round-trips.
 */
export default function ManageShell({ email, name, children }: ManageShellProps) {
  const router = useRouter();
  const { collapsed, toggle } = useSidebarState();
  useSidebarShortcut(toggle);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const user = { name: name || currentUser.name, email };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // Defer to any component that already handled Escape: Radix Dialog, Popover,
      // DropdownMenu, Select, Tooltip, etc. all call preventDefault on their
      // Escape handler (DismissableLayer). Checking defaultPrevented covers every
      // overlay primitive without enumerating tag names or walking the DOM.
      if (e.defaultPrevented) return;
      // Native form controls swallow Escape for their own UX (cancel IME, revert
      // selection); don't hijack it from them either.
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      router.push("/jobs");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [router]);

  return (
    <RoleProvider>
      <TooltipProvider>
        <div className="flex h-screen overflow-hidden bg-background text-foreground">
          <SkipToContent />

          {/* md viewport: rail locked at 52px. Cmd+B still flips localStorage
              but cannot change layout here — the user toggle is consumed by the
              lg+ sidebar only. */}
          <aside
            aria-label="Settings navigation rail"
            className="hidden w-[52px] shrink-0 flex-col border-r border-border bg-card md:flex lg:hidden"
          >
            <SidebarProvider collapsed={true} toggle={toggle}>
              <ManageSidebarBody user={user} />
            </SidebarProvider>
          </aside>

          <aside
            className={cn(
              "hidden shrink-0 flex-col border-r border-border bg-card transition-[width] duration-subtle ease-out-standard lg:flex",
              collapsed ? "lg:w-[52px]" : "lg:w-[248px]",
            )}
          >
            <SidebarProvider collapsed={collapsed} toggle={toggle}>
              <ManageSidebarBody user={user} />
            </SidebarProvider>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <MobileTopBar
              drawerOpen={drawerOpen}
              onOpenDrawer={() => setDrawerOpen(true)}
            />

            <main id="main-content" className="flex-1 overflow-y-auto">
              <div className="mx-auto max-w-[820px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                {children}
              </div>
            </main>
          </div>

          <Drawer
            direction="left"
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
          >
            <DrawerContent
              id={MOBILE_DRAWER_ID}
              size="sm"
              className="bg-card data-[vaul-drawer-direction=left]:w-[280px]"
              aria-label="Settings navigation"
            >
              <DrawerTitle className="sr-only">Settings navigation</DrawerTitle>
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
                  <ManageSidebarBody
                    user={user}
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

interface MobileTopBarProps {
  drawerOpen: boolean;
  onOpenDrawer: () => void;
}

function MobileTopBar({ drawerOpen, onOpenDrawer }: MobileTopBarProps) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-muted-surface px-3 md:hidden">
      <div className="flex items-center gap-1">
        <IconButton
          variant="ghost"
          size="md"
          aria-label="Open settings navigation"
          aria-expanded={drawerOpen}
          aria-controls={MOBILE_DRAWER_ID}
          onClick={onOpenDrawer}
        >
          <Menu />
        </IconButton>
        <BrandMark />
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
