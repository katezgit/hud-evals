// MultiSelect — multi-value searchable dropdown with select-all.
"use client"

import * as React from "react"
import { ChevronsUpDownIcon } from "lucide-react"

import { cn } from "@repo/ui/lib/cn"
import { formFieldBoxVariants } from "@repo/ui/lib/form-field-box"
import { Checkbox } from "@repo/ui/components/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/components/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@repo/ui/components/command"

// ── Types ─────────────────────────────────────────────────────────────────────

export type MultiSelectOption = {
  value: string
  label: string
  disabled?: boolean
}

export interface MultiSelectProps {
  options: MultiSelectOption[]
  value: string[]
  onValueChange: (value: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  selectAllLabel?: string
  clearLabel?: string
  maxChips?: number
  disabled?: boolean
  size?: "sm" | "md"
  className?: string
  "aria-invalid"?: boolean | "true" | "false"
}

// ── Trigger ───────────────────────────────────────────────────────────────────

const MultiSelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button"> & {
    open?: boolean
    size?: "sm" | "md"
    "aria-invalid"?: boolean | "true" | "false"
  }
>(({ className, open, size = "md", children, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    role="combobox"
    aria-expanded={open}
    data-slot="multi-select-trigger"
    data-size={size}
    data-state={open ? "open" : "closed"}
    className={cn(
      "group/trigger",
      "flex w-full items-center justify-between gap-2",
      formFieldBoxVariants({ size }),
      "data-[state=open]:shadow-focus-ring",
      "[&_svg]:pointer-events-none [&_svg]:shrink-0",
      className
    )}
    {...props}
  >
    {children}
    <ChevronsUpDownIcon
      aria-hidden="true"
      className="size-4 shrink-0 text-muted-foreground opacity-mid"
    />
  </button>
))
MultiSelectTrigger.displayName = "MultiSelectTrigger"

// ── MultiSelect ───────────────────────────────────────────────────────────────

const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
  (
    {
      options,
      value,
      onValueChange,
      placeholder = "Filter…",
      searchPlaceholder = "Search…",
      emptyText = "No results found.",
      selectAllLabel = "Select all",
      clearLabel = "Clear",
      maxChips = 2,
      disabled = false,
      size = "md",
      className,
      "aria-invalid": ariaInvalid,
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState("")
    // Zero-width sentinel: cmdk auto-selects first item when value is empty/falsy.
    const SENTINEL = "​"
    const [commandValue, setCommandValue] = React.useState(SENTINEL)

    // Mirrors cmdk's default filter: case-insensitive substring match (we pass shouldFilter={false}).
    const visibleOptions = React.useMemo(() => {
      if (!search.trim()) return options
      const q = search.toLowerCase()
      return options.filter((o) => o.label.toLowerCase().includes(q))
    }, [options, search])

    const selectableVisible = visibleOptions.filter((o) => !o.disabled)
    const selectedVisible = selectableVisible.filter((o) =>
      value.includes(o.value)
    )
    const allVisibleSelected =
      selectableVisible.length > 0 &&
      selectedVisible.length === selectableVisible.length

    function toggleItem(itemValue: string) {
      if (value.includes(itemValue)) {
        onValueChange(value.filter((v) => v !== itemValue))
      } else {
        onValueChange([...value, itemValue])
      }
    }

    function handleSelectAll() {
      if (allVisibleSelected) {
        const visibleValues = new Set(selectableVisible.map((o) => o.value))
        onValueChange(value.filter((v) => !visibleValues.has(v)))
      } else {
        const toAdd = selectableVisible
          .map((o) => o.value)
          .filter((v) => !value.includes(v))
        onValueChange([...value, ...toAdd])
      }
    }

    const triggerContent = React.useMemo(() => {
      if (value.length === 0) {
        return (
          <span className="text-meta-foreground line-clamp-1 flex-1">
            {placeholder}
          </span>
        )
      }
      const labelsToShow = value.slice(0, maxChips).map(
        (v) => options.find((o) => o.value === v)?.label ?? v
      )
      const overflow = value.length - maxChips
      return (
        <span className="flex items-center gap-1 overflow-hidden flex-1 min-w-0">
          <span className="text-body text-foreground font-sans line-clamp-1">
            {labelsToShow.join(", ")}
          </span>
          {overflow > 0 && (
            <span className="text-meta text-muted-foreground shrink-0">
              +{overflow}
            </span>
          )}
        </span>
      )
    }, [value, maxChips, options, placeholder])

    return (
      <Popover open={open} onOpenChange={(next) => { setOpen(next); if (!next) setCommandValue(SENTINEL) }}>
        <PopoverTrigger asChild>
          <MultiSelectTrigger
            ref={ref}
            open={open}
            size={size}
            disabled={disabled}
            aria-expanded={open}
            aria-invalid={ariaInvalid}
            className={className}
          >
            {triggerContent}
          </MultiSelectTrigger>
        </PopoverTrigger>
        <PopoverContent
          variant="action"
          className="w-(--radix-popover-trigger-width) min-w-48 p-0"
          align="start"
        >
          <Command
            shouldFilter={false}
            value={commandValue}
            onValueChange={setCommandValue}
            className="rounded-none border-0 bg-transparent shadow-none"
          >
            <CommandInput
              placeholder={searchPlaceholder}
              value={search}
              onValueChange={setSearch}
            />
            <CommandList aria-multiselectable="true">
              <CommandEmpty>{emptyText}</CommandEmpty>

              {visibleOptions.length > 0 && (
                <>
                  <CommandGroup>
                    <CommandItem
                      value="__select_all__"
                      data-slot="multi-select-all"
                      onSelect={handleSelectAll}
                      className="pr-2.5 [&_[data-slot=checkbox-indicator]_svg]:text-background data-[selected=true]:[&_[data-slot=checkbox-indicator]_svg]:text-background"
                    >
                      <Checkbox
                        checked={allVisibleSelected}
                        aria-hidden="true"
                        tabIndex={-1}
                        className="pointer-events-none group-data-[selected=true]/item:border-border"
                        size="sm"
                      />
                      <span className="text-body">
                        {allVisibleSelected ? clearLabel : selectAllLabel}
                      </span>
                    </CommandItem>
                  </CommandGroup>
                  <CommandSeparator />
                  <CommandGroup>
                    {visibleOptions.map((option) => {
                      const checked = value.includes(option.value)
                      return (
                        <CommandItem
                          key={option.value}
                          value={option.value}
                          disabled={option.disabled}
                          data-slot="multi-select-item"
                          onSelect={() => toggleItem(option.value)}
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
                      )
                    })}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
  }
)
MultiSelect.displayName = "MultiSelect"

export { MultiSelect, MultiSelectTrigger }
