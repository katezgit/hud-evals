"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpenIcon, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { tasksets, getTaskset } from "@/lib/mock/tasksets";
import { getTrainingModel, type TrainingModelRow } from "@/lib/mock/job-create";
import { BaselineEvalDrawer } from "./baseline-eval-drawer";
import { StepperHeader, type StepKey } from "./stepper-header";
import { StepModel } from "./step-model";
import { StepTaskset } from "./step-taskset";
import { StepTasks } from "./step-tasks";
import { StepReview } from "./step-review";
import { WizardFooter } from "./wizard-footer";

export interface TrainingWizardProps {
  prefilledModelId: string | null;
  prefilledTasksetId: string | null;
}

export type ReasoningEffort = "low" | "medium" | "high";

const STEP_ORDER: ReadonlyArray<StepKey> = [
  "model",
  "taskset",
  "tasks",
  "review",
];

export function TrainingWizard({
  prefilledModelId,
  prefilledTasksetId,
}: TrainingWizardProps) {
  const router = useRouter();

  const [step, setStep] = useState<StepKey>("model");
  const [visited, setVisited] = useState<ReadonlySet<StepKey>>(
    () => new Set(["model"]),
  );

  // ── Form state. The taskset locked-from-URL boolean is stored once at mount
  // so the user can still hit [Change] to unlock without losing the original
  // signal. The model picker treats `?modelId=` as a prefill, not a lock —
  // an invalid prefill id is dropped to null so no phantom selection sticks;
  // the raw requested id is forwarded so the picker can render an inline error.
  const [modelId, setModelId] = useState<string | null>(() =>
    prefilledModelId && getTrainingModel(prefilledModelId)
      ? prefilledModelId
      : null,
  );

  const [tasksetId, setTasksetId] = useState<string | null>(prefilledTasksetId);
  const [tasksetLocked, setTasksetLocked] = useState<boolean>(
    prefilledTasksetId !== null,
  );

  // Task selection — defaults to "all tasks of the selected taskset" so Sam's
  // 5-click path doesn't ask him to tick four checkboxes for no reason.
  const tasksetTaskIds = useMemo<ReadonlyArray<string>>(() => {
    if (!tasksetId) return [];
    const ts = getTaskset(tasksetId);
    if (!ts) return [];
    return ts.tasks.map((t) => t.taskId);
  }, [tasksetId]);

  const [taskSelection, setTaskSelection] = useState<ReadonlySet<string>>(
    () => new Set(tasksetTaskIds),
  );
  const [taskCountAcknowledged, setTaskCountAcknowledged] =
    useState<boolean>(false);

  // Reset task selection when the taskset changes (treated as a fresh choice).
  const [lastTasksetId, setLastTasksetId] = useState<string | null>(tasksetId);
  if (lastTasksetId !== tasksetId) {
    setLastTasksetId(tasksetId);
    setTaskSelection(new Set(tasksetTaskIds));
    setTaskCountAcknowledged(false);
  }

  const [reasoningEffort, setReasoningEffort] =
    useState<ReasoningEffort>("medium");

  // Baseline eval is a side-quest from Step 2: open over the dimmed wizard so
  // training config state is preserved when the user returns.
  const [baselineDrawerOpen, setBaselineDrawerOpen] = useState<boolean>(false);

  const model: TrainingModelRow | null = modelId
    ? (getTrainingModel(modelId) ?? null)
    : null;
  const taskset = tasksetId ? (getTaskset(tasksetId) ?? null) : null;

  const stepIndex = STEP_ORDER.indexOf(step);
  const nextStep = STEP_ORDER[stepIndex + 1] ?? null;
  const prevStep = STEP_ORDER[stepIndex - 1] ?? null;

  const selectedTaskCount = taskSelection.size;
  const needsTaskAck =
    selectedTaskCount > 0 && selectedTaskCount < 10 && !taskCountAcknowledged;

  const canAdvance: Record<StepKey, boolean> = {
    model: model !== null,
    taskset: taskset !== null,
    tasks: selectedTaskCount > 0 && !needsTaskAck,
    review: true,
  };

  // Edits = anything diverging from the initial state we'd restore on cancel.
  // The full-taskset selection is the *default* after picking a taskset, so a
  // taskset pick alone is an edit but a same-selection round-trip is not.
  // For the model: an invalid prefill id is dropped to null at mount; comparing
  // against that resolved baseline (not the raw URL value) avoids reading the
  // initial load itself as an edit.
  const taskSelectionIsDefault =
    taskSelection.size === tasksetTaskIds.length &&
    tasksetTaskIds.every((id) => taskSelection.has(id));
  const resolvedPrefilledModelId =
    prefilledModelId && getTrainingModel(prefilledModelId)
      ? prefilledModelId
      : null;
  const hasEdits =
    modelId !== resolvedPrefilledModelId ||
    tasksetId !== prefilledTasksetId ||
    !taskSelectionIsDefault ||
    reasoningEffort !== "medium";

  const goToStep = (next: StepKey) => {
    setStep(next);
    setVisited((prev) => {
      if (prev.has(next)) return prev;
      const out = new Set(prev);
      out.add(next);
      return out;
    });
  };

  const goNext = () => {
    if (!nextStep || !canAdvance[step]) return;
    goToStep(nextStep);
  };
  const goPrev = () => {
    if (!prevStep) return;
    goToStep(prevStep);
  };
  const goCancel = () => router.push("/jobs");

  const launch = () => {
    const mockId = `job_${Math.random().toString(36).slice(2, 8)}`;
    toast.success("Training job queued", {
      description: `${model?.name ?? "Model"} on ${taskset?.name ?? "taskset"} — ${selectedTaskCount} tasks.`,
    });
    router.push(`/jobs/${mockId}`);
  };

  // Single-scroll discipline: the wizard body is bounded (`overflow-hidden`)
  // and each step owns its own internal scroll. The body itself cannot scroll,
  // so there is no possibility of a page-body scrollbar racing a ScrollArea
  // inside a step. Header chrome (title + stepper) and footer are shrink-0
  // siblings of the bounded body; the footer covers nothing because nothing
  // can scroll past the body's region.
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 bg-background pt-6">
        <div className="page-shell block py-0">
          <header className="flex flex-col gap-3 pt-2 pb-6">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1 text-label tracking-normal normal-case text-muted-foreground"
            >
              <Link
                href="/jobs"
                className="rounded-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Jobs
              </Link>
              <ChevronRight
                aria-hidden="true"
                className="size-3 text-meta-foreground"
              />
              <span aria-current="page" className="truncate text-foreground">
                New training job
              </span>
            </nav>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h1 className="text-display font-semibold text-foreground">
                  New Training Job
                </h1>
                <a
                  href="https://docs.hud.ai/quick-links/training"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Training documentation, opens in new tab"
                  className="inline-flex items-center justify-center rounded-sm text-muted-foreground hover:text-foreground focus-visible:shadow-focus-ring outline-hidden"
                >
                  <BookOpenIcon aria-hidden="true" className="size-3.5" />
                </a>
              </div>
              <p className="text-body text-muted-foreground">
                Configure a training run for a model checkpoint.
              </p>
            </div>
          </header>
        </div>
      </div>

      <div className="shrink-0 page-shell block py-0 pt-6">
        <div className="mx-auto w-full max-w-[1100px]">
          <StepperHeader
            activeStep={step}
            visited={visited}
            onStepClick={goToStep}
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <div className="page-shell block py-0 flex-1 min-h-0 flex flex-col">
          <div className="mx-auto w-full max-w-[1100px] pt-8 pb-8 flex-1 min-h-0 flex flex-col">
            {step === "model" && (
              <StepModel
                selectedId={modelId}
                requestedId={prefilledModelId}
                onSelect={(id) => setModelId(id)}
                onClearSelection={() => setModelId(null)}
              />
            )}
            {step === "taskset" && (
              <StepTaskset
                selectedId={tasksetId}
                locked={tasksetLocked}
                modelId={modelId}
                tasksets={tasksets}
                onSelect={(id) => setTasksetId(id)}
                onUnlock={() => {
                  setTasksetLocked(false);
                  setTasksetId(null);
                }}
                onRunBaseline={() => setBaselineDrawerOpen(true)}
              />
            )}
            {step === "tasks" && taskset && (
              <StepTasks
                taskset={taskset}
                selection={taskSelection}
                onSelectionChange={setTaskSelection}
                acknowledged={taskCountAcknowledged}
                onAcknowledgedChange={setTaskCountAcknowledged}
              />
            )}
            {step === "review" && model && taskset && (
              <StepReview
                model={model}
                taskset={taskset}
                reasoningEffort={reasoningEffort}
                onReasoningEffortChange={setReasoningEffort}
              />
            )}
          </div>
        </div>
      </div>

      <WizardFooter
        step={step}
        prevStep={prevStep}
        nextStep={nextStep}
        canAdvance={canAdvance[step]}
        hasEdits={hasEdits}
        onCancel={goCancel}
        onPrev={goPrev}
        onNext={goNext}
        onLaunch={launch}
      />

      <BaselineEvalDrawer
        open={baselineDrawerOpen}
        onOpenChange={setBaselineDrawerOpen}
        model={model}
        taskset={taskset}
      />
    </div>
  );
}
