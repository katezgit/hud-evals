"use client";

// Filter-chip primitives shared between the Jobs and Traces filter bars.
//
// Two chip flavors, both styled as a 32px-tall pressable chip with a trailing
// chevron and value-bearing label (e.g. `Status: Scored, Failed`). Each chip
// opens a Popover containing its own dropdown body; the chip itself is the
// trigger and shows active state via primary-soft background. Selection state
// is communicated to assistive tech via the value-bearing label, not
// `aria-pressed` (which conflicts with Radix's injected `aria-expanded` role).
//
// Kept local to /library because the dropdown bodies are deeply task-specific
// (multi-select-with-search for Job filter, single-select for Date filter, etc)
// AND because @repo/ui has no chip+popover composition: FilterChip is a boolean
// toggle (wrong shape for a Popover trigger), and MultiSelect is a form-field
// (full-width, panel surface — wrong shape for a 32px chip in a filter bar).

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { Checkbox } from "@repo/ui/components/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@repo/ui/components/command";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/components/popover";
import { cn } from "@repo/ui/lib/cn";

// Identical visual to @repo/ui FilterChip but as a Popover trigger (chevron
// trailing instead of leading check). Re-implementing rather than wrapping
// FilterChip because FilterChip's button click toggles a boolean — wrong shape
// for a Popover trigger.

interface ChipTriggerProps extends React.ComponentPropsWithoutRef<"button"> {
  label: string;
  active?: boolean;
  /** Optional native tooltip — used when the label is truncated by max-width. */
  title?: string;
}

const ChipTrigger = React.forwardRef<HTMLButtonElement, ChipTriggerProps>(
  ({ label, active, className, title, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        title={title}
        className={cn(
          "inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-border bg-transparent px-3 py-0 font-sans text-body font-medium text-foreground transition-colors duration-150",
          "hover:bg-secondary-surface active:bg-primary-soft",
          "data-[state=open]:shadow-focus-ring",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0",
          active && "bg-primary-soft hover:bg-primary-soft",
          className,
        )}
        {...props}
      >
        <span className="max-w-64 overflow-hidden text-ellipsis">{label}</span>
        <ChevronDown aria-hidden="true" className="size-3.5 text-muted-foreground" />
      </button>
    );
  },
);
ChipTrigger.displayName = "ChipTrigger";

export interface SingleSelectOption {
  value: string;
  label: string;
}

interface SingleSelectChipProps {
  label: string;
  options: ReadonlyArray<SingleSelectOption>;
  value: string | null;
  onValueChange: (next: string | null) => void;
  /** Clear-row label at the bottom of the dropdown. */
  clearLabel?: string;
}

export function SingleSelectChip({
  label,
  options,
  value,
  onValueChange,
  clearLabel = "Clear",
}: SingleSelectChipProps) {
  const [open, setOpen] = React.useState(false);
  const selected = options.find((o) => o.value === value) ?? null;
  const triggerLabel = selected ? `${label}: ${selected.label}` : label;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <ChipTrigger
          label={triggerLabel}
          active={Boolean(selected)}
          title={selected ? triggerLabel : undefined}
        />
      </PopoverTrigger>
      <PopoverContent variant="action" className="min-w-56 p-0" align="start">
        <Command className="rounded-none border-0 bg-transparent shadow-none">
          <CommandList>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => {
                      onValueChange(option.value);
                      setOpen(false);
                    }}
                    className="pr-2.5"
                  >
                    <span className="flex-1 line-clamp-1">{option.label}</span>
                    {isSelected && (
                      <Check
                        aria-hidden="true"
                        className="size-3.5 text-foreground"
                      />
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selected && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    value="__clear__"
                    onSelect={() => {
                      onValueChange(null);
                      setOpen(false);
                    }}
                    className="pr-2.5 text-muted-foreground"
                  >
                    {clearLabel}
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectChipProps {
  label: string;
  options: ReadonlyArray<MultiSelectOption>;
  value: ReadonlyArray<string>;
  onValueChange: (next: ReadonlyArray<string>) => void;
  /** Search input on top of the list — pass when the option set is large. */
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
  clearLabel?: string;
}

// How many selected labels to inline before collapsing the rest into `+N`.
// 2 matches @repo/ui MultiSelect's `maxChips` default — same scanability budget.
const MAX_INLINE_LABELS = 2;

export function MultiSelectChip({
  label,
  options,
  value,
  onValueChange,
  searchable = false,
  searchPlaceholder = "Search…",
  emptyText = "No results found.",
  clearLabel = "Clear all",
}: MultiSelectChipProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const selectedCount = value.length;
  const active = selectedCount > 0;

  // Build the trigger label from the selection: nothing → `Status`; all →
  // `Status: All`; ≤2 → `Status: A, B`; >2 → `Status: A, B +N`. The full
  // "A, B, C, D" join lands in the native `title` tooltip so a truncated chip
  // still reveals its full selection on hover (and via the assistive name —
  // we override `aria-label` for screen readers to read the same string).
  const { triggerLabel, tooltip } = React.useMemo(() => {
    if (selectedCount === 0) {
      return { triggerLabel: label, tooltip: undefined };
    }
    const selectedLabels = value.map(
      (v) => options.find((o) => o.value === v)?.label ?? v,
    );
    const full = `${label}: ${selectedLabels.join(", ")}`;
    if (selectedCount === options.length) {
      return { triggerLabel: `${label}: All`, tooltip: full };
    }
    if (selectedCount <= MAX_INLINE_LABELS) {
      return { triggerLabel: full, tooltip: full };
    }
    const head = selectedLabels.slice(0, MAX_INLINE_LABELS).join(", ");
    const rest = selectedCount - MAX_INLINE_LABELS;
    return {
      triggerLabel: `${label}: ${head} +${rest}`,
      tooltip: full,
    };
  }, [label, options, selectedCount, value]);

  // cmdk's substring filter, exposed when `searchable` is true. We pass
  // shouldFilter={false} so cmdk preserves option order (matches alphabetical
  // / by-frequency ordering we apply upstream).
  const visibleOptions = React.useMemo(() => {
    if (!searchable || !search.trim()) return options;
    const q = search.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, search, searchable]);

  const toggle = (next: string) => {
    if (value.includes(next)) {
      onValueChange(value.filter((v) => v !== next));
    } else {
      onValueChange([...value, next]);
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSearch("");
      }}
    >
      <PopoverTrigger asChild>
        <ChipTrigger
          label={triggerLabel}
          active={active}
          title={tooltip}
          aria-label={tooltip ?? label}
        />
      </PopoverTrigger>
      <PopoverContent variant="action" className="min-w-56 p-0" align="start">
        <Command
          shouldFilter={false}
          className="rounded-none border-0 bg-transparent shadow-none"
        >
          {searchable && (
            <CommandInput
              placeholder={searchPlaceholder}
              value={search}
              onValueChange={setSearch}
            />
          )}
          <CommandList aria-multiselectable="true">
            <CommandEmpty>{emptyText}</CommandEmpty>
            {visibleOptions.length > 0 && (
              <CommandGroup>
                {visibleOptions.map((option) => {
                  const checked = value.includes(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => toggle(option.value)}
                      className="pr-2.5 [&_[data-slot=checkbox-indicator]_svg]:text-background data-[selected=true]:[&_[data-slot=checkbox-indicator]_svg]:text-background"
                    >
                      <Checkbox
                        checked={checked}
                        aria-hidden="true"
                        tabIndex={-1}
                        className="pointer-events-none group-data-[selected=true]/item:border-border"
                        size="sm"
                      />
                      <span className="flex-1 line-clamp-1">{option.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
            {active && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    value="__clear_all__"
                    onSelect={() => {
                      onValueChange([]);
                    }}
                    className="pr-2.5 text-muted-foreground"
                  >
                    {clearLabel}
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
