import type { Meta, StoryObj } from "@storybook/react"

import {
  AlertTriangle,
  CheckCircle2,
  Info,
  OctagonX,
} from "lucide-react"
import { Alert, AlertTitle, AlertDescription } from "./alert"

const meta: Meta<typeof Alert> = {
  title: "Components/Alert",
  component: Alert,
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "warning", "success", "info"],
    },
  },
  args: {
    variant: "default",
  },
  parameters: { layout: "padded" },
}

export default meta
type Story = StoryObj<typeof meta>

// ── Playground ────────────────────────────────────────────────────────────────

export const Playground: Story = {
  render: (args) => (
    <Alert {...args}>
      <Info className="h-4 w-4" />
      <AlertTitle>Heads up</AlertTitle>
      <AlertDescription>
        Sandbox environments spin up in under one second. Configure your eval run before deploying.
      </AlertDescription>
    </Alert>
  ),
}

// ── Variants ──────────────────────────────────────────────────────────────────
// All five variants side-by-side. Title color changes per variant; description
// stays at muted-foreground (secondary). Icon inherits variant color via currentColor.

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4" style={{ maxWidth: 600 }}>
      <Alert variant="default">
        <Info className="h-4 w-4" />
        <AlertTitle>Default — neutral notice</AlertTitle>
        <AlertDescription>
          Low-priority information that needs no action. Uses muted surface and standard foreground.
        </AlertDescription>
      </Alert>
      <Alert variant="info">
        <Info className="h-4 w-4" />
        <AlertTitle>Info — contextual detail</AlertTitle>
        <AlertDescription>
          Helpful context about the current state. Title and icon render in the blue info color.
        </AlertDescription>
      </Alert>
      <Alert variant="success">
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>Success — operation completed</AlertTitle>
        <AlertDescription>
          A step finished without errors. Title and icon render in the green success color.
        </AlertDescription>
      </Alert>
      <Alert variant="warning">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Warning — attention required</AlertTitle>
        <AlertDescription>
          Something may need your attention soon. Title and icon render in the amber warning color.
        </AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <OctagonX className="h-4 w-4" />
        <AlertTitle>Destructive — error or danger</AlertTitle>
        <AlertDescription>
          An error occurred or a destructive action is pending. Title and icon render in the red error color.
        </AlertDescription>
      </Alert>
    </div>
  ),
}

// ── State: WithoutIcon ────────────────────────────────────────────────────────
// No SVG child — grid collapses to single-column (grid-cols-[0_1fr] baseline)

export const WithoutIcon: Story = {
  render: () => (
    <Alert style={{ maxWidth: 600 }}>
      <AlertTitle>Sandbox ready</AlertTitle>
      <AlertDescription>
        Your environment is live and accepting connections.
      </AlertDescription>
    </Alert>
  ),
}
