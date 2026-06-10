import type { Meta, StoryObj } from "@storybook/react"
import { Search } from "lucide-react"
import { Input } from "./input"

const meta: Meta<typeof Input> = {
  title: "Components/Input",
  component: Input,
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "number", "password", "search", "url"],
    },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    "aria-invalid": { control: "boolean" },
  },
  args: {
    type: "text",
    placeholder: "Placeholder text",
    disabled: false,
  },
  parameters: { layout: "padded" },
}

export default meta
type Story = StoryObj<typeof meta>

// ── Playground ────────────────────────────────────────────────────────────────

export const Playground: Story = {
  render: (args) => (
    <div style={{ width: 320 }}>
      <Input {...args} />
    </div>
  ),
}

// ── Variants ──────────────────────────────────────────────────────────────────
// All meaningful states: empty, with value, disabled, error, common types.

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-3" style={{ width: 320 }}>
      <Input placeholder="Empty (default)" />
      <Input defaultValue="frontier-reasoning-v1" />
      <Input placeholder="Disabled empty" disabled />
      <Input defaultValue="env_8xkP3" disabled readOnly />
      <Input
        aria-invalid
        defaultValue="hud_sk_invalid_key"
        aria-describedby="input-error"
      />
      <Input type="number" defaultValue={128} />
      <Input type="password" placeholder="API secret key" />
    </div>
  ),
}

// ── Disabled ──────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-3" style={{ width: 320 }}>
      <Input placeholder="Disabled placeholder" disabled />
      <Input defaultValue="read-only value" disabled readOnly />
    </div>
  ),
}

// ── Errored ───────────────────────────────────────────────────────────────────

export const Errored: Story = {
  render: () => (
    <div className="flex flex-col gap-3" style={{ width: 320 }}>
      <Input aria-invalid defaultValue="bad-input-value" />
      <Input aria-invalid placeholder="Required field" />
    </div>
  ),
}

// ── Sizes ─────────────────────────────────────────────────────────────────────
// One size: 32px. Rejected sizes shown as structural divs for reference only.

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4" style={{ width: 320 }}>
      <div className="flex flex-col gap-1">
        <p className="text-label text-muted-foreground">32px ✓</p>
        <Input placeholder="Run name or config key" />
      </div>
      <div className="flex flex-col gap-1" style={{ opacity: 0.35 }}>
        <p className="text-label text-muted-foreground">28px — rejected</p>
        <div
          style={{
            height: 28,
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-sm)",
            background: "var(--color-background)",
            display: "flex",
            alignItems: "center",
            paddingLeft: 10,
          }}
        >
          <span style={{ fontSize: 12, color: "var(--color-muted-foreground)", fontFamily: "var(--font-sans)" }}>
            sm anchor gone — both contexts → 32px
          </span>
        </div>
      </div>
    </div>
  ),
}

// ── WithLeadingIcon ───────────────────────────────────────────────────────────

export const WithLeadingIcon: Story = {
  render: () => (
    <div className="flex flex-col gap-1" style={{ width: 320 }}>
      <p className="text-label text-muted-foreground">With leading icon</p>
      <Input
        placeholder="Search runs…"
        leading={<Search className="size-4 shrink-0 text-muted-foreground" />}
      />
    </div>
  ),
}

// ── WithKbdHint ───────────────────────────────────────────────────────────────

export const WithKbdHint: Story = {
  render: () => (
    <div className="flex flex-col gap-4" style={{ width: 320 }}>
      <div className="flex flex-col gap-1">
        <p className="text-label text-muted-foreground">cmd-bar (icon + kbd)</p>
        <Input
          placeholder="Search or jump to…"
          leading={<Search className="size-4 shrink-0 text-muted-foreground" />}
          trailing={
            <kbd className="font-mono text-meta bg-panel border border-border rounded-sm px-1.5 py-px text-muted-foreground shrink-0">
              ⌘K
            </kbd>
          }
        />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-label text-muted-foreground">trailing kbd only</p>
        <Input
          placeholder="Jump to run…"
          trailing={
            <kbd className="font-mono text-meta bg-panel border border-border rounded-sm px-1.5 py-px text-muted-foreground shrink-0">
              /
            </kbd>
          }
        />
      </div>
    </div>
  ),
}
