import type { Meta, StoryObj } from "@storybook/react"
import { Filter, Plus, RefreshCw, Search, Trash2, X } from "lucide-react"
import { Button } from "./button"
import { IconButton } from "./icon-button"
import { Input } from "./input"

/* ─── Meta ─────────────────────────────────────────────────────────────────── */

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  parameters: { layout: "padded" },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "ghost", "destructive", "destructive-ghost", "link"],
    },
    disabled: { control: "boolean" },
    asChild: { control: "boolean" },
    children: { control: "text" },
  },
  args: {
    children: "Button",
    variant: "primary",
    disabled: false,
  },
}

export default meta
type Story = StoryObj<typeof meta>

/* ─── Playground ───────────────────────────────────────────────────────────── */

export const Playground: Story = {}

/* ─── Variants ─────────────────────────────────────────────────────────────── */
// All variants × disabled × leading/trailing icon — single 32px height.

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="destructive-ghost">Destructive Ghost</Button>
        <Button variant="link">Link</Button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" disabled>Primary disabled</Button>
        <Button variant="secondary" disabled>Secondary disabled</Button>
        <Button variant="ghost" disabled>Ghost disabled</Button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary">
          <Plus />
          New Taskset
        </Button>
        <Button variant="secondary">
          <Filter />
          Filter
        </Button>
        <Button variant="ghost">
          Cancel
          <X />
        </Button>
      </div>
    </div>
  ),
}

/* ─── ToolbarAlignment ──────────────────────────────────────────────────────── */
// Hard alignment rule: Button (32px) + IconButton md (32px) + Input (32px) on one baseline.
// See: .intermediate/design/sizing/primitives-2026-06-08.md §C

export const ToolbarAlignment: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="flex flex-col gap-6">
      {/* Filter bar — all three primitives at 32px */}
      <div className="flex flex-col gap-1.5">
        <p className="text-label text-muted-foreground">Toolbar / filter bar — Button + IconButton md + Input (all 32px)</p>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search runs…"
            leading={<Search className="size-4 shrink-0 text-muted-foreground" />}
            className="w-64"
          />
          <IconButton variant="ghost" size="md" aria-label="Refresh">
            <RefreshCw />
          </IconButton>
          <IconButton variant="ghost" size="md" aria-label="Clear filter">
            <X />
          </IconButton>
          <Button variant="primary">
            <Plus />
            New Taskset
          </Button>
        </div>
      </div>

      {/* Table row — IconButton sm (24px) inside a fake ~40px row */}
      <div className="flex flex-col gap-1.5">
        <p className="text-label text-muted-foreground">Table cell — IconButton sm (24px) inside ~40px row</p>
        <div className="border border-border rounded-lg overflow-hidden w-96">
          {["frontier-reasoning-v1", "env-8xkp3-baseline", "rl-train-2026-06-07"].map((name) => (
            <div
              key={name}
              className="flex items-center justify-between h-10 px-3 border-b border-border last:border-b-0 hover:bg-hover-surface"
            >
              <span className="text-body text-foreground font-mono">{name}</span>
              <div className="flex items-center gap-1">
                <IconButton variant="ghost" size="sm" aria-label={`Copy ID for ${name}`}>
                  <Search className="size-3.5" />
                </IconButton>
                <IconButton variant="destructive-ghost" size="sm" aria-label={`Delete ${name}`}>
                  <Trash2 className="size-3.5" />
                </IconButton>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
}
