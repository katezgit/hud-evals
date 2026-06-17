"use client";

import Link from "next/link";
import {
  Ban,
  ChevronRight,
  Download,
  Eye,
  ListChecks,
  MoreHorizontal,
  Play,
  RotateCcw,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { CopyButton } from "@repo/ui/components/copy-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { IconButton } from "@repo/ui/components/icon-button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/cn";
import type { JobDetail } from "@/lib/mock/job-detail";

interface JobHeaderProps {
  detail: JobDetail;
  /** Derived count of `state === "scored"` runs. Drives the Train gate. */
  validRunCount: number;
}

const SCOPE_VERB: Record<JobDetail["scope"], string> = {
  eval: "Eval",
  train: "Train",
  "qa-analysis": "QA Analysis",
};

export function JobHeader({ detail, validRunCount }: JobHeaderProps) {
  const isBatch = detail.models.length > 1;
  const taskCount = detail.tasks.length;
  const traceCount = detail.usage?.tracesCount ?? taskCount;
  const taskNoun = taskCount === 1 ? "task" : "tasks";
  const traceNoun = traceCount === 1 ? "trace" : "traces";
  const batchSuffix = isBatch ? " batch" : "";
  const headingLabel =
    detail.scope === "qa-analysis"
      ? `QA Analysis on ${traceCount} ${traceNoun}`
      : `${SCOPE_VERB[detail.scope]}${batchSuffix} ${taskCount} ${taskNoun}`;

  const showResultRow = !detail.resultsInvalidated;

  return (
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
        <ChevronRight aria-hidden="true" className="size-3 text-meta-foreground" />
        <span aria-current="page" className="truncate text-foreground">
          Jobs detail
        </span>
      </nav>

      <div className="flex items-start justify-between gap-6">
        <div className="flex min-w-0 flex-col page-header">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="text-display font-semibold tracking-tight text-foreground">
              {headingLabel}
            </h1>
            <Badge variant="success" showDot>
              completed
            </Badge>
            {detail.resultsInvalidated && (
              <Badge variant="warning" showDot>
                results invalidated
              </Badge>
            )}
          </div>

          {detail.displayTitle && (
            <p className="truncate text-body text-muted-foreground">
              {detail.displayTitle}
            </p>
          )}

          <MetaLine detail={detail} />

          {showResultRow && detail.scope === "eval" && <EvalResultRow detail={detail} />}
          {showResultRow && detail.scope === "train" && <TrainResultRow detail={detail} />}
          {showResultRow && detail.scope === "qa-analysis" && (
            <QaAnalysisResultRow detail={detail} />
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {detail.scope === "eval" && (
            <EvalActions detail={detail} validRunCount={validRunCount} />
          )}
          {detail.scope === "train" && <TrainActions detail={detail} />}
          {detail.scope === "qa-analysis" && <QaAnalysisActions detail={detail} />}
        </div>
      </div>
    </header>
  );
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
      <Separator />
      <span>Avg success: {avgSuccess}%</span>
      <Separator />
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
      <Separator />
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
        <Separator />
        <span>{findings.highSeverity} high severity</span>
        {findings.topIssue != null && findings.topIssue !== "" && (
          <>
            <Separator />
            <span>Top issue: {findings.topIssue}</span>
          </>
        )}
      </p>
    );
  }
  return (
    <p className="page-header-meta">
      <span>No high-severity issues found</span>
      <Separator />
      <span>
        {findings.minor} minor {findings.minor === 1 ? "issue" : "issues"}
      </span>
    </p>
  );
}

function EvalActions({
  detail,
  validRunCount,
}: {
  detail: JobDetail;
  validRunCount: number;
}) {
  const trainGated = validRunCount < detail.trainTraceThreshold;
  const trainTitle = `Train needs ≥${detail.trainTraceThreshold} valid Traces · have ${validRunCount}`;
  const hasWinner =
    detail.models.length > 1 && detail.models[0]?.winRate != null;
  const trainLabel = hasWinner ? "Train Best Model" : "Train Model";

  const handleRerun = () =>
    toast(`Rerun Eval — same Model · Taskset · seed ${detail.seed} → job_9d52…`);
  const handleTrain = () =>
    toast(`Training launched on ${validRunCount} valid Traces from ${detail.job.id}`);
  const handleRefine = () =>
    toast(`Opening env editor — ${detail.envId}`);
  const handleInvalidateAll = () =>
    toast("Invalidate entire Job — all Runs excluded");

  return (
    <>
      <Button variant="secondary" onClick={handleRerun}>
        <RotateCcw aria-hidden="true" />
        Rerun Eval
      </Button>
      {/* Train gate: when validRunCount < threshold, button is disabled and a
          tooltip explains why. Wrap with Tooltip so the disabled affordance
          stays discoverable. */}
      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={trainGated ? 0 : -1} className={cn(trainGated && "cursor-not-allowed")}>
            <Button
              variant="primary"
              disabled={trainGated}
              onClick={handleTrain}
              title={trainTitle}
            >
              <Play aria-hidden="true" />
              {trainLabel}
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>{trainTitle}</TooltipContent>
      </Tooltip>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton
            variant="ghost"
            size="sm"
            aria-label="More job actions"
            type="button"
          >
            <MoreHorizontal aria-hidden="true" />
          </IconButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={handleRefine}>
            <Wrench aria-hidden="true" />
            Refine environment
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={handleInvalidateAll}>
            <Ban aria-hidden="true" />
            Invalidate entire Job
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

function TrainActions({ detail }: { detail: JobDetail }) {
  const handleRerunTraining = () =>
    toast(`Rerun training — same config from ${detail.job.id}`);
  const handleRunEval = () =>
    toast(`Running eval on checkpoint ${detail.checkpointId ?? detail.job.id}`);
  const handleInvalidateAll = () =>
    toast("Invalidate entire Job — all Runs excluded");

  return (
    <>
      <Button variant="secondary" onClick={handleRerunTraining}>
        <RotateCcw aria-hidden="true" />
        Rerun Training
      </Button>
      <Button variant="primary" onClick={handleRunEval}>
        <Play aria-hidden="true" />
        Run Eval
      </Button>
      <InvalidateOnlyMenu onInvalidateAll={handleInvalidateAll} />
    </>
  );
}

function QaAnalysisActions({ detail }: { detail: JobDetail }) {
  const highSev = detail.findings?.highSeverity ?? 0;
  const handleExport = () =>
    toast(`Exporting QA report for ${detail.job.id}`);
  const handleReview = () =>
    toast("Reviewing findings — opening report");
  const handleOpenTraces = () =>
    toast("Opening traces");
  const handleInvalidateAll = () =>
    toast("Invalidate entire Job — all Runs excluded");

  return (
    <>
      <Button variant="secondary" onClick={handleExport}>
        <Download aria-hidden="true" />
        Export Report
      </Button>
      {highSev > 0 && (
        <Button variant="primary" onClick={handleReview}>
          <ListChecks aria-hidden="true" />
          Review Findings
        </Button>
      )}
      {highSev === 0 && (
        <Button variant="primary" onClick={handleOpenTraces}>
          <Eye aria-hidden="true" />
          Open Traces
        </Button>
      )}
      <InvalidateOnlyMenu onInvalidateAll={handleInvalidateAll} />
    </>
  );
}

function InvalidateOnlyMenu({ onInvalidateAll }: { onInvalidateAll: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton
          variant="ghost"
          size="sm"
          aria-label="More job actions"
          type="button"
        >
          <MoreHorizontal aria-hidden="true" />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem variant="destructive" onSelect={onInvalidateAll}>
          <Ban aria-hidden="true" />
          Invalidate entire Job
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MetaLine({ detail }: { detail: JobDetail }) {
  return (
    <div className="page-header-meta">
      <span>{detail.createdDateLabel}</span>
      <Separator />
      <span className="page-header-meta-group">
        <span className="font-mono">{detail.job.id}</span>
        <CopyButton
          value={detail.job.id}
          ariaLabel={`Copy Job id ${detail.job.id}`}
          tooltipLabel="Copy id"
        />
      </span>
      <Separator />
      <span>Created by: {detail.job.ownerName}</span>
    </div>
  );
}

function Separator() {
  return <span aria-hidden="true" className="text-meta-foreground">·</span>;
}
