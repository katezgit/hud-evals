import type { Meta, StoryObj } from "@storybook/react"
import { Skeleton } from "./skeleton"

const meta: Meta<typeof Skeleton> = {
  title: "Components/Skeleton",
  component: Skeleton,
  argTypes: {
    className: { control: "text" },
  },
  args: {
    className: "h-10 w-48 rounded-lg",
  },
}

export default meta
type Story = StoryObj<typeof meta>

// ── Playground ────────────────────────────────────────────────────────────────
export const Playground: Story = {}

// ── Shapes — consumer controls radius via className ───────────────────────────
export const Shapes: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-xs text-muted-foreground font-mono">text rows (rounded-sm)</span>
        <Skeleton className="h-3 w-full rounded-sm" />
        <Skeleton className="h-3 w-3/4 rounded-sm" />
        <Skeleton className="h-3 w-1/2 rounded-sm" />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs text-muted-foreground font-mono">avatars (rounded-full)</span>
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs text-muted-foreground font-mono">block card (rounded-lg)</span>
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    </div>
  ),
}
