"use client";

import * as React from "react";
import { ChevronsUpDownIcon, LockIcon } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@repo/ui/components/command";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@repo/ui/components/popover";
import { VisibilityIcon } from "@repo/ui/components/visibility-icon";
import { cn } from "@repo/ui/lib/cn";
import type { Taskset } from "@/lib/mock/tasksets";
import { getTaskset } from "@/lib/mock/tasksets";
import { getBaselineCoverage } from "@/lib/mock/job-create";
import { BaselineHintCard } from "./baseline-hint-card";

export interface StepTasksetProps {
  selectedId: string | null;
  locked: boolean;
  modelId: string | null;
  tasksets: ReadonlyArray<Taskset>;
  onSelect: (id: string) => void;
  onUnlock: () => void;
  /** Click handler for the "Run baseline eval →" CTA on the no-baseline advisory. */
  onRunBaseline?: () => void;
}

export function StepTaskset({
  selectedId,
  locked,
  modelId,
  tasksets,
  onSelect,
  onUnlock,
  onRunBaseline,
}: StepTasksetProps) {
  const taskset = selectedId ? (getTaskset(selectedId) ?? null) : null;
  const lockedTaskset = locked ? taskset : null;
  // One-shot signal: Change-click unlocks AND asks the picker to open + focus
  // on its first mount. Incremented each unlock so a single change re-arms it.
  const [autoOpenToken, setAutoOpenToken] = React.useState(0);

  const handleUnlock = React.useCallback(() => {
    setAutoOpenToken((n) => n + 1);
    onUnlock();
  }, [onUnlock]);

  return (
    <div className="h-full flex flex-col gap-6">
      {lockedTaskset ? (
        <LockedTaskset taskset={lockedTaskset} onUnlock={handleUnlock} />
      ) : (
        <label className="flex flex-col gap-1.5">
          <span className="font-medium text-foreground">
            Taskset
          </span>
          <TasksetPicker
            tasksets={tasksets}
            value={selectedId}
            onValueChange={onSelect}
            autoOpenToken={autoOpenToken}
          />
        </label>
      )}

      {taskset && (
        <>
          {!lockedTaskset && <TasksetMetaLine taskset={taskset} />}
          {modelId && (
            <BaselineHintCard
              coverage={getBaselineCoverage(
                modelId,
                taskset.id,
                taskset.taskCount,
              )}
              onRunBaseline={onRunBaseline}
            />
          )}
        </>
      )}
    </div>
  );
}

function LockedTaskset({
  taskset,
  onUnlock,
}: {
  taskset: Taskset;
  onUnlock: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-primary bg-primary-glow px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <LockIcon
            aria-hidden="true"
            className="size-3.5 text-muted-foreground"
          />
          <span className="text-body font-medium text-primary">
            {taskset.name}
          </span>
          <span className="sr-only">Prefilled from URL — read-only.</span>
        </div>
        <Button variant="link" onClick={onUnlock} className="h-auto px-0">
          Change
        </Button>
      </div>
      <TasksetMetaLine taskset={taskset} />
    </div>
  );
}

function TasksetMetaLine({ taskset }: { taskset: Taskset }) {
  return (
    <div className="flex items-center gap-2 text-caption text-muted-foreground">
      <span>{taskset.taskCount} tasks</span>
      <span aria-hidden="true">·</span>
      <span className="inline-flex items-center gap-1">
        <VisibilityIcon visibility={taskset.visibility} size="sm" />
        {taskset.visibility === "public" ? "public" : "private"}
      </span>
      <span aria-hidden="true">·</span>
      <span>by {taskset.ownerName}</span>
    </div>
  );
}

// ── Taskset picker ────────────────────────────────────────────────────────────
// Grouped, enriched-option combobox. The shared @repo/ui Combobox renders each
// option as a single-line label string and cannot express the two-line metadata
// the designer recommendation requires. We compose Popover + Command primitives
// locally — same building blocks the shared Combobox uses — to render two-line
// items grouped by ownership.
//
// Grouping predicate matches the Tasksets index (tasksets-index.tsx):
//   • My Tasksets    → ownership === "team" || ownership === "user"
//   • Public Tasksets → visibility === "public" AND not in My Tasksets

interface TasksetPickerProps {
  tasksets: ReadonlyArray<Taskset>;
  value: string | null;
  onValueChange: (id: string) => void;
  // Bumped by parent on unlock — picker opens and focuses the input on the
  // matching render. Re-armable via increment so a second unlock works.
  autoOpenToken?: number;
}

function isMine(t: Taskset): boolean {
  return t.ownership === "team" || t.ownership === "user";
}

function nameOf(value: string | null, tasksets: ReadonlyArray<Taskset>): string {
  if (value === null) return "";
  return tasksets.find((t) => t.id === value)?.name ?? "";
}

function TasksetPicker({
  tasksets,
  value,
  onValueChange,
  autoOpenToken,
}: TasksetPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState(() => nameOf(value, tasksets));
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const openRef = React.useRef(false);
  const blurTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // Auto-open + focus on mount (and on subsequent token bumps) when the parent
  // signals an unlock-to-pick flow. RAF defers focus until after the popover
  // has mounted so the input keeps focus and the popover stays open.
  React.useEffect(() => {
    if (autoOpenToken === undefined || autoOpenToken === 0) return;
    openRef.current = true;
    setOpen(true);
    const raf = requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    return () => cancelAnimationFrame(raf);
  }, [autoOpenToken]);

  // External value sync — caller may set value programmatically.
  const prevValueRef = React.useRef<string | null | undefined>(undefined);
  React.useEffect(() => {
    if (prevValueRef.current === undefined) {
      prevValueRef.current = value;
      return;
    }
    if (value !== prevValueRef.current) {
      prevValueRef.current = value;
      setQuery(nameOf(value, tasksets));
    }
  }, [value, tasksets]);

  const closeAndRevert = React.useCallback(() => {
    setQuery(nameOf(value, tasksets));
    openRef.current = false;
    setOpen(false);
  }, [value, tasksets]);

  const commit = React.useCallback(
    (id: string, name: string) => {
      onValueChange(id);
      setQuery(name);
      openRef.current = false;
      setOpen(false);
    },
    [onValueChange],
  );

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (next) {
        openRef.current = true;
        setOpen(true);
      } else {
        closeAndRevert();
      }
    },
    [closeAndRevert],
  );

  const handleFocus = React.useCallback(() => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    if (!openRef.current) {
      openRef.current = true;
      setOpen(true);
    }
  }, []);

  const handleBlur = React.useCallback(() => {
    // 150ms race window — let item mousedown commit before blur closes.
    blurTimeoutRef.current = setTimeout(() => {
      if (!openRef.current) return;
      closeAndRevert();
    }, 150);
  }, [closeAndRevert]);

  React.useEffect(
    () => () => {
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    },
    [],
  );

  // When query matches the selected taskset's name verbatim we are showing the
  // post-commit name, not an active search — treat as "no filter" so all groups
  // remain visible on re-open.
  const q = query.trim().toLowerCase();
  const isFiltering =
    q.length > 0 && q !== nameOf(value, tasksets).toLowerCase();

  const matches = (t: Taskset) =>
    !isFiltering ||
    t.name.toLowerCase().includes(q) ||
    t.ownerName.toLowerCase().includes(q);

  const mine = tasksets.filter((t) => isMine(t) && matches(t));
  const publicTs = tasksets.filter(
    (t) => !isMine(t) && t.visibility === "public" && matches(t),
  );
  const hasResults = mine.length + publicTs.length > 0;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "ArrowDown" || e.key === "ArrowUp") && !openRef.current) {
      openRef.current = true;
      setOpen(true);
      e.preventDefault();
    }
    if (e.key === "Escape" && openRef.current) {
      e.preventDefault();
      closeAndRevert();
    }
  };

  const handleQueryChange = (next: string) => {
    setQuery(next);
    if (!openRef.current) {
      openRef.current = true;
      setOpen(true);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <Command
        shouldFilter={false}
        className={cn(
          // Suppress wrapped Command's border/shadow/bg — Popover provides them.
          // !shadow-none is required: tailwind-merge does not recognize the custom
          // shadow-popover token as a shadow utility, so without ! both rules ship
          // and shadow-popover wins by stylesheet order, lifting the trigger.
          "relative w-full rounded-none border-0 bg-transparent !shadow-none",
        )}
      >
        <PopoverAnchor asChild>
          <div
            data-slot="combobox-trigger-wrapper"
            data-state={open ? "open" : "closed"}
            className="relative flex h-8 w-full items-center"
          >
            <input
              ref={inputRef}
              data-slot="combobox-trigger"
              type="text"
              role="combobox"
              aria-expanded={open}
              aria-autocomplete="list"
              aria-haspopup="listbox"
              autoComplete="off"
              value={query}
              placeholder="Pick a taskset"
              onChange={(e) => handleQueryChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
              data-state={open ? "open" : "closed"}
              className={cn(
                "flex h-8 w-full items-center rounded-lg px-2.5 pr-8",
                "border border-border bg-background",
                "focus:bg-form-field-surface data-[state=open]:bg-form-field-surface",
                "text-body text-foreground placeholder:text-meta-foreground",
                "transition-[background-color,border-color,box-shadow] duration-fast ease-out-standard",
              )}
            />
            <ChevronsUpDownIcon
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute right-2.5 size-4 shrink-0 text-muted-foreground opacity-mid",
                query.length > 0 && "opacity-0",
              )}
            />
          </div>
        </PopoverAnchor>

        <PopoverContent
          variant="action"
          align="start"
          sideOffset={8}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => {
            const target = e.target as Node | null;
            if (
              inputRef.current?.contains(target) ||
              inputRef.current === target
            ) {
              e.preventDefault();
              return;
            }
            handleOpenChange(false);
          }}
          onEscapeKeyDown={(e) => {
            e.preventDefault();
            closeAndRevert();
          }}
          // Match trigger width and lift the default max-w-80 cap.
          style={{ width: "var(--radix-popover-trigger-width)" }}
          className="max-w-none"
        >
          <CommandList>
            <CommandEmpty>
              <span className="block py-6 text-center text-body text-muted-foreground">
                No tasksets match.
              </span>
            </CommandEmpty>

            {hasResults && mine.length > 0 && (
              <CommandGroup
                heading="My Tasksets"
                className="[&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-normal [&_[cmdk-group-heading]]:text-meta-foreground"
              >
                {mine.map((t) => (
                  <TasksetOption
                    key={t.id}
                    taskset={t}
                    selected={value === t.id}
                    onCommit={commit}
                  />
                ))}
              </CommandGroup>
            )}

            {hasResults && mine.length > 0 && publicTs.length > 0 && (
              <CommandSeparator className="my-3" />
            )}

            {hasResults && publicTs.length > 0 && (
              <CommandGroup
                heading="Public Tasksets"
                className="[&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-normal [&_[cmdk-group-heading]]:text-meta-foreground"
              >
                {publicTs.map((t) => (
                  <TasksetOption
                    key={t.id}
                    taskset={t}
                    selected={value === t.id}
                    onCommit={commit}
                  />
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </PopoverContent>
      </Command>
    </Popover>
  );
}

function TasksetOption({
  taskset,
  selected,
  onCommit,
}: {
  taskset: Taskset;
  selected: boolean;
  onCommit: (id: string, name: string) => void;
}) {
  return (
    <CommandItem
      value={taskset.id}
      role="option"
      id={taskset.id}
      aria-selected={selected}
      onMouseDown={(e) => e.preventDefault()}
      onSelect={() => onCommit(taskset.id, taskset.name)}
      className="flex-col items-start gap-0.5 py-2"
    >
      <span className="text-body font-medium text-foreground">
        {taskset.name}
      </span>
      <span className="text-meta text-muted-foreground">
        {taskset.taskCount} tasks · {taskset.visibility} · by{" "}
        {taskset.ownerName}
      </span>
    </CommandItem>
  );
}
