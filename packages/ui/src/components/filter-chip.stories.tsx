import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import { FilterChip } from "./filter-chip"

/* ─── Meta ─────────────────────────────────────────────────────────────────── */

const meta: Meta<typeof FilterChip> = {
  title: "Components/FilterChip",
  component: FilterChip,
  parameters: { layout: "padded" },
  argTypes: {
    label: { control: "text" },
    selected: { control: "boolean" },
    count: { control: "number" },
    disabled: { control: "boolean" },
  },
  args: {
    label: "Trainable",
    selected: false,
    disabled: false,
  },
}

export default meta
type Story = StoryObj<typeof meta>

/* ─── Playground ───────────────────────────────────────────────────────────── */

export const Playground: Story = {
  render: (args) => {
    const [selected, setSelected] = useState(args.selected ?? false)
    return (
      <FilterChip
        {...args}
        selected={selected}
        onSelectedChange={setSelected}
      />
    )
  },
}

/* ─── Default ──────────────────────────────────────────────────────────────── */
// Baseline visual — single chip, unselected, no count.

export const Default: Story = {
  render: () => {
    const [selected, setSelected] = useState(false)
    return (
      <FilterChip label="Trainable" selected={selected} onSelectedChange={setSelected} />
    )
  },
}

/* ─── Selected ─────────────────────────────────────────────────────────────── */
// Leading check icon + filled surface render.

export const Selected: Story = {
  render: () => {
    const [selected, setSelected] = useState(true)
    return (
      <FilterChip label="Trainable" selected={selected} onSelectedChange={setSelected} />
    )
  },
}

/* ─── WithCount ────────────────────────────────────────────────────────────── */
// Trailing count slot wired — unselected state, muted count color.

export const WithCount: Story = {
  render: () => {
    const [selected, setSelected] = useState(false)
    return (
      <FilterChip label="Trainable" count={16} selected={selected} onSelectedChange={setSelected} />
    )
  },
}

/* ─── WithCountSelected ────────────────────────────────────────────────────── */
// selected=true + count → count shifts to text-foreground (a11y contrast fix).

export const WithCountSelected: Story = {
  render: () => {
    const [selected, setSelected] = useState(true)
    return (
      <FilterChip label="Trainable" count={16} selected={selected} onSelectedChange={setSelected} />
    )
  },
}

/* ─── Disabled ─────────────────────────────────────────────────────────────── */
// Disabled chrome — cursor-not-allowed, text-text-disabled.

export const Disabled: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <FilterChip label="Trainable" selected={false} onSelectedChange={() => {}} disabled />
      <FilterChip label="Reasoning" count={18} selected={false} onSelectedChange={() => {}} disabled />
      <FilterChip label="Favorites" count={4} selected={true} onSelectedChange={() => {}} disabled />
    </div>
  ),
}

/* ─── FilterRow ────────────────────────────────────────────────────────────── */
// Production usage — three independently-controlled chips as used on the models page.

export const FilterRow: Story = {
  render: () => {
    const [trainable, setTrainable] = useState(false)
    const [reasoning, setReasoning] = useState(false)
    const [favorites, setFavorites] = useState(false)
    return (
      <div className="flex items-center gap-2">
        <FilterChip label="Trainable" count={16} selected={trainable} onSelectedChange={setTrainable} />
        <FilterChip label="Reasoning" count={18} selected={reasoning} onSelectedChange={setReasoning} />
        <FilterChip label="Favorites" count={4} selected={favorites} onSelectedChange={setFavorites} />
      </div>
    )
  },
}

/* ─── AllStates ────────────────────────────────────────────────────────────── */
// Docs-only grid — every visual permutation side-by-side.
// unselected/selected × no-count/with-count × enabled/disabled

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-label text-muted-foreground">Enabled — no count</p>
        <div className="flex items-center gap-3">
          <FilterChip label="Unselected" selected={false} onSelectedChange={() => {}} />
          <FilterChip label="Selected" selected={true} onSelectedChange={() => {}} />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-label text-muted-foreground">Enabled — with count</p>
        <div className="flex items-center gap-3">
          <FilterChip label="Unselected" count={16} selected={false} onSelectedChange={() => {}} />
          <FilterChip label="Selected" count={16} selected={true} onSelectedChange={() => {}} />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-label text-muted-foreground">Disabled — no count</p>
        <div className="flex items-center gap-3">
          <FilterChip label="Unselected" selected={false} onSelectedChange={() => {}} disabled />
          <FilterChip label="Selected" selected={true} onSelectedChange={() => {}} disabled />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-label text-muted-foreground">Disabled — with count</p>
        <div className="flex items-center gap-3">
          <FilterChip label="Unselected" count={16} selected={false} onSelectedChange={() => {}} disabled />
          <FilterChip label="Selected" count={16} selected={true} onSelectedChange={() => {}} disabled />
        </div>
      </div>
    </div>
  ),
}
