import type { Meta, StoryObj } from "@storybook/react"
import { FileText, Settings, Zap } from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionStepIcon,
  AccordionTrigger,
} from "./accordion"
import { Badge } from "./badge"

const meta: Meta = {
  title: "Components/Accordion",
  parameters: { layout: "padded" },
}

export default meta
type Story = StoryObj<typeof meta>

// ── Playground ────────────────────────────────────────────────────────────────

export const Playground: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <Accordion type="multiple">
        <AccordionItem value="model">
          <AccordionTrigger>Model configuration</AccordionTrigger>
          <AccordionContent>
            <p className="text-body text-muted-foreground">
              Select the model and adjust hyperparameters for this eval run.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="environment">
          <AccordionTrigger>Environment settings</AccordionTrigger>
          <AccordionContent>
            <p className="text-body text-muted-foreground">
              Configure sandbox isolation, memory limits, and execution timeout.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="scoring">
          <AccordionTrigger>Scoring criteria</AccordionTrigger>
          <AccordionContent>
            <p className="text-body text-muted-foreground">
              Define the reward function and pass/fail thresholds.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
}

// ── Variants ──────────────────────────────────────────────────────────────────
// Default (multiple-open) vs Stepper (single-open) side-by-side.

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-10" style={{ maxWidth: 560 }}>
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Default — type=&quot;multiple&quot;, no step-icon
        </p>
        <Accordion type="multiple">
          <AccordionItem value="a">
            <AccordionTrigger>Model configuration</AccordionTrigger>
            <AccordionContent>
              <p className="text-body text-muted-foreground">Config panel content.</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="b">
            <AccordionTrigger>Environment settings</AccordionTrigger>
            <AccordionContent>
              <p className="text-body text-muted-foreground">Config panel content.</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Stepper — type=&quot;single&quot;, step-icons, all four states
        </p>
        <Accordion type="single" collapsible defaultValue="step-active">
          <AccordionItem value="step-completed" stepState="completed">
            <AccordionTrigger
              icon={<AccordionStepIcon stepState="completed" />}
              subtitle="Complete"
              badge={<Badge variant="success" size="sm">Done</Badge>}
            >
              Install SDK
            </AccordionTrigger>
            <AccordionContent stepper>
              <p className="text-body text-muted-foreground">SDK installed.</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="step-active" stepState="active">
            <AccordionTrigger
              icon={<AccordionStepIcon stepState="active" icon={<Settings className="size-4" />} />}
              subtitle="In progress"
            >
              Configure API key
            </AccordionTrigger>
            <AccordionContent stepper>
              <p className="text-body text-muted-foreground">API key configuration.</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="step-default" stepState="default">
            <AccordionTrigger
              icon={<AccordionStepIcon stepState="default" icon={<FileText className="size-4" />} />}
              subtitle="Not started"
            >
              Run first eval
            </AccordionTrigger>
            <AccordionContent stepper>
              <p className="text-body text-muted-foreground">Deploy and start the eval loop.</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="step-locked" stepState="locked">
            <AccordionTrigger
              icon={<AccordionStepIcon stepState="locked" icon={<Zap className="size-4" />} />}
              subtitle="Locked — complete previous steps"
            >
              Review results
            </AccordionTrigger>
            <AccordionContent stepper>
              <p className="text-body text-muted-foreground">Results appear after the eval completes.</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  ),
}
