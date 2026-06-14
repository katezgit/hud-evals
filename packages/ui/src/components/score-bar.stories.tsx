import type { Meta, StoryObj } from "@storybook/react"
import { ScoreBar } from "./score-bar"

/* ─── Meta ─────────────────────────────────────────────────────────────────── */

const meta: Meta<typeof ScoreBar> = {
  title: "Components/ScoreBar",
  component: ScoreBar,
  parameters: { layout: "padded" },
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
    threshold: { control: { type: "range", min: 0, max: 100, step: 1 } },
  },
  args: {
    value: 70,
    threshold: 50,
  },
}

export default meta
type Story = StoryObj<typeof meta>

/* ─── Playground ───────────────────────────────────────────────────────────── */

export const Playground: Story = {}

/* ─── States ────────────────────────────────────────────────────────────────── */

/** score ≥ 50 → bg-state-scored (green) fill */
export const Default: Story = {
  args: { value: 70 },
}

/** score < 50 → bg-state-warning (amber) fill */
export const LowScore: Story = {
  args: { value: 30 },
}

/** value === threshold: ≥ threshold so falls into the high (scored) band */
export const BoundaryAt50: Story = {
  args: { value: 50 },
}

/** value=0: fill collapses to 0 width, track still visible */
export const ZeroPercent: Story = {
  args: { value: 0 },
}

/** value=100: fill spans full track width */
export const HundredPercent: Story = {
  args: { value: 100 },
}

/** threshold=75, value=60: value < threshold → warning fill, demonstrating the threshold knob */
export const CustomThreshold: Story = {
  args: { value: 60, threshold: 75 },
}

/* ─── Composition ───────────────────────────────────────────────────────────── */

/**
 * Canonical consumer pattern: ScoreBar + adjacent numeric label in a flex row.
 * The bar is aria-hidden; the numeric span is what screen readers announce.
 */
export const InContext: Story = {
  render: () => (
    <span className="flex items-center gap-2">
      <ScoreBar value={72} />
      <span className="font-mono text-caption tabular-nums text-muted-foreground">
        72%
      </span>
    </span>
  ),
}

/* ─── Misuse ────────────────────────────────────────────────────────────────── */

/**
 * ANTI-PATTERN — do not copy. Without an adjacent numeric `<span>{value}%</span>`,
 * the bar is invisible to screen readers and conveys score tier via color alone.
 * See README §Accessibility for the composition contract.
 */
export const Misuse_NoNumericLabel: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "**ANTI-PATTERN — do not copy.** Without an adjacent numeric `<span>{value}%</span>`, the bar is invisible to screen readers and conveys score tier via color alone. See README §Accessibility for the composition contract.",
      },
    },
  },
  render: () => <ScoreBar value={47} />,
}
