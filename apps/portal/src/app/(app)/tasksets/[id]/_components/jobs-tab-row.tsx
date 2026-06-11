"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@repo/ui/lib/cn";
import type { TasksetJobRow } from "@/lib/mock/tasksets";
import {
  CostCell,
  JobCell,
  ModelOwnerCell,
  RewardCell,
  StatusCell,
} from "./jobs-table-cells";

export const GRID_COLS =
  "grid grid-cols-[112px_minmax(220px,1fr)_236px_168px_84px_26px] items-center gap-4";

interface JobRowProps {
  job: TasksetJobRow;
  tasksetId: string;
  focused: boolean;
  ref: (el: HTMLAnchorElement | null) => void;
}

export function JobRow({ job, tasksetId, focused, ref }: JobRowProps) {
  return (
    <Link
      ref={ref}
      href={`/jobs/${job.id}?from=taskset:${tasksetId}`}
      className={cn(
        // border-b applies on every row; the parent <ul> strips it on the last <li>'s child via
        // `[&>li:last-child>a]:border-b-0` (a Link inside its only-child <li> is always :last-child,
        // so we can't rely on `last:border-b-0` here).
        "group border-border hover:bg-surface-hover relative block border-b px-4 py-2 transition-colors",
        focused && "bg-surface-hover before:bg-primary before:absolute before:inset-y-0 before:left-0 before:w-0.5",
      )}
    >
      <div className={GRID_COLS}>
        <StatusCell state={job.state} when={job.when} />
        <JobCell job={job} />
        <RewardCell job={job} />
        <ModelOwnerCell job={job} />
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
