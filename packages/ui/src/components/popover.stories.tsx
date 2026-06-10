import type { Meta, StoryObj } from "@storybook/react"
import { Button } from "./button"
import {
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverItem,
  PopoverLabel,
  PopoverSeparator,
  PopoverTrigger,
  PopoverValue,
} from "./popover"

const meta: Meta<typeof PopoverContent> = {
  title: "Components/Popover",
  component: PopoverContent,
  argTypes: {
    variant: {
      control: "select",
      options: ["informational", "filter", "action"],
    },
    side: {
      control: "select",
      options: ["top", "right", "bottom", "left"],
    },
    align: {
      control: "select",
      options: ["start", "center", "end"],
    },
    sideOffset: { control: "number" },
  },
  args: {
    variant: "informational",
    side: "bottom",
    align: "center",
    sideOffset: 8,
  },
  parameters: { layout: "centered" },
}

export default meta
type Story = StoryObj<typeof meta>

// ── Playground ────────────────────────────────────────────────────────────────

export const Playground: Story = {
  render: (args) => (
    <Popover defaultOpen>
      <PopoverTrigger asChild>
        <Button variant="secondary">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent {...args}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-4">
            <PopoverLabel>Model</PopoverLabel>
            <PopoverValue>claude-3-5-sonnet</PopoverValue>
          </div>
          <div className="flex items-center justify-between gap-4">
            <PopoverLabel>Environment</PopoverLabel>
            <PopoverValue>sandbox-prod</PopoverValue>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
}

// ── Variants ──────────────────────────────────────────────────────────────────
// informational / filter / action variants + arrow + disabled item.

export const Variants: Story = {
  render: () => (
    <div className="flex items-start gap-8">
      {/* informational */}
      <Popover defaultOpen>
        <PopoverTrigger asChild>
          <Button variant="secondary">Informational</Button>
        </PopoverTrigger>
        <PopoverContent variant="informational">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-4">
              <PopoverLabel>Cost</PopoverLabel>
              <PopoverValue>$0.0042</PopoverValue>
            </div>
            <div className="flex items-center justify-between gap-4">
              <PopoverLabel>Tokens</PopoverLabel>
              <PopoverValue>1,248</PopoverValue>
            </div>
          </div>
          <PopoverArrow />
        </PopoverContent>
      </Popover>

      {/* action */}
      <Popover defaultOpen>
        <PopoverTrigger asChild>
          <Button variant="secondary">Action</Button>
        </PopoverTrigger>
        <PopoverContent variant="action">
          <PopoverItem>Duplicate</PopoverItem>
          <PopoverItem>Rename</PopoverItem>
          <PopoverItem disabled>Archive (unavailable)</PopoverItem>
          <PopoverSeparator />
          <PopoverItem className="text-destructive hover:text-destructive">Delete</PopoverItem>
        </PopoverContent>
      </Popover>
    </div>
  ),
  parameters: { layout: "padded" },
}
