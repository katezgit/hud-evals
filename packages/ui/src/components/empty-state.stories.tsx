import type { Meta, StoryObj } from "@storybook/react"
import { Inbox, Activity, GitBranch, Layers } from "lucide-react"

import { Button } from "./button"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { EmptyState } from "./empty-state"

const meta: Meta<typeof EmptyState> = {
  title: "Components/EmptyState",
  component: EmptyState,
  argTypes: {
    variant: {
      control: "select",
      options: ["zero-state", "no-results"],
    },
    size: {
      control: "select",
      options: ["md", "sm"],
    },
    title: { control: "text" },
    subtitle: { control: "text" },
  },
  args: {
    variant: "zero-state",
    size: "md",
    title: "No active runs",
    subtitle: "Runs you start will appear here.",
  },
  parameters: { layout: "padded" },
}

export default meta
type Story = StoryObj<typeof meta>

// ── Playground ────────────────────────────────────────────────────────────────

export const Playground: Story = {
  render: (args) => (
    <div style={{ width: 480 }} className="border border-border rounded-surface bg-panel">
      <EmptyState {...args} icon={args.variant === "zero-state" ? Inbox : undefined} />
    </div>
  ),
}

// ── Variants ──────────────────────────────────────────────────────────────────
// zero-state: icon container + title + subtitle + optional CTA
// no-results: text only, no icon

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-6" style={{ width: 480 }}>
      <div className="border border-border rounded-surface bg-panel">
        <EmptyState
          variant="zero-state"
          icon={Activity}
          title="No active runs"
          subtitle="Runs you start will appear here."
          cta={
            <Button variant="secondary">
              Start a run
            </Button>
          }
        />
      </div>
      <div className="border border-border rounded-surface bg-panel">
        <EmptyState
          variant="no-results"
          title="No matches"
          subtitle="Adjust your filters or clear the search."
        />
      </div>
    </div>
  ),
}

// ── Sizes ─────────────────────────────────────────────────────────────────────
// md (default): full-panel empty states — 48×48 icon container, py-12
// sm: inline/compact — no icon, py-6 (for command palette, combobox)

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-6" style={{ width: 480 }}>
      <div>
        <p className="text-caption text-muted-foreground mb-2 ml-1">size=&quot;md&quot; (default)</p>
        <div className="border border-border rounded-surface bg-panel">
          <EmptyState
            variant="zero-state"
            size="md"
            icon={GitBranch}
            title="No eval configs"
            subtitle="Eval configs you create will appear here."
          />
        </div>
      </div>
      <div>
        <p className="text-caption text-muted-foreground mb-2 ml-1">size=&quot;sm&quot; (compact — icon suppressed)</p>
        <div className="border border-border rounded-surface bg-panel" style={{ width: 320 }}>
          <EmptyState
            variant="no-results"
            size="sm"
            title="No results"
          />
        </div>
      </div>
    </div>
  ),
}

// ── WithCta ───────────────────────────────────────────────────────────────────

export const WithCta: Story = {
  render: () => (
    <div className="border border-border rounded-surface bg-panel" style={{ width: 480 }}>
      <EmptyState
        variant="zero-state"
        icon={Layers}
        title="No environments"
        subtitle="Sandbox environments you create will appear here."
        cta={
          <Button variant="secondary">
            Create environment
          </Button>
        }
      />
    </div>
  ),
}

// ── InCard ────────────────────────────────────────────────────────────────────
// Typical use: list-shell Card showing empty state when zero items.

export const InCard: Story = {
  render: () => (
    <Card style={{ width: 480 }}>
      <CardHeader>
        <CardTitle>Recent runs</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <EmptyState
          variant="zero-state"
          icon={Activity}
          title="No active runs"
          subtitle="Runs you start will appear here."
          cta={
            <Button variant="ghost">
              Start a run
            </Button>
          }
        />
      </CardContent>
    </Card>
  ),
}

// ── NoResultsSmall ────────────────────────────────────────────────────────────
// Demonstrates the no-results + sm combination used inside command palette / combobox.

export const NoResultsSmall: Story = {
  render: () => (
    <div
      className="border border-border rounded-surface bg-popover shadow-popover"
      style={{ width: 320 }}
    >
      <EmptyState
        variant="no-results"
        size="sm"
        title="No results"
      />
    </div>
  ),
}
