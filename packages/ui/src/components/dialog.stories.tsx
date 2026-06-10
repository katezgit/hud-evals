"use client"

import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { Trash2 } from "lucide-react"
import { Button } from "./button"
import { Checkbox } from "./checkbox"
import { Combobox } from "./combobox"
import {
  Dialog,
  DialogBody,
  DialogCancelButton,
  DialogConfirmButton,
  DialogContent,
  DialogDestructiveButton,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog"
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

const meta: Meta<typeof DialogContent> = {
  title: "Components/Dialog",
  component: DialogContent,
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    showCloseButton: {
      control: "boolean",
    },
  },
  args: {
    size: "md",
    showCloseButton: true,
  },
  parameters: { layout: "centered" },
}

export default meta
type Story = StoryObj<typeof meta>

// ── Playground ────────────────────────────────────────────────────────────────

export const Playground: Story = {
  render: (args) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Open dialog</Button>
      </DialogTrigger>
      <DialogContent {...args}>
        <DialogHeader>
          <DialogTitle>Pause evaluation run?</DialogTitle>
          <DialogDescription>The run will suspend at the end of the current step and resume from that checkpoint.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <p className="text-muted-foreground">eval-run-042 · claude-3-7-sonnet · step 64 of 200</p>
        </DialogBody>
        <DialogFooter>
          <DialogCancelButton />
          <DialogConfirmButton />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  parameters: { layout: "padded" },
}

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
// This story opens with enough rows to guarantee overflow at any typical canvas
// size. Scroll the body to observe both cues activate and deactivate.

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
  { step: 25,  action: "agent.think",             status: "ok",      ms: 1_330 },
  { step: 26,  action: "tool.bash",               status: "ok",      ms: 183 },
  { step: 27,  action: "tool.read_file",          status: "ok",      ms: 42  },
  { step: 28,  action: "tool.write_file",         status: "ok",      ms: 77  },
  { step: 29,  action: "reward.compute",          status: "ok",      ms: 39  },
  { step: 30,  action: "agent.observe",           status: "ok",      ms: 7   },
  { step: 31,  action: "tool.bash",               status: "ok",      ms: 412 },
  { step: 32,  action: "tool.grep",               status: "ok",      ms: 14  },
  { step: 33,  action: "tool.bash",               status: "err",     ms: 388 },
  { step: 34,  action: "agent.retry",             status: "ok",      ms: 5   },
  { step: 35,  action: "tool.bash",               status: "ok",      ms: 249 },
  { step: 36,  action: "env.snapshot",            status: "ok",      ms: 88  },
]

function ScrollBodyExample() {
  const [open, setOpen] = React.useState(true)
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button variant="secondary" onClick={() => setOpen(true)}>Open dialog</Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
    <DialogContent size="md">
      <DialogHeader>
        <DialogTitle>Pause evaluation run?</DialogTitle>
        <DialogDescription>
          The run will suspend at the end of the current step and resume from
          that checkpoint. In-progress tool calls will complete before pausing.
        </DialogDescription>
      </DialogHeader>
      <DialogBody>
        <form className="flex flex-col gap-4 mb-6">
          <FormField id="dialog-pause-reason" label="Reason (optional)">
            <Textarea
              id="dialog-pause-reason"
              rows={3}
              placeholder="e.g. unexpected reward signal, needs manual review"
            />
          </FormField>
          <FormField id="dialog-resume-strategy" label="Resume strategy">
            <Select>
              <SelectTrigger id="dialog-resume-strategy" className="w-full">
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
            <Switch id="dialog-notify-resume" />
            <Label htmlFor="dialog-notify-resume">Email me when the run resumes</Label>
          </div>
          <FormField id="dialog-snapshot-retention" label="Snapshot retention">
            <Select>
              <SelectTrigger id="dialog-snapshot-retention" className="w-full">
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
            claude-3-7-sonnet · step 36 of 200 · sandbox-env-007
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
      </DialogBody>
      <DialogFooter>
        <DialogCancelButton />
        <DialogConfirmButton>Pause run</DialogConfirmButton>
      </DialogFooter>
    </DialogContent>
      </Dialog>
    </div>
  )
}

export const ScrollBody: Story = {
  render: () => <ScrollBodyExample />,
  parameters: { layout: "padded" },
}

// ── Variants ──────────────────────────────────────────────────────────────────
// sm / md / lg sizes + showCloseButton=false + destructive footer.

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {(["sm", "md", "lg"] as const).map((size) => (
        <Dialog key={size}>
          <DialogTrigger asChild>
            <Button variant="secondary">Size {size}</Button>
          </DialogTrigger>
          <DialogContent size={size}>
            <DialogHeader>
              <DialogTitle>Export trajectory data</DialogTitle>
              <DialogDescription>
                {size === "sm"
                  ? "Selected trajectories will be exported as JSONL to your connected storage bucket."
                  : size === "md"
                    ? "Selected trajectories will be exported as JSONL to your connected storage bucket. Large exports may take a few minutes to complete."
                    : "Selected trajectories will be exported as JSONL to your connected storage bucket. You can monitor export progress from the Jobs panel and download the archive once it is ready."}
              </DialogDescription>
            </DialogHeader>
            <DialogBody>
              <p className="text-muted-foreground">{size} panel · export-job-{size}-001</p>
            </DialogBody>
            <DialogFooter>
              <DialogCancelButton />
              <DialogConfirmButton />
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ))}

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="secondary">No close button</Button>
        </DialogTrigger>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Apply environment snapshot?</DialogTitle>
            <DialogDescription>The current sandbox state will be replaced with the selected snapshot. In-progress steps will be discarded.</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <p className="text-muted-foreground">snapshot-2026-05-27-baseline · env-sandbox-003</p>
          </DialogBody>
          <DialogFooter>
            <DialogCancelButton />
            <DialogConfirmButton />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="destructive">
            <Trash2 className="h-4 w-4" />
            Delete run
          </Button>
        </DialogTrigger>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Delete eval run?</DialogTitle>
            <DialogDescription>
              Permanently removes the run and all trajectory data.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="rounded-md border border-border bg-card p-3">
              <p className="text-sm font-medium text-foreground">eval-run-007</p>
              <p className="text-xs text-muted-foreground mt-0.5">claude-3-5-sonnet · 128 steps</p>
            </div>
          </DialogBody>
          <DialogFooter>
            <DialogCancelButton />
            <DialogDestructiveButton>Delete run</DialogDestructiveButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  ),
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

interface NewEvalRunFormProps {
  /** Pre-seed errors for the WithFormErrors story. */
  initialErrors?: FieldErrors
  /** Controlled open state. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

function NewEvalRunForm({ initialErrors, open: controlledOpen, onOpenChange }: NewEvalRunFormProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen
  const setOpen = isControlled ? (onOpenChange ?? (() => {})) : setUncontrolledOpen

  const [values, setValues] = React.useState<FieldValues>(EMPTY_VALUES)
  const [errors, setErrors] = React.useState<FieldErrors>(initialErrors ?? {})

  // Sync initialErrors into state when the story mounts with pre-seeded errors.
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="primary">New evaluation run</Button>
      </DialogTrigger>

      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>New evaluation run</DialogTitle>
          <DialogDescription>
            Configure and launch a new eval run against a model and environment.
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <div className="flex flex-col gap-4">
            {/* Name */}
            <FormField
              id="eval-run-name"
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
              id="eval-run-model"
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
                  id="eval-run-model"
                  aria-invalid={errors.model ? true : undefined}
                  aria-describedby={errors.model ? "eval-run-model-error" : undefined}
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
              id="eval-run-environment"
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
                id="eval-run-retries"
                checked={values.retries}
                onCheckedChange={(checked) =>
                  setValues((v) => ({ ...v, retries: checked === true }))
                }
              />
              <Label htmlFor="eval-run-retries">Enable retries on failure</Label>
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <DialogCancelButton />
          <Button variant="primary" onClick={handleSubmit}>
            Start run
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function WithFormErrorsDemo() {
  const [open, setOpen] = React.useState(true)

  return (
    <NewEvalRunForm
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
// Dialog closed on mount; click "New evaluation run" to open the form.
// Submit with empty fields to trigger client-side validation.

export const WithForm: Story = {
  render: () => <NewEvalRunForm />,
  parameters: { layout: "centered" },
}

// ── WithFormErrors ────────────────────────────────────────────────────────────
// Dialog opens on mount with Name and Model errors pre-seeded — error styling
// is immediately visible without needing to trigger a failed submit.

export const WithFormErrors: Story = {
  render: () => <WithFormErrorsDemo />,
  parameters: { layout: "centered" },
}
