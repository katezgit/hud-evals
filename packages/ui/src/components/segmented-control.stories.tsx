import type { Meta, StoryObj } from "@storybook/react"
import * as React from "react"

import { SegmentedControl } from "./segmented-control"

function GridIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="5" height="5" rx="1" fill="currentColor" />
      <rect x="8" y="1" width="5" height="5" rx="1" fill="currentColor" />
      <rect x="1" y="8" width="5" height="5" rx="1" fill="currentColor" />
      <rect x="8" y="8" width="5" height="5" rx="1" fill="currentColor" />
    </svg>
  )
}

function LinesIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="1" y="2" width="12" height="2" rx="1" fill="currentColor" />
      <rect x="1" y="6" width="12" height="2" rx="1" fill="currentColor" />
      <rect x="1" y="10" width="12" height="2" rx="1" fill="currentColor" />
    </svg>
  )
}

const meta: Meta<typeof SegmentedControl> = {
  title: "Components/SegmentedControl",
  component: SegmentedControl,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
  },
  args: {
    disabled: false,
  },
}

export default meta
type Story = StoryObj<typeof meta>

interface PlaygroundProps {
  disabled?: boolean
}

function PlaygroundInner({ disabled = false }: PlaygroundProps) {
  const [value, setValue] = React.useState("system")
  return (
    <SegmentedControl
      aria-label="Theme"
      value={value}
      onValueChange={setValue}
      disabled={disabled}
    >
      <SegmentedControl.Item value="light">Light</SegmentedControl.Item>
      <SegmentedControl.Item value="system">System</SegmentedControl.Item>
      <SegmentedControl.Item value="dark">Dark</SegmentedControl.Item>
    </SegmentedControl>
  )
}

function ViewModeInner() {
  const [value, setValue] = React.useState("table")
  return (
    <SegmentedControl aria-label="View mode" value={value} onValueChange={setValue}>
      <SegmentedControl.Item value="table">Table</SegmentedControl.Item>
      <SegmentedControl.Item value="cards">Cards</SegmentedControl.Item>
      <SegmentedControl.Item value="grid">Grid</SegmentedControl.Item>
    </SegmentedControl>
  )
}

function FourOptionTimeframe() {
  const [value, setValue] = React.useState("7d")
  return (
    <SegmentedControl aria-label="Timeframe" value={value} onValueChange={setValue}>
      <SegmentedControl.Item value="24h">24h</SegmentedControl.Item>
      <SegmentedControl.Item value="7d">7d</SegmentedControl.Item>
      <SegmentedControl.Item value="30d">30d</SegmentedControl.Item>
      <SegmentedControl.Item value="all">All</SegmentedControl.Item>
    </SegmentedControl>
  )
}

function DisabledItemExample() {
  const [value, setValue] = React.useState("system")
  return (
    <SegmentedControl aria-label="Theme" value={value} onValueChange={setValue}>
      <SegmentedControl.Item value="light">Light</SegmentedControl.Item>
      <SegmentedControl.Item value="system">System</SegmentedControl.Item>
      <SegmentedControl.Item value="dark" disabled>Dark</SegmentedControl.Item>
    </SegmentedControl>
  )
}

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
      {children}
    </div>
  )
}

function IconOnlyInner() {
  const [value, setValue] = React.useState("grid")
  return (
    <SegmentedControl aria-label="View layout" value={value} onValueChange={setValue}>
      <SegmentedControl.Item value="grid" aria-label="Grid view"><GridIcon /></SegmentedControl.Item>
      <SegmentedControl.Item value="list" aria-label="List view"><LinesIcon /></SegmentedControl.Item>
    </SegmentedControl>
  )
}

export const Playground: Story = {
  render: (args) => <PlaygroundInner {...args} />,
}

export const IconOnly: Story = {
  render: () => <IconOnlyInner />,
}

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <Row label="icon only (flush shape)">
        <IconOnlyInner />
      </Row>
      <Row label="3 options (appearance settings)">
        <PlaygroundInner />
      </Row>
      <Row label="3 options (view mode)">
        <ViewModeInner />
      </Row>
      <Row label="4 options (timeframe)">
        <FourOptionTimeframe />
      </Row>
      <Row label="disabled root">
        <SegmentedControl
          aria-label="View mode"
          value="table"
          onValueChange={() => {}}
          disabled
        >
          <SegmentedControl.Item value="table">Table</SegmentedControl.Item>
          <SegmentedControl.Item value="cards">Cards</SegmentedControl.Item>
          <SegmentedControl.Item value="grid">Grid</SegmentedControl.Item>
        </SegmentedControl>
      </Row>
      <Row label="disabled item (active item ignores disabled prop)">
        <DisabledItemExample />
      </Row>
    </div>
  ),
}
