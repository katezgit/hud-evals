import type { Meta, StoryObj } from "@storybook/react"
import { Settings } from "lucide-react"

import { Button } from "./button"
import { IconButton } from "./icon-button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip"

const meta: Meta<typeof TooltipContent> = {
  title: "Components/Tooltip",
  component: TooltipContent,
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "truncation"],
    },
    side: {
      control: "select",
      options: ["top", "bottom", "left", "right"],
    },
    align: {
      control: "select",
      options: ["start", "center", "end"],
    },
    sideOffset: {
      control: { type: "range", min: 0, max: 24, step: 1 },
    },
  },
  args: {
    variant: "default",
    side: "top",
    align: "center",
    sideOffset: 6,
  },
  parameters: { layout: "centered" },
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

// ── Playground ───────────────────────────────────────────────────────────────

export const Playground: Story = {
  render: (args) => (
    <Tooltip defaultOpen>
      <TooltipTrigger asChild>
        <Button variant="secondary">Hover me</Button>
      </TooltipTrigger>
      <TooltipContent {...args}>Run eval agent</TooltipContent>
    </Tooltip>
  ),
}

// ── Variants ──────────────────────────────────────────────────────────────────
// default vs. truncation variant; side placements; icon trigger; disabled button.

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      {/* default vs truncation */}
      <div className="flex items-center gap-8">
        <Tooltip defaultOpen>
          <TooltipTrigger asChild>
            <Button variant="secondary">Default</Button>
          </TooltipTrigger>
          <TooltipContent variant="default">Run eval agent</TooltipContent>
        </Tooltip>
        <Tooltip defaultOpen>
          <TooltipTrigger asChild>
            <p
              className="text-body text-foreground cursor-default truncate"
              style={{ maxWidth: 180 }}
            >
              swe-bench-verified-gpt-4o-2024-11-20-run-003-final
            </p>
          </TooltipTrigger>
          <TooltipContent variant="truncation" side="bottom" align="start">
            swe-bench-verified-gpt-4o-2024-11-20-run-003-final
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Side placements */}
      <div className="flex items-center gap-6">
        {(["top", "right", "bottom", "left"] as const).map((side) => (
          <Tooltip key={side} defaultOpen>
            <TooltipTrigger asChild>
              <Button variant="ghost">{side}</Button>
            </TooltipTrigger>
            <TooltipContent side={side}>{side}</TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* Icon trigger */}
      <Tooltip defaultOpen>
        <TooltipTrigger asChild>
          <IconButton variant="ghost" aria-label="Settings">
            <Settings />
          </IconButton>
        </TooltipTrigger>
        <TooltipContent>Settings</TooltipContent>
      </Tooltip>

      {/* On disabled button */}
      <Tooltip defaultOpen>
        <TooltipTrigger
          className="cursor-not-allowed"
          aria-label="Deploy eval agent — disabled"
        >
          <Button variant="primary" disabled tabIndex={-1} aria-hidden>
            Deploy
          </Button>
        </TooltipTrigger>
        <TooltipContent>Complete setup before deploying</TooltipContent>
      </Tooltip>
    </div>
  ),
  parameters: { layout: "padded" },
}
