// shadcn-source: https://ui.shadcn.com/docs/components/command (cli, 2026-05-27)
"use client"

import * as React from "react"
import { SearchIcon } from "lucide-react"
import {
  Command as CommandPrimitive,
  CommandDialog as CommandDialogPrimitive,
  CommandEmpty as CommandEmptyPrimitive,
  CommandGroup as CommandGroupPrimitive,
  CommandInput as CommandInputPrimitive,
  CommandItem as CommandItemPrimitive,
  CommandList as CommandListPrimitive,
  CommandSeparator as CommandSeparatorPrimitive,
} from "cmdk"

import { cn } from "@repo/ui/lib/cn"
import { EmptyState } from "./empty-state"

// ── Root ─────────────────────────────────────────────────────────────────────

function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        "flex flex-col",
        "rounded-lg border border-border bg-popover text-popover-foreground",
        "shadow-popover",
        className
      )}
      {...props}
    />
  )
}

// ── Dialog variant ────────────────────────────────────────────────────────────
// Wraps cmdk's built-in dialog so consumers don't reassemble a Dialog + Command shell.

function CommandDialog({
  children,
  ...props
}: React.ComponentProps<typeof CommandDialogPrimitive>) {
  return (
    <CommandDialogPrimitive
      data-slot="command-dialog"
      contentClassName={cn(
        "overflow-hidden",
        "rounded-xl border border-border",
        "bg-popover text-foreground",
        "shadow-command",
        "p-0",
      )}
      overlayClassName="fixed inset-0 z-overlay bg-(--overlay-backdrop)"
      {...props}
    >
      {children}
    </CommandDialogPrimitive>
  )
}

// ── Input ─────────────────────────────────────────────────────────────────────

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandInputPrimitive>) {
  return (
    <div
      data-slot="command-input-wrapper"
      className="flex items-center gap-2 border-b border-border bg-background px-3 py-2 focus-within:border-ring"
    >
      <SearchIcon
        aria-hidden="true"
        className="size-4 shrink-0 text-muted-foreground"
      />
      <CommandInputPrimitive
        data-slot="command-input"
        className={cn(
          "w-full",
          "bg-transparent",
          "text-body text-foreground font-sans",
          "placeholder:text-meta-foreground",
          // base.css owns focus ring via *:focus-visible — suppress duplicate ring here.
          // Forced-colors preserves a 1px outline for high-contrast a11y.
          "focus-visible:outline-none focus-visible:shadow-none forced-colors:focus-visible:outline-1",
          "disabled:cursor-not-allowed disabled:opacity-mid",
          className
        )}
        {...props}
      />
    </div>
  )
}

// ── List ──────────────────────────────────────────────────────────────────────

const CommandList = React.forwardRef<
  React.ComponentRef<typeof CommandListPrimitive>,
  React.ComponentProps<typeof CommandListPrimitive>
>(({ className, ...props }, ref) => (
  <CommandListPrimitive
    ref={ref}
    data-slot="command-list"
    className={cn(
      "max-h-[360px] overflow-y-auto p-1",
      className
    )}
    {...props}
  />
))
CommandList.displayName = "CommandList"

// ── Empty ─────────────────────────────────────────────────────────────────────
// CommandEmptyPrimitive (cmdk) handles show/hide based on filter matches.
// EmptyState replaces the raw text content for consistent styling.
// If children are passed, they render as-is (consumer override).

function CommandEmpty({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CommandEmptyPrimitive>) {
  return (
    <CommandEmptyPrimitive
      data-slot="command-empty"
      {...props}
    >
      {children != null ? (
        children
      ) : (
        <EmptyState
          variant="no-results"
          size="sm"
          title="No results"
          className={className}
        />
      )}
    </CommandEmptyPrimitive>
  )
}

// ── Group ─────────────────────────────────────────────────────────────────────

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandGroupPrimitive>) {
  return (
    <CommandGroupPrimitive
      data-slot="command-group"
      className={cn(
        "overflow-hidden p-1",
        "text-foreground",
        "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1",
        "[&_[cmdk-group-heading]]:text-meta [&_[cmdk-group-heading]]:font-sans [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:uppercase",
        className
      )}
      {...props}
    />
  )
}

// ── Item ──────────────────────────────────────────────────────────────────────

function CommandItem({
  className,
  ...props
}: React.ComponentProps<typeof CommandItemPrimitive>) {
  return (
    <CommandItemPrimitive
      data-slot="command-item"
      className={cn(
        // group/item exposes data-[selected=true] for descendants (e.g. MultiSelect's embedded Checkbox).
        "group/item",
        "relative flex cursor-default select-none items-center gap-2",
        "rounded-md px-2 py-1.5",
        "text-body text-foreground",
        "outline-none",
        // cmdk unifies keyboard + pointer cursor into data-[selected=true] — no hover: variant needed.
        // bg-highlight matches Select's data-[highlighted] — see --color-highlight in theme.css; no font-medium (weight shift jitters glyphs).
        "data-[selected=true]:bg-highlight",
        // Suppress global *:focus-visible ring — bg-highlight is the sole active-option indicator.
        // cmdk uses aria-activedescendant so focus-visible is a no-op in practice, but added for
        // defensive parity in case cmdk's internal model changes. Forced-colors fallback for Windows HC.
        "focus-visible:shadow-none focus-visible:outline-none",
        "forced-colors:focus-visible:outline-2 forced-colors:focus-visible:outline-current",
        "data-[selected=true]:[&_svg]:text-foreground",
        "[&_svg]:text-muted-foreground",
        // cursor-not-allowed kept without pointer-events-none — cmdk gates onSelect; OS cursor signal preserved.
        "data-[disabled=true]:cursor-not-allowed data-[disabled=true]:text-text-disabled",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

// ── Separator ─────────────────────────────────────────────────────────────────

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandSeparatorPrimitive>) {
  return (
    <CommandSeparatorPrimitive
      data-slot="command-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

// ── Shortcut ─────────────────────────────────────────────────────────────────

function CommandShortcut({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        // Stays muted on selected row — chrome, not content; pinned so parent's selected-row color can't advance it.
        "ml-auto font-mono text-meta text-muted-foreground tracking-wider",
        className
      )}
      {...props}
    />
  )
}

export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
}
