"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Badge } from "@repo/ui/components/badge";
import {
  tableBodyClass,
  tableCellVariants,
  tableClass,
  tableHeaderClass,
  tableHeadVariants,
  tableRowVariants,
} from "@repo/ui/components/table";
import { cn } from "@repo/ui/lib/cn";

import type {
  Taskset,
  TasksetCustomColumn,
  TasksetTaskRow,
} from "@/lib/mock/tasksets";

import { EmptyState } from "./tasks-tab-empty";
import { DistBars } from "./tasks-tab-cells";
import { TaskDrawer } from "./task-drawer";
import { TasksTabFilterChips } from "./tasks-tab-filter-chips";
import { TasksTabFiltersPopover } from "./tasks-tab-filters-popover";
import {
  DEFAULT_STATS_FILTERS,
  loadStatsFilters,
  saveStatsFilters,
  type TasksetStatsFilters,
} from "./tasks-tab-filters";

interface TasksTabProps {
  taskset: Taskset;
}

const columnHelper = createColumnHelper<TasksetTaskRow>();

export default function TasksTab({ taskset }: TasksTabProps) {
  const customColumns = taskset.customColumns;
  const tasks = taskset.tasks;

  // SSR + first client render: defaults (no localStorage access). After mount,
  // load persisted filters from localStorage. Keeping SSR and first CSR markup
  // identical avoids the hydration mismatch on the trigger's count badge + chip
  // row when persisted filters are non-default.
  const [statsFilters, setStatsFilters] = useState<TasksetStatsFilters>(
    DEFAULT_STATS_FILTERS,
  );
  useEffect(() => {
    setStatsFilters(loadStatsFilters(taskset.id));
  }, [taskset.id]);

  const handleStatsFiltersChange = useCallback(
    (next: TasksetStatsFilters) => {
      setStatsFilters(next);
      saveStatsFilters(taskset.id, next);
    },
    [taskset.id],
  );

  const environments = useMemo(
    () => extractEnvironmentPrefixes(tasks),
    [tasks],
  );

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const selectedIndex = useMemo(
    () =>
      selectedTaskId === null
        ? -1
        : tasks.findIndex((t) => t.taskId === selectedTaskId),
    [selectedTaskId, tasks],
  );
  const selectedTask =
    selectedIndex >= 0 ? (tasks[selectedIndex] ?? null) : null;

  useEffect(() => {
    if (selectedTask === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      // Don't hijack arrow keys when the user is interacting with a real input
      // — selects, segmented controls, search inputs all need them.
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      if (target?.isContentEditable) return;
      if (selectedIndex < 0) return;
      e.preventDefault();
      const delta = e.key === "ArrowDown" ? 1 : -1;
      const next = Math.max(
        0,
        Math.min(tasks.length - 1, selectedIndex + delta),
      );
      const nextTask = tasks[next];
      if (nextTask) setSelectedTaskId(nextTask.taskId);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedTask, selectedIndex, tasks]);

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "rowNumber",
        header: "#",
        cell: (info) => (
          <span className="font-mono text-code tabular-nums text-muted-foreground">
            {info.row.index + 1}
          </span>
        ),
        meta: {
          headerClassName: "text-right w-10",
          cellClassName: "text-right w-10",
        },
      }),
      columnHelper.accessor("tr", {
        header: "Runs",
        cell: (info) => (
          <span className="font-mono text-code tabular-nums text-foreground">
            {info.getValue()}
          </span>
        ),
        meta: {
          headerClassName: "text-right w-12",
          cellClassName: "text-right w-12",
        },
      }),
      columnHelper.display({
        id: "task",
        header: "Task",
        cell: (info) => {
          const r = info.row.original;
          return (
            <div className="flex flex-col items-start gap-1">
              <Badge variant="neutral">
                {r.taskId} | v{r.taskVersion}
              </Badge>
              <span className="font-mono text-code text-muted-foreground">
                {r.scenario}
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor("progress", {
        header: "Progress",
        cell: (info) => <ProgressDots value={info.getValue()} />,
      }),
      columnHelper.accessor("reward", {
        header: "Reward",
        cell: (info) => <RewardBadge value={info.getValue()} />,
        meta: { headerClassName: "text-right", cellClassName: "text-right" },
      }),
      columnHelper.accessor("dist", {
        header: "Dist",
        cell: (info) => <DistBars value={info.getValue()} />,
      }),
      columnHelper.accessor("updated", {
        header: "Updated",
        cell: (info) => (
          <span className="text-body text-muted-foreground">
            {info.getValue()}
          </span>
        ),
      }),
      ...customColumns.map((col) =>
        columnHelper.display({
          id: `custom-${col.key}`,
          header: () => <CustomColumnHeader column={col} />,
          cell: (info) => {
            const raw = info.row.original.customColumns?.[col.key];
            if (raw === undefined || raw === null) {
              return (
                <span className="text-body text-meta-foreground">—</span>
              );
            }
            return (
              <span className="text-body text-foreground">{String(raw)}</span>
            );
          },
        }),
      ),
    ],
    [customColumns],
  );

  // Stable mutable copy — TanStack Table resets its row model whenever the
  // `data` reference changes, so it must be referentially stable across renders.
  const tableData = useMemo(() => [...tasks], [tasks]);
  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (tasks.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="flex items-center gap-2">
        <TasksTabFilterChips
          applied={statsFilters}
          onChange={handleStatsFiltersChange}
        />
        <div className="ml-auto flex items-center gap-2">
          <TasksTabFiltersPopover
            applied={statsFilters}
            environments={environments}
            onApply={handleStatsFiltersChange}
          />
        </div>
      </div>


      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className={tableClass}>
          <thead className={tableHeaderClass}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as
                    | { headerClassName?: string }
                    | undefined;
                  return (
                    <th
                      key={header.id}
                      scope="col"
                      className={cn(
                        tableHeadVariants(),
                        "normal-case tracking-normal",
                        meta?.headerClassName,
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className={tableBodyClass}>
            {table.getRowModel().rows.map((row) => {
              const isSelected = row.original.taskId === selectedTaskId;
              return (
                <tr
                  key={row.id}
                  data-state={isSelected ? "selected" : undefined}
                  onClick={() => setSelectedTaskId(row.original.taskId)}
                  className={cn(
                    tableRowVariants(),
                    "cursor-pointer",
                    "border-l-2 border-l-transparent",
                  )}
                >
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta as
                      | { cellClassName?: string }
                      | undefined;
                    return (
                      <td
                        key={cell.id}
                        className={cn(
                          tableCellVariants(),
                          meta?.cellClassName,
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <TaskDrawer
        task={selectedTask}
        onClose={() => setSelectedTaskId(null)}
      />
    </div>
  );
}

function extractEnvironmentPrefixes(
  tasks: ReadonlyArray<TasksetTaskRow>,
): ReadonlyArray<string> {
  const seen = new Set<string>();
  const out: Array<string> = [];
  for (const t of tasks) {
    const idx = t.scenario.indexOf(":");
    const prefix = idx === -1 ? t.scenario : t.scenario.slice(0, idx);
    if (!seen.has(prefix)) {
      seen.add(prefix);
      out.push(prefix);
    }
  }
  return out;
}

function CustomColumnHeader({ column }: { column: TasksetCustomColumn }) {
  return (
    <>
      <span className="capitalize">{column.label}</span>
      <span className="ml-1.5 font-mono text-meta text-meta-foreground">
        {column.type}
      </span>
    </>
  );
}

function ProgressDots({ value }: { value: number }) {
  const total = 3;
  // round() so 0.5 lands on 2/3 dots — matches "halfway through" intuition.
  const filled = Math.max(0, Math.min(total, Math.round(value * total)));
  const width = 56;
  const height = 12;
  const radius = 4;
  const margin = radius + 1;
  const step = (width - margin * 2) / (total - 1);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label={`Progress ${Math.round(value * 100)}%`}
    >
      <line
        x1={margin}
        x2={width - margin}
        y1={height / 2}
        y2={height / 2}
        className="stroke-border"
        strokeWidth={1}
      />
      {Array.from({ length: total }).map((_, i) => {
        const cx = margin + i * step;
        const isFilled = i < filled;
        return (
          <circle
            key={i}
            cx={cx}
            cy={height / 2}
            r={radius}
            className={
              isFilled
                ? "fill-primary stroke-primary"
                : "fill-background stroke-border-strong"
            }
            strokeWidth={1}
          />
        );
      })}
    </svg>
  );
}

function RewardBadge({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  let variant: "success" | "destructive" | "neutral";
  if (value >= 1) variant = "success";
  else if (value <= 0) variant = "destructive";
  else variant = "neutral";

  return (
    <Badge variant={variant}>
      {pct}%
    </Badge>
  );
}
