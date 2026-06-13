import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@repo/ui/lib/cn";
import type { HomeJobRow } from "@/lib/mock/home-jobs";
import {
  CostCell,
  DeltaCell,
  JobCell,
  ModelOwnerCell,
  RewardCell,
  StatusCell,
  TasksetCell,
} from "./jobs-index-cells";

// Cross-taskset grid: same axis as the within-taskset table + a Taskset column.
// Flat rows only — grouping accordion (hyperparameter sweep collapse) deferred
// per brief; will re-introduce when operator confirms density-vs-grouping trade.
export const GRID_COLS =
  "grid grid-cols-[112px_minmax(220px,1fr)_160px_152px_136px_92px_72px_26px] items-center gap-4";

interface JobsIndexRowProps {
  job: HomeJobRow;
}

export function JobsIndexRow({ job }: JobsIndexRowProps) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className={cn(
        "group border-border hover:bg-hover-surface relative block border-b px-4 py-2 transition-colors",
      )}
    >
      <div className={GRID_COLS}>
        <StatusCell state={job.state} when={job.when} />
        <JobCell job={job} />
        <TasksetCell job={job} />
        <ModelOwnerCell job={job} />
        <RewardCell job={job} />
        <DeltaCell delta={job.delta} />
        <CostCell cost={job.cost} />
        <div className="justify-self-end">
          <ChevronRight
            aria-hidden="true"
            className="text-meta-foreground size-3.5 opacity-0 transition-opacity group-hover:opacity-100"
          />
        </div>
      </div>
    </Link>
  );
}
