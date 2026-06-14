"use client";

// Stub list view for /library?tab=traces&view=list. The brief carves this out
// as a thin alternative to the grid — simple <table>, same data, no expandable
// rows, no row actions beyond unstar.
//
// Raw <table> instead of the @repo/ui Table component because that component's
// API is shaped for TanStack-driven tables (totalCount / pageOffset / sorting
// callbacks) and would be configuration-over-composition for this stub.

import { Star } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/cn";
import type { TraceRow, TraceStatus } from "@/lib/mock/library";

const STATUS_LABEL: Record<TraceStatus, string> = {
  running: "Running",
  passed: "Passed",
  failed: "Failed",
  partial: "Partial",
};

const STATUS_PILL: Record<TraceStatus, string> = {
  running: "bg-state-running-subtle text-state-running-text",
  passed: "bg-state-scored-subtle text-state-scored-text",
  failed: "bg-state-errored-subtle text-state-errored-text",
  partial: "bg-state-warning-subtle text-state-warning-text",
};

interface TraceListTableProps {
  traces: ReadonlyArray<TraceRow>;
  onToggleStar: (id: string) => void;
}

export function TraceListTable({ traces, onToggleStar }: TraceListTableProps) {
  return (
    // Bounded inner scroll via flex chain. flex-1 + min-h-0 takes the
    // remaining height inside the LibraryTraces flex column — no calc() math.
    // Sticky <thead> anchors against this wrapper's overflow context.
    <div className="min-h-0 flex-1 overflow-auto rounded-md border border-border bg-panel">
      <table className="w-full border-collapse">
        <thead className="sticky top-0 z-table-header bg-elevated-surface">
          <tr className="border-b border-border text-left">
            <th className="px-4 py-2 font-mono text-meta text-meta-foreground uppercase">
              Task
            </th>
            <th className="px-4 py-2 font-mono text-meta text-meta-foreground uppercase">
              Score
            </th>
            <th className="px-4 py-2 font-mono text-meta text-meta-foreground uppercase">
              Status
            </th>
            <th className="px-4 py-2 font-mono text-meta text-meta-foreground uppercase">
              Turns
            </th>
            <th className="px-4 py-2 font-mono text-meta text-meta-foreground uppercase">
              Time
            </th>
            <th className="px-4 py-2" aria-label="Saved" />
          </tr>
        </thead>
        <tbody>
          {traces.map((trace) => (
            <tr
              key={trace.id}
              className="border-b border-border last:border-b-0 transition-colors hover:bg-hover-surface"
            >
              <td className="min-w-0 px-4 py-2.5">
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-mono text-caption text-foreground">
                    {trace.taskSlug}
                  </span>
                  <span className="font-mono text-meta text-meta-foreground">
                    {trace.id.slice(0, 6)}
                  </span>
                </div>
              </td>
              <td className="px-4 py-2.5 font-mono text-body tabular-nums text-foreground">
                {trace.reward == null
                  ? "—"
                  : trace.reward.toFixed(4)}
              </td>
              <td className="px-4 py-2.5">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 font-mono text-meta font-medium",
                    STATUS_PILL[trace.status],
                  )}
                >
                  {STATUS_LABEL[trace.status]}
                </span>
              </td>
              <td className="px-4 py-2.5 font-mono text-body tabular-nums text-foreground">
                {trace.steps}
              </td>
              <td className="px-4 py-2.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <time
                      dateTime={trace.whenISO}
                      className="font-mono text-meta text-meta-foreground"
                    >
                      {trace.when}
                    </time>
                  </TooltipTrigger>
                  <TooltipContent>{trace.whenISO}</TooltipContent>
                </Tooltip>
              </td>
              <td className="px-4 py-2.5 text-right">
                <button
                  type="button"
                  aria-pressed={true}
                  aria-label={`Unstar trace ${trace.id.slice(0, 6)}`}
                  onClick={() => onToggleStar(trace.id)}
                  className="inline-flex size-6 items-center justify-center rounded-sm text-state-warning-text outline-hidden hover:bg-foreground/5 focus-visible:shadow-focus-ring"
                >
                  <Star aria-hidden="true" className="size-3.5 fill-current" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
