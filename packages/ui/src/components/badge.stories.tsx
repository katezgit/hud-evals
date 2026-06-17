import type { Meta, StoryObj } from "@storybook/react"
import { Badge } from "./badge"

const meta: Meta<typeof Badge> = {
  title: "Components/Badge",
  component: Badge,
  argTypes: {
    variant: {
      control: "select",
      options: ["neutral", "success", "running", "info", "beta", "warning", "destructive"],
    },
    showDot: { control: "boolean" },
    children: { control: "text" },
  },
  args: {
    children: "Badge",
    variant: "neutral",
    showDot: false,
  },
}

export default meta
type Story = StoryObj<typeof meta>

// ── Playground ────────────────────────────────────────────────────────────────
export const Playground: Story = {}

// ── Variants ──────────────────────────────────────────────────────────────────
// All variants × sizes × dot states grouped.
export const Variants: Story = {
  args: {
    showDot: true
  },

  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <Badge variant="neutral">Neutral</Badge>
        <Badge variant="info">Info</Badge>
        <Badge variant="beta">Beta</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="running">Running</Badge>
        <Badge variant="warning">Warning</Badge>
        <Badge variant="destructive">Destructive</Badge>
      </div>
      <div className="flex flex-wrap gap-3">
        <Badge variant="success" showDot>Scored</Badge>
        <Badge variant="running" showDot>Running</Badge>
        <Badge variant="warning" showDot>Warning</Badge>
        <Badge variant="destructive" showDot>Errored</Badge>
      </div>
    </div>
  )
}
