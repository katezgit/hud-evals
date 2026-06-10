import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import {
  FlaskConicalIcon,
  LayoutDashboardIcon,
  PlusIcon,
  TerminalIcon,
  PlayIcon,
} from "lucide-react"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "./command"

const meta: Meta<typeof Command> = {
  title: "Components/Command",
  component: Command,
  parameters: { layout: "padded" },
}

export default meta
type Story = StoryObj<typeof meta>

// ── Playground ────────────────────────────────────────────────────────────────
// Minimal shell — flat group, no separator, no disabled rows.
// Starting point for API exploration; covers input wrapper focus ring behavior.

export const Playground: Story = {
  render: () => (
    <div style={{ width: 400 }}>
      <Command>
        <CommandInput placeholder="Search commands…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Actions">
            <CommandItem>
              <PlayIcon />
              Run evaluation
              <CommandShortcut>⌘R</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <PlusIcon />
              New environment
              <CommandShortcut>⌘N</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <FlaskConicalIcon />
              View traces
            </CommandItem>
            <CommandItem>
              <LayoutDashboardIcon />
              Dashboard
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  ),
}

// ── Variants ──────────────────────────────────────────────────────────────────
// Canonical anatomy: grouped sections, shortcuts, separator.
// Matches the spec diagram exactly — ACTIONS group with shortcuts, NAVIGATION group.

export const Variants: Story = {
  render: () => (
    <div style={{ width: 400 }}>
      <Command>
        <CommandInput placeholder="Search commands…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Actions">
            <CommandItem>
              <PlayIcon />
              Run evaluation
              <CommandShortcut>⌘R</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <PlusIcon />
              New environment
              <CommandShortcut>⌘N</CommandShortcut>
            </CommandItem>
            <CommandItem disabled>
              <FlaskConicalIcon />
              View traces
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Navigation">
            <CommandItem>
              <LayoutDashboardIcon />
              Dashboard
            </CommandItem>
            <CommandItem>
              <TerminalIcon />
              Terminal
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  ),
}

// ── EmptyState ────────────────────────────────────────────────────────────────
// CommandEmpty renders when no items match the current filter query.
// cmdk controls its own search state via React context — defaultValue on the
// input writes to the DOM attribute but does NOT seed cmdk's internal search,
// so items remain unfiltered and CommandEmpty stays hidden. To show the empty
// state on initial render we must use controlled mode: value + onValueChange
// on CommandInput, initialized to a query that matches nothing.

function EmptyStateExample() {
  const [query, setQuery] = useState("xyzzy")
  return (
    <div style={{ width: 400 }}>
      <Command>
        <CommandInput
          placeholder="Search commands…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No commands match your search.</CommandEmpty>
          <CommandGroup heading="Actions">
            <CommandItem value="run-evaluation">
              <PlayIcon />
              Run evaluation
            </CommandItem>
            <CommandItem value="new-environment">
              <PlusIcon />
              New environment
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  )
}

export const EmptyState: Story = {
  render: () => <EmptyStateExample />,
}

// ── EmptyStateDefault ─────────────────────────────────────────────────────────
// CommandEmpty with no children — renders the default EmptyState component
// (variant="no-results" size="sm" title="No results"). This is the new default
// behavior after the CommandEmpty update.

function EmptyStateDefaultExample() {
  const [query, setQuery] = useState("xyzzy")
  return (
    <div style={{ width: 400 }}>
      <Command>
        <CommandInput
          placeholder="Search commands…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty />
          <CommandGroup heading="Actions">
            <CommandItem value="run-evaluation">
              <PlayIcon />
              Run evaluation
            </CommandItem>
            <CommandItem value="new-environment">
              <PlusIcon />
              New environment
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  )
}

export const EmptyStateDefault: Story = {
  render: () => <EmptyStateDefaultExample />,
}
