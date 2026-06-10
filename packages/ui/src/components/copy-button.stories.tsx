import type { Meta, StoryObj } from "@storybook/react"

import { TooltipProvider } from "./tooltip"
import { CopyButton } from "./copy-button"

/* ─── Meta ─────────────────────────────────────────────────────────────────── */

const meta: Meta<typeof CopyButton> = {
  title: "Components/CopyButton",
  component: CopyButton,
  parameters: { layout: "padded" },
  argTypes: {
    value: { control: "text" },
    ariaLabel: { control: "text" },
    tooltipLabel: { control: "text" },
    tooltipCopiedLabel: { control: "text" },
    disabled: { control: "boolean" },
    className: { control: "text" },
  },
  args: {
    value: "abc123",
    tooltipLabel: "Copy",
    tooltipCopiedLabel: "Copied!",
    disabled: false,
  },
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

/* ─── Playground ───────────────────────────────────────────────────────────── */
// All props controllable. Click to trigger the idle → copied → idle cycle.

export const Playground: Story = {}

/* ─── InContext: ID cell ────────────────────────────────────────────────────── */
// Catalog row: monospace ID + adjacent copy button. Shows the default idle color in a realistic row.

export const InContextIDCell: Story = {
  render: () => (
    <div className="flex items-center gap-1.5">
      <span className="font-mono text-meta text-foreground">mdl_a1b2c3d4</span>
      <CopyButton value="mdl_a1b2c3d4" />
    </div>
  ),
}

/* ─── InContext: Label–value row ────────────────────────────────────────────── */
// Model information panel pattern: dt label + dd value + muted copy button.

export const InContextLabelValue: Story = {
  render: () => (
    <dl className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-1">
      <dt className="text-meta text-muted-foreground">Model ID</dt>
      <dd className="flex items-center gap-1">
        <span className="font-mono text-meta text-foreground">mdl_a1b2c3d4</span>
        <CopyButton
          value="mdl_a1b2c3d4"
          className="shrink-0 text-meta-foreground"
        />
      </dd>
      <dt className="text-meta text-muted-foreground">Base model</dt>
      <dd className="flex items-center gap-1">
        <span className="font-mono text-meta text-foreground">claude-3-5-sonnet-20241022</span>
        <CopyButton
          value="claude-3-5-sonnet-20241022"
          className="shrink-0 text-meta-foreground"
        />
      </dd>
    </dl>
  ),
}

/* ─── Disabled ──────────────────────────────────────────────────────────────── */
// No clipboard call occurs; replaces the old DisabledCopyButton pattern.
// Uses aria-disabled (not native disabled) so Radix's hover/focus handlers still
// fire — hover or focus the button to confirm the tooltip appears.

export const Disabled: Story = {
  args: {
    value: "",
    disabled: true,
    ariaLabel: "Copy output (unavailable)",
  },
}

/* ─── Custom labels ─────────────────────────────────────────────────────────── */
// Overrides for ariaLabel, tooltipLabel, and tooltipCopiedLabel.

export const CustomLabels: Story = {
  args: {
    value: "run-2024-11-20-003",
    ariaLabel: "Copy run ID",
    tooltipLabel: "Copy run ID",
    tooltipCopiedLabel: "Run ID copied",
  },
}
