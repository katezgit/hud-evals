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

export const Playground: Story = {}

/* ─── StepStates ───────────────────────────────────────────────────────────── */
// All three circle states (completed / active / pending) visible simultaneously.
// 4 steps, currentStep=2 — matches the operator screenshot.

export const StepStates: Story = {
  args: {
    steps: [...FOUR_STEPS],
    currentStep: 2,
  },
}

/* ─── FirstStep ────────────────────────────────────────────────────────────── */
// No completed steps — all connectors muted.

export const FirstStep: Story = {
  args: {
    steps: [...FOUR_STEPS],
    currentStep: 1,
  },
}

/* ─── LastStep ─────────────────────────────────────────────────────────────── */
// All but final completed; final active — all connectors teal.

export const LastStep: Story = {
  args: {
    steps: [...FOUR_STEPS],
    currentStep: 4,
  },
}

/* ─── WithoutDescriptions ──────────────────────────────────────────────────── */
// description is optional — label-only steps omit row B entirely.

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

/* ─── ThreeSteps ───────────────────────────────────────────────────────────── */

export const ThreeSteps: Story = {
  args: {
    steps: [
      { label: "Configure", description: "Set up your environment." },
      { label: "Run",        description: "Execute the evaluation." },
      { label: "Review",     description: "Inspect results." },
    ],
    currentStep: 2,
  },
}

/* ─── FiveSteps ────────────────────────────────────────────────────────────── */

export const FiveSteps: Story = {
  args: {
    steps: [
      { label: "Model",      description: "Choose checkpoint." },
      { label: "Taskset",    description: "Select taskset." },
      { label: "Tasks",      description: "Pick tasks." },
      { label: "Config",     description: "Set hyperparameters." },
      { label: "Review",     description: "Confirm and launch." },
    ],
    currentStep: 3,
  },
}

/* ─── InWizardContext ──────────────────────────────────────────────────────── */
// Stepper mounted inside a card-like container — mirrors the wizard shell layout.

export const InWizardContext: Story = {
  render: (args) => (
    <div className="max-w-3xl rounded-lg border border-border bg-panel p-6">
      <Stepper {...args} />
    </div>
  ),
  args: {
    steps: [...FOUR_STEPS],
    currentStep: 2,
  },
}
