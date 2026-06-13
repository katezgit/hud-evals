"use client";

import { CheckCircle2Icon, InfoIcon, TriangleAlertIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import type { BaselineCoverage } from "@/lib/mock/job-create";

export interface BaselineHintCardProps {
  coverage: BaselineCoverage;
  /** Click handler for the "Run baseline eval →" CTA on the `none` state. */
  onRunBaseline?: () => void;
}

export function BaselineHintCard({
  coverage,
  onRunBaseline,
}: BaselineHintCardProps) {
  if (coverage.state === "evaluated") {
    return (
      <Alert variant="success">
        <CheckCircle2Icon aria-hidden="true" />
        <AlertTitle>Evaluated</AlertTitle>
        <AlertDescription>
          <p className="text-body text-foreground">
            Avg reward{" "}
            <strong className="font-semibold">
              {formatPct(coverage.avgReward ?? 0)}
            </strong>{" "}
            across {coverage.totalTasks} tasks ·{" "}
            <ActionLink>View results →</ActionLink>
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  if (coverage.state === "partial") {
    return (
      <Alert variant="warning">
        <TriangleAlertIcon aria-hidden="true" />
        <AlertTitle>Partial coverage</AlertTitle>
        <AlertDescription>
          <p className="text-body text-foreground">
            {coverage.evaluatedTasks} of {coverage.totalTasks} tasks evaluated —
            Avg {formatPct(coverage.avgReward ?? 0)} so far ·{" "}
            <ActionLink>Complete baseline →</ActionLink>
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="info">
      <InfoIcon aria-hidden="true" />
      <AlertTitle>No baseline yet</AlertTitle>
      <AlertDescription>
        <p className="text-body text-foreground">
          Running eval first can save compute if the model already passes most
          tasks. <ActionLink onClick={onRunBaseline}>Run baseline eval →</ActionLink>
        </p>
      </AlertDescription>
    </Alert>
  );
}

function ActionLink({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer text-primary hover:underline outline-hidden focus-visible:shadow-focus-ring rounded-sm"
    >
      {children}
    </button>
  );
}

function formatPct(value: number): string {
  return `${Math.round(value * 100)}%`;
}
