import type { Meta, StoryObj } from "@storybook/react"
import { BrandMark, BrandMarkSquare } from "./brand-mark"

const meta: Meta<typeof BrandMark> = {
  title: "Components/BrandMark",
  component: BrandMark,
  argTypes: {
    size: {
      control: "select",
      options: ["default", "sm"],
    },
    gradient: { control: "boolean" },
    glow:     { control: "boolean" },
    wordmark: { control: "boolean" },
  },
  args: {
    size:     "default",
    gradient: true,
    glow:     true,
    wordmark: true,
  },
}

export default meta
type Story = StoryObj<typeof meta>

// ── Default — sidebar brand row (26×26 mark + HUD wordmark) ──────────────────

export const Default: Story = {
  args: { size: "default" },
  render: (args) => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-center p-8 bg-background rounded-lg border border-border">
        <BrandMark {...args} />
      </div>
      <div className="flex items-center justify-center p-8 rounded-lg bg-panel" style={{ background: "var(--color-panel)" }}>
        <BrandMark {...args} />
      </div>
    </div>
  ),
}

// ── Small — dense toolbar / auth sub-header (20×20 mark) ─────────────────────

export const Small: Story = {
  args: { size: "sm" },
  render: (args) => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-center p-8 bg-background rounded-lg border border-border">
        <BrandMark {...args} />
      </div>
      <div className="flex items-center justify-center p-8 rounded-lg" style={{ background: "var(--color-panel)" }}>
        <BrandMark {...args} />
      </div>
    </div>
  ),
}

// ── Solid (no gradient) ───────────────────────────────────────────────────────

export const SolidFallback: Story = {
  name: "Solid (gradient=false)",
  args: { gradient: false },
  render: (args) => (
    <div className="flex items-center justify-center p-8 bg-background rounded-lg border border-border">
      <BrandMark {...args} />
    </div>
  ),
}

// ── No glow ────────────────────────────────────────────────────────────────────

export const NoGlow: Story = {
  name: "No glow (glow=false)",
  args: { glow: false },
  render: (args) => (
    <div className="flex items-center justify-center p-8 bg-background rounded-lg border border-border">
      <BrandMark {...args} />
    </div>
  ),
}

// ── Mark only (wordmark=false) ────────────────────────────────────────────────

export const MarkOnly: Story = {
  name: "Mark only (wordmark=false)",
  args: { wordmark: false },
  render: (args) => (
    <div className="flex items-center gap-6 justify-center p-8 bg-background rounded-lg border border-border">
      <BrandMark {...args} size="default" />
      <BrandMark {...args} size="sm" />
    </div>
  ),
}

// ── BrandMarkSquare convenience alias ─────────────────────────────────────────

export const Square: Story = {
  name: "BrandMarkSquare (alias)",
  render: () => (
    <div className="flex items-center gap-4 justify-center p-8 bg-background rounded-lg border border-border">
      <BrandMarkSquare size="default" />
      <BrandMarkSquare size="sm" />
    </div>
  ),
}

// ── Both themes side by side (light bg vs dark panel) ────────────────────────

export const ThemeComparison: Story = {
  name: "Theme comparison",
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-8 p-8 bg-background rounded-lg border border-border">
        <span className="text-xs text-muted-foreground font-mono w-16">light</span>
        <BrandMark size="default" />
        <BrandMark size="sm" />
      </div>
      <div
        className="flex items-center gap-8 p-8 rounded-lg"
        data-theme="dark"
        style={{ background: "var(--color-panel)" }}
      >
        <span className="text-xs font-mono w-16" style={{ color: "var(--color-muted-foreground)" }}>dark</span>
        <BrandMark size="default" />
        <BrandMark size="sm" />
      </div>
    </div>
  ),
}
