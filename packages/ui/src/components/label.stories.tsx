import type { Meta, StoryObj } from "@storybook/react"
import { Label } from "./label"

const meta: Meta<typeof Label> = {
  title: "Components/Label",
  component: Label,
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "section"],
    },
    children: { control: "text" },
    htmlFor: { control: "text" },
  },
  args: {
    variant: "default",
    children: "Label",
    htmlFor: undefined,
  },
}

export default meta
type Story = StoryObj<typeof meta>

// ── Playground ────────────────────────────────────────────────────────────────
export const Playground: Story = {}

// ── Variants ──────────────────────────────────────────────────────────────────
// Plain label + required asterisk (the only structural decoration Label supports).

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Label>Run name</Label>
      <Label>
        API key
        <span aria-hidden="true" className="text-state-errored">*</span>
      </Label>
    </div>
  ),
}

// ── Disabled ──────────────────────────────────────────────────────────────────
// Demonstrates peer-disabled dimming when a sibling input is disabled.

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {/* peer-disabled example */}
      <div className="flex flex-col gap-1.5">
        <input
          id="disabled-input"
          disabled
          className="peer rounded border border-border bg-muted-surface px-3 py-2 text-body text-foreground"
          placeholder="disabled input"
        />
        <Label htmlFor="disabled-input" className="peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
          Disabled via peer
        </Label>
      </div>
      {/* group-data-[disabled=true] example */}
      <div className="group flex flex-col gap-1.5" data-disabled="true">
        <Label>Disabled via group</Label>
      </div>
    </div>
  ),
}

// ── Section ───────────────────────────────────────────────────────────────────
// Section variant: mono, uppercase, wide tracking, 10px — used for sidebar
// section headers, table group headers, and nav category labels.

export const Section: Story = {
  render: () => (
    <div className="w-48 rounded-lg border border-border bg-surface-raised p-4 flex flex-col gap-4">
      {/* WORKSPACE section */}
      <div className="flex flex-col gap-1">
        <Label variant="section">Workspace</Label>
        <nav className="flex flex-col gap-0.5">
          <a href="#" className="rounded px-2 py-1.5 text-body text-foreground hover:bg-muted-surface">
            Overview
          </a>
          <a href="#" className="rounded px-2 py-1.5 text-body text-foreground hover:bg-muted-surface">
            Runs
          </a>
          <a href="#" className="rounded px-2 py-1.5 text-body text-foreground hover:bg-muted-surface">
            Evals
          </a>
        </nav>
      </div>

      {/* MANAGE section */}
      <div className="flex flex-col gap-1">
        <Label variant="section">Manage</Label>
        <nav className="flex flex-col gap-0.5">
          <a href="#" className="rounded px-2 py-1.5 text-body text-foreground hover:bg-muted-surface">
            Team
          </a>
          <a href="#" className="rounded px-2 py-1.5 text-body text-foreground hover:bg-muted-surface">
            API Keys
          </a>
          <a href="#" className="rounded px-2 py-1.5 text-body text-foreground hover:bg-muted-surface">
            Billing
          </a>
        </nav>
      </div>
    </div>
  ),
}
