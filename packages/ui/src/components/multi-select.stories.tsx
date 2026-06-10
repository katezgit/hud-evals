import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"

import { MultiSelect } from "./multi-select"
import type { MultiSelectOption } from "./multi-select"

// ── Shared fixtures ───────────────────────────────────────────────────────────

const TAG_OPTIONS: MultiSelectOption[] = [
  { value: "production", label: "production" },
  { value: "staging", label: "staging" },
  { value: "experimental", label: "experimental" },
  { value: "scored", label: "scored" },
  { value: "running", label: "running" },
  { value: "errored", label: "errored" },
  { value: "warning", label: "warning" },
  { value: "archived", label: "archived" },
  { value: "baseline", label: "baseline" },
  { value: "nightly", label: "nightly" },
]

const MIXED_OPTIONS: MultiSelectOption[] = [
  { value: "production", label: "production" },
  { value: "staging", label: "staging" },
  { value: "gpu-required", label: "gpu-required", disabled: true },
  { value: "scored", label: "scored" },
  { value: "gpu-a100", label: "gpu-a100", disabled: true },
  { value: "baseline", label: "baseline" },
]

// ── Controlled wrapper ────────────────────────────────────────────────────────

function ControlledMultiSelect(
  props: Omit<React.ComponentProps<typeof MultiSelect>, "value" | "onValueChange"> & {
    defaultValue?: string[]
  }
) {
  const { defaultValue = [], ...rest } = props
  const [value, setValue] = useState<string[]>(defaultValue)
  return <MultiSelect {...rest} value={value} onValueChange={setValue} />
}

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta<typeof MultiSelect> = {
  title: "Components/MultiSelect",
  component: MultiSelect,
  argTypes: {
    size: {
      control: "select",
      options: ["md", "sm"],
    },
    disabled: { control: "boolean" },
    maxChips: { control: "number" },
    placeholder: { control: "text" },
    searchPlaceholder: { control: "text" },
    emptyText: { control: "text" },
    selectAllLabel: { control: "text" },
    clearLabel: { control: "text" },
  },
  args: {
    size: "md",
    disabled: false,
    maxChips: 2,
    placeholder: "Filter by tag…",
    searchPlaceholder: "Search tags…",
    emptyText: "No tag found.",
    selectAllLabel: "Select all",
    clearLabel: "Clear",
  },
  parameters: { layout: "padded" },
}

export default meta
type Story = StoryObj<typeof meta>

// ── Playground ────────────────────────────────────────────────────────────────

export const Playground: Story = {
  render: (args) => (
    <ControlledMultiSelect
      options={TAG_OPTIONS}
      placeholder={args.placeholder ?? "Filter by tag…"}
      searchPlaceholder={args.searchPlaceholder ?? "Search tags…"}
      emptyText={args.emptyText ?? "No tag found."}
      selectAllLabel={args.selectAllLabel ?? "Select all"}
      clearLabel={args.clearLabel ?? "Clear"}
      maxChips={args.maxChips ?? 2}
      size={(args.size as "sm" | "md" | undefined) ?? "md"}
      disabled={args.disabled ?? false}
    />
  ),
}

// ── Variants ──────────────────────────────────────────────────────────────────
// Sizes × placeholder × chip selection × chip overflow × disabled × disabled options.

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-caption text-muted-foreground">md (32px) — empty</span>
          <ControlledMultiSelect options={TAG_OPTIONS} placeholder="Filter by tag…" maxChips={2} />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-caption text-muted-foreground">sm (28px)</span>
          <ControlledMultiSelect options={TAG_OPTIONS} defaultValue={["production"]} size="sm" maxChips={2} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-caption text-muted-foreground">Chip overflow — 4 selected, maxChips=2 → +2</span>
        <ControlledMultiSelect
          options={TAG_OPTIONS}
          defaultValue={["production", "staging", "scored", "running"]}
          maxChips={2}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-caption text-muted-foreground">Disabled control</span>
        <ControlledMultiSelect options={TAG_OPTIONS} defaultValue={["production"]} disabled />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-caption text-muted-foreground">Disabled options (gpu-required, gpu-a100)</span>
        <ControlledMultiSelect options={MIXED_OPTIONS} placeholder="Filter by tag…" maxChips={2} />
      </div>
    </div>
  ),
}
