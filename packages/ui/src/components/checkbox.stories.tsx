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
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Checkbox size="md" aria-label="Unchecked md" />
        <Checkbox size="md" checked aria-label="Checked md" onCheckedChange={() => {}} />
        <Checkbox size="md" checked="indeterminate" aria-label="Indeterminate md" onCheckedChange={() => {}} />
        <Checkbox size="md" disabled aria-label="Disabled unchecked md" />
        <Checkbox size="md" disabled checked aria-label="Disabled checked md" onCheckedChange={() => {}} />
        <Checkbox size="md" aria-invalid aria-label="Error unchecked md" />
      </div>
      <div className="flex items-center gap-4">
        <Checkbox size="sm" aria-label="Unchecked sm" />
        <Checkbox size="sm" checked aria-label="Checked sm" onCheckedChange={() => {}} />
        <Checkbox size="sm" checked="indeterminate" aria-label="Indeterminate sm" onCheckedChange={() => {}} />
        <Checkbox size="sm" disabled aria-label="Disabled unchecked sm" />
        <Checkbox size="sm" disabled checked aria-label="Disabled checked sm" onCheckedChange={() => {}} />
        <Checkbox size="sm" aria-invalid aria-label="Error unchecked sm" />
      </div>
    </div>
  ),
}
