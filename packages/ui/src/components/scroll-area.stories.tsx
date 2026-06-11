import type { Meta, StoryObj } from "@storybook/react"
import { ScrollArea, ScrollBar } from "./scroll-area"

const meta: Meta<typeof ScrollArea> = {
  title: "Components/ScrollArea",
  component: ScrollArea,
  parameters: { layout: "padded" },
}

export default meta
type Story = StoryObj<typeof meta>

// ── Fixtures ──────────────────────────────────────────────────────────────────

const EVAL_NAMES = [
  "frontier-reasoning-v1",
  "agent-harness-baseline",
  "code-exec-sandbox-a",
  "safety-red-team-2024",
  "grpo-reward-signal-v3",
  "math-competition-bench",
  "web-navigation-agent",
  "tool-use-chain-eval",
  "multimodal-vision-v2",
  "llm-judge-calibration",
  "rl-env-latency-suite",
  "post-training-delta",
  "instruction-follow-v4",
  "context-window-stress",
]

// ── Playground ────────────────────────────────────────────────────────────────

export const Playground: Story = {
  render: () => (
    <ScrollArea className="h-72 w-80 rounded-md border border-border bg-card">
      <div className="p-4">
        {EVAL_NAMES.map((name) => (
          <div
            key={name}
            className="border-b border-border py-2 text-sm font-mono text-foreground last:border-0"
          >
            {name}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
}

// ── Variants — orientation ────────────────────────────────────────────────────

export const Variants: Story = {
  name: "Variants — orientation",
  render: () => (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Vertical (default)
        </span>
        <ScrollArea className="h-48 w-72 rounded-md border border-border bg-card">
          <div className="p-4">
            {EVAL_NAMES.map((name) => (
              <div
                key={name}
                className="border-b border-border py-2 text-sm font-mono text-foreground last:border-0"
              >
                {name}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Horizontal
        </span>
        <ScrollArea className="w-72 rounded-md border border-border bg-card">
          <div className="flex w-max gap-4 p-4">
            {EVAL_NAMES.slice(0, 6).map((name) => (
              <div
                key={name}
                className="shrink-0 rounded-md border border-border bg-muted-surface px-3 py-2 text-sm font-mono text-foreground"
              >
                {name}
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  ),
}
