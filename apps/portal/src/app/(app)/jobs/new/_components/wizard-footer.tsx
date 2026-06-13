"use client";

import { type ReactNode, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import type { StepKey } from "./stepper-header";

export interface WizardFooterProps {
  step: StepKey;
  prevStep: StepKey | null;
  nextStep: StepKey | null;
  canAdvance: boolean;
  hasEdits: boolean;
  onCancel: () => void;
  onPrev: () => void;
  onNext: () => void;
  onLaunch: () => void;
  /**
   * Step labels — accepted for API compatibility; Previous/Next buttons render
   * as bare "Previous" / "Next" and no longer interpolate the step name.
   */
  stepLabels?: Record<StepKey, string>;
  /** Launch CTA label (rendered on the review step). */
  launchLabel?: ReactNode;
  /** Optional leading icon on the launch CTA. No trailing arrow — Launch is a commit, not navigation. */
  launchIcon?: ReactNode;
  /** Discard-confirmation dialog title. */
  discardTitle?: string;
  /** Discard-confirmation dialog body copy. */
  discardBody?: ReactNode;
}

export function WizardFooter({
  step,
  prevStep,
  nextStep,
  canAdvance,
  hasEdits,
  onCancel,
  onPrev,
  onNext,
  onLaunch,
  launchLabel = "Launch Training Job",
  launchIcon,
  discardTitle = "Discard training configuration?",
  discardBody = "Your selections will not be saved.",
}: WizardFooterProps) {
  const isReview = step === "review";
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleCancelClick = () => {
    if (hasEdits) {
      setConfirmOpen(true);
      return;
    }
    onCancel();
  };

  // Natural-flow bar at the bottom of the wizard's flex column. NOT sticky.
  // The parent wizard owns the scroll (its body is overflow-y-auto), so this
  // sits below the body's bottom edge by construction — content cannot scroll
  // past it. Inner row mirrors the wizard body's centered 1100px cap inside
  // page-shell padding so footer controls align with content above.
  return (
    <>
      <div className="shrink-0 border-t border-border bg-background">
        <div className="page-shell block py-0">
          <div className="mx-auto flex h-14 w-full max-w-[1100px] items-center justify-between gap-2">
            <Button variant="ghost" onClick={handleCancelClick}>
              Cancel
            </Button>

            <div className="flex items-center gap-2">
              {prevStep && (
                <Button variant="secondary" onClick={onPrev}>
                  <ArrowLeftIcon aria-hidden="true" className="size-3.5" />
                  Previous
                </Button>
              )}

              {isReview ? (
                <Button variant="primary" onClick={onLaunch}>
                  {launchIcon}
                  {launchLabel}
                </Button>
              ) : (
                nextStep && (
                  <Button
                    variant="primary"
                    onClick={onNext}
                    disabled={!canAdvance}
                    aria-disabled={!canAdvance}
                  >
                    Next
                    <ArrowRightIcon aria-hidden="true" className="size-3.5" />
                  </Button>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>{discardTitle}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="text-body">{discardBody}</p>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Keep editing
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setConfirmOpen(false);
                onCancel();
              }}
            >
              Discard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
