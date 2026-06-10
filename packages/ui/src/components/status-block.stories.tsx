import type { Meta, StoryObj } from "@storybook/react"

import { Progress } from "./progress"
import { StatusBlock } from "./status-block"

const meta: Meta<typeof StatusBlock> = {
  title: "Components/StatusBlock",
  component: StatusBlock,
  argTypes: {
    tone: {
      control: "select",
      options: ["default", "destructive"],
    },
  },
  args: {
    tone: "default",
  },
  // Width matches sidebar inner area: 248px sidebar - 24px mx-3 margins = 224px
  decorators: [
    (Story) => (
      <div className="w-[224px] bg-card p-3">
        <Story />
      </div>
    ),
  ],
  parameters: { layout: "centered" },
}

export default meta
type Story = StoryObj<typeof meta>

// ── Shared children ───────────────────────────────────────────────────────────
// Rendered inside both Default and Destructive to isolate the tone diff.

function SampleChildren() {
  return (
    <>
      <div className="flex items-baseline justify-between font-mono text-[11px]"> {/* eslint-disable-line no-restricted-syntax -- no 11px text token; matches StatusBlock internal layout */}
        <span className="text-muted-foreground">quota</span>
        <span className="font-medium text-foreground tabular-nums">8,400 / 10,000</span>
      </div>
      <p className="mt-1.5 font-mono text-[11px] text-meta-foreground"> {/* eslint-disable-line no-restricted-syntax -- no 11px text token */}
        ~120 units/hr · ~14h left
      </p>
    </>
  )
}

// ── Default ───────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: (args) => (
    <StatusBlock {...args} tone="default">
      <SampleChildren />
    </StatusBlock>
  ),
}

// ── Destructive ───────────────────────────────────────────────────────────────

export const Destructive: Story = {
  render: (args) => (
    <StatusBlock {...args} tone="destructive">
      <SampleChildren />
    </StatusBlock>
  ),
}

// ── WithProgressAndAction ────────────────────────────────────────────────────
// Mirrors the credits use case structurally: label/value row + Progress +
// status/action row. Uses generic copy — no domain concepts.

export const WithProgressAndAction: Story = {
  render: (args) => (
    <StatusBlock {...args} tone="destructive">
      <div className="font-mono text-[11px] font-medium">items</div> {/* eslint-disable-line no-restricted-syntax -- no 11px text token */}
      <div className="mt-0.5 text-right font-mono text-[11px] font-semibold tabular-nums"> {/* eslint-disable-line no-restricted-syntax -- no 11px text token */}
        0 / 100
      </div>
      <div className="mt-1.5">
        <Progress value={0} state="error" aria-hidden="true" />
      </div>
      <div className="mt-1.5 flex items-baseline justify-between gap-2 font-mono text-[11px] font-medium"> {/* eslint-disable-line no-restricted-syntax -- no 11px text token */}
        <span>No items remaining</span>
        <a href="#" className="whitespace-nowrap hover:underline">
          Add Items →
        </a>
      </div>
    </StatusBlock>
  ),
}
