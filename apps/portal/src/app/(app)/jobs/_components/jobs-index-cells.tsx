// Cells for the cross-taskset Jobs index. Derived from the within-taskset
// jobs-table-cells.tsx at apps/portal/src/app/(app)/tasksets/[id]/_components/.
// Per project no-over-abstract rule: copied at the new call site rather than
// hoisted into a shared component until a third caller appears. Only the
// Taskset column is new; the others mirror the existing anatomy with one
// trim — no inline batch-grid viz on this iteration (placeholder text instead).

import { Clock } from "lucide-react";
import { cn } from "@repo/ui/lib/cn";
import type { TasksetJobRow, TasksetJobState } from "@/lib/mock/tasksets";
import type { HomeJobRow } from "@/lib/mock/home-jobs";

const STATE_LABEL: Record<TasksetJobState, string> = {
  running: "Running",
  queued: "Queued",
  completed: "Completed",
  failed: "Failed",
  errored: "Errored",
  invalidated: "Invalid",
};

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
      {!hideWhen && (
        <span className="text-meta-foreground pl-4 font-mono text-meta tracking-normal tabular-nums">
          {when} ago
        </span>
      )}
    </div>
  );
}

// Radar-pulse running indicator — same anatomy as the in-taskset cell.
function RunningDot() {
  return (
    <span aria-hidden="true" className="relative flex size-2 shrink-0">
      <span className="bg-state-running absolute inline-flex h-full w-full rounded-full opacity-75 motion-safe:animate-ping" />
      <span className="bg-state-running relative inline-flex size-2 rounded-full" />
    </span>
  );
}

export function JobCell({ job }: { job: HomeJobRow }) {
  return (
    <div className="min-w-0">
      <div className="flex min-w-0 items-center gap-2">
        <span className="text-meta-foreground shrink-0 font-mono text-meta uppercase">
          {job.type === "train" ? "Train" : "Eval"}
        </span>
        <span className="text-foreground truncate text-body font-medium">
          {job.title}
        </span>
        <span className="text-text-disabled shrink-0 font-mono text-meta tracking-normal">
          {job.id}
        </span>
      </div>
      {job.subtitle && (
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
      )}
    </div>
  );
}

// Taskset column — only new cell vs the within-taskset table. Two-line:
// taskset name + environment underneath, both monospaced for code rhythm.
export function TasksetCell({ job }: { job: HomeJobRow }) {
  return (
    <div className="min-w-0 font-mono">
      <div className="text-foreground truncate text-caption">
        {job.tasksetName}
      </div>
      <div className="text-meta-foreground mt-0.5 truncate text-meta tracking-normal">
        {job.tasksetEnv}
      </div>
    </div>
  );
}

export function ModelOwnerCell({ job }: { job: TasksetJobRow }) {
  return (
    <div className="min-w-0 font-mono">
      <div className="text-foreground truncate text-caption">
        {job.modelName}
      </div>
      <div className="text-meta-foreground mt-0.5 flex items-center gap-1 text-meta tracking-normal">
        {job.ownerScope === "cron" && (
          <Clock aria-hidden="true" className="size-2.5" />
        )}
        {job.ownerName}
      </div>
    </div>
  );
}

export function RewardCell({ job }: { job: TasksetJobRow }) {
  if (job.state === "errored" || job.state === "queued" || job.reward == null) {
    return (
      <div className="font-mono">
        <span className="text-text-disabled text-body">—</span>
      </div>
    );
  }
  return (
    <div className="min-w-0">
      <div className="font-mono">
        <span className="text-foreground text-body font-medium tabular-nums tracking-tight">
          {job.reward.toFixed(4)}
        </span>
      </div>
      {job.frac && (
        <div className="text-meta-foreground mt-0.5 font-mono text-meta tracking-normal">
          {job.frac}
        </div>
      )}
    </div>
  );
}

export function DeltaCell({ delta }: { delta: number | null }) {
  if (delta == null) {
    return (
      <span className="text-text-disabled font-mono text-caption">—</span>
    );
  }
  const positive = delta > 0;
  const negative = delta < 0;
  return (
    <span
      className={cn(
        "font-mono text-caption tabular-nums",
        positive && "text-state-scored-text",
        negative && "text-state-errored-text",
        !positive && !negative && "text-muted-foreground",
      )}
    >
      {positive ? "+" : ""}
      {delta.toFixed(4)}
    </span>
  );
}

export function CostCell({ cost }: { cost: string }) {
  if (cost === "—") {
    return (
      <span className="text-meta-foreground font-mono text-caption">—</span>
    );
  }
  return (
    <span className="text-muted-foreground font-mono text-caption tabular-nums">
      {cost}
      <span className="text-meta-foreground text-meta tracking-normal">
        {" "}
        Cr
      </span>
    </span>
  );
}

