"use client";

import { TriangleAlertIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import { cn } from "@repo/ui/lib/cn";
import type { Taskset } from "@/lib/mock/tasksets";
import {
  deriveTrainingMethod,
  estimateTraining,
  type TrainingModelRow,
} from "@/lib/mock/job-create";
import type { ReasoningEffort } from "./training-wizard";

export interface StepReviewProps {
  model: TrainingModelRow;
  taskset: Taskset;
  // Accepted but unused — orphan state in training-wizard awaits a separate cleanup pass.
  reasoningEffort?: ReasoningEffort;
  onReasoningEffortChange?: (next: ReasoningEffort) => void;
}

export function StepReview({ model, taskset }: StepReviewProps) {
  const method = deriveTrainingMethod(model.provider);
  const estimate = estimateTraining();

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-6 px-1">
        <SummaryBlock model={model} taskset={taskset} method={method} />

        <SectionLabel>Estimates</SectionLabel>

        <dl className="grid grid-cols-3 overflow-hidden rounded-lg border border-border">
          <EstimateCell label="Estimated time" value={estimate.estimatedTime} />
          <EstimateCell label="Hourly rate" value={estimate.hourlyRate} />
          <EstimateCell
            label="Estimated cost"
            value={estimate.estimatedCost}
            last
          />
        </dl>

        <ImportantNotesCallout provider={method.via} />
      </div>
    </ScrollArea>
  );
}

function SummaryBlock({
  model,
  taskset,
  method,
}: {
  model: TrainingModelRow;
  taskset: Taskset;
  method: { method: string; via: string };
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-elevated-surface px-4 py-4">
      <p className="text-body font-medium text-foreground">
        Training{" "}
        <span className="text-foreground">{model.name}</span> on{" "}
        <span className="text-foreground">{taskset.name}</span> with{" "}
        {method.via} using {method.method}.
      </p>
      <p className="flex items-center gap-2 text-caption text-muted-foreground">
        Training method: {method.method} via {method.via}
        <span className="inline-flex items-center rounded-sm border border-border-strong bg-elevated-surface px-1.5 py-0.5 text-meta font-semibold uppercase tracking-wider text-meta-foreground">
          derived from model provider
        </span>
      </p>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-meta font-semibold uppercase tracking-wider text-meta-foreground">
      {children}
    </h3>
  );
}

function EstimateCell({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 px-4 py-4",
        !last && "border-r border-border",
      )}
    >
      <dt className="text-meta font-semibold uppercase tracking-wider text-meta-foreground">
        {label}
      </dt>
      <dd className="text-display font-semibold tabular-nums text-foreground">
        {value}
      </dd>
    </div>
  );
}

function ImportantNotesCallout({ provider }: { provider: string }) {
  return (
    <Alert variant="warning">
      <TriangleAlertIcon aria-hidden="true" />
      <AlertTitle>Important notes for {provider} training</AlertTitle>
      <AlertDescription>
        <ul className="flex flex-col gap-1">
          <NoteItem>
            <strong className="font-semibold text-foreground">
              Environment startup time:
            </strong>{" "}
            Must be under 60 seconds.
          </NoteItem>
          <NoteItem>
            <strong className="font-semibold text-foreground">
              Rate limits:
            </strong>{" "}
            Environment needs to handle bursts of 50 req/s.
          </NoteItem>
          <NoteItem>
            <strong className="font-semibold text-foreground">
              Vision tasks:
            </strong>{" "}
            Not currently supported for training.
          </NoteItem>
        </ul>
      </AlertDescription>
    </Alert>
  );
}

function NoteItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span aria-hidden="true" className="mt-1.5 size-1 rounded-full bg-state-warning" />
      <span className="flex-1">{children}</span>
    </li>
  );
}
