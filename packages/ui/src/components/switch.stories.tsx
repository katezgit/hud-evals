import type { Meta, StoryObj } from "@storybook/react"
import { Switch } from "./switch"

const meta: Meta<typeof Switch> = {
  title: "Components/Switch",
  component: Switch,
  argTypes: {
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
    size: {
      control: "select",
      options: ["md", "sm"],
    },
  },
  args: {
    checked: false,
    disabled: false,
    size: "md",
    "aria-label": "Toggle feature",
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <Switch aria-label="md size off" />
          <span className="text-xs text-muted-foreground">md off</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Switch defaultChecked aria-label="md size on" />
          <span className="text-xs text-muted-foreground">md on</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Switch size="sm" aria-label="sm off" />
          <span className="text-xs text-muted-foreground">sm off</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Switch size="sm" defaultChecked aria-label="sm on" />
          <span className="text-xs text-muted-foreground">sm on</span>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <Switch disabled aria-label="Disabled off" />
          <span className="text-xs text-muted-foreground">disabled off</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Switch disabled checked onCheckedChange={() => {}} aria-label="Disabled on" />
          <span className="text-xs text-muted-foreground">disabled on</span>
        </div>
      </div>
    </div>
  ),
}
