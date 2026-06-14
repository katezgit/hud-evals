// shadcn-source: radix-wrap:n/a (n/a, 2026-06-14)
// No shadcn primitive exists for a step-indicator. No Radix primitive covers this pattern.
// Implemented as a pure presentational component — no Radix interaction primitives required
// (stepper is display-only; wizard navigation lives in the consumer).

import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "@repo/ui/lib/cn"

export interface StepperStep {
  label: string
  description?: string
}

export interface StepperProps {
  /** Step definitions — ordered array of { label, description? }. */
  steps: ReadonlyArray<StepperStep>
  /**
   * 1-indexed current step.
   * Steps before `currentStep` are 'completed'; `currentStep` is 'active';
   * steps after are 'pending'. Matches the visible numeral ("Step 1 of 4").
   */
  currentStep: number
  /** Accessible label for the wizard progress list. Defaults to "Wizard progress". */
  "aria-label"?: string
  className?: string
}

const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  (
    {
      steps,
      currentStep,
      "aria-label": ariaLabel = "Wizard progress",
      className,
    },
    ref,
  ) => {
    const activeIndex = currentStep - 1
    const currentStepDef = steps[activeIndex] ?? steps[0]

    return (
      <div ref={ref} className={cn("w-full", className)}>
        {/* ── Mobile: single-step summary (<md) ─────────────────────────── */}
        {currentStepDef && (
          <div
            role="group"
            aria-label={ariaLabel}
            className="flex flex-col gap-1 md:hidden"
          >
            <p className="text-meta text-meta-foreground">
              Step {activeIndex + 1} of {steps.length}
            </p>
            <p className="text-subtitle font-semibold text-foreground">
              {currentStepDef.label}
            </p>
            {currentStepDef.description && (
              <p className="text-body text-muted-foreground">
                {currentStepDef.description}
              </p>
            )}
          </div>
        )}

        {/* ── Desktop: horizontal step list (md+) ───────────────────────── */}
        <ol
          role="list"
          aria-label={ariaLabel}
          className="hidden items-start md:flex"
        >
          {steps.map((step, idx) => {
            const isActive = idx === activeIndex
            const isCompleted = idx < activeIndex
            const isLast = idx === steps.length - 1

            return (
              <li
                key={step.label}
                aria-current={isActive ? "step" : undefined}
                className="flex flex-1 flex-col last:flex-none"
              >
                <div className="flex items-center gap-2">
                  {/* numeral/icon is decorative — accessible name comes from <li> text */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "inline-flex size-8 shrink-0 items-center justify-center rounded-full text-body font-semibold",
                      isActive && "bg-primary text-primary-foreground",
                      isCompleted &&
                        "border-2 border-primary bg-panel text-primary",
                      !isActive &&
                        !isCompleted &&
                        "border-[1.5px] border-border-strong bg-transparent font-medium text-text-disabled", // eslint-disable-line no-restricted-syntax -- 1.5px is the spec-mandated pending circle border; no token exists between border(1px) and border-2(2px)
                    )}
                  >
                    {isCompleted ? (
                      <Check className="size-4" strokeWidth={2} />
                    ) : (
                      idx + 1
                    )}
                  </span>

                  <span
                    className={cn(
                      "whitespace-nowrap text-subtitle font-semibold",
                      isActive ? "text-foreground" : "text-meta-foreground",
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

                {/* ml-10 = size-8 (32px) + gap-2 (8px) — aligns left edge under step label */}
                {step.description && (
                  <span className="ml-10 mt-0 text-body text-muted-foreground">
                    {step.description}
                  </span>
                )}
              </li>
            )
          })}
        </ol>
      </div>
    )
  },
)

Stepper.displayName = "Stepper"

export { Stepper }
