// shadcn-source: radix-wrap:PopoverPrimitive+cmdk (n/a, 2026-05-28)
"use client"

import * as React from "react"
import { ChevronsUpDownIcon, CheckIcon } from "lucide-react"
import { matchSorter, rankings } from "match-sorter"
import { Popover as PopoverPrimitive } from "radix-ui"
import {
  Command as CommandPrimitive,
  CommandEmpty as CommandEmptyPrimitive,
  CommandList as CommandListPrimitive,
  useCommandState,
} from "cmdk"

import { cn } from "@repo/ui/lib/cn"
import { CommandGroup, CommandItem } from "@repo/ui/components/command"

// ── Types ─────────────────────────────────────────────────────────────────────

export type ComboboxOption = { value: string; label: string; disabled?: boolean }
export type ComboboxGroup = { heading: string; options: ComboboxOption[] }

type ComboboxPropsBase = {
  value: string | null
  onValueChange: (value: string | null) => void
  placeholder?: string
  emptyText?: string
  disabled?: boolean
  size?: "sm" | "md"
  className?: string
}

export type ComboboxProps =
  | (ComboboxPropsBase & { options: ComboboxOption[]; groups?: never })
  | (ComboboxPropsBase & { groups: ComboboxGroup[]; options?: never })

// Internal shape that erases discriminated union strictness for destructuring
type ComboboxInternalProps = ComboboxPropsBase & {
  options?: ComboboxOption[]
  groups?: ComboboxGroup[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function labelFor(value: string | null, opts: ComboboxOption[]): string {
  if (value === null) return ""
  return opts.find((o) => o.value === value)?.label ?? ""
}

function flattenGroups(groups: ComboboxGroup[]): ComboboxOption[] {
  return groups.flatMap((g) => g.options)
}

function useFilteredFlat(options: ComboboxOption[], query: string): ComboboxOption[] {
  return React.useMemo(() => {
    if (query === "") return options
    return matchSorter(options, query, { threshold: rankings.CONTAINS, keys: ["label", "value"] })
  }, [options, query])
}

function useFilteredGroups(groups: ComboboxGroup[], query: string): ComboboxGroup[] {
  return React.useMemo(() => {
    if (query === "") return groups
    return groups
      .map((g) => ({
        ...g,
        options: matchSorter(g.options, query, { threshold: rankings.CONTAINS, keys: ["label", "value"] }),
      }))
      .filter((g) => g.options.length > 0)
  }, [groups, query])
}

// ── TriggerInput — nested inside Command to access useCommandState ─────────────

interface TriggerInputProps extends Omit<React.ComponentProps<"input">, "size" | "ref"> {
  query: string
  onQueryChange: (q: string) => void
  open: boolean
  size?: "sm" | "md"
  inputRef: React.RefObject<HTMLInputElement | null>
  listboxId: string | undefined
  activeItemId: string | undefined
}

const TriggerInput = React.forwardRef<HTMLInputElement, TriggerInputProps>(
  ({ query, onQueryChange, open, size = "md", className, inputRef,
     listboxId, activeItemId, onKeyDownCapture, onBlur, onFocus, disabled, placeholder, ...rest }, ref) => {
    const highlightedValue = useCommandState((s) => s.value)
    const derivedActiveItemId = activeItemId ?? (highlightedValue || undefined)

    const mergeRef = React.useCallback(
      (node: HTMLInputElement | null) => {
        (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node
        if (typeof ref === "function") ref(node)
        else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node
      },
      [ref] // eslint-disable-line react-hooks/exhaustive-deps
    )

    return (
      <div
        data-slot="combobox-trigger-wrapper"
        data-state={open ? "open" : "closed"}
        className={cn("relative flex w-full items-center", size === "md" ? "h-8" : "h-7", className)}
      >
        <input
          ref={mergeRef}
          data-slot="combobox-trigger"
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-activedescendant={derivedActiveItemId}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          autoComplete="off"
          disabled={disabled}
          value={query}
          placeholder={placeholder}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDownCapture={onKeyDownCapture}
          onBlur={onBlur}
          onFocus={onFocus}
          data-state={open ? "open" : "closed"}
          className={cn(
            "flex w-full items-center",
            size === "md" ? "h-8 px-2.5 rounded-lg" : "h-7 px-2 rounded-md",
            size === "sm" ? "pr-7" : "pr-8",
            "border border-border bg-background",
            // Lift to form-field surface on focus — light: #FFFFFF, dark: #11161F. Tracks --color-panel.
            "focus:bg-form-field-surface data-[state=open]:bg-form-field-surface",
            "aria-invalid:border-state-errored",
            "text-body text-foreground placeholder:text-meta-foreground",
            // Open state: chevron rotation is the only open feedback. Keyboard nav gets the global ring via base.css.
            "disabled:cursor-not-allowed disabled:bg-muted disabled:border-border disabled:text-muted-foreground",
            "transition-[background-color,border-color,box-shadow] duration-fast ease-out-standard",
          )}
          {...rest}
        />
        <ChevronsUpDownIcon
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute right-2.5 size-4 shrink-0 text-muted-foreground opacity-mid",
            query.length > 0 && "opacity-0",
          )}
        />
      </div>
    )
  }
)
TriggerInput.displayName = "ComboboxTriggerInput"

// ── Combobox ──────────────────────────────────────────────────────────────────

export const Combobox = React.forwardRef<HTMLInputElement, ComboboxProps>((props, ref) => {
  const {
    value, onValueChange, placeholder, emptyText, disabled = false, size = "md",
    className, options: optionsProp = [], groups: groupsProp,
  } = props as ComboboxInternalProps

  const allOptions = React.useMemo(
    () => (groupsProp ? flattenGroups(groupsProp) : optionsProp),
    [groupsProp, optionsProp]
  )

  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState(() => labelFor(value, allOptions))

  const initialValueRef = React.useRef<string | null>(value)
  const committedRef = React.useRef(false)
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const blurTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const openRef = React.useRef(false)
  const [listboxId, setListboxId] = React.useState<string | undefined>(undefined)

  // External value sync — query and initialValueRef drift to new external value
  const prevValueRef = React.useRef<string | null | undefined>(undefined)
  React.useEffect(() => {
    if (prevValueRef.current === undefined) { prevValueRef.current = value; return }
    if (value !== prevValueRef.current) {
      prevValueRef.current = value
      setQuery(labelFor(value, allOptions))
      initialValueRef.current = value
    }
  }, [value, allOptions])

  // Close path: revert if uncommitted
  const runClosePath = React.useCallback(() => {
    if (!committedRef.current) {
      onValueChange(initialValueRef.current)
      setQuery(labelFor(initialValueRef.current, allOptions))
    }
    committedRef.current = false
  }, [onValueChange, allOptions])

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (next) {
        initialValueRef.current = value
        committedRef.current = false
        openRef.current = true
        setOpen(true)
      } else {
        openRef.current = false
        runClosePath()
        setOpen(false)
      }
    },
    [value, runClosePath]
  )

  // After open, read cmdk list id for aria-controls
  React.useEffect(() => {
    if (!open) { setListboxId(undefined); return }
    const raf = requestAnimationFrame(() => {
      const el = document.querySelector("[cmdk-list]")
      if (el) {
        let id = el.getAttribute("id")
        if (!id) { id = `combobox-list-${Math.random().toString(36).slice(2, 9)}`; el.setAttribute("id", id) }
        setListboxId(id)
      }
    })
    return () => cancelAnimationFrame(raf)
  }, [open])

  // Commit path
  const commit = React.useCallback(
    (option: ComboboxOption) => {
      onValueChange(option.value)
      setQuery(option.label)
      committedRef.current = true
      openRef.current = false
      setOpen(false)
    },
    [onValueChange]
  )

  // Query change — backspace-to-empty fires intermediate null
  const handleQueryChange = React.useCallback(
    (q: string) => {
      setQuery(q)
      if (q === "") onValueChange(null)
      if (!openRef.current) {
        initialValueRef.current = value
        committedRef.current = false
        openRef.current = true
        setOpen(true)
      }
    },
    [value, onValueChange]
  )

  // Blur with 150ms race window for item-click.
  // Uses openRef (not the closure-captured `open`) so the guard sees current state
  // even if blur fires before the re-render that updates the stale closure value.
  const handleBlur = React.useCallback(() => {
    blurTimeoutRef.current = setTimeout(() => {
      if (!openRef.current) return
      openRef.current = false
      runClosePath()
      setOpen(false)
    }, 150)
  }, [runClosePath])

  const handleFocus = React.useCallback(() => {
    if (blurTimeoutRef.current) { clearTimeout(blurTimeoutRef.current); blurTimeoutRef.current = null }
    if (!openRef.current) {
      initialValueRef.current = value
      committedRef.current = false
      openRef.current = true
      setOpen(true)
    }
  }, [value])

  React.useEffect(() => () => { if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current) }, [])

  const filteredFlat = useFilteredFlat(optionsProp, query)
  const filteredGroups = useFilteredGroups(groupsProp ?? [], query)
  const firstFilteredItem = groupsProp
    ? filteredGroups.flatMap((g) => g.options).find((o) => !o.disabled)
    : filteredFlat.find((o) => !o.disabled)

  // ArrowDown opens; Enter with no cmdk highlight commits first item
  const handleKeyDownCapture = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        if (!openRef.current) { initialValueRef.current = value; committedRef.current = false; openRef.current = true; setOpen(true); e.preventDefault() }
        return
      }
      if (e.key === "Enter" && openRef.current) {
        const highlighted = document.querySelector("[cmdk-item][aria-selected=true]")
        if (!highlighted && firstFilteredItem) { e.preventDefault(); commit(firstFilteredItem) }
      }
    },
    [value, firstFilteredItem, commit]
  )

  const renderItems = (items: ComboboxOption[]) =>
    items.map((option) => (
      <CommandItem
        key={option.value}
        value={option.value}
        disabled={option.disabled}
        role="option"
        id={option.value}
        aria-selected={value === option.value}
        onMouseDown={(e) => e.preventDefault()}
        onSelect={() => commit(option)}
      >
        <span className="flex-1 truncate">{option.label}</span>
        <CheckIcon
          aria-hidden="true"
          className={cn("size-4 shrink-0", value === option.value ? "opacity-100" : "opacity-0")}
        />
      </CommandItem>
    ))

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <CommandPrimitive
        shouldFilter={false}
        className="relative w-full"
      >
        <PopoverPrimitive.Anchor asChild>
          <TriggerInput
            ref={ref}
            query={query}
            onQueryChange={handleQueryChange}
            open={open}
            placeholder={placeholder}
            disabled={disabled}
            size={size}
            className={className}
            onKeyDownCapture={handleKeyDownCapture}
            inputRef={inputRef}
            listboxId={listboxId}
            activeItemId={undefined}
            onBlur={handleBlur}
            onFocus={handleFocus}
          />
        </PopoverPrimitive.Anchor>

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            data-slot="combobox-content"
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
            onInteractOutside={(e) => {
              // Radix fires onInteractOutside for any pointer/focus event outside the
              // portal — including the trigger input itself. Since we use Anchor (not
              // Trigger), Radix's built-in targetIsTrigger guard never fires. We must
              // guard it ourselves: when the interaction target is the input, call
              // e.preventDefault() to stop the DismissableLayer from also calling
              // onDismiss → onOpenChange(false). Returning early without preventDefault
              // is insufficient — onDismiss fires regardless unless default is prevented.
              const target = e.target as Node | null
              if (inputRef.current?.contains(target) || inputRef.current === target) {
                e.preventDefault()
                return
              }
              handleOpenChange(false)
            }}
            onEscapeKeyDown={(e) => { e.preventDefault(); handleOpenChange(false) }}
            align="start"
            sideOffset={8}
            style={{ width: "var(--radix-popover-trigger-width)" }}
            className={cn(
              "z-overlay overflow-hidden rounded-lg border border-border",
              "bg-popover text-foreground shadow-popover outline-none p-1",
              "data-[state=open]:animate-in data-[state=open]:fade-in-0",
              "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
              "data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1",
              "data-[state=closed]:data-[side=bottom]:slide-out-to-top-0.5",
              "data-[state=closed]:data-[side=top]:slide-out-to-bottom-0.5",
            )}
          >
            <CommandListPrimitive
              data-slot="combobox-list"
              role="listbox"
              className="max-h-[360px] scroll-py-1 overflow-x-hidden overflow-y-auto"
            >
              <CommandEmptyPrimitive className="py-6 text-center text-body text-muted-foreground">
                {emptyText ?? "No results found."}
              </CommandEmptyPrimitive>

              {groupsProp
                ? filteredGroups.map((group) => (
                    <CommandGroup
                      key={group.heading}
                      heading={group.heading}
                    >
                      {renderItems(group.options)}
                    </CommandGroup>
                  ))
                : renderItems(filteredFlat)}
            </CommandListPrimitive>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </CommandPrimitive>
    </PopoverPrimitive.Root>
  )
})

Combobox.displayName = "Combobox"
