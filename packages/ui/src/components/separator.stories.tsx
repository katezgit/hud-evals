import type { Meta, StoryObj } from "@storybook/react"
import { Separator } from "./separator"

const meta: Meta<typeof Separator> = {
  title: "Components/Separator",
  component: Separator,
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
    decorative: { control: "boolean" },
  },
  args: {
    orientation: "horizontal",
    decorative: true,
  },
}

export default meta
type Story = StoryObj<typeof meta>

// ── Playground ────────────────────────────────────────────────────────────────
export const Playground: Story = {
  render: (args) => (
    <div className="flex items-center justify-center p-8">
      {args.orientation === "vertical" ? (
        <div className="flex h-8 items-center">
          <Separator {...args} />
        </div>
      ) : (
        <div className="w-64">
          <Separator {...args} />
        </div>
      )}
    </div>
  ),
}

// ── Variants ──────────────────────────────────────────────────────────────────
// Both orientations.

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <p className="mb-2 text-xs text-muted-foreground">Horizontal</p>
        <Separator orientation="horizontal" />
      </div>
      <div>
        <p className="mb-2 text-xs text-muted-foreground">Vertical</p>
        <div className="flex h-8 items-center">
          <Separator orientation="vertical" />
        </div>
      </div>
    </div>
  ),
}
