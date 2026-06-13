import { CheckIcon } from "lucide-react";
import { cn } from "@repo/ui/lib/cn";

export type StepKey = "model" | "taskset" | "tasks" | "review";

export interface StepDef {
  key: StepKey;
  label: string;
  description: string;
  number: number;
}

export const TRAINING_STEPS: ReadonlyArray<StepDef> = [
  {
    key: "model",
    label: "Model",
    description: "Choose the model checkpoint to train.",
    number: 1,
  },
  {
    key: "taskset",
    label: "Taskset",
    description: "Select the taskset to train against.",
    number: 2,
  },
  {
    key: "tasks",
    label: "Tasks",
    description: "Pick which tasks to include.",
    number: 3,
  },
  {
    key: "review",
    label: "Review",
    description: "Confirm configuration and launch.",
    number: 4,
  },
];

export interface StepperHeaderProps {
  activeStep: StepKey;
  /** Step definitions. Defaults to TRAINING_STEPS for back-compat. */
  steps?: ReadonlyArray<StepDef>;
  /** Retained for prop-API stability; stepper is presentational and does not navigate. */
  visited?: ReadonlySet<StepKey>;
  /** Retained for prop-API stability; stepper is presentational and does not navigate. */
  onStepClick?: (key: StepKey) => void;
}

export function StepperHeader({
  activeStep,
  steps = TRAINING_STEPS,
}: StepperHeaderProps) {
  const activeIndex = steps.findIndex((s) => s.key === activeStep);
  const currentStep = steps[activeIndex] ?? steps[0];

  return (
    <>
      {currentStep && (
        <div
          role="group"
          aria-label="Wizard progress"
          className="flex flex-col gap-1 md:hidden"
        >
          <p className="text-meta text-meta-foreground">
            Step {activeIndex + 1} of {steps.length}
          </p>
          <h2 className="text-subtitle font-semibold text-foreground">
            {currentStep.label}
          </h2>
          <p className="text-body text-muted-foreground">
            {currentStep.description}
          </p>
        </div>
      )}
      <ol
        role="list"
        aria-label="Wizard progress"
        className="hidden md:flex items-start"
      >
        {steps.map((step, idx) => {
        const isCurrent = idx === activeIndex;
        const isCompleted = idx < activeIndex;
        const isLast = idx === steps.length - 1;

        return (
          <li
            key={step.key}
            aria-current={isCurrent ? "step" : undefined}
            className="flex flex-1 flex-col last:flex-none"
          >
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={cn(
                  "inline-flex size-8 shrink-0 items-center justify-center rounded-full text-body font-semibold",
                  isCurrent && "bg-primary text-primary-foreground",
                  isCompleted &&
                    "border-2 border-primary bg-panel text-primary",
                  !isCurrent &&
                    !isCompleted &&
                    "border-[1.5px] border-border-strong bg-transparent font-medium text-text-disabled",
                )}
              >
                {isCompleted ? (
                  <CheckIcon className="size-4" strokeWidth={2} />
                ) : (
                  step.number
                )}
              </span>
              <span
                className={cn(
                  "text-subtitle font-semibold whitespace-nowrap",
                  isCurrent ? "text-foreground" : "text-meta-foreground",
                )}
              >
                {step.label}
              </span>
              {!isLast && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "mx-3 h-px flex-1",
                    isCompleted ? "bg-primary" : "bg-border-strong",
                  )}
                />
              )}
            </div>
            <span className="ml-10 mt-1 text-body text-muted-foreground">
              {step.description}
            </span>
          </li>
        );
        })}
      </ol>
    </>
  );
}
