import type { Meta, StoryObj } from "@storybook/react"
import { Textarea } from "./textarea"

const meta: Meta<typeof Textarea> = {
  title: "Components/Textarea",
  component: Textarea,
  argTypes: {
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    "aria-invalid": { control: "boolean" },
    rows: { control: { type: "number", min: 2, max: 20 } },
  },
  args: {
    placeholder: "Enter description…",
    disabled: false,
    rows: 4,
  },
  parameters: { layout: "padded" },
}

export default meta
type Story = StoryObj<typeof meta>

// ── Playground ────────────────────────────────────────────────────────────────

export const Playground: Story = {
  render: (args) => (
    <div style={{ width: 400 }}>
      <Textarea {...args} />
    </div>
  ),
}

// ── Variants ──────────────────────────────────────────────────────────────────
// All meaningful states: empty, with value, disabled, error.

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-3" style={{ width: 400 }}>
      <Textarea placeholder="Empty (default)" rows={3} />
      <Textarea
        defaultValue={`Baseline evaluation of claude-3-5-sonnet on SWE-bench Verified.
Parallelism: 4 agents, timeout: 30s per step.`}
        rows={3}
      />
      <Textarea placeholder="Disabled empty" disabled rows={3} />
      <Textarea defaultValue="Read-only content." disabled readOnly rows={3} />
      <Textarea
        aria-invalid
        placeholder="Description is required."
        aria-describedby="textarea-error"
        rows={3}
      />
    </div>
  ),
}
