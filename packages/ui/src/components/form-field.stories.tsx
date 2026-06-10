import type { Meta, StoryObj } from "@storybook/react"

import { FormField, FieldLabel, FieldHelper, FieldError } from "./form-field"
import { Input } from "./input"

// FormField is a layout wrapper: label + control + helper/error slot.
// No visual variants — the component has a fixed structure.

const meta: Meta<typeof FormField> = {
  title: "Components/FormField",
  component: FormField,
  parameters: { layout: "padded" },
}

export default meta
type Story = StoryObj<typeof meta>

// ── Playground ────────────────────────────────────────────────────────────────
// All structural states: required asterisk, helper, error, disabled.

export const Playground: Story = {
  render: () => (
    <div className="flex flex-col gap-4" style={{ width: 360 }}>
      <FormField id="run-name" label="Run name" helper="Unique name within this workspace.">
        <Input placeholder="e.g. baseline-v2-prod" />
      </FormField>

      <FormField id="org-name" label="Organization name" required helper="Used in your workspace URL slug.">
        <Input placeholder="my-org" />
      </FormField>

      <FormField id="api-key" label="API key" required error="Key is invalid — verify in your provider dashboard.">
        <Input defaultValue="hud_sk_invalid" />
      </FormField>

      <FormField id="env-id" label="Environment ID" helper="Assigned automatically. Cannot be changed.">
        <Input value="env_8xkP3" disabled readOnly />
      </FormField>

      <FormField id="search" helper="Search by run name or model.">
        <Input placeholder="Search runs…" />
      </FormField>
    </div>
  ),
}

// ── Variants ──────────────────────────────────────────────────────────────────
// Sub-components used independently in custom layouts.

export const Variants: Story = {
  name: "Primitive slots (FieldLabel / FieldHelper / FieldError)",
  render: () => (
    <div className="flex flex-col gap-6" style={{ maxWidth: 360 }}>
      <div className="flex flex-col gap-1">
        <p className="text-xs text-muted-foreground font-mono">FieldLabel</p>
        <FieldLabel htmlFor="x">Run name</FieldLabel>
        <FieldLabel htmlFor="x" required>Required field</FieldLabel>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-xs text-muted-foreground font-mono">FieldHelper</p>
        <FieldHelper>Unique name within this workspace.</FieldHelper>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-xs text-muted-foreground font-mono">FieldError</p>
        <FieldError>This field is required.</FieldError>
      </div>
    </div>
  ),
}
