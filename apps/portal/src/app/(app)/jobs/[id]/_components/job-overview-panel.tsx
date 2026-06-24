"use client";

import { useState } from "react";
import { Separator } from "@repo/ui/components/separator";
import type { JobDetail, JobRun, JobTask } from "@/lib/mock/job-detail";
import { JobCoverageGrid } from "./job-coverage-grid";
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
      {/* KPI strip leads: Alex scans Avg Reward / Valid Traces / Cost / Latency
          first, then drops into per-task forensics. */}
      <div className="flex flex-col gap-3">
        <JobSummaryMetrics
          detail={detail}
          validRunCount={validRunCount}
          erroredRunCount={erroredRunCount}
          totalRunCount={totalRunCount}
          onDrillToTraces={onSwitchToTraces}
          onDrillToToolsAll={() => setToolFilter("all")}
        />
        <JobResultRow detail={detail} />
      </div>

      <Separator />

      <ResultsSection
        detail={detail}
        runs={runs}
        validRunCount={validRunCount}
        selectedTaskId={selectedTaskId}
        selectedRuns={selectedRuns}
        onSelectTask={handleSelectTask}
        onViewTraces={onSwitchToTraces}
      />

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

function EvalResultRow({ detail }: { detail: JobDetail }) {
  const best = detail.models[0];
  if (!best || best.overallReward === null) return null;
  const totalFailed = Object.values(detail.failedByModel).reduce((a, b) => a + b, 0);
  const avgSuccess = Math.round(best.overallReward * 100);
  return (
    <p className="page-header-meta">
      <span>
        Best model: <span className="text-foreground">{best.modelId}</span>
      </span>
      <RowSeparator />
      <span>Avg success: {avgSuccess}%</span>
      <RowSeparator />
      <span>
        {totalFailed} failed {totalFailed === 1 ? "task" : "tasks"}
      </span>
    </p>
  );
}

function TrainResultRow({ detail }: { detail: JobDetail }) {
  if (!detail.checkpointId) return null;
  return (
    <p className="page-header-meta">
      <span>
        Checkpoint ready:{" "}
        <span className="font-mono text-foreground">{detail.checkpointId}</span>
      </span>
      <RowSeparator />
      <span>{detail.downstreamEvalRun ? "Eval already run" : "Eval not run yet"}</span>
    </p>
  );
}

function QaAnalysisResultRow({ detail }: { detail: JobDetail }) {
  const findings = detail.findings;
  if (!findings) return null;
  if (findings.highSeverity > 0) {
    return (
      <p className="page-header-meta">
        <span>
          {findings.total} {findings.total === 1 ? "issue" : "issues"} found
        </span>
        <RowSeparator />
        <span>{findings.highSeverity} high severity</span>
        {findings.topIssue != null && findings.topIssue !== "" && (
          <>
            <RowSeparator />
            <span>Top issue: {findings.topIssue}</span>
          </>
        )}
      </p>
    );
  }
  return (
    <p className="page-header-meta">
      <span>No high-severity issues found</span>
      <RowSeparator />
      <span>
        {findings.minor} minor {findings.minor === 1 ? "issue" : "issues"}
      </span>
    </p>
  );
}

function RowSeparator() {
  return <span aria-hidden="true" className="text-meta-foreground">·</span>;
}

interface ResultsSectionProps {
  detail: JobDetail;
  runs: ReadonlyArray<JobRun>;
  validRunCount: number;
  selectedTaskId: string | null;
  selectedRuns: ReadonlyArray<JobRun>;
  onSelectTask: (taskId: string | null) => void;
  onViewTraces: () => void;
}

function ResultsSection({
  detail,
  runs,
  validRunCount,
  selectedTaskId,
  selectedRuns,
  onSelectTask,
  onViewTraces,
}: ResultsSectionProps) {
  return (
    <section
      aria-labelledby="job-overview-results"
      className="flex flex-col gap-4"
    >
      <header className="flex items-baseline justify-between gap-3">
        <h2
          id="job-overview-results"
          className="text-subtitle font-semibold text-foreground"
        >
          Results
        </h2>
        <span className="text-label text-muted-foreground">
          Coverage {detail.coverageLabel}
        </span>
      </header>

      <JobCoverageGrid
        tasks={detail.tasks}
        runs={runs}
        selectedTaskId={selectedTaskId}
        onSelectTask={(taskId) => onSelectTask(taskId === selectedTaskId ? null : taskId)}
      />

      {detail.resultsInvalidated ? (
        <InvalidatedResultNote envId={detail.envId} onViewTraces={onViewTraces} />
      ) : (
        <ValidResultNote
          validCount={validRunCount}
          threshold={detail.trainTraceThreshold}
        />
      )}

      {selectedTaskId !== null && (
        <OverviewTaskRunTable
          jobId={detail.job.id}
          runs={selectedRuns}
          task={detail.tasks.find((t) => t.id === selectedTaskId)}
        />
      )}
    </section>
  );
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
