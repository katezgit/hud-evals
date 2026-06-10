import type { Meta, StoryObj } from "@storybook/react"

import { Checkbox } from "./checkbox"

const meta: Meta<typeof Checkbox> = {
  title: "Components/Checkbox",
  component: Checkbox,
  argTypes: {
    size: {
      control: "select",
      options: ["md", "sm"],
    },
    checked: {
      control: "select",
      options: [true, false, "indeterminate"],
    },
    disabled: { control: "boolean" },
    "aria-invalid": { control: "boolean" },
  },
  args: {
    size: "md",
    disabled: false,
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    "aria-label": "Playground checkbox",
  },
}

export const Variants: Story = {
  render: () => (
    <div
      className="grid items-center gap-4"
      style={{ gridTemplateColumns: "auto repeat(6, minmax(0, max-content))" }}
    >
      {/* Header row */}
      <span className="text-label font-medium text-muted-foreground">Size</span>
      <span className="text-label font-medium text-muted-foreground">Unchecked</span>
      <span className="text-label font-medium text-muted-foreground">Checked</span>
      <span className="text-label font-medium text-muted-foreground">Indeterminate</span>
      <span className="text-label font-medium text-muted-foreground">Disabled</span>
      <span className="text-label font-medium text-muted-foreground">Disabled · Checked</span>
      <span className="text-label font-medium text-muted-foreground">Error</span>

      {/* md row */}
      <span className="text-label font-medium text-muted-foreground">md</span>
      <Checkbox size="md" aria-label="Unchecked md" />
      <Checkbox size="md" checked aria-label="Checked md" onCheckedChange={() => {}} />
      <Checkbox size="md" checked="indeterminate" aria-label="Indeterminate md" onCheckedChange={() => {}} />
      <Checkbox size="md" disabled aria-label="Disabled unchecked md" />
      <Checkbox size="md" disabled checked aria-label="Disabled checked md" onCheckedChange={() => {}} />
      <Checkbox size="md" aria-invalid aria-label="Error unchecked md" />

      {/* sm row */}
      <span className="text-label font-medium text-muted-foreground">sm</span>
      <Checkbox size="sm" aria-label="Unchecked sm" />
      <Checkbox size="sm" checked aria-label="Checked sm" onCheckedChange={() => {}} />
      <Checkbox size="sm" checked="indeterminate" aria-label="Indeterminate sm" onCheckedChange={() => {}} />
      <Checkbox size="sm" disabled aria-label="Disabled unchecked sm" />
      <Checkbox size="sm" disabled checked aria-label="Disabled checked sm" onCheckedChange={() => {}} />
      <Checkbox size="sm" aria-invalid aria-label="Error unchecked sm" />
    </div>
  ),
}
