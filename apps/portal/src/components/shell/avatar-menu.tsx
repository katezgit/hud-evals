"use client";

import Link from "next/link";
import { forwardRef, useState, type ReactNode } from "react";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  LogOutIcon,
  PlusIcon,
  Repeat2,
  SettingsIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/components/popover";
import { cn } from "@repo/ui/lib/cn";
import { useRole } from "@/lib/mock/role-context";
import { AvatarPill } from "@/components/shell/avatar-pill";
import { signOut } from "@/lib/auth/actions";
import type { Org, OrgMembership } from "@/lib/mock/types";

interface AvatarMenuProps {
  user: { name: string; email: string };
  currentOrg: Org;
  orgs: ReadonlyArray<OrgMembership>;
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

function AvatarMenuShell({ user, currentOrg, orgs, renderTrigger }: AvatarMenuShellProps) {
  const [open, setOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);

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
        <div className="border-b border-border px-3.5 py-2.5">
          <div className="text-label font-semibold text-foreground">{user.name}</div>
          <div className="mt-0.5 font-mono text-caption text-meta-foreground">
            {user.email}
          </div>
        </div>

        <div className="flex items-center gap-2.5 border-b border-border bg-muted-surface px-3.5 py-2.5">
          <Avatar size="xs" shape="square">
            <AvatarFallback>{currentOrg.avatarInitial}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-label font-semibold text-foreground">
              {currentOrg.name}
            </span>
            <span className="truncate font-mono text-caption text-meta-foreground">
              {currentOrg.hint}
            </span>
          </div>
        </div>

        <OrgSwitcher
          open={switcherOpen}
          onToggle={() => setSwitcherOpen((prev) => !prev)}
          orgs={orgs}
          activeOrgId={currentOrg.id}
        />

        <MenuItem icon={<PlusIcon className="size-3.5" />} onClick={() => setOpen(false)}>
          Create organization
        </MenuItem>

        <MenuLink
          href="/manage/profile"
          icon={<SettingsIcon className="size-3.5" />}
          trailing={<ChevronRightIcon className="size-3 text-meta-foreground" />}
          onSelect={() => setOpen(false)}
        >
          Account settings
        </MenuLink>

        <div className="h-px bg-border" role="separator" />

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
          "flex h-9 items-center justify-center rounded-md hover:bg-hover-surface",
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
      className="flex w-full items-center gap-2.5 px-3.5 py-2 text-label text-muted-foreground hover:bg-hover-surface hover:text-foreground"
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
  trailing?: React.ReactNode;
  children: React.ReactNode;
  onSelect: () => void;
}

function MenuLink({ href, icon, trailing, children, onSelect }: MenuLinkProps) {
  return (
    <Link
      href={href}
      onClick={onSelect}
      className="flex w-full items-center gap-2.5 px-3.5 py-2 text-label text-muted-foreground hover:bg-hover-surface hover:text-foreground"
    >
      <span aria-hidden="true" className="text-meta-foreground">
        {icon}
      </span>
      <span className="flex-1 text-left">{children}</span>
      {trailing}
    </Link>
  );
}

interface OrgSwitcherProps {
  open: boolean;
  onToggle: () => void;
  orgs: ReadonlyArray<OrgMembership>;
  activeOrgId: string;
}

function OrgSwitcher({ open, onToggle, orgs, activeOrgId }: OrgSwitcherProps) {
  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="flex w-full items-center gap-2.5 px-3.5 py-2 text-label text-muted-foreground hover:bg-hover-surface hover:text-foreground"
      >
        <Repeat2 aria-hidden="true" className="size-3.5 text-meta-foreground" />
        <span className="flex-1 text-left">Switch organization</span>
        <ChevronDownIcon
          aria-hidden="true"
          className={cn(
            "size-3 text-meta-foreground transition-transform duration-fast ease-out-standard",
            open && "rotate-180",
          )}
        />
      </button>
      {open ? (
        <div className="border-y border-border bg-background py-1">
          {orgs.map(({ org }) => {
            const isActive = org.id === activeOrgId;
            return (
              <button
                key={org.id}
                type="button"
                className={cn(
                  "flex w-full items-center gap-2.5 py-1.5 pr-3.5 pl-5 text-label text-muted-foreground hover:bg-hover-surface hover:text-foreground",
                  isActive && "text-foreground",
                )}
              >
                <Avatar size="xs" shape="square">
                  <AvatarFallback>{org.avatarInitial}</AvatarFallback>
                </Avatar>
                <span className="flex-1 truncate text-left">{org.name}</span>
                {isActive ? (
                  <CheckIcon
                    aria-label="Current organization"
                    className="size-3.5 text-foreground"
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </>
  );
}
