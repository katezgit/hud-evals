import type { Meta, StoryObj } from "@storybook/react"
import { Progress } from "./progress"

const meta: Meta<typeof Progress> = {
  title: "Components/Progress",
  component: Progress,
  argTypes: {
    value: {
      control: { type: "range", min: 0, max: 100, step: 1 },
    },
    size: {
      control: "select",
      options: ["sm", "md"],
    },
    state: {
      control: "select",
      options: ["default", "success", "warning", "error", "neutral"],
    },
    indeterminate: { control: "boolean" },
    label: { control: "text" },
    valueLabel: { control: "text" },
  },
  args: {
    value: 47,
    size: "sm",
    state: "default",
    indeterminate: false,
    label: undefined,
    valueLabel: undefined,
  },
}

export default meta
type Story = StoryObj<typeof meta>

// ── Playground ────────────────────────────────────────────────────────────────

export const Playground: Story = {}

// ── Sizes ─────────────────────────────────────────────────────────────────────

export const Sizes: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-caption text-muted-foreground">sm — 4px (default)</span>
        <Progress value={60} size="sm" />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-caption text-muted-foreground">md — 6px</span>
        <Progress value={60} size="md" />
      </div>
    </div>
  ),
}

// ── States ────────────────────────────────────────────────────────────────────

export const States: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-caption text-muted-foreground">default — teal gradient</span>
        <Progress value={60} state="default" />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-caption text-muted-foreground">success — state-scored</span>
        <Progress value={60} state="success" />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-caption text-muted-foreground">warning — state-warning</span>
        <Progress value={60} state="warning" />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-caption text-muted-foreground">error — state-errored</span>
        <Progress value={60} state="error" />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-caption text-muted-foreground">neutral — secondary-surface (passive reading, no glow)</span>
        <Progress value={18} state="neutral" />
      </div>
    </div>
  ),
}

// ── With Labels ───────────────────────────────────────────────────────────────

export const WithLabels: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-6">
      <Progress value={47} label="Eval progress" valueLabel="47%" />
      <Progress value={100} label="Training run" valueLabel="Complete" state="default" />
      <Progress value={23} label="Scoring" valueLabel="23 / 100" state="success" />
      <Progress value={80} label="Warning threshold" valueLabel="80%" state="warning" />
      <Progress
        value={0}
        label="Only left label"
      />
      <Progress value={60} valueLabel="60%" />
    </div>
  ),
}

// ── Indeterminate ─────────────────────────────────────────────────────────────

export const Indeterminate: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-4">
      <span className="text-caption text-muted-foreground">Indeterminate sweep (teal gradient)</span>
      <Progress indeterminate />
      <Progress indeterminate size="md" label="Loading…" />
    </div>
  ),
}

// ── Complete vs InProgress ────────────────────────────────────────────────────

export const CompleteVsInProgress: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-caption text-muted-foreground">In-progress — teal gradient</span>
        <Progress value={60} />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-caption text-muted-foreground">Complete — teal flat + glow bump</span>
        <Progress value={100} />
      </div>
    </div>
  ),
}
