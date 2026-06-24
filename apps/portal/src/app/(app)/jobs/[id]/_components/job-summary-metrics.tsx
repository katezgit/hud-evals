"use client";

import type { ReactNode } from "react";
import { cn } from "@repo/ui/lib/cn";
import type { JobDetail } from "@/lib/mock/job-detail";

interface JobSummaryMetricsProps {
  detail: JobDetail;
  validRunCount: number;
  erroredRunCount: number;
  totalRunCount: number;
  /** Switch to the Traces tab. */
  onDrillToTraces: () => void;
  /** Switch the tool filter to "all". */
  onDrillToToolsAll: () => void;
}

export function JobSummaryMetrics({
  detail,
  validRunCount,
  erroredRunCount,
  totalRunCount,
  onDrillToTraces,
  onDrillToToolsAll,
}: JobSummaryMetricsProps) {
  const noValidRuns = validRunCount === 0;
  const isInvalidated = detail.resultsInvalidated;
  const validCountColor = noValidRuns ? "text-state-warning-text" : "text-state-scored-text";
  const validCountSub = erroredRunCount > 0
    ? <span className="text-state-errored-text">{erroredRunCount} errored</span>
    : <span className="text-state-scored-text">all valid</span>;

  return (
    <div className="grid grid-cols-5">
      <MetricCell
        label="Avg Reward (valid)"
        valueDim={noValidRuns}
        value={noValidRuns ? "—" : "1.0000"}
        sub={
          isInvalidated ? (
            <span className="text-state-warning-text">1.0000 pre-invalidation</span>
          ) : (
            <span className="text-state-scored-text">
              {validRunCount} valid Run{validRunCount === 1 ? "" : "s"}
            </span>
          )
        }
      />
      <MetricCell
        label="Valid Traces"
        drillLabel="drill →"
        onDrill={onDrillToTraces}
        value={
          <>
            <span className={validCountColor}>{validRunCount}</span>
            <span className="ml-1 text-meta font-normal text-muted-foreground">
              / {totalRunCount}
            </span>
          </>
        }
        sub={validCountSub}
      />
      <MetricCell
        label="Latency p50"
        drillLabel="drill →"
        onDrill={onDrillToTraces}
        value={detail.latencyP50Label}
        sub="per Run"
      />
      <MetricCell
        label="Tool Turns"
        drillLabel="drill →"
        onDrill={onDrillToToolsAll}
        value={
          <>
            {detail.toolTurnsAvgLabel}
            <span className="ml-1 text-meta font-normal text-muted-foreground">avg</span>
          </>
        }
        sub={detail.toolTurnsSubLabel}
      />
      <MetricCell
        label="Hallucination"
        valueDim
        value="—"
        sub="no valid Runs"
      />
    </div>
  );
}

interface MetricCellProps {
  label: string;
  value: ReactNode;
  sub: ReactNode;
  valueDim?: boolean;
  drillLabel?: string;
  onDrill?: () => void;
}

function MetricCell({
  label,
  value,
  sub,
  valueDim = false,
  drillLabel,
  onDrill,
}: MetricCellProps) {
  return (
    <div className="relative flex flex-col gap-1 p-4">
      {drillLabel && onDrill ? (
        <button
          type="button"
          onClick={onDrill}
          className="absolute top-3 right-3 font-mono text-label text-meta-foreground hover:text-primary"
        >
          {drillLabel}
        </button>
      ) : null}
      <div className="font-mono text-meta uppercase tracking-wider text-meta-foreground">
        {label}
      </div>
      <div
        className={cn(
          "font-mono text-display font-semibold tracking-tight",
          valueDim && "text-meta-foreground",
        )}
      >
        {value}
      </div>
      <div className="font-mono text-label text-muted-foreground">{sub}</div>
    </div>
  );
}
