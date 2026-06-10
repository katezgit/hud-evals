import type { Meta, StoryObj } from "@storybook/react"
import * as React from "react"

import { TooltipProvider } from "./tooltip"
import { VisibilityIcon } from "./visibility-icon"

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta<typeof VisibilityIcon> = {
  title: "Components/VisibilityIcon",
  component: VisibilityIcon,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  // VisibilityIcon wraps a Radix Tooltip — every story needs a TooltipProvider.
  decorators: [
    (Story) =>
      React.createElement(TooltipProvider, null, React.createElement(Story)),
  ],
  argTypes: {
    visibility: {
      control: "radio",
      options: ["public", "private"],
    },
    size: {
      control: "radio",
      options: ["sm", "md"],
    },
  },
  args: {
    visibility: "public",
    size: "sm",
  },
}

export default meta
type Story = StoryObj<typeof meta>

// ── Helper ────────────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </span>
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
      <Label>{label}</Label>
      <div className="flex items-center gap-4">{children}</div>
    </div>
  )
}

// ── Public ────────────────────────────────────────────────────────────────────

/** Globe icon, default sm size. Tooltip reads "Visible to anyone". */
export const Public: Story = {
  args: { visibility: "public", size: "sm" },
}

// ── Private ───────────────────────────────────────────────────────────────────

/** Lock icon, default sm size. Tooltip reads "Visible only to your organization". */
export const Private: Story = {
  args: { visibility: "private", size: "sm" },
}

// ── Medium ────────────────────────────────────────────────────────────────────

/**
 * Both visibility values at md (16px) side by side — makes the size delta
 * visible without needing to flip controls.
 */
export const Medium: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <Row label="public — md (16px)">
        <VisibilityIcon visibility="public" size="md" />
      </Row>
      <Row label="private — md (16px)">
        <VisibilityIcon visibility="private" size="md" />
      </Row>
    </div>
  ),
}

// ── InHeader ──────────────────────────────────────────────────────────────────

/**
 * Composed alongside a fake page title and status badge — mirrors the real
 * env-detail-header context where the icon sits inline with the h1.
 * Do NOT import from apps/; layout is recreated inline.
 */
export const InHeader: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <h1 className="text-xl font-semibold leading-none tracking-tight">
        browser-dom-v2
      </h1>
      {/* Status badge — inline recreation of the badge primitive */}
      <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium text-muted-foreground">
        active
      </span>
      <VisibilityIcon visibility="public" />
    </div>
  ),
}

// ── AllVariants ───────────────────────────────────────────────────────────────

/**
 * Full 2×2 grid: public×sm, public×md, private×sm, private×md.
 * Useful as a visual regression baseline.
 */
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <Row label="public — sm (14px, default)">
        <VisibilityIcon visibility="public" size="sm" />
      </Row>
      <Row label="public — md (16px)">
        <VisibilityIcon visibility="public" size="md" />
      </Row>
      <Row label="private — sm (14px, default)">
        <VisibilityIcon visibility="private" size="sm" />
      </Row>
      <Row label="private — md (16px)">
        <VisibilityIcon visibility="private" size="md" />
      </Row>
    </div>
  ),
}
