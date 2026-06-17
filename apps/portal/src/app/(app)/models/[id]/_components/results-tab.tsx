"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, HelpCircleIcon } from "lucide-react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Progress } from "@repo/ui/components/progress";
import {
  tableBodyClass,
  tableCellVariants,
  tableClass,
  tableHeaderClass,
  tableHeadVariants,
  tableRowVariants,
} from "@repo/ui/components/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/cn";
import type { TasksetResult } from "../_data/types";
import { ScoreDistribution } from "./score-distribution";

const THRESHOLD_TOOLTIP =
  "Tasks where the model's score met this threshold ÷ total tasks run.";

interface ResultsTabProps {
  rows: ReadonlyArray<TasksetResult>;
}

export function ResultsTab({ rows }: ResultsTabProps) {
  return (
    <section className="py-4">
      {rows.length === 0 && (
        <div className="py-12 text-center text-body text-muted-foreground">
          No tasksets yet. Add one to start evaluating.
        </div>
      )}
      {rows.length > 0 && (
        <div className="overflow-hidden rounded-md border border-border bg-card">
          <div className="overflow-x-auto">
            <ResultsTable rows={rows} />
          </div>
        </div>
      )}
    </section>
  );
}

const columnHelper = createColumnHelper<TasksetResult>();

function ResultsTable({ rows }: { rows: ReadonlyArray<TasksetResult> }) {
  const router = useRouter();
  const columns = [
    columnHelper.accessor("tasksetName", {
      id: "taskset",
      header: () => <span>Taskset</span>,
      cell: (info) => {
        const row = info.row.original;
        return (
          <div className="flex flex-col">
            <span className="text-foreground">{row.tasksetName}</span>
            <span className="text-body text-muted-foreground">
              {row.description}
            </span>
            <span className="font-mono text-meta text-meta-foreground">
              {row.taskCount} tasks
            </span>
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "progress",
      header: () => <span>Progress</span>,
      cell: (info) => <ProgressCell row={info.row.original} />,
    }),
    columnHelper.display({
      id: "avg",
      header: () => <span>Avg</span>,
      cell: (info) => <AvgCell row={info.row.original} />,
    }),
    columnHelper.display({
      id: "rank",
      header: () => <span>Rank</span>,
      cell: (info) => <RankCell row={info.row.original} />,
    }),
    columnHelper.display({
      id: "ge99",
      header: () => <ThresholdHeader label="≥99%" />,
      cell: (info) => (
        <ThresholdCell
          count={info.row.original.runStats?.countAt99 ?? null}
          taskCount={info.row.original.taskCount}
        />
      ),
    }),
    columnHelper.display({
      id: "ge75",
      header: () => <ThresholdHeader label="≥75%" />,
      cell: (info) => (
        <ThresholdCell
          count={info.row.original.runStats?.countAt75 ?? null}
          taskCount={info.row.original.taskCount}
        />
      ),
    }),
    columnHelper.display({
      id: "ge40",
      header: () => <ThresholdHeader label="≥40%" />,
      cell: (info) => (
        <ThresholdCell
          count={info.row.original.runStats?.countAt40 ?? null}
          taskCount={info.row.original.taskCount}
        />
      ),
    }),
    columnHelper.display({
      id: "distribution",
      header: () => <span>Score distribution</span>,
      cell: (info) => <DistributionCell row={info.row.original} />,
    }),
    columnHelper.display({
      id: "chevron",
      header: () => <span />,
      cell: () => (
        <ChevronRight
          aria-hidden="true"
          className="size-4 text-meta-foreground"
        />
      ),
    }),
  ];

  const table = useReactTable({
    data: rows as TasksetResult[],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table className={tableClass}>
      <thead className={tableHeaderClass}>
        {table.getHeaderGroups().map((group) => (
          <tr key={group.id}>
            {group.headers.map((header) => (
              <th key={header.id} className={cn(tableHeadVariants(), "normal-case")}>
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody className={tableBodyClass}>
        {table.getRowModel().rows.map((row) => {
          const href = `/tasksets/${row.original.tasksetId}`;
          const navigate = () => router.push(href);
          return (
            <tr
              key={row.id}
              role="button"
              tabIndex={0}
              onClick={navigate}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate();
                }
              }}
              className={cn(
                tableRowVariants(),
                "cursor-pointer transition-colors hover:bg-accent",
              )}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className={tableCellVariants()}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/** Filled-row only — empty rows render their own merged cell upstream and never
 * reach this component. */
function ProgressCell({ row }: { row: TasksetResult }) {
  if (row.runStats === null) return null;
  const pct = Math.round((row.runStats.completed / row.taskCount) * 100);
  return (
    <div className="flex min-w-[140px] items-center gap-3">
      <div className="flex-1">
        <Progress value={pct} aria-label={`Progress ${pct}%`} />
      </div>
      <span className="font-mono text-meta text-foreground tabular-nums">{pct}%</span>
    </div>
  );
}

function AvgCell({ row }: { row: TasksetResult }) {
  if (row.runStats === null) {
    return <EmptyMetric />;
  }
  return (
    <span className="font-mono tabular-nums text-foreground">
      {row.runStats.avgScore.toFixed(1)}%
    </span>
  );
}

function RankCell({ row }: { row: TasksetResult }) {
  if (row.rank === null || row.totalRanked === null) {
    return <EmptyMetric />;
  }
  return (
    <span className="font-mono tabular-nums text-foreground">
      #{row.rank} <span className="text-muted-foreground">of {row.totalRanked}</span>
    </span>
  );
}

function ThresholdCell({
  count,
  taskCount,
}: {
  count: number | null;
  taskCount: number;
}) {
  if (count === null) {
    return <EmptyMetric />;
  }
  const pct = Math.round((count / taskCount) * 100);
  return (
    <span className="font-mono tabular-nums text-foreground">
      {count} <span className="text-meta-foreground">·</span>{" "}
      <span className="text-muted-foreground">{pct}%</span>
    </span>
  );
}

function DistributionCell({ row }: { row: TasksetResult }) {
  if (row.runStats === null) {
    return <EmptyMetric />;
  }
  return <ScoreDistribution scores={row.runStats.scoreDistribution} />;
}

function EmptyMetric() {
  return (
    <span aria-label="No data" className="text-meta-foreground">
      —
    </span>
  );
}

function ThresholdHeader({ label }: { label: "≥99%" | "≥75%" | "≥40%" }) {
  return (
    <span className="inline-flex items-center gap-1">
      {label}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={THRESHOLD_TOOLTIP}
            className={cn(
              "inline-flex size-3.5 items-center justify-center rounded-full",
              "text-meta-foreground hover:text-foreground",
            )}
          >
            <HelpCircleIcon aria-hidden="true" className="size-3" />
          </button>
        </TooltipTrigger>
        <TooltipContent>{THRESHOLD_TOOLTIP}</TooltipContent>
      </Tooltip>
    </span>
  );
}
