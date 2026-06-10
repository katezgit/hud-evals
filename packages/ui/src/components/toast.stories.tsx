import type { Meta, StoryObj } from "@storybook/react"
import { toast } from "sonner"

import { Button } from "./button"
import { Toaster } from "./toast"

const meta: Meta<typeof Toaster> = {
  title: "Components/Toast",
  component: Toaster,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <>
        <Toaster />
        <Story />
      </>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

// ── Playground — all types + position control ────────────────────────────────
export const Playground: Story = {
  argTypes: {
    position: {
      control: "select",
      options: [
        "top-left",
        "top-center",
        "top-right",
        "bottom-left",
        "bottom-center",
        "bottom-right",
      ],
    },
  },
  args: {
    position: "bottom-right",
  },
  render: (args) => {
    const types = ["default", "success", "error", "warning", "info"] as const
    return (
      <>
        <Toaster {...args} />
        <div className="flex flex-col gap-3 items-start">
          {types.map((type) => (
            <Button
              key={type}
              variant="secondary"
              onClick={() => {
                const fn = type === "default" ? toast : toast[type]
                fn(`${type.charAt(0).toUpperCase() + type.slice(1)} toast`)
              }}
            >
              Fire {type}
            </Button>
          ))}
        </div>
      </>
    )
  },
}

// ── Variants — all toast types × description × action × promise ───────────────
export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-3 items-start">
      <Button variant="secondary" onClick={() => toast("Default toast")}>Default</Button>
      <Button variant="secondary" onClick={() => toast.success("Environment saved")}>Success</Button>
      <Button variant="secondary" onClick={() => toast.error("Run failed — timeout exceeded")}>Error</Button>
      <Button variant="secondary" onClick={() => toast.warning("Sandbox nearing memory limit")}>Warning</Button>
      <Button variant="secondary" onClick={() => toast.info("New eval results available")}>Info</Button>
      <Button
        variant="secondary"
        onClick={() => toast.success("Checkpoint saved", { description: "Weights written to s3://hud-runs/ckpt-0042." })}
      >
        With description
      </Button>
      <Button
        variant="secondary"
        onClick={() => toast("Run archived", { action: { label: "Undo", onClick: () => toast.info("Archive undone") } })}
      >
        With action
      </Button>
      <Button
        variant="secondary"
        onClick={() => {
          const promise = new globalThis.Promise<{ name: string }>((resolve) =>
            setTimeout(() => resolve({ name: "eval-batch-128" }), 2000),
          )
          toast.promise(promise, {
            loading: "Submitting eval run…",
            success: (data) => `Run "${data.name}" queued`,
            error: "Failed to queue eval run",
          })
        }}
      >
        Promise (loading → success)
      </Button>
    </div>
  ),
}
