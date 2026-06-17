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
    wordmark: { control: "boolean" },
  },
  args: {
    size:     "default",
    wordmark: true,
  },
}

export default meta
type Story = StoryObj<typeof meta>

// ── Default — hero/onboarding context (size=default + wordmark) ───────────────

export const Default: Story = {
  args: { size: "default" },
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

// ── Small — auth-card context (size=sm + wordmark) ────────────────────────────

export const Small: Story = {
  name: "Small (auth-card)",
  args: { size: "sm" },
  render: (args) => (
    <div className="flex items-center justify-center p-8 bg-background rounded-lg border border-border">
      <BrandMark {...args} />
    </div>
  ),
}

// ── BrandMarkSquare convenience alias — default + sm sizes ────────────────────

export const Square: Story = {
  name: "BrandMarkSquare (alias)",
  render: () => (
    <div className="flex items-center gap-6 justify-center p-8 bg-background rounded-lg border border-border">
      <BrandMarkSquare size="default" />
      <BrandMarkSquare size="sm" />
    </div>
  ),
}

// ── On brand surface — wordmark override to white (brand-panel use case) ──────

export const OnBrandSurface: Story = {
  name: "On brand surface (wordmark override)",
  render: () => (
    <div
      className="flex items-center justify-center p-8 rounded-lg"
      style={{ background: "var(--color-brand-surface)" }}
    >
      <BrandMark className="[&>span:last-child]:text-white" />
    </div>
  ),
}
