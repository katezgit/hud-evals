"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpenIcon, ChevronRight, PlayIcon } from "lucide-react";
import { toast } from "sonner";
import { tasksets, getTaskset } from "@/lib/mock/tasksets";
import { StepEvalModels } from "./step-eval-models";
import { StepTaskset } from "./step-taskset";
import { StepEvalReview } from "./step-eval-review";
import {
  StepperHeader,
  type StepDef,
  type StepKey,
} from "./stepper-header";
import { WizardFooter } from "./wizard-footer";

export interface EvalWizardProps {
  prefilledTasksetId: string | null;
}

const EVAL_STEPS: ReadonlyArray<StepDef> = [
  {
    key: "taskset",
    label: "Taskset",
    description: "Pick a taskset to evaluate against.",
    number: 1,
  },
  {
    key: "model",
    label: "Models",
    description: "Pick models to evaluate.",
    number: 2,
  },
  {
    key: "review",
    label: "Review",
    description: "Review the settings and launch.",
    number: 3,
  },
];

const EVAL_STEP_LABELS: Record<StepKey, string> = {
  model: "Models",
  taskset: "Taskset",
  tasks: "Tasks",
  review: "Review",
};

const STEP_ORDER: ReadonlyArray<StepKey> = ["taskset", "model", "review"];

const DEFAULT_MAX_STEPS = 15;
const DEFAULT_GROUP_SIZE = 3;
const DEFAULT_CONCURRENCY = 10;

export function EvalWizard({ prefilledTasksetId }: EvalWizardProps) {
  const router = useRouter();

  const [step, setStep] = useState<StepKey>("taskset");
  const [visited, setVisited] = useState<ReadonlySet<StepKey>>(
    () => new Set(["taskset"]),
  );

  const [modelSelection, setModelSelection] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const [tasksetId, setTasksetId] = useState<string | null>(prefilledTasksetId);
  const [tasksetLocked, setTasksetLocked] = useState<boolean>(
    prefilledTasksetId !== null,
  );

  const [maxSteps, setMaxSteps] = useState<number>(DEFAULT_MAX_STEPS);
  const [groupSize, setGroupSize] = useState<number>(DEFAULT_GROUP_SIZE);
  const [perTaskEnv, setPerTaskEnv] = useState<boolean>(false);
  const [concurrency, setConcurrency] = useState<number>(DEFAULT_CONCURRENCY);

  const taskset = tasksetId ? (getTaskset(tasksetId) ?? null) : null;

  const stepIndex = STEP_ORDER.indexOf(step);
  const nextStep = STEP_ORDER[stepIndex + 1] ?? null;
  const prevStep = STEP_ORDER[stepIndex - 1] ?? null;

  const modelCount = modelSelection.size;
  const totalTasksInTaskset = taskset?.taskCount ?? 0;
  const traceCount = modelCount * totalTasksInTaskset * groupSize;

  const canAdvance: Record<StepKey, boolean> = {
    taskset: taskset !== null,
    model: modelCount > 0,
    tasks: true,
    review: true,
  };

  const hasEdits =
    modelCount > 0 ||
    tasksetId !== prefilledTasksetId ||
    maxSteps !== DEFAULT_MAX_STEPS ||
    groupSize !== DEFAULT_GROUP_SIZE ||
    perTaskEnv !== false ||
    concurrency !== DEFAULT_CONCURRENCY;

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
    toast.success("Eval job queued", {
      description: `${modelCount} ${modelCount === 1 ? "model" : "models"} × ${totalTasksInTaskset} ${totalTasksInTaskset === 1 ? "task" : "tasks"} × ${groupSize} = ${traceCount.toLocaleString()} traces.`,
    });
    router.push(`/jobs/${mockId}`);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-border bg-background pt-6">
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
                New eval job
              </span>
            </nav>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h1 className="text-display font-semibold text-foreground">
                  New Eval Job
                </h1>
                <a
                  href="https://docs.hud.ai/quick-links/eval"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Eval documentation, opens in new tab"
                  className="inline-flex items-center justify-center rounded-sm text-muted-foreground hover:text-foreground focus-visible:shadow-focus-ring outline-hidden"
                >
                  <BookOpenIcon aria-hidden="true" className="size-3.5" />
                </a>
              </div>
              <p className="text-body text-muted-foreground">
                Compare one or more models on a taskset.
              </p>
            </div>
          </header>
        </div>
      </div>

      <div className="shrink-0 page-shell block py-0 pt-6">
        <div className="mx-auto w-full max-w-[1100px]">
          <StepperHeader
            activeStep={step}
            steps={EVAL_STEPS}
            visited={visited}
            onStepClick={goToStep}
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <div className="page-shell block py-0 flex-1 min-h-0 flex flex-col">
          <div className="mx-auto w-full max-w-[1100px] pt-8 pb-8 flex-1 min-h-0 flex flex-col">
            {step === "taskset" && (
              <StepTaskset
                selectedId={tasksetId}
                locked={tasksetLocked}
                modelId={null}
                tasksets={tasksets}
                onSelect={(id) => setTasksetId(id)}
                onUnlock={() => {
                  setTasksetLocked(false);
                  setTasksetId(null);
                }}
              />
            )}
            {step === "model" && (
              <StepEvalModels
                selection={modelSelection}
                onSelectionChange={setModelSelection}
                tasksetName={taskset?.name ?? null}
              />
            )}
            {step === "review" && (
              <StepEvalReview
                modelCount={modelCount}
                taskCount={totalTasksInTaskset}
                maxSteps={maxSteps}
                onMaxStepsChange={setMaxSteps}
                groupSize={groupSize}
                onGroupSizeChange={setGroupSize}
                perTaskEnv={perTaskEnv}
                onPerTaskEnvChange={setPerTaskEnv}
                concurrency={concurrency}
                onConcurrencyChange={setConcurrency}
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
        stepLabels={EVAL_STEP_LABELS}
        launchLabel={`Run ${totalTasksInTaskset} ${totalTasksInTaskset === 1 ? "Task" : "Tasks"}`}
        launchIcon={<PlayIcon aria-hidden="true" className="size-3.5" />}
        discardTitle="Discard eval configuration?"
        discardBody="Your selections will not be saved."
      />
    </div>
  );
}
