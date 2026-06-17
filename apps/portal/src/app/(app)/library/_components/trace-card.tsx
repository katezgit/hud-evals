"use client";

import { Star } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/cn";
import type { TraceRow, TraceStatus } from "@/lib/mock/library";

// Status banner color tokens — keyed by trace terminal state per traces.wireframe.md §5.
// Reuses the same semantic palette as jobs-index-cells.tsx (state-* tokens) so
// a "Passed" trace and a "Completed" job read as the same green family.
const STATUS_LABEL: Record<TraceStatus, string> = {
  running: "Running",
  passed: "Passed",
  failed: "Failed",
  partial: "Partial",
};

const STATUS_BANNER: Record<TraceStatus, string> = {
  running: "bg-state-running-subtle text-state-running-text",
  passed: "bg-state-scored-subtle text-state-scored-text",
  failed: "bg-state-errored-subtle text-state-errored-text",
  partial: "bg-state-warning-subtle text-state-warning-text",
};

interface TraceCardProps {
  trace: TraceRow;
  starred: boolean;
  onToggleStar: (id: string) => void;
}

export function TraceCard({ trace, starred, onToggleStar }: TraceCardProps) {
  const shortId = trace.id.slice(0, 6);
  const starLabel = starred
    ? `Unstar trace ${shortId}`
    : `Star trace ${shortId}`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-border bg-panel transition-colors hover:border-border-strong">
      <header
        className={cn(
          "flex items-center justify-between px-4 py-2",
          STATUS_BANNER[trace.status],
        )}
      >
        <span
          className="font-mono text-caption font-medium"
          aria-label={`Status: ${STATUS_LABEL[trace.status]}`}
        >
          {STATUS_LABEL[trace.status]}
        </span>
        <button
          type="button"
          aria-pressed={starred}
          aria-label={starLabel}
          onClick={() => onToggleStar(trace.id)}
          className="inline-flex size-6 items-center justify-center rounded-sm outline-hidden hover:bg-foreground/5 focus-visible:shadow-focus-ring"
        >
          <Star
            aria-hidden="true"
            className={cn(
              "size-4",
              starred ? "fill-brand text-brand" : "text-muted-foreground",
            )}
          />
        </button>
      </header>

      <div className="flex flex-col gap-1 px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <code className="font-mono text-meta text-meta-foreground">
              {shortId}
            </code>
            <span className="text-meta-foreground" aria-hidden="true">
              ·
            </span>
            <span className="truncate font-mono text-caption text-foreground">
              {trace.taskSlug}
            </span>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <time
                dateTime={trace.whenISO}
                className="shrink-0 font-mono text-meta text-meta-foreground"
              >
                {trace.when}
              </time>
            </TooltipTrigger>
            <TooltipContent>{trace.whenISO}</TooltipContent>
          </Tooltip>
        </div>

        <div className="flex min-w-0 items-center gap-2 font-mono text-meta text-muted-foreground">
          <span className="truncate">
            <span className="text-meta-foreground">Job:</span>{" "}
            <span className="text-foreground">{trace.jobName}</span>
          </span>
          <span aria-hidden="true">·</span>
          <span className="truncate text-foreground">{trace.model}</span>
          <span aria-hidden="true">·</span>
          <span className="truncate">{trace.environment}</span>
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-meta tabular-nums text-muted-foreground">
          {trace.reward === null ? (
            <span>
              reward: <span className="text-text-disabled">—</span>
            </span>
          ) : (
            <span>
              reward:{" "}
              <span className="text-foreground">{trace.reward.toFixed(4)}</span>
            </span>
          )}
          <span aria-hidden="true">·</span>
          <span>
            <span className="text-foreground">{trace.steps}</span> steps
            {trace.status === "running" && (
              <span aria-hidden="true" className="ml-1">
                ↻
              </span>
            )}
          </span>
          <span aria-hidden="true">·</span>
          <span className="text-foreground">{trace.cost}</span>
        </div>

        {trace.errorExcerpt && (
          <p className="mt-1 line-clamp-2 font-mono text-meta text-state-errored-text">
            {trace.errorExcerpt}
          </p>
        )}
      </div>
    </article>
  );
}
