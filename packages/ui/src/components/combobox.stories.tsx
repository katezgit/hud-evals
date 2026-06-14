import type { Meta, StoryObj } from "@storybook/react"
import * as React from "react"

import { Combobox, ComboboxTwoLineOption } from "./combobox"
import type { ComboboxOption, ComboboxGroup } from "./combobox"

// ── Fixtures ──────────────────────────────────────────────────────────────────

const LONG_LABEL_OPTIONS: ComboboxOption[] = [
  { value: "claude-opus-4-7-extended", label: "claude-opus-4-7-2026-05-28-extended-thinking-1m-context" },
  { value: "gpt-4o", label: "gpt-4o" },
  { value: "gemini-2-flash", label: "gemini-2.0-flash" },
]

const FRAMEWORK_OPTIONS: ComboboxOption[] = [
  { value: "next.js", label: "Next.js" },
  { value: "sveltekit", label: "SvelteKit" },
  { value: "nuxt", label: "Nuxt" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "solidstart", label: "SolidStart" },
  { value: "qwik", label: "Qwik" },
]

const LANGUAGE_GROUPS: ComboboxGroup[] = [
  {
    heading: "Most Popular",
    options: [
      { value: "auto-detect", label: "Auto-detect" },
      { value: "english", label: "English" },
      { value: "hindi", label: "Hindi" },
      { value: "spanish", label: "Spanish" },
    ],
  },
  {
    heading: "All Languages",
    options: [
      { value: "arabic", label: "Arabic" },
      { value: "bengali", label: "Bengali" },
      { value: "french", label: "French" },
      { value: "german", label: "German" },
      { value: "japanese", label: "Japanese" },
      { value: "portuguese", label: "Portuguese" },
      { value: "russian", label: "Russian" },
      { value: "turkish", label: "Turkish" },
    ],
  },
]

// ── Meta ──────────────────────────────────────────────────────────────────────

// Meta typed without generic — ComboboxProps is a discriminated union which
// causes StoryObj<typeof Combobox> to resolve to `never`. All stories use
// render() functions with explicit props, no args needed.
const meta = {
  title: "Components/Combobox",
  component: Combobox,
  parameters: { layout: "padded" },
} satisfies Meta

export default meta
type Story = StoryObj

// ── Story components (hooks require named components) ─────────────────────────

function PlaygroundDemo() {
  const [value, setValue] = React.useState<string | null>(null)
  return (
    <div style={{ width: 280 }}>
      <Combobox
        options={FRAMEWORK_OPTIONS}
        value={value}
        onValueChange={setValue}
        placeholder="Select framework…"
        emptyText="No framework found."
      />
    </div>
  )
}

function PreSelectedDemo() {
  const [value, setValue] = React.useState<string | null>("astro")
  return (
    <div style={{ width: 280 }}>
      <Combobox
        options={FRAMEWORK_OPTIONS}
        value={value}
        onValueChange={setValue}
        placeholder="Select framework…"
        emptyText="No framework found."
      />
    </div>
  )
}

function GroupedDemo() {
  const [value, setValue] = React.useState<string | null>("english")
  return (
    <div style={{ width: 280 }}>
      <Combobox
        groups={LANGUAGE_GROUPS}
        value={value}
        onValueChange={setValue}
        placeholder="Select language…"
        emptyText="No language found."
      />
    </div>
  )
}

function SmallDemo() {
  const [value, setValue] = React.useState<string | null>(null)
  return (
    <div style={{ width: 240 }}>
      <Combobox
        options={FRAMEWORK_OPTIONS}
        value={value}
        onValueChange={setValue}
        placeholder="Select framework…"
        size="sm"
      />
    </div>
  )
}

function DisabledOptionDemo() {
  const [value, setValue] = React.useState<string | null>(null)
  const options: ComboboxOption[] = [
    { value: "next.js", label: "Next.js" },
    { value: "sveltekit", label: "SvelteKit", disabled: true },
    { value: "nuxt", label: "Nuxt" },
    { value: "remix", label: "Remix" },
  ]
  return (
    <div style={{ width: 280 }}>
      <Combobox
        options={options}
        value={value}
        onValueChange={setValue}
        placeholder="Select framework…"
        emptyText="No framework found."
      />
    </div>
  )
}

// ── Stories ───────────────────────────────────────────────────────────────────

export const Playground: Story = {
  render: () => <PlaygroundDemo />,
}

export const PreSelected: Story = {
  render: () => <PreSelectedDemo />,
}

export const Grouped: Story = {
  render: () => <GroupedDemo />,
}

export const Small: Story = {
  render: () => <SmallDemo />,
}

export const Disabled: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <Combobox
        options={FRAMEWORK_OPTIONS}
        value={null}
        onValueChange={() => {}}
        placeholder="Select framework…"
        disabled
      />
    </div>
  ),
}

export const DisabledOption: Story = {
  render: () => <DisabledOptionDemo />,
}

// ── Width-pinning verification stories ───────────────────────────────────────

function MaxWidthLongLabelDemo() {
  const [value, setValue] = React.useState<string | null>("claude-opus-4-7-extended")
  return (
    <Combobox
      options={LONG_LABEL_OPTIONS}
      value={value}
      onValueChange={setValue}
      placeholder="Select model…"
      className="max-w-[280px]"
    />
  )
}

function MaxWidthLongPlaceholderDemo() {
  const [value, setValue] = React.useState<string | null>(null)
  return (
    <Combobox
      options={LONG_LABEL_OPTIONS}
      value={value}
      onValueChange={setValue}
      placeholder="claude-opus-4-7-2026-05-28-extended-thinking-1m-context"
      className="max-w-[280px]"
    />
  )
}

export const MaxWidthLongLabel: Story = {
  name: "Max-width — long label truncates",
  render: () => <MaxWidthLongLabelDemo />,
}

export const MaxWidthLongPlaceholder: Story = {
  name: "Max-width — long placeholder truncates",
  render: () => <MaxWidthLongPlaceholderDemo />,
}

type TasksetOption = ComboboxOption & { taskCount: number; visibility: string; owner: string }

const TASKSET_OPTIONS: TasksetOption[] = [
  { value: "ts-webqa-001", label: "WebQA Benchmark", taskCount: 240, visibility: "public", owner: "riley" },
  { value: "ts-webqa-002", label: "WebQA Benchmark", taskCount: 18, visibility: "private", owner: "alex" },
  { value: "ts-browsergym", label: "BrowserGym Suite", taskCount: 512, visibility: "public", owner: "hud-team" },
  { value: "ts-osworld", label: "OSWorld", taskCount: 369, visibility: "public", owner: "hud-team" },
  { value: "ts-custom-rl", label: "Custom RL Env", taskCount: 64, visibility: "private", owner: "alex" },
]

function TwoLineOptionsDemo() {
  const [value, setValue] = React.useState<string | null>("ts-webqa-001")
  return (
    <div style={{ width: 320 }}>
      <Combobox
        options={TASKSET_OPTIONS}
        value={value}
        onValueChange={setValue}
        placeholder="Select taskset…"
        emptyText="No tasksets match"
        renderOption={(opt) => {
          const ts = opt as TasksetOption
          return (
            <ComboboxTwoLineOption
              primary={ts.label}
              secondary={`${ts.taskCount} tasks · ${ts.visibility} · by ${ts.owner}`}
            />
          )
        }}
      />
    </div>
  )
}

export const TwoLineOptions: Story = {
  name: "Two-line options (renderOption)",
  render: () => <TwoLineOptionsDemo />,
}
