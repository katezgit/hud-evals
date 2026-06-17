"use client";

import Link from "next/link";
import { forwardRef, useState, type ReactNode } from "react";
import { LogOutIcon, SettingsIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/components/popover";
import { SegmentedControl } from "@repo/ui/components/segmented-control";
import { cn } from "@repo/ui/lib/cn";
import { useRole } from "@/lib/mock/role-context";
import { AvatarPill } from "@/components/shell/avatar-pill";
import { signOut } from "@/lib/auth/actions";
import type { Org } from "@/lib/mock/types";

type ThemeChoice = "system" | "light" | "dark";

interface AvatarMenuProps {
  user: { name: string; email: string };
  currentOrg: Org;
}

export function AvatarMenu(props: AvatarMenuProps) {
  const { role } = useRole();
  return (
    <AvatarMenuShell
      {...props}
      renderTrigger={({ open, toggle, name }) => (
        <AvatarPill
          name={name}
          org={props.currentOrg}
          roleLabel={role}
          open={open}
          onClick={toggle}
        />
      )}
    />
  );
}

// Collapsed-sidebar trigger: avatar circle only, same popover body. Identical
// menu content — only the trigger shape changes.
export function AvatarMenuCollapsed(props: AvatarMenuProps) {
  return (
    <AvatarMenuShell
      {...props}
      renderTrigger={({ open, toggle, name }) => (
        <AvatarTriggerCollapsed name={name} open={open} onClick={toggle} />
      )}
    />
  );
}

interface AvatarMenuShellProps extends AvatarMenuProps {
  renderTrigger: (args: {
    open: boolean;
    toggle: () => void;
    name: string;
  }) => ReactNode;
}

function AvatarMenuShell({ user, currentOrg, renderTrigger }: AvatarMenuShellProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {renderTrigger({
          open,
          toggle: () => setOpen((prev) => !prev),
          name: user.name,
        })}
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        sideOffset={8}
        variant="action"
        className="w-[272px] p-0 focus-inset"
      >
        <div className="border-b border-border px-3.5 py-3">
          <div className="text-label font-semibold text-foreground">{user.name}</div>
          <div className="mt-0.5 font-mono text-caption text-meta-foreground">
            {user.email}
          </div>

          <div className="mt-2.5 flex items-center gap-2.5">
            <Avatar size="xs" shape="square">
              <AvatarFallback>{currentOrg.avatarInitial}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-label font-medium text-foreground">
                {currentOrg.name}
              </span>
              <span className="truncate font-mono text-caption text-meta-foreground">
                {currentOrg.hint}
              </span>
            </div>
          </div>
        </div>

        <MenuLink
          href="/manage"
          icon={<SettingsIcon className="size-3.5" />}
          onSelect={() => setOpen(false)}
        >
          Manage settings
        </MenuLink>

        <ThemeRow />

        <MenuItem
          icon={<LogOutIcon className="size-3.5" />}
          onClick={() => {
            setOpen(false);
            void signOut();
          }}
        >
          Log out
        </MenuItem>
      </PopoverContent>
    </Popover>
  );
}

interface AvatarTriggerCollapsedProps {
  name: string;
  open: boolean;
  onClick: () => void;
}

const AvatarTriggerCollapsed = forwardRef<HTMLButtonElement, AvatarTriggerCollapsedProps>(
  function AvatarTriggerCollapsed({ name, open, onClick }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        aria-label="Open account menu"
        aria-expanded={open}
        onClick={onClick}
        className={cn(
          "sidebar-row-hover flex h-7 w-full items-center justify-center rounded-md",
          open && "bg-secondary-surface",
        )}
      >
        <Avatar size="xs">
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
      </button>
    );
  },
);

interface MenuItemProps {
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
}

function MenuItem({ icon, children, onClick }: MenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 px-3.5 py-2 text-label text-muted-foreground hover:bg-sidebar-hover-manage hover:text-foreground"
    >
      <span aria-hidden="true" className="text-meta-foreground">
        {icon}
      </span>
      <span className="flex-1 text-left">{children}</span>
    </button>
  );
}

interface MenuLinkProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onSelect: () => void;
}

function MenuLink({ href, icon, children, onSelect }: MenuLinkProps) {
  return (
    <Link
      href={href}
      onClick={onSelect}
      className="flex w-full items-center gap-2.5 px-3.5 py-2 text-label text-muted-foreground hover:bg-sidebar-hover-manage hover:text-foreground"
    >
      <span aria-hidden="true" className="text-meta-foreground">
        {icon}
      </span>
      <span className="flex-1 text-left">{children}</span>
    </Link>
  );
}

function ThemeRow() {
  const { theme, setTheme } = useTheme();
  // `theme` is undefined before next-themes hydrates from storage; fall back to
  // "system" so the active segment renders sensibly on first paint.
  const value = (theme ?? "system") as ThemeChoice;
  return (
    <div className="flex items-center justify-between gap-2.5 px-3.5 py-2 text-label text-muted-foreground">
      <span>Theme</span>
      <SegmentedControl
        aria-label="Theme"
        value={value}
        onValueChange={(next) => setTheme(next as ThemeChoice)}
        className="h-7"
      >
        <SegmentedControl.Item value="system" className="px-2 text-caption">
          System
        </SegmentedControl.Item>
        <SegmentedControl.Item value="light" className="px-2 text-caption">
          Light
        </SegmentedControl.Item>
        <SegmentedControl.Item value="dark" className="px-2 text-caption">
          Dark
        </SegmentedControl.Item>
      </SegmentedControl>
    </div>
  );
}
