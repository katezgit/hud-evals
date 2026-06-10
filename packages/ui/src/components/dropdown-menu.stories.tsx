import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import {
  Copy,
  Download,
  Share2,
  Trash2,
} from "lucide-react"

import { Button } from "./button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./dropdown-menu"

const meta: Meta<typeof DropdownMenuContent> = {
  title: "Components/DropdownMenu",
  component: DropdownMenuContent,
  parameters: { layout: "centered" },
}

export default meta
type Story = StoryObj<typeof meta>

// ── Playground ────────────────────────────────────────────────────────────────

export const Playground: Story = {
  render: () => (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary">Open menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Eval run</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Copy className="size-4" />
            Duplicate
            <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Share2 className="size-4" />
            Share
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Download className="size-4" />
            Export results
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <Trash2 className="size-4" />
          Delete run
          <DropdownMenuShortcut>⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}

// ── Variants ──────────────────────────────────────────────────────────────────
// Item states: default, disabled, destructive; checkbox items; radio items; sub-menu.

function CheckboxVariant() {
  const [statuses, setStatuses] = useState({ scored: true, running: true, errored: false })
  type Key = keyof typeof statuses
  return (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary">Checkbox items</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-44">
        <DropdownMenuLabel>Status filter</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(Object.entries(statuses) as [Key, boolean][]).map(([key, checked]) => (
          <DropdownMenuCheckboxItem
            key={key}
            checked={checked}
            onCheckedChange={(v) => setStatuses((prev) => ({ ...prev, [key]: v }))}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function RadioVariant() {
  const [sort, setSort] = useState("newest")
  return (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary">Radio items</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40">
        <DropdownMenuLabel>Sort order</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
          <DropdownMenuRadioItem value="newest">Newest first</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="oldest">Oldest first</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="score">Score ↓</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const Variants: Story = {
  render: () => (
    <div className="flex items-start gap-6 flex-wrap">
      {/* Disabled item + destructive item */}
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary">Item states</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>View details</DropdownMenuItem>
          <DropdownMenuItem>Clone run</DropdownMenuItem>
          <DropdownMenuItem disabled>Archive (unavailable)</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Delete run</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Checkbox items */}
      <CheckboxVariant />

      {/* Radio items */}
      <RadioVariant />

      {/* Sub-menu */}
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary">Sub-menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-40">
          <DropdownMenuItem>View details</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Share2 className="size-4" />
              Export as
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>JSON</DropdownMenuItem>
              <DropdownMenuItem>CSV</DropdownMenuItem>
              <DropdownMenuItem>Parquet</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ),
  parameters: { layout: "padded" },
}
