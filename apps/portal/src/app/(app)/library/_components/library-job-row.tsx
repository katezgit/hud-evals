"use client";

// Block element (not a Link) because the trailing Star button needs its own
// onClick that doesn't trigger row navigation; the title carries the link.

import Link from "next/link";
import { Play, Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/cn";
import { TraceGrid } from "@/app/(app)/tasksets/[id]/_components/jobs-tab-viz";
import type { LibraryJobRow } from "@/lib/mock/library";

// Status pill — mirrors the trace-card status banner palette for cross-surface
// recognition (a Completed job and a Passed trace land on the same green).
const STATE_PILL: Record<LibraryJobRow["state"], string> = {
  completed: "bg-state-scored-subtle text-state-scored-text",
  running: "bg-state-running-subtle text-state-running-text",
  queued: "bg-state-not-run/15 text-state-not-run",
  failed: "bg-state-warning-subtle text-state-warning-text",
  errored: "bg-state-errored-subtle text-state-errored-text",
  invalidated: "bg-state-not-run/15 text-state-not-run",
};

const STATE_LABEL: Record<LibraryJobRow["state"], string> = {
  completed: "Completed",
  running: "Running",
  queued: "Queued",
  failed: "Failed",
  errored: "Errored",
  invalidated: "Invalid",
};

interface LibraryJobRowProps {
  job: LibraryJobRow;
  onToggleStar: (id: string) => void;
}

export function LibraryJobRowItem({ job, onToggleStar }: LibraryJobRowProps) {
  const ownerInitial = job.ownerName.charAt(0).toUpperCase();
  const rewardPct =
    job.reward == null ? null : `${(job.reward * 100).toFixed(0)}%`;
  const rewardColor =
    job.reward == null
      ? "text-muted-foreground"
      : job.reward >= 0.75
        ? "text-state-scored-text"
        : job.reward >= 0.4
          ? "text-state-warning-text"
          : "text-state-errored-text";
  const dateLabel = job.when ?? "now";

  return (
    <div className="group relative flex items-center gap-3 border-b border-border px-4 py-3 transition-colors hover:bg-hover-surface">
      <Play
        aria-hidden="true"
        className="size-3.5 shrink-0 fill-muted-foreground text-muted-foreground"
      />

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href={`/jobs/${job.id}`}
            className="truncate text-body font-semibold text-foreground outline-hidden hover:underline focus-visible:shadow-focus-ring rounded-sm"
          >
            {job.title}
          </Link>
          <span aria-hidden="true" className="text-meta-foreground">
            ·
          </span>
          <Avatar size="xs" className="size-5">
            <AvatarFallback>{ownerInitial}</AvatarFallback>
          </Avatar>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="shrink-0 font-mono text-meta text-meta-foreground tabular-nums">
                {dateLabel}
              </span>
            </TooltipTrigger>
            <TooltipContent>{job.ownerName}</TooltipContent>
          </Tooltip>
          {rewardPct && (
            <span
              className={cn(
                "shrink-0 font-mono text-caption font-medium tabular-nums",
                rewardColor,
              )}
            >
              {rewardPct}
            </span>
          )}
        </div>

        <div className="mt-1 flex min-w-0 items-center gap-2">
          <span className="inline-flex items-center rounded-sm bg-secondary-surface px-1.5 py-0.5 font-mono text-meta text-foreground">
            {job.modelName}
          </span>
          <span className="inline-flex items-center font-mono text-meta text-muted-foreground">
            {job.tasksetEnv} Tasks
          </span>
          {job.traces && job.traceCount <= 40 && (
            <span className="ml-1">
              <TraceGrid traces={job.traces} />
            </span>
          )}
          {!job.traces && job.runsLabel && (
            <span className="font-mono text-meta text-meta-foreground tabular-nums">
              {job.runsLabel}
            </span>
          )}
          {job.flag && (
            <span className="inline-flex items-center rounded-sm bg-state-warning-subtle px-1.5 py-0.5 font-mono text-meta text-state-warning-text">
              {job.flag}
            </span>
          )}
        </div>
      </div>

      <span
        className={cn(
          "shrink-0 rounded-full px-2 py-0.5 font-mono text-meta font-medium uppercase tracking-wide",
          STATE_PILL[job.state],
        )}
        aria-label={`Status: ${STATE_LABEL[job.state]}`}
      >
        {job.state === "completed" && "✓ "}
        {STATE_LABEL[job.state]}
      </span>

      <button
        type="button"
        aria-pressed={true}
        aria-label={`Unstar job ${job.title}`}
        onClick={() => onToggleStar(job.id)}
        className="inline-flex size-7 shrink-0 items-center justify-center rounded-sm text-state-warning-text outline-hidden hover:bg-foreground/5 focus-visible:shadow-focus-ring"
      >
        <Star aria-hidden="true" className="size-4 fill-current" />
      </button>
    </div>
  );
}
