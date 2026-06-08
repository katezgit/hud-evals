import type { Meta, StoryObj } from "@storybook/react"
import { Plus, ArrowRight } from "lucide-react"
import { Button } from "./button"

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
    size: {
      control: "select",
      options: ["md", "sm"],
    },
    disabled: { control: "boolean" },
    asChild: { control: "boolean" },
    children: { control: "text" },
  },
  args: {
    children: "Button",
    variant: "primary",
    size: "md",
    disabled: false,
  },
}

export default meta
type Story = StoryObj<typeof meta>

/* ─── Playground ───────────────────────────────────────────────────────────── */

export const Playground: Story = {}

/* ─── Variants ─────────────────────────────────────────────────────────────── */
// All variants × sizes × disabled × leading/trailing icon in one view.

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
        <Button size="md">Medium (32px)</Button>
        <Button size="sm">Small (28px)</Button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" disabled>Primary disabled</Button>
        <Button variant="secondary" disabled>Secondary disabled</Button>
        <Button variant="ghost" disabled>Ghost disabled</Button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary">
          <Plus className="h-4 w-4" />
          Leading icon
        </Button>
        <Button variant="secondary">
          Trailing icon
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  ),
}
