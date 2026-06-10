"use client"

import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react"

import { Button } from "./button"
import { Checkbox } from "./checkbox"
import { Combobox } from "./combobox"
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerCloseButton,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./drawer"
import { FormField } from "./form-field"
import { Input } from "./input"
import { Label } from "./label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select"
import { Switch } from "./switch"
import { Textarea } from "./textarea"

const meta: Meta<typeof DrawerContent> = {
  title: "Components/Drawer",
  component: DrawerContent,
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
  },
  args: {
    size: "md",
  },
  parameters: { layout: "centered" },
}

export default meta
type Story = StoryObj<typeof meta>

// ── Playground — all props controllable via args ───────────────────────────────
export const Playground: Story = {
  render: (args) => (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button variant="secondary">Open drawer</Button>
      </DrawerTrigger>
      <DrawerContent {...args}>
        <DrawerHeader>
          <div>
            <DrawerTitle>Drawer title</DrawerTitle>
            <DrawerDescription>A description giving more context about this drawer.</DrawerDescription>
          </div>
          <DrawerCloseButton />
        </DrawerHeader>
        <DrawerBody>
          <p className="text-muted-foreground">Drawer body content goes here.</p>
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DrawerClose>
          <Button variant="primary">Confirm</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
  parameters: { layout: "padded" },
}

// ── Variants — directions × sizes ─────────────────────────────────────────────
export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Directions
        </span>
        <div className="flex flex-wrap items-center gap-3">
          {(["right", "left", "bottom", "top"] as const).map((direction) => (
            <Drawer key={direction} direction={direction}>
              <DrawerTrigger asChild>
                <Button variant="secondary">
                  {direction.charAt(0).toUpperCase() + direction.slice(1)}
                </Button>
              </DrawerTrigger>
              <DrawerContent size="sm">
                <DrawerHeader>
                  <div>
                    <DrawerTitle>Direction: {direction}</DrawerTitle>
                    <DrawerDescription>Slides in from the {direction}.</DrawerDescription>
                  </div>
                  <DrawerCloseButton />
                </DrawerHeader>
                <DrawerBody>
                  <p className="text-muted-foreground">Content area for a {direction} drawer.</p>
                </DrawerBody>
              </DrawerContent>
            </Drawer>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Sizes (right direction)
        </span>
        <div className="flex items-center gap-3">
          {(["sm", "md", "lg"] as const).map((size) => (
            <Drawer key={size} direction="right">
              <DrawerTrigger asChild>
                <Button variant="secondary">
                  Size {size}
                </Button>
              </DrawerTrigger>
              <DrawerContent size={size}>
                <DrawerHeader>
                  <div>
                    <DrawerTitle>Size: {size}</DrawerTitle>
                    <DrawerDescription>
                      {size === "sm" ? "320px" : size === "md" ? "480px" : "720px"} width panel.
                    </DrawerDescription>
                  </div>
                  <DrawerCloseButton />
                </DrawerHeader>
                <DrawerBody>
                  <p className="text-muted-foreground">Content for the {size} size variant.</p>
                </DrawerBody>
                <DrawerFooter>
                  <DrawerClose asChild>
                    <Button variant="ghost">Close</Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          ))}
        </div>
      </div>
    </div>
  ),
  parameters: { layout: "padded" },
}

// ── Not dismissible — dismissible={false} prop ────────────────────────────────
// Structural primitive behavior: overlay-click and Escape are both disabled.
// The explicit close button is the only exit point.

export const NotDismissible: Story = {
  name: "Not dismissible",
  render: () => (
    <Drawer direction="right" dismissible={false}>
      <DrawerTrigger asChild>
        <Button variant="secondary">Open non-dismissible drawer</Button>
      </DrawerTrigger>
      <DrawerContent size="sm">
        <DrawerHeader>
          <div>
            <DrawerTitle>Overlay and Escape disabled</DrawerTitle>
            <DrawerDescription>Close via the explicit button only.</DrawerDescription>
          </div>
          <DrawerCloseButton />
        </DrawerHeader>
        <DrawerBody>
          <p className="text-muted-foreground">
            Pass{" "}
            <code className="font-mono text-xs">dismissible={"{false}"}</code>{" "}
            to the <code className="font-mono text-xs">Drawer</code> root to disable both
            overlay-click and Escape. No wrapper prop required.
          </p>
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="primary">Close drawer</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story:
          "Pass `dismissible={false}` to the `Drawer` root to disable both overlay-click and Escape. The close button is the only exit.",
      },
    },
  },
}

// ── Without footer — footer is optional ──────────────────────────────────────
// Inspector and log-viewer variants omit the footer. This story confirms the
// body fills the remaining panel height without a footer action pair.

export const WithoutFooter: Story = {
  name: "Without footer",
  render: () => (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button variant="secondary">Open drawer</Button>
      </DrawerTrigger>
      <DrawerContent size="sm">
        <DrawerHeader>
          <div>
            <DrawerTitle>Inspector panel</DrawerTitle>
            <DrawerDescription>Read-only view — no footer actions needed.</DrawerDescription>
          </div>
          <DrawerCloseButton />
        </DrawerHeader>
        <DrawerBody>
          <p className="text-muted-foreground">
            Body fills to the bottom of the panel when no footer is present.
          </p>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  ),
  parameters: { layout: "padded" },
}

// ── ScrollBody fixture ────────────────────────────────────────────────────────

const TRAJECTORY_STEPS = [
  { step: 1,   action: "env.reset",              status: "ok",      ms: 12  },
  { step: 2,   action: "agent.observe",           status: "ok",      ms: 8   },
  { step: 3,   action: "tool.bash",               status: "ok",      ms: 340 },
  { step: 4,   action: "tool.read_file",          status: "ok",      ms: 55  },
  { step: 5,   action: "tool.write_file",         status: "ok",      ms: 72  },
  { step: 6,   action: "agent.think",             status: "ok",      ms: 1_420 },
  { step: 7,   action: "tool.bash",               status: "ok",      ms: 288 },
  { step: 8,   action: "tool.grep",               status: "ok",      ms: 19  },
  { step: 9,   action: "tool.bash",               status: "err",     ms: 401 },
  { step: 10,  action: "agent.retry",             status: "ok",      ms: 5   },
  { step: 11,  action: "tool.bash",               status: "ok",      ms: 376 },
  { step: 12,  action: "tool.read_file",          status: "ok",      ms: 48  },
  { step: 13,  action: "agent.think",             status: "ok",      ms: 980 },
  { step: 14,  action: "tool.write_file",         status: "ok",      ms: 61  },
  { step: 15,  action: "tool.bash",               status: "ok",      ms: 215 },
  { step: 16,  action: "tool.list_dir",           status: "ok",      ms: 11  },
  { step: 17,  action: "tool.bash",               status: "ok",      ms: 330 },
  { step: 18,  action: "agent.observe",           status: "ok",      ms: 9   },
  { step: 19,  action: "tool.bash",               status: "ok",      ms: 298 },
  { step: 20,  action: "reward.compute",          status: "ok",      ms: 44  },
  { step: 21,  action: "agent.think",             status: "ok",      ms: 1_105 },
  { step: 22,  action: "tool.write_file",         status: "ok",      ms: 58  },
  { step: 23,  action: "tool.bash",               status: "ok",      ms: 267 },
  { step: 24,  action: "env.checkpoint",          status: "pending", ms: 0   },
]

// ── ScrollBody ────────────────────────────────────────────────────────────────
// Symmetric two-edge scroll cue: header lights when content is hidden above,
// footer lights when content is hidden below. Both use a stable-box treatment
// (always-render border, conditional border-color + shadow, crossfade transition).
// Header uses downward shadow-scroll-cue; footer uses upward shadow-scroll-cue-inverted.
//
// Edge states:
//   At top:     header off · footer ON   (scrollTop = 0; content hidden below)
//   Mid scroll: header ON  · footer ON   (content hidden on both sides)
//   At bottom:  header ON  · footer off  (scrollTop + clientHeight = scrollHeight)
//
// Body content combines a form section with a long activity list — demonstrates
// scroll cue with mixed interactive content.
//
// The lg size (720px) gives the panel enough width to mirror the dialog's
// trajectory-list composition at full fidelity. Scroll the body to observe
// both cues activate and deactivate.

function ScrollBodyExample() {
  const [open, setOpen] = React.useState(true)
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button variant="secondary" onClick={() => setOpen(true)}>Open drawer</Button>
      </div>
      <Drawer direction="right" open={open} onOpenChange={setOpen}>
        <DrawerContent size="lg">
          <DrawerHeader>
            <div>
              <DrawerTitle>Pause evaluation run?</DrawerTitle>
              <DrawerDescription>
                The run will suspend at the end of the current step and resume from
                that checkpoint. In-progress tool calls will complete before pausing.
              </DrawerDescription>
            </div>
            <DrawerCloseButton />
          </DrawerHeader>
          <DrawerBody>
            <form className="flex flex-col gap-4 mb-6">
              <FormField id="drawer-pause-reason" label="Reason (optional)">
                <Textarea
                  id="drawer-pause-reason"
                  rows={3}
                  placeholder="e.g. unexpected reward signal, needs manual review"
                />
              </FormField>
              <FormField id="drawer-resume-strategy" label="Resume strategy">
                <Select>
                  <SelectTrigger id="drawer-resume-strategy" className="w-full">
                    <SelectValue placeholder="Select a strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual resume</SelectItem>
                    <SelectItem value="auto-review">Auto-resume after review</SelectItem>
                    <SelectItem value="discard">Discard and restart</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <div className="flex items-center gap-2">
                <Switch id="drawer-notify-resume" />
                <Label htmlFor="drawer-notify-resume">Email me when the run resumes</Label>
              </div>
              <FormField id="drawer-snapshot-retention" label="Snapshot retention">
                <Select>
                  <SelectTrigger id="drawer-snapshot-retention" className="w-full">
                    <SelectValue placeholder="Select retention period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Keep 7 days</SelectItem>
                    <SelectItem value="30d">Keep 30 days</SelectItem>
                    <SelectItem value="indefinite">Keep indefinitely</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </form>
            <div className="mb-3 rounded-md border border-border bg-card px-3 py-2">
              <p className="text-sm font-medium text-foreground">eval-run-042</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                claude-3-7-sonnet · step 24 of 200 · sandbox-env-007
              </p>
            </div>
            <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Trajectory — steps executed
            </p>
            <div className="flex flex-col divide-y divide-border rounded-md border border-border">
              {TRAJECTORY_STEPS.map(({ step, action, status, ms }) => (
                <div key={step} className="flex items-center justify-between px-3 py-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                      {step}
                    </span>
                    <span className="truncate text-sm text-foreground font-mono">{action}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span
                      className={
                        status === "err"
                          ? "text-xs text-destructive font-medium"
                          : status === "pending"
                            ? "text-xs text-muted-foreground"
                            : "text-xs text-muted-foreground"
                      }
                    >
                      {status === "pending" ? "pending" : status === "err" ? "err" : "ok"}
                    </span>
                    {ms > 0 && (
                      <span className="text-xs tabular-nums text-muted-foreground w-14 text-right">
                        {ms >= 1_000 ? `${(ms / 1_000).toFixed(2)}s` : `${ms}ms`}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </DrawerBody>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DrawerClose>
            <Button variant="primary">Pause run</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

export const ScrollBody: Story = {
  render: () => <ScrollBodyExample />,
  parameters: { layout: "padded" },
}

// ── Form helpers ──────────────────────────────────────────────────────────────

const MODEL_OPTIONS = [
  { value: "claude-opus-4-7",    label: "claude-opus-4-7" },
  { value: "gpt-4o",             label: "gpt-4o" },
  { value: "gemini-2.0-flash",   label: "gemini-2.0-flash" },
] as const

const ENVIRONMENT_OPTIONS = [
  { value: "browser-use",   label: "browser-use" },
  { value: "computer-use",  label: "computer-use" },
  { value: "sheets",        label: "sheets" },
  { value: "web-shop",      label: "web-shop" },
  { value: "swe-bench",     label: "swe-bench" },
]

type FieldValues = {
  name: string
  model: string
  environment: string | null
  retries: boolean
}

type FieldErrors = Partial<Record<keyof FieldValues, string>>

const EMPTY_VALUES: FieldValues = {
  name: "",
  model: "",
  environment: null,
  retries: false,
}

interface NewEvalRunDrawerProps {
  /** Pre-seed errors for the WithFormErrors story. */
  initialErrors?: FieldErrors
  /** Controlled open state. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

function NewEvalRunDrawer({ initialErrors, open: controlledOpen, onOpenChange }: NewEvalRunDrawerProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen
  const setOpen = isControlled ? (onOpenChange ?? (() => {})) : setUncontrolledOpen

  const [values, setValues] = React.useState<FieldValues>(EMPTY_VALUES)
  const [errors, setErrors] = React.useState<FieldErrors>(initialErrors ?? {})

  const didSeedRef = React.useRef(false)
  React.useEffect(() => {
    if (!didSeedRef.current && initialErrors) {
      setErrors(initialErrors)
      didSeedRef.current = true
    }
  }, [initialErrors])

  function handleOpenChange(next: boolean) {
    if (!next) {
      setValues(EMPTY_VALUES)
      setErrors({})
    }
    setOpen(next)
  }

  function validate(): FieldErrors {
    const errs: FieldErrors = {}
    if (!values.name.trim()) errs.name = "Name is required"
    if (!values.model) errs.model = "Model is required"
    return errs
  }

  function handleSubmit() {
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    console.log("New evaluation run payload:", values)
    setValues(EMPTY_VALUES)
    setErrors({})
    setOpen(false)
  }

  return (
    <Drawer direction="right" open={open} onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild>
        <Button variant="primary">New evaluation run</Button>
      </DrawerTrigger>

      <DrawerContent size="md">
        <DrawerHeader>
          <div>
            <DrawerTitle>New evaluation run</DrawerTitle>
            <DrawerDescription>
              Configure and launch a new eval run against a model and environment.
            </DrawerDescription>
          </div>
          <DrawerCloseButton />
        </DrawerHeader>

        <DrawerBody>
          <div className="flex flex-col gap-4">
            {/* Name */}
            <FormField
              id="drawer-eval-run-name"
              label="Name"
              required
              error={errors.name}
            >
              <Input
                type="text"
                placeholder="e.g. baseline-run-001"
                value={values.name}
                onChange={(e) => {
                  setValues((v) => ({ ...v, name: e.target.value }))
                  if (errors.name) setErrors((err) => ({ ...err, name: undefined }))
                }}
              />
            </FormField>

            {/* Model */}
            <FormField
              id="drawer-eval-run-model"
              label="Model"
              required
              error={errors.model}
            >
              <Select
                value={values.model || undefined}
                onValueChange={(val) => {
                  setValues((v) => ({ ...v, model: val }))
                  if (errors.model) setErrors((err) => ({ ...err, model: undefined }))
                }}
              >
                <SelectTrigger
                  id="drawer-eval-run-model"
                  aria-invalid={errors.model ? true : undefined}
                  aria-describedby={errors.model ? "drawer-eval-run-model-error" : undefined}
                  className="w-full"
                >
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {MODEL_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            {/* Environment */}
            <FormField
              id="drawer-eval-run-environment"
              label="Environment"
              helper="The sandbox environment agents will interact with."
            >
              <Combobox
                options={ENVIRONMENT_OPTIONS}
                value={values.environment}
                onValueChange={(val) => setValues((v) => ({ ...v, environment: val }))}
                placeholder="Search environments…"
              />
            </FormField>

            {/* Retries */}
            <div className="flex items-center gap-2 min-h-[var(--size-input-h)]">
              <Checkbox
                id="drawer-eval-run-retries"
                checked={values.retries}
                onCheckedChange={(checked) =>
                  setValues((v) => ({ ...v, retries: checked === true }))
                }
              />
              <Label htmlFor="drawer-eval-run-retries">Enable retries on failure</Label>
            </div>
          </div>
        </DrawerBody>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DrawerClose>
          <Button variant="primary" onClick={handleSubmit}>
            Start run
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function WithFormErrorsDemo() {
  const [open, setOpen] = React.useState(true)

  return (
    <NewEvalRunDrawer
      open={open}
      onOpenChange={setOpen}
      initialErrors={{
        name: "Name is required",
        model: "Model is required",
      }}
    />
  )
}

// ── WithForm ──────────────────────────────────────────────────────────────────
// Drawer closed on mount; click "New evaluation run" to open the form.
// Submit with empty fields to trigger client-side validation.

export const WithForm: Story = {
  render: () => <NewEvalRunDrawer />,
  parameters: { layout: "padded" },
}

// ── WithFormErrors ────────────────────────────────────────────────────────────
// Drawer opens on mount with Name and Model errors pre-seeded — error styling
// is immediately visible without needing to trigger a failed submit.

export const WithFormErrors: Story = {
  render: () => <WithFormErrorsDemo />,
  parameters: { layout: "padded" },
}
