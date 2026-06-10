import type { Meta, StoryObj } from "@storybook/react"
import * as React from "react"

import { StarCount } from "./star-count"

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta<typeof StarCount> = {
  title: "Components/StarCount",
  component: StarCount,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md"],
    },
    pressed: { control: "boolean" },
    count: { control: "number" },
    label: { control: "text" },
    stopPropagation: { control: "boolean" },
  },
  args: {
    size: "sm",
    pressed: false,
    count: 24,
    label: "hud-browser",
    stopPropagation: true,
  },
}

export default meta
type Story = StoryObj<typeof meta>

// ── Shared inner components (useState must live in named components) ───────────

interface PlaygroundProps {
  count?: number
  size?: "sm" | "md"
  label?: string
  pressed?: boolean
  stopPropagation?: boolean
  className?: string
}

function PlaygroundInner({
  count = 24,
  size = "sm",
  label = "hud-browser",
  pressed: initialPressed = false,
  stopPropagation = true,
  className,
}: PlaygroundProps) {
  const [pressed, setPressed] = React.useState(initialPressed)
  const [displayCount, setDisplayCount] = React.useState(count)

  const handleChange = (next: boolean) => {
    setPressed(next)
    setDisplayCount((c) => (next ? c + 1 : c - 1))
  }

  return (
    <StarCount
      count={displayCount}
      pressed={pressed}
      onPressedChange={handleChange}
      label={label}
      size={size}
      stopPropagation={stopPropagation}
      className={className}
    />
  )
}

// ── Helper ────────────────────────────────────────────────────────────────────

function Row({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="flex items-center gap-4">{children}</div>
    </div>
  )
}

// ── Playground ────────────────────────────────────────────────────────────────

export const Playground: Story = {
  render: (args) => <PlaygroundInner {...args} />,
}

// ── Sizes ─────────────────────────────────────────────────────────────────────

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <Row label="sm (default, 28px) — inactive">
        <StarCount
          count={24}
          pressed={false}
          onPressedChange={() => {}}
          label="hud-browser"
          size="sm"
        />
      </Row>
      <Row label="sm (default, 28px) — active">
        <StarCount
          count={24}
          pressed={true}
          onPressedChange={() => {}}
          label="hud-browser"
          size="sm"
        />
      </Row>
      <Row label="md (32px) — inactive">
        <StarCount
          count={24}
          pressed={false}
          onPressedChange={() => {}}
          label="hud-browser"
          size="md"
        />
      </Row>
      <Row label="md (32px) — active">
        <StarCount
          count={24}
          pressed={true}
          onPressedChange={() => {}}
          label="hud-browser"
          size="md"
        />
      </Row>
    </div>
  ),
}
