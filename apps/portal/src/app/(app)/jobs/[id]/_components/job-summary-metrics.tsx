"use client";

import { cn } from "@repo/ui/lib/cn";
import type { JobDetail } from "@/lib/mock/job-detail";

interface JobSummaryMetricsProps {
  detail: JobDetail;
  validRunCount: number;
  erroredRunCount: number;
  totalRunCount: number;
  /** Switch to the Traces tab. */
  onDrillToTraces: () => void;
}

export function JobSummaryMetrics({
  detail,
  validRunCount,
  erroredRunCount,
  totalRunCount,
  onDrillToTraces,
}: JobSummaryMetricsProps) {
  const noValidRuns = validRunCount === 0;
  const isInvalidated = detail.resultsInvalidated;
  const avgRewardValue = noValidRuns ? "—" : "1.0000";

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 p-4 text-body">
      <MetaSegment label="Avg Reward">
        <span
          className={cn(
            "font-mono font-bold",
            noValidRuns ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {avgRewardValue}
        </span>
        {isInvalidated && (
          <span className="ml-1.5 font-mono text-label text-state-warning-text">
            pre-invalidation
          </span>
        )}
      </MetaSegment>

      <Separator />

      <MetaSegment label="Valid Traces">
        <span className="font-mono font-bold text-foreground">
          {validRunCount}
          <span className="ml-1 font-normal text-muted-foreground">/ {totalRunCount}</span>
        </span>
      </MetaSegment>

      <Separator />

      {erroredRunCount > 0 ? (
        <span className="font-mono font-bold text-state-errored-text">
          {erroredRunCount} errored
        </span>
      ) : (
        <span className="font-mono font-bold text-state-scored-text">all valid</span>
      )}

      <button
        type="button"
        onClick={onDrillToTraces}
        className="ml-auto font-mono text-label text-meta-foreground hover:text-primary"
      >
        View Traces →
      </button>
    </div>
  );
}

function MetaSegment({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="text-muted-foreground">{label}</span>
      {children}
    </span>
  );
}

function Separator() {
  return (
    <span aria-hidden="true" className="text-meta-foreground">
      ·
    </span>
  );
}
