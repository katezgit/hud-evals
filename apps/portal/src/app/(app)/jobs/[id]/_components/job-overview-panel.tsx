"use client";

import { useState } from "react";
import { Separator } from "@repo/ui/components/separator";
import { cn } from "@repo/ui/lib/cn";
import type { JobDetail, JobRun, JobTask } from "@/lib/mock/job-detail";
import { CoverageLegend, JobCoverageGrid } from "./job-coverage-grid";
import { JobRunTable, type TraceRow } from "./job-run-table";
import { JobSummaryMetrics } from "./job-summary-metrics";
import { JobToolUsage } from "./job-tool-usage";

interface JobOverviewPanelProps {
  detail: JobDetail;
  runs: ReadonlyArray<JobRun>;
  validRunCount: number;
  erroredRunCount: number;
  totalRunCount: number;
  onSwitchToTraces: () => void;
}

export function JobOverviewPanel({
  detail,
  runs,
  validRunCount,
  erroredRunCount,
  totalRunCount,
  onSwitchToTraces,
}: JobOverviewPanelProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [toolFilter, setToolFilter] = useState<string>("all");

  // Selecting a task syncs the tool filter when that task is one of the
  // filter options (skips the empty "0002" case in the showcase data).
  const handleSelectTask = (taskId: string | null) => {
    setSelectedTaskId(taskId);
    if (taskId && detail.toolScopes[taskId]) setToolFilter(taskId);
  };

  const selectedRuns =
    selectedTaskId === null
      ? []
      : runs.filter((r) => r.taskId === selectedTaskId);

  return (
    <div className="flex flex-col gap-8 pt-2">
      <section
        aria-labelledby="job-overview-results"
        className="overflow-hidden rounded-lg border border-border bg-card"
      >
        <h2 id="job-overview-results" className="sr-only">
          Job results
        </h2>
        <JobSummaryMetrics
          detail={detail}
          validRunCount={validRunCount}
          erroredRunCount={erroredRunCount}
          totalRunCount={totalRunCount}
          onDrillToTraces={onSwitchToTraces}
          onDrillToToolsAll={() => setToolFilter("all")}
        />
        <div className="flex flex-col gap-3 border-t border-border p-4">
          <div className="flex items-center justify-between gap-4">
            <span className="font-mono text-label text-muted-foreground">
              Coverage <span className="text-foreground">{detail.coverageLabel}</span>
            </span>
            <CoverageLegend />
          </div>

          <JobCoverageGrid
            tasks={detail.tasks}
            runs={runs}
            selectedTaskId={selectedTaskId}
            onSelectTask={(taskId) => handleSelectTask(taskId === selectedTaskId ? null : taskId)}
          />

          <div className="flex flex-col gap-2">
            <JobResultRow detail={detail} />
            {detail.resultsInvalidated ? (
              <InvalidatedResultNote envId={detail.envId} onViewTraces={onSwitchToTraces} />
            ) : (
              <ValidResultNote
                validCount={validRunCount}
                threshold={detail.trainTraceThreshold}
              />
            )}
          </div>

          {selectedTaskId !== null && (
            <OverviewTaskRunTable
              jobId={detail.job.id}
              runs={selectedRuns}
              task={detail.tasks.find((t) => t.id === selectedTaskId)}
            />
          )}
        </div>
      </section>

      <Separator />

      <JobToolUsage
        detail={detail}
        filter={toolFilter}
        onFilterChange={setToolFilter}
      />
    </div>
  );
}

function JobResultRow({ detail }: { detail: JobDetail }) {
  if (detail.resultsInvalidated) return null;
  if (detail.scope === "eval") return <EvalResultRow detail={detail} />;
  if (detail.scope === "train") return <TrainResultRow detail={detail} />;
  return <QaAnalysisResultRow detail={detail} />;
}

function StatusNoteRow({
  dotClass,
  children,
}: {
  dotClass: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 font-mono text-label text-muted-foreground">
      <span
        aria-hidden="true"
        className={cn("size-1.5 shrink-0 rounded-full", dotClass)}
      />
      <span>{children}</span>
    </div>
  );
}

function EvalResultRow({ detail }: { detail: JobDetail }) {
  const best = detail.models[0];
  if (!best || best.overallReward === null) return null;
  const totalFailed = Object.values(detail.failedByModel).reduce((a, b) => a + b, 0);
  const avgSuccess = Math.round(best.overallReward * 100);
  return (
    <StatusNoteRow dotClass="bg-muted-foreground">
      Best model: <span className="text-foreground">{best.modelId}</span>
      <RowSeparator />
      Avg success: {avgSuccess}%
      <RowSeparator />
      {totalFailed} failed {totalFailed === 1 ? "task" : "tasks"}
    </StatusNoteRow>
  );
}

function TrainResultRow({ detail }: { detail: JobDetail }) {
  if (!detail.checkpointId) return null;
  return (
    <StatusNoteRow dotClass="bg-muted-foreground">
      Checkpoint ready:{" "}
      <span className="font-mono text-foreground">{detail.checkpointId}</span>
      <RowSeparator />
      {detail.downstreamEvalRun ? "Eval already run" : "Eval not run yet"}
    </StatusNoteRow>
  );
}

function QaAnalysisResultRow({ detail }: { detail: JobDetail }) {
  const findings = detail.findings;
  if (!findings) return null;
  if (findings.highSeverity > 0) {
    return (
      <StatusNoteRow dotClass="bg-muted-foreground">
        {findings.total} {findings.total === 1 ? "issue" : "issues"} found
        <RowSeparator />
        {findings.highSeverity} high severity
        {findings.topIssue != null && findings.topIssue !== "" && (
          <>
            <RowSeparator />
            Top issue: {findings.topIssue}
          </>
        )}
      </StatusNoteRow>
    );
  }
  return (
    <StatusNoteRow dotClass="bg-muted-foreground">
      No high-severity issues found
      <RowSeparator />
      {findings.minor} minor {findings.minor === 1 ? "issue" : "issues"}
    </StatusNoteRow>
  );
}

function RowSeparator() {
  return <span aria-hidden="true" className="mx-1 text-meta-foreground">·</span>;
}

interface InvalidatedResultNoteProps {
  envId: string;
  onViewTraces: () => void;
}

function InvalidatedResultNote({ envId, onViewTraces }: InvalidatedResultNoteProps) {
  return (
    <div className="flex items-center gap-2.5 font-mono text-label text-muted-foreground">
      <span
        aria-hidden="true"
        className="size-1.5 shrink-0 rounded-full bg-state-warning"
      />
      <span>
        <span className="font-medium text-foreground">Results invalidated</span> —
        Grader returned non-deterministic reward on re-check (
        <code className="rounded-sm border border-border bg-card px-1 text-foreground">
          {envId}
        </code>
        ). Not counted toward Train until the Job is re-graded.
      </span>
      <button
        type="button"
        onClick={onViewTraces}
        className="ml-1 whitespace-nowrap text-primary hover:underline focus-visible:underline"
      >
        View Traces →
      </button>
    </div>
  );
}

interface ValidResultNoteProps {
  validCount: number;
  threshold: number;
}

function ValidResultNote({ validCount, threshold }: ValidResultNoteProps) {
  const runsLabel = validCount === 1 ? "1 Run" : `${validCount} Runs`;
  return (
    <div className="flex items-center gap-2.5 font-mono text-label text-muted-foreground">
      <span
        aria-hidden="true"
        className="size-1.5 shrink-0 rounded-full bg-state-scored"
      />
      <span>
        All <span className="font-medium text-foreground">{runsLabel}</span> valid · avg
        reward <span className="font-medium text-foreground">1.0000</span>. Train gated —
        needs ≥{threshold} valid Traces.
      </span>
    </div>
  );
}

// Overview's per-task drilldown uses the flat traces table without selection or
// bulk-actions: rows for the selected task, no checkbox state. Keeps the same
// chrome and reward bands as the Traces tab table.
interface OverviewTaskRunTableProps {
  jobId: string;
  runs: ReadonlyArray<JobRun>;
  task: JobTask | undefined;
}

function OverviewTaskRunTable({ jobId, runs, task }: OverviewTaskRunTableProps) {
  if (!task) return null;
  const rows: ReadonlyArray<TraceRow> = runs.map((run) => ({ run, task }));
  const noSelection = new Set<string>();
  return (
    <JobRunTable
      jobId={jobId}
      rows={rows}
      selectedRunIds={noSelection}
      onToggleSelect={() => undefined}
      onToggleSelectAll={() => undefined}
    />
  );
}
