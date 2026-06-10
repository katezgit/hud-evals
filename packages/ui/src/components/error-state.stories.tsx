import type { Meta, StoryObj } from "@storybook/react"

import { Button } from "./button"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { ErrorState } from "./error-state"

const meta: Meta<typeof ErrorState> = {
  title: "Components/ErrorState",
  component: ErrorState,
  argTypes: {
    title: { control: "text" },
    subtitle: { control: "text" },
  },
  args: {
    title: "Couldn't load runs",
    subtitle: "Something went wrong loading the run list. Your data is intact.",
  },
  parameters: { layout: "padded" },
}

export default meta
type Story = StoryObj<typeof meta>

// ── Playground ────────────────────────────────────────────────────────────────

export const Playground: Story = {
  render: (args) => (
    <div style={{ width: 480 }} className="border border-border rounded-surface bg-panel">
      <ErrorState
        {...args}
        action={
          <Button variant="secondary">
            Try again
          </Button>
        }
      />
    </div>
  ),
}

// ── Default ───────────────────────────────────────────────────────────────────
// Standard treatment: AlertCircle icon + title + subtitle + retry action.

export const Default: Story = {
  render: () => (
    <div className="border border-border rounded-surface bg-panel" style={{ width: 480 }}>
      <ErrorState
        title="Couldn't load runs"
        subtitle="Something went wrong loading the run list. Your data is intact."
        action={
          <Button variant="secondary">
            Try again
          </Button>
        }
      />
    </div>
  ),
}

// ── NoIcon ────────────────────────────────────────────────────────────────────
// Compact panel context — icon={null} suppresses the icon container entirely.

export const NoIcon: Story = {
  render: () => (
    <div className="border border-border rounded-surface bg-panel" style={{ width: 360 }}>
      <ErrorState
        icon={null}
        title="Couldn't load traces"
        action={
          <Button variant="ghost">
            Retry
          </Button>
        }
      />
    </div>
  ),
}

// ── NoSubtitle ────────────────────────────────────────────────────────────────
// Minimal form: title + action only.

export const NoSubtitle: Story = {
  render: () => (
    <div className="border border-border rounded-surface bg-panel" style={{ width: 480 }}>
      <ErrorState
        title="Something went wrong"
        action={
          <Button variant="secondary">
            Try again
          </Button>
        }
      />
    </div>
  ),
}

// ── MultipleActions ───────────────────────────────────────────────────────────
// Two recovery actions: primary retry + secondary navigation escape.

export const MultipleActions: Story = {
  render: () => (
    <div className="border border-border rounded-surface bg-panel" style={{ width: 480 }}>
      <ErrorState
        title="Couldn't load this eval"
        subtitle="Something went wrong. Your data is intact."
        action={
          <div className="flex flex-col items-center gap-2 sm:flex-row">
            <Button variant="secondary">
              Try again
            </Button>
            <Button variant="ghost">
              Go to runs
            </Button>
          </div>
        }
      />
    </div>
  ),
}

// ── InCard ────────────────────────────────────────────────────────────────────
// Typical use: a card region that failed to load its content.

export const InCard: Story = {
  render: () => (
    <Card style={{ width: 480 }}>
      <CardHeader>
        <CardTitle>Recent runs</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ErrorState
          title="Couldn't load runs"
          subtitle="Something went wrong. Your data is intact."
          action={
            <Button variant="secondary">
              Try again
            </Button>
          }
        />
      </CardContent>
    </Card>
  ),
}
