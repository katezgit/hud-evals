"use client";

import { Clock, Flag } from "lucide-react";
import { cn } from "@repo/ui/lib/cn";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import type { TasksetJobRow, TasksetJobState } from "@/lib/mock/tasksets";
import { DistBar, Sparkline, TraceGrid, distOf, totalTraces } from "./jobs-tab-viz";

const STATE_LABEL: Record<TasksetJobState, string> = {
  running: "Running",
  queued: "Queued",
  completed: "Completed",
  failed: "Failed",
  errored: "Errored",
  invalidated: "Invalid",
};

// Job-level "completed" reuses the green tokens that Trace-level "scored" uses —
// the trace state vocabulary (scored/failed/errored) is unchanged at the token layer.
// Running gets a radar-pulse halo (RunningDot below); other states render a flat dot.
const STATE_DOT: Record<TasksetJobState, string> = {
  running: "bg-state-running",
  queued: "bg-state-not-run",
  completed: "bg-state-scored",
  failed: "bg-state-warning",
  errored: "bg-state-errored",
  invalidated: "bg-state-not-run",
};

const STATE_TEXT: Record<TasksetJobState, string> = {
  running: "text-state-running-text",
  queued: "text-state-not-run",
  completed: "text-state-scored-text",
  failed: "text-state-warning-text",
  errored: "text-state-errored-text",
  invalidated: "text-state-not-run",
};

interface StatusCellProps {
  state: TasksetJobState;
  when: string | null;
}

export function StatusCell({ state, when }: StatusCellProps) {
  const hideWhen = state === "running" || !when;
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <div className="flex items-center gap-2">
        {state === "running" ? (
          <RunningDot />
        ) : (
          <span
            aria-hidden="true"
            className={cn("size-2 shrink-0 rounded-full", STATE_DOT[state])}
          />
        )}
        <span className={cn("font-mono text-caption", STATE_TEXT[state])}>
          {STATE_LABEL[state]}
        </span>
      </div>
      {hideWhen ? null : (
        <span className="text-meta-foreground pl-4 font-mono text-meta tracking-normal tabular-nums">
          {when} ago
        </span>
      )}
    </div>
  );
}

// Radar-pulse running indicator: solid teal dot anchored, expanding halo behind.
// Mirrors the canonical LiveDot pattern in components/shell/sidebar-nav-link.tsx —
// the single source of truth for "actively running" affordance across the portal.
function RunningDot() {
  return (
    <span aria-hidden="true" className="relative flex size-2 shrink-0">
      <span className="bg-state-running absolute inline-flex h-full w-full rounded-full opacity-75 motion-safe:animate-ping" />
      <span className="bg-state-running relative inline-flex size-2 rounded-full" />
    </span>
  );
}

export function JobCell({ job }: { job: TasksetJobRow }) {
  return (
    <div className="min-w-0">
      <div className="flex min-w-0 items-center gap-2">
        <span className="text-meta-foreground shrink-0 font-mono text-meta uppercase">
          {job.type === "train" ? "Train" : "Eval"}
        </span>
        <span className="text-foreground truncate text-body font-medium">
          {job.title}
        </span>
        {job.flag ? (
          <span className="bg-state-warning-subtle text-state-warning-text shrink-0 rounded px-1.5 py-px font-mono text-meta uppercase">
            <Flag aria-hidden="true" className="inline size-2.5" />
            {job.flag}
          </span>
        ) : null}
        <span className="text-text-disabled shrink-0 font-mono text-meta tracking-normal">
          {job.id}
        </span>
      </div>
      {job.subtitle ? (
        <div
          className={cn(
            "mt-0.5 truncate font-mono text-meta tracking-normal",
            job.state === "errored"
              ? "text-state-errored-text"
              : "text-meta-foreground",
          )}
        >
          {job.subtitle}
        </div>
      ) : null}
    </div>
  );
}

export function RewardCell({ job }: { job: TasksetJobRow }) {
  if (job.state === "errored" || job.state === "queued") {
    return (
      <div className="min-w-0">
        <div className="font-mono">
          <span className="text-text-disabled text-body">—</span>
        </div>
      </div>
    );
  }

  if (job.type === "train") {
    return (
      <div className="min-w-0">
        <div className="font-mono">
          <span className="text-foreground text-body font-medium tabular-nums tracking-tight">
            {job.reward!.toFixed(4)}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <Sparkline points={job.spark!} />
          <span className="text-meta-foreground whitespace-nowrap font-mono text-meta tracking-normal tabular-nums">
            {job.runsLabel}
          </span>
        </div>
      </div>
    );
  }

  const total = totalTraces(job);
  const useGrid = total <= 40 && !!job.traces;
  return (
    <div className="min-w-0">
      <div className="flex items-baseline gap-2 font-mono">
        <span className="text-foreground text-body font-medium tabular-nums tracking-tight">
          {job.reward!.toFixed(4)}
        </span>
        {job.frac ? (
          <span className="text-meta-foreground text-meta tracking-normal">
            {job.frac}
          </span>
        ) : null}
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <div tabIndex={0} className="mt-1 flex w-fit items-center gap-2">
            {useGrid ? (
              <TraceGrid traces={job.traces!} />
            ) : (
              <DistBar dist={distOf(job)} total={total} />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-none">
          <TraceStateLegend />
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

// Legend matches dot-grid / dist-bar token vocabulary exactly — solid swatches
// for scored/failed/errored/running, open circle for not-run (mirrors the
// hatch/open cell rendering in `jobs-tab-viz`).
const LEGEND_ROWS = [
  { label: "scored", swatch: "bg-state-scored" },
  { label: "failed", swatch: "bg-state-warning" },
  { label: "errored", swatch: "bg-state-errored" },
  { label: "running", swatch: "bg-state-running" },
  { label: "not run", swatch: null },
] as const;

function TraceStateLegend() {
  return (
    <ul className="flex flex-col gap-1">
      {LEGEND_ROWS.map((row) => (
        <li key={row.label} className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={cn(
              "size-2 shrink-0 rounded-full",
              row.swatch ?? "border border-background",
            )}
          />
          <span>{row.label}</span>
        </li>
      ))}
    </ul>
  );
}

export function ModelOwnerCell({ job }: { job: TasksetJobRow }) {
  return (
    <div className="min-w-0 font-mono">
      <div className="text-foreground truncate text-caption">
        {job.modelName}
      </div>
      <div className="text-meta-foreground mt-0.5 flex items-center gap-1 text-meta tracking-normal">
        {job.ownerScope === "cron" ? (
          <Clock aria-hidden="true" className="size-2.5" />
        ) : null}
        {job.ownerName}
      </div>
    </div>
  );
}

interface CostCellProps {
  cost: string;
}

export function CostCell({ cost }: CostCellProps) {
  if (cost === "—") {
    return (
      <div className="justify-self-end text-right">
        <span className="text-meta-foreground font-mono text-caption">
          —
        </span>
      </div>
    );
  }
  return (
    <div className="justify-self-end text-right">
      <span className="text-muted-foreground font-mono text-caption tabular-nums">
        {cost}
        <span className="text-meta-foreground text-meta tracking-normal">
          {" "}
          Cr
        </span>
      </span>
    </div>
  );
}
