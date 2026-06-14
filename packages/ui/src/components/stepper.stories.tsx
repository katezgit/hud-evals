import type { Meta, StoryObj } from "@storybook/react"
import { Stepper } from "./stepper"

/* ─── Meta ─────────────────────────────────────────────────────────────────── */

const FOUR_STEPS = [
  { label: "Model",   description: "Choose the model checkpoint to train." },
  { label: "Taskset", description: "Select the taskset to train against." },
  { label: "Tasks",   description: "Pick which tasks to include." },
  { label: "Review",  description: "Confirm configuration and launch." },
] as const

const meta: Meta<typeof Stepper> = {
  title: "Components/Stepper",
  component: Stepper,
  parameters: { layout: "padded" },
  argTypes: {
    currentStep: { control: { type: "number", min: 1 } },
    "aria-label": { control: "text" },
  },
  args: {
    steps: [...FOUR_STEPS],
    currentStep: 2,
  },
}

export default meta
type Story = StoryObj<typeof meta>

/* ─── Playground ───────────────────────────────────────────────────────────── */
// Default args: currentStep=2 on a 4-step sequence — shows completed (step 1),
// active (step 2), and pending (steps 3–4) simultaneously.
// Use the currentStep control to reach boundary states (1 = no completed, 4 = all completed).

export const Playground: Story = {}

/* ─── WithoutDescriptions ──────────────────────────────────────────────────── */
// Steps with no description prop — the description row is omitted entirely,
// collapsing the layout to a single-row indicator. Not reachable from Playground
// controls because the steps array is fixed in meta args.

export const WithoutDescriptions: Story = {
  args: {
    steps: [
      { label: "Model" },
      { label: "Taskset" },
      { label: "Tasks" },
      { label: "Review" },
    ],
    currentStep: 2,
  },
}
