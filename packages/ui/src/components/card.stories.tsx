import type { Meta, StoryObj } from "@storybook/react"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "./card"

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "elevated", "interactive", "selected"],
    },
  },
  args: {
    variant: "default",
  },
  parameters: { layout: "padded" },
}

export default meta
type Story = StoryObj<typeof meta>

// ── Playground ───────────────────────────────────────────────────────────────

export const Playground: Story = {
  render: (args) => (
    <Card {...args} style={{ width: 360 }}>
      <CardHeader>
        <CardTitle>Eval Run #42</CardTitle>
        <CardDescription>SWE-bench — 128 tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-body text-muted-foreground">
          94 tasks scored, 34 in review.
        </p>
      </CardContent>
      <CardFooter>
        <span className="text-caption text-muted-foreground">Last updated 2 min ago</span>
      </CardFooter>
    </Card>
  ),
}

// ── Variants ─────────────────────────────────────────────────────────────────
// All four surface variants + CardAction slot.

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-6" style={{ width: 360 }}>
      {(["default", "elevated", "interactive", "selected"] as const).map((variant) => (
        <Card key={variant} variant={variant}>
          <CardHeader>
            <CardTitle>{variant.charAt(0).toUpperCase() + variant.slice(1)}</CardTitle>
            <CardDescription>variant=&quot;{variant}&quot;</CardDescription>
            <CardAction>
              <button
                className="text-caption text-muted-foreground border border-border rounded-surface px-2 py-1 cursor-pointer"
                type="button"
              >
                View
              </button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p className="text-caption text-muted-foreground">Card body.</p>
          </CardContent>
        </Card>
      ))}
    </div>
  ),
}
