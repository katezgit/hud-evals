"use client";

import { useMemo } from "react";
import { FilterIcon, PlusIcon } from "lucide-react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
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

interface TasksTabProps {
  taskset: Taskset;
}

const columnHelper = createColumnHelper<TasksetTaskRow>();

export default function TasksTab({ taskset }: TasksTabProps) {
  const customColumns = taskset.customColumns;

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
        header: "Tr",
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
            <Badge size="sm" variant="neutral">
              {r.taskId} | v{r.taskVersion}
            </Badge>
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
      columnHelper.accessor("scenario", {
        header: "Scenario",
        cell: (info) => (
          <span className="font-mono text-code text-foreground">
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
                <span className="text-body text-meta-foreground">
                  —
                </span>
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

  const table = useReactTable({
    data: [...taskset.tasks],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (taskset.tasks.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col gap-3 pb-4">
      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" size="sm">
          <PlusIcon aria-hidden="true" />
          Add Column
        </Button>
        <Button type="button" variant="secondary" size="sm">
          <FilterIcon aria-hidden="true" />
          Filters
        </Button>
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
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className={tableRowVariants()}>
                {row.getVisibleCells().map((cell) => {
                  const meta = cell.column.columnDef.meta as
                    | { cellClassName?: string }
                    | undefined;
                  return (
                    <td
                      key={cell.id}
                      className={cn(tableCellVariants(), meta?.cellClassName)}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CustomColumnHeader({ column }: { column: TasksetCustomColumn }) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span>{column.label}</span>
      <Badge size="sm" variant="neutral" className="border-transparent bg-transparent px-0 py-0 opacity-70">
        {column.type}
      </Badge>
    </span>
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
    <Badge size="sm" variant={variant}>
      {pct}%
    </Badge>
  );
}

function DistBars({ value }: { value: number }) {
  const bars = 5;
  // Active count grows with value; ≥1 lights everything.
  const active = Math.max(0, Math.min(bars, Math.round(value * bars)));
  const width = 40;
  const height = 14;
  const gap = 1.5;
  const barWidth = (width - gap * (bars - 1)) / bars;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label={`Distribution ${Math.round(value * 100)}%`}
    >
      {Array.from({ length: bars }).map((_, i) => {
        const x = i * (barWidth + gap);
        const isActive = i < active;
        const barHeight = height * (0.4 + ((i + 1) / bars) * 0.6);
        const y = height - barHeight;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barWidth}
            height={barHeight}
            className={isActive ? distBarClass(value) : "fill-muted"}
            rx={0.5}
          />
        );
      })}
    </svg>
  );
}

function distBarClass(value: number): string {
  if (value >= 0.66) return "fill-state-scored";
  if (value >= 0.33) return "fill-state-warning";
  return "fill-state-errored";
}
