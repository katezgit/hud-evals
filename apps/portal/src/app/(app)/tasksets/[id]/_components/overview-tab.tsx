"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ListFilter,
  Network,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { IconButton } from "@repo/ui/components/icon-button";
import {
  tableBodyClass,
  tableCellVariants,
  tableClass,
  tableHeaderClass,
  tableHeadVariants,
  tableRowVariants,
} from "@repo/ui/components/table";
import { cn } from "@repo/ui/lib/cn";
import type { Taskset, TasksetLeaderboardRow } from "@/lib/mock/tasksets";
import { OverviewEmptyState } from "./overview-tab-empty";

interface OverviewTabProps {
  taskset: Taskset;
}

type MetricKey = "average" | "best3" | "best5" | "best10" | "pass1" | "steps";
type SortDirection = "asc" | "desc";
type SortState = { column: MetricKey | null; direction: SortDirection };

interface MetricColumn {
  key: MetricKey;
  label: string;
  format: "percent" | "steps";
}

const METRIC_COLUMNS: ReadonlyArray<MetricColumn> = [
  { key: "average", label: "Average", format: "percent" },
  { key: "best3", label: "Best@3", format: "percent" },
  { key: "best5", label: "Best@5", format: "percent" },
  { key: "best10", label: "Best@10", format: "percent" },
  { key: "pass1", label: "Pass@1", format: "percent" },
  { key: "steps", label: "Steps", format: "steps" },
];

const STEPS_FILTER_OPTIONS: ReadonlyArray<{ value: string; label: string; max: number | null }> = [
  { value: "unlimited", label: "No limit", max: null },
  { value: "10", label: "≤ 10", max: 10 },
  { value: "15", label: "≤ 15", max: 15 },
  { value: "20", label: "≤ 20", max: 20 },
  { value: "50", label: "≤ 50", max: 50 },
  { value: "100", label: "≤ 100", max: 100 },
];

function formatMetric(value: number | null, format: MetricColumn["format"]): string {
  if (value === null) return "—";
  if (format === "percent") return `${(value * 100).toFixed(1)}%`;
  return value.toFixed(1);
}

function rankPillClass(rank: number): string {
  if (rank === 1) return "bg-state-warning-subtle text-state-warning-text";
  if (rank === 2) return "bg-secondary-surface text-secondary-foreground";
  if (rank === 3) return "bg-state-scored-subtle text-state-scored-text";
  return "bg-muted-surface text-muted-foreground";
}

function nextSortState(current: SortState, column: MetricKey): SortState {
  if (current.column !== column) return { column, direction: "desc" };
  if (current.direction === "desc") return { column, direction: "asc" };
  return { column: null, direction: "desc" };
}

function compareNullable(a: number | null, b: number | null, direction: SortDirection): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return direction === "asc" ? a - b : b - a;
}

function ariaSortFor(state: SortState, column: MetricKey): "ascending" | "descending" | "none" {
  if (state.column !== column) return "none";
  return state.direction === "asc" ? "ascending" : "descending";
}

function buildSortLabel(label: string, sort: SortState, isActive: boolean): string {
  if (!isActive) return `Sort by ${label} descending`;
  if (sort.direction === "desc") return `Sort by ${label} ascending`;
  return `Clear sort on ${label}`;
}

export default function OverviewTab({ taskset }: OverviewTabProps) {
  const [sort, setSort] = useState<SortState>({ column: null, direction: "desc" });
  const [stepsFilter, setStepsFilter] = useState<string>("unlimited");

  const visibleRows = useMemo(() => {
    const filterMax = STEPS_FILTER_OPTIONS.find((o) => o.value === stepsFilter)?.max ?? null;
    const filtered =
      filterMax === null
        ? taskset.leaderboard
        : taskset.leaderboard.filter((r) => r.steps === null || r.steps <= filterMax);
    if (sort.column === null) return filtered;
    const column = sort.column;
    return [...filtered].sort((a, b) => compareNullable(a[column], b[column], sort.direction));
  }, [taskset.leaderboard, sort, stepsFilter]);

  if (taskset.leaderboard.length === 0) {
    return (
      <div className="flex flex-col gap-4 pb-4">
        <LastModifiedLine taskset={taskset} />
        <OverviewEmptyState taskset={taskset} />
      </div>
    );
  }

  const topAverage = taskset.leaderboard
    .map((r) => r.average)
    .filter((v): v is number => v !== null)
    .reduce<number | null>((max, v) => (max === null || v > max ? v : max), null);

  const stepsFilterActive = stepsFilter !== "unlimited";

  return (
    <div className="flex flex-col gap-4 pb-4">
      <LastModifiedLine taskset={taskset} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <table className={tableClass}>
            <thead className={tableHeaderClass}>
              <tr>
                <th
                  scope="col"
                  className={cn(
                    tableHeadVariants({ density: "compact" }),
                    "normal-case tracking-normal",
                  )}
                >
                  <span className="text-label font-medium text-muted-foreground">
                    Agent
                  </span>
                </th>
                {METRIC_COLUMNS.map((col) => (
                  <SortableHeaderCell
                    key={col.key}
                    column={col}
                    sort={sort}
                    onSort={() => setSort((s) => nextSortState(s, col.key))}
                    filterSlot={
                      col.key === "steps" ? (
                        <StepsFilterMenu
                          value={stepsFilter}
                          onChange={setStepsFilter}
                          active={stepsFilterActive}
                        />
                      ) : null
                    }
                  />
                ))}
                <th
                  scope="col"
                  className={cn(
                    tableHeadVariants({ density: "compact" }),
                    "w-12 normal-case tracking-normal",
                  )}
                >
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className={tableBodyClass}>
              {visibleRows.map((row, i) => (
                <LeaderboardRow
                  key={`${row.rank}-${row.agentName}`}
                  row={row}
                  displayRank={i + 1}
                  topAverage={topAverage}
                  tasksetId={taskset.id}
                />
              ))}
            </tbody>
          </table>
        </div>

        <TopPerformersCard rows={visibleRows} />
      </div>
    </div>
  );
}

const LAST_MODIFIED_DATE = "2026-05-12";
const LAST_MODIFIED_FORMATTER = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
});

function LastModifiedLine({ taskset }: { taskset: Taskset }) {
  const handle = `@${taskset.ownerName.toLowerCase().replace(/\s+/g, "-")}`;
  const formatted = LAST_MODIFIED_FORMATTER.format(new Date(LAST_MODIFIED_DATE));
  return (
    <p className="text-caption text-meta-foreground">
      Last modified {formatted} by {handle}
    </p>
  );
}

function SortableHeaderCell({
  column,
  sort,
  onSort,
  filterSlot,
}: {
  column: MetricColumn;
  sort: SortState;
  onSort: () => void;
  filterSlot: React.ReactNode;
}) {
  const isActive = sort.column === column.key;
  const ariaSort = ariaSortFor(sort, column.key);
  const sortLabel = buildSortLabel(column.label, sort, isActive);

  return (
    <th
      scope="col"
      aria-sort={ariaSort}
      className={cn(
        tableHeadVariants({ density: "compact", numeric: true }),
        "normal-case tracking-normal",
      )}
    >
      <div className="flex items-center justify-end gap-1">
        <button
          type="button"
          onClick={onSort}
          aria-label={sortLabel}
          className={cn(
            "group inline-flex items-center gap-1 rounded-sm",
            "text-label font-medium text-muted-foreground",
            "hover:text-foreground",
            isActive && "text-foreground",
          )}
        >
          <SortIcon state={sort} column={column.key} />
          <span>{column.label}</span>
        </button>
        {filterSlot}
      </div>
    </th>
  );
}

function SortIcon({ state, column }: { state: SortState; column: MetricKey }) {
  if (state.column !== column) {
    return (
      <ChevronsUpDown
        aria-hidden="true"
        className="size-3 text-meta-foreground opacity-0 group-hover:opacity-100"
      />
    );
  }
  if (state.direction === "asc") {
    return <ChevronUp aria-hidden="true" className="size-3 text-foreground" />;
  }
  return <ChevronDown aria-hidden="true" className="size-3 text-foreground" />;
}

function StepsFilterMenu({
  value,
  onChange,
  active,
}: {
  value: string;
  onChange: (v: string) => void;
  active: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton
          variant="ghost"
          size="sm"
          aria-label="Filter by Steps"
          className={cn(
            active ? "text-foreground" : "text-meta-foreground",
          )}
        >
          {/* Override IconButton sm's default [&_svg]:size-3.5 (14px) → 12px
              so the icon matches the text-label header (12px) it sits next to. */}
          <ListFilter className="size-3" />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {STEPS_FILTER_OPTIONS.map((opt) => (
            <DropdownMenuRadioItem key={opt.value} value={opt.value}>
              {opt.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function LeaderboardRow({
  row,
  displayRank,
  topAverage,
  tasksetId,
}: {
  row: TasksetLeaderboardRow;
  displayRank: number;
  topAverage: number | null;
  tasksetId: string;
}) {
  const tracesHref = `/traces?taskset=${encodeURIComponent(tasksetId)}&agent=${encodeURIComponent(row.agentName)}`;
  return (
    <tr className={tableRowVariants({ density: "compact" })}>
      <td className={tableCellVariants({ density: "compact" })}>
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "inline-flex size-4 items-center justify-center rounded font-mono text-meta tabular-nums",
              rankPillClass(displayRank),
            )}
            aria-label={`Rank ${displayRank}`}
          >
            {displayRank}
          </span>
          <span className="min-w-0 truncate text-body font-medium text-foreground">
            {row.agentName}
          </span>
        </div>
      </td>
      {METRIC_COLUMNS.map((col) => {
        const value = row[col.key];
        const isTopAverage =
          col.key === "average" &&
          value !== null &&
          topAverage !== null &&
          value === topAverage;
        const isZero = value === 0;
        return (
          <td
            key={col.key}
            className={cn(
              tableCellVariants({ density: "compact", variant: "mono" }),
              "text-right",
              isTopAverage && "font-bold text-foreground",
              isZero && !isTopAverage && "text-destructive",
              value === null && "text-meta-foreground",
            )}
          >
            {formatMetric(value, col.format)}
            {isTopAverage && (
              <span
                aria-hidden="true"
                className="ml-1 inline-block size-1.5 rounded-full bg-state-warning"
              />
            )}
          </td>
        );
      })}
      <td className={cn(tableCellVariants({ density: "compact" }), "w-12 text-right")}>
        <Link
          href={tracesHref}
          aria-label={`View Traces for ${row.agentName} on this Taskset`}
          className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-hover-surface hover:text-foreground"
        >
          <Network aria-hidden="true" className="size-3.5" />
        </Link>
      </td>
    </tr>
  );
}

interface BarDatum {
  label: string;
  /** 0..1 average; nulls are filtered out before this stage. */
  value: number;
  /** 1..5 — drives chart-N token selection. */
  colorIndex: number;
}

function TopPerformersCard({
  rows,
}: {
  rows: ReadonlyArray<TasksetLeaderboardRow>;
}) {
  const data: ReadonlyArray<BarDatum> = rows
    .filter((r): r is TasksetLeaderboardRow & { average: number } => r.average !== null)
    .slice(0, 5)
    .map((r, i) => ({
      label: r.agentName,
      value: r.average,
      colorIndex: i + 1,
    }));

  return (
    <Card variant="default" className="h-fit">
      <CardHeader>
        <CardTitle>Top 5 Performers</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="py-6 text-center text-caption text-muted-foreground">
            No scored runs yet.
          </div>
        ) : (
          <BarChart data={data} />
        )}
      </CardContent>
    </Card>
  );
}

function BarChart({ data }: { data: ReadonlyArray<BarDatum> }) {
  // viewBox-driven so the SVG scales fluidly inside the card.
  const viewBoxWidth = 320;
  const viewBoxHeight = 200;
  const padLeft = 28;
  const padRight = 8;
  const padTop = 18;
  const padBottom = 56;
  const plotWidth = viewBoxWidth - padLeft - padRight;
  const plotHeight = viewBoxHeight - padTop - padBottom;

  // Y-axis fixed at 0..40% — matches the reference range; values past 40 still
  // render proportionally but cap at chart top.
  const yMax = 0.4;
  const yTicks = [0, 0.1, 0.2, 0.3, 0.4];

  const slotWidth = plotWidth / data.length;
  const barWidth = Math.min(slotWidth * 0.55, 40);

  return (
    <svg
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      role="img"
      aria-label="Top 5 performers by average score"
      className="w-full"
    >
      {yTicks.map((t) => {
        const y = padTop + plotHeight - (t / yMax) * plotHeight;
        return (
          <g key={t}>
            <line
              x1={padLeft}
              x2={viewBoxWidth - padRight}
              y1={y}
              y2={y}
              className="stroke-border"
              strokeWidth={1}
            />
            <text
              x={padLeft - 4}
              y={y + 3}
              textAnchor="end"
              className="fill-meta-foreground text-meta font-mono"
            >
              {Math.round(t * 100)}%
            </text>
          </g>
        );
      })}

      {data.map((d, i) => {
        const ratio = Math.min(d.value / yMax, 1);
        const h = ratio * plotHeight;
        const x = padLeft + i * slotWidth + (slotWidth - barWidth) / 2;
        const y = padTop + plotHeight - h;
        const labelY = padTop + plotHeight + 14;
        return (
          <g key={`${d.label}-${i}`}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={h}
              rx={2}
              className={chartFillClass(d.colorIndex)}
            />
            <text
              x={x + barWidth / 2}
              y={y - 4}
              textAnchor="middle"
              className="fill-foreground text-meta font-mono tabular-nums"
            >
              {(d.value * 100).toFixed(0)}%
            </text>
            <text
              x={x + barWidth / 2}
              y={labelY}
              textAnchor="middle"
              transform={`rotate(-10, ${x + barWidth / 2}, ${labelY})`}
              className="fill-muted-foreground text-meta font-mono"
            >
              {truncate(d.label, 14)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// chart-1..chart-5 are in @theme → fill-chart-N utilities generate.
// Switch keeps Tailwind able to statically detect each class string.
function chartFillClass(index: number): string {
  switch (index) {
    case 1:
      return "fill-chart-1";
    case 2:
      return "fill-chart-2";
    case 3:
      return "fill-chart-3";
    case 4:
      return "fill-chart-4";
    default:
      return "fill-chart-5";
  }
}

function truncate(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}
