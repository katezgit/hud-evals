"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LayoutGrid, List as ListIcon } from "lucide-react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Badge } from "@repo/ui/components/badge";
import { Card, CardContent } from "@repo/ui/components/card";
import { EmptyState } from "@repo/ui/components/empty-state";
import { SegmentedControl } from "@repo/ui/components/segmented-control";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import {
  tableBodyClass,
  tableCellVariants,
  tableClass,
  tableHeaderClass,
  tableHeadVariants,
  tableRowVariants,
} from "@repo/ui/components/table";
import { cn } from "@repo/ui/lib/cn";
import { getTraces } from "../_data/models";
import type { Trace, Viewer } from "../_data/types";

const ALL_TASKSETS = "__all__";
type ViewMode = "grid" | "list";

interface TracesTabProps {
  modelId: string;
  viewer: Viewer;
}

/**
 * Adapter — the page wires this tab with `model` + `viewer` (see
 * `model-detail-tabs.tsx`). We only need `model.id` for the data lookup;
 * forward the rest to the internal client component.
 */
export function TracesTab({
  model,
  viewer,
}: {
  model: { id: string };
  viewer: Viewer;
}) {
  return <TracesTabClient modelId={model.id} viewer={viewer} />;
}

function TracesTabClient({ modelId }: TracesTabProps) {
  const [traces, setTraces] = useState<ReadonlyArray<Trace> | null>(null);
  const [view, setView] = useState<ViewMode>("grid");
  const [tasksetId, setTasksetId] = useState<string>(ALL_TASKSETS);

  useEffect(() => {
    let cancelled = false;
    setTraces(null);
    getTraces(modelId).then((rows) => {
      if (!cancelled) setTraces(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [modelId]);

  // Derive the Taskset filter options from the loaded data — the dropdown only
  // surfaces Tasksets that actually produced traces on this Model.
  const tasksetOptions = useMemo(() => {
    if (traces === null) return [] as ReadonlyArray<{ id: string; name: string }>;
    const seen = new Map<string, string>();
    for (const t of traces) {
      if (!seen.has(t.tasksetId)) seen.set(t.tasksetId, t.tasksetName);
    }
    return Array.from(seen, ([id, name]) => ({ id, name }));
  }, [traces]);

  const filtered = useMemo(() => {
    if (traces === null) return null;
    if (tasksetId === ALL_TASKSETS) return traces;
    return traces.filter((t) => t.tasksetId === tasksetId);
  }, [traces, tasksetId]);

  // Loading skeleton — keeps the toolbar visible so the layout doesn't jump.
  if (traces === null) {
    return (
      <div className="py-4">
        <TracesToolbar
          tasksetId={tasksetId}
          onTasksetChange={setTasksetId}
          tasksetOptions={tasksetOptions}
          view={view}
          onViewChange={setView}
        />
        <div className="mt-6 h-40 animate-pulse rounded-surface bg-muted" />
      </div>
    );
  }

  // True zero-state — no traces have ever existed for this Model.
  if (traces.length === 0) {
    return (
      <div className="py-12">
        <EmptyState
          variant="zero-state"
          icon={LayoutGrid}
          title="No traces yet"
          subtitle="Runs on this model will produce traces here."
        />
      </div>
    );
  }

  const visible = filtered ?? [];

  return (
    <div className="py-4">
      <TracesToolbar
        tasksetId={tasksetId}
        onTasksetChange={setTasksetId}
        tasksetOptions={tasksetOptions}
        view={view}
        onViewChange={setView}
      />

      <TracesBody traces={visible} view={view} />
    </div>
  );
}

function TracesBody({
  traces,
  view,
}: {
  traces: ReadonlyArray<Trace>;
  view: ViewMode;
}) {
  if (traces.length === 0) {
    return (
      <div className="mt-6">
        <EmptyState
          variant="no-results"
          title="No traces match this filter"
          subtitle="Try another Taskset or clear the filter."
        />
      </div>
    );
  }
  if (view === "grid") return <TraceGrid traces={traces} />;
  return <TraceList traces={traces} />;
}

function TracesToolbar({
  tasksetId,
  onTasksetChange,
  tasksetOptions,
  view,
  onViewChange,
}: {
  tasksetId: string;
  onTasksetChange: (next: string) => void;
  tasksetOptions: ReadonlyArray<{ id: string; name: string }>;
  view: ViewMode;
  onViewChange: (next: ViewMode) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Select value={tasksetId} onValueChange={onTasksetChange}>
        <SelectTrigger className="w-56" aria-label="Filter by taskset">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_TASKSETS}>All tasksets</SelectItem>
          {tasksetOptions.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <SegmentedControl
        aria-label="View mode"
        value={view}
        onValueChange={(value) => onViewChange(value as ViewMode)}
        size="md"
      >
        <SegmentedControl.Item value="grid" aria-label="Grid view">
          <LayoutGrid aria-hidden="true" className="size-4" />
        </SegmentedControl.Item>
        <SegmentedControl.Item value="list" aria-label="List view">
          <ListIcon aria-hidden="true" className="size-4" />
        </SegmentedControl.Item>
      </SegmentedControl>
    </div>
  );
}

function TraceGrid({ traces }: { traces: ReadonlyArray<Trace> }) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
      {traces.map((trace) => (
        <TraceCard key={trace.id} trace={trace} />
      ))}
    </div>
  );
}

function TraceCard({ trace }: { trace: Trace }) {
  return (
    <Card className="overflow-hidden" data-trace-id={trace.id}>
      <TraceThumbnail trace={trace} />
      <CardContent className="flex flex-col gap-1">
        <Link
          href={`/traces/${trace.id}`}
          className={cn(
            "self-start rounded-sm",
            "font-mono text-meta text-muted-foreground",
            "hover:underline hover:text-foreground",
          )}
        >
          {truncateTraceId(trace.id)}
        </Link>
        <span className="text-meta text-meta-foreground">
          {trace.tasksetName}
        </span>
      </CardContent>
    </Card>
  );
}

// Deterministic pseudo-thumbnail keyed off the trace id so cards visually
// differ at a glance; rendered in place of the real screenshot/step-replay
// preview the trace replayer will provide.
function TraceThumbnail({ trace }: { trace: Trace }) {
  const tint = thumbnailTint(trace.id);
  return (
    <div
      className={cn(
        "relative aspect-[4/3] w-full border-b border-border",
        "bg-muted",
      )}
      style={{ backgroundColor: tint }}
      aria-hidden="true"
    >
      {/* Score badge top-right */}
      <div className="absolute right-2 top-2">
        <Badge variant={scoreVariant(trace.score)} size="default">
          {Math.round(trace.score)}%
        </Badge>
      </div>
      {/* Step counter bottom-left */}
      <div className="absolute bottom-2 left-2">
        <span
          className={cn(
            "rounded-badge bg-panel/90 px-1.5 py-0.5",
            "font-mono text-meta text-foreground",
            "border border-border",
          )}
        >
          {trace.steps} steps
        </span>
      </div>
    </div>
  );
}

const columnHelper = createColumnHelper<Trace>();

function TraceList({ traces }: { traces: ReadonlyArray<Trace> }) {
  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        id: "id",
        header: () => <span>Trace ID</span>,
        cell: (info) => (
          <Link
            href={`/traces/${info.getValue()}`}
            className={cn(
              "rounded-sm",
              "font-mono text-meta text-foreground",
              "hover:underline hover:text-foreground",
            )}
          >
            {info.getValue()}
          </Link>
        ),
      }),
      columnHelper.accessor("tasksetName", {
        id: "taskset",
        header: () => <span>Taskset</span>,
        cell: (info) => <span className="text-foreground">{info.getValue()}</span>,
      }),
      columnHelper.accessor("steps", {
        id: "steps",
        header: () => <span>Steps</span>,
        cell: (info) => (
          <span className="font-mono tabular-nums text-foreground">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("score", {
        id: "score",
        header: () => <span>Score</span>,
        cell: (info) => (
          <Badge variant={scoreVariant(info.getValue())} size="default">
            {Math.round(info.getValue())}%
          </Badge>
        ),
      }),
      columnHelper.accessor("createdAt", {
        id: "createdAt",
        header: () => <span>Created</span>,
        cell: (info) => {
          const iso = info.getValue();
          return (
            <span
              title={iso}
              className="font-mono text-meta text-muted-foreground tabular-nums"
            >
              {relativeTime(iso)}
            </span>
          );
        },
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: traces as Trace[],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="mt-4 overflow-x-auto">
      <table className={tableClass}>
        <thead className={tableHeaderClass}>
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id}>
              {group.headers.map((header) => (
                <th key={header.id} className={tableHeadVariants({ density: "compact" })}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className={tableBodyClass}>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className={tableRowVariants({ density: "compact" })}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className={tableCellVariants({ density: "compact" })}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function scoreVariant(score: number): "success" | "warning" | "destructive" {
  if (score >= 75) return "success";
  if (score >= 40) return "warning";
  return "destructive";
}

/** `trc_a3b2f9` → `trc_a3b2f9…` when longer than the wireframe's ~10-char cap. */
function truncateTraceId(id: string): string {
  return id.length <= 10 ? id : `${id.slice(0, 10)}…`;
}

// Tuned so the tinted plate stays light + desaturated enough that the score
// Badge overlay remains the dominant semantic signal on the card. Hue rotates
// per trace id for visual differentiation; lightness + chroma are fixed.
const TRACE_THUMBNAIL_LIGHTNESS = 0.78;
const TRACE_THUMBNAIL_CHROMA = 0.04;

function thumbnailTint(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff;
  }
  const hue = Math.abs(hash) % 360;
  return `oklch(${TRACE_THUMBNAIL_LIGHTNESS} ${TRACE_THUMBNAIL_CHROMA} ${hue})`;
}

function relativeTime(iso: string): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return iso;
  const diffMs = Date.now() - then;
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
