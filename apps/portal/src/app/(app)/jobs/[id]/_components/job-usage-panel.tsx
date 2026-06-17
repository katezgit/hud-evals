"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
} from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { tableHeaderClass } from "@repo/ui/components/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/cn";
import type { JobUsage, JobUsageTrace } from "@/lib/mock/job-detail";

type GroupKey = "None" | "Model" | "Status" | "Task";

const ROWS_PER_PAGE = 20;

interface JobUsagePanelProps {
  usage: JobUsage;
}

export function JobUsagePanel({ usage }: JobUsagePanelProps) {
  const isSingleModel = usage.models.length <= 1;
  const [groupBy, setGroupBy] = useState<GroupKey>("None");
  const [page, setPage] = useState(1);
  const [collapsedGroups, setCollapsedGroups] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  // Flat ordered row set — Total descending. Pagination operates against this
  // list; grouping is a presentational overlay on whatever lands on the page.
  const sortedTraces = useMemo(
    () => [...usage.traces].sort((a, b) => b.total - a.total),
    [usage.traces],
  );

  // Waste flag is computed once per dataset, not per page. An errored row is
  // "waste" iff its inference cost is at least 2× the median inference cost of
  // all Scored rows in the full job — the trace burned ≥2× the typical inference
  // budget before failing.
  const wasteInfo = useMemo(() => buildWasteInfo(usage.traces), [usage.traces]);

  const pageCount = Math.max(1, Math.ceil(sortedTraces.length / ROWS_PER_PAGE));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const pageStart = (safePage - 1) * ROWS_PER_PAGE;
  const pageRows = sortedTraces.slice(pageStart, pageStart + ROWS_PER_PAGE);

  const groups = useMemo(
    () => buildGroups(pageRows, groupBy),
    [pageRows, groupBy],
  );

  // Task column suppressed when grouped by Task (group label carries the task id
  // — repeating it on every child row is noise). Model column suppressed when
  // grouped by Model, or when ungrouped on a single-model job.
  const showTaskColumn = groupBy !== "Task";
  const showModelColumn = !(
    groupBy === "Model" || (groupBy === "None" && isSingleModel)
  );
  // Trace · Status · Turns/Tokens · Inference · Environment · Total = 6
  // (+1 Task, +1 Model).
  const colCount =
    6 + (showTaskColumn ? 1 : 0) + (showModelColumn ? 1 : 0);

  const toggleGroup = (key: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="flex flex-1 min-h-0 flex-col gap-8">
      <section className="flex flex-col gap-3">
        {/* Subsection label — sits close to its content (gap-3) so the header
            reads as "label for the strip below", not a top-level section. No
            underline shelf: proximity alone carries the grouping. */}
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-subtitle font-medium text-foreground">
            Cost breakdown
          </h2>
        </div>
        <StatStrip usage={usage} />
      </section>

      <section className="flex flex-1 min-h-0 flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
          <h2 className="text-subtitle font-medium text-foreground">
            Per-trace breakdown
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-label text-meta-foreground">Group by:</span>
            <Select
              value={groupBy}
              onValueChange={(v) => setGroupBy(v as GroupKey)}
            >
              <SelectTrigger size="sm" aria-label="Group by">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">None</SelectItem>
                <SelectItem value="Model">Model</SelectItem>
                <SelectItem value="Status">Status</SelectItem>
                <SelectItem value="Task">Task</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Pattern A: bordered card wraps the table. The inner scroll container
            owns overflow so <thead sticky top-0> stays visible while body
            scrolls. Pagination row sits outside this wrapper, below. */}
        <div className="flex flex-1 min-h-0 flex-col overflow-hidden rounded-md border border-border bg-card">
          <div className="flex-1 min-h-0 overflow-x-auto overflow-y-auto">
            <table className="w-full border-collapse bg-card">
              <thead className={cn("sticky top-0 z-sticky", tableHeaderClass)}>
                <tr>
                  <TraceTh>Trace</TraceTh>
                  {showTaskColumn && <TraceTh>Task</TraceTh>}
                  {showModelColumn && <TraceTh>Model</TraceTh>}
                  <TraceTh>Status</TraceTh>
                  <TraceTh align="right">Turns / Tokens</TraceTh>
                  <TraceTh align="right">Inference</TraceTh>
                  <TraceTh align="right">Environment</TraceTh>
                  <TraceTh align="right">Total</TraceTh>
                </tr>
              </thead>
              <tbody className="[&>tr:last-child>td]:border-b-0">
                {groups.map((group) => {
                  const isCollapsed = collapsedGroups.has(group.key);
                  const isUngrouped = group.key === "__ungrouped__";
                  const groupWasteSum = group.rows.reduce(
                    (acc, r) =>
                      wasteInfo.flagged.has(r.traceId) ? acc + r.total : acc,
                    0,
                  );
                  return (
                    <GroupRows
                      key={group.key}
                      group={group}
                      collapsed={isCollapsed}
                      showHeaderRow={!isUngrouped}
                      showTaskColumn={showTaskColumn}
                      showModelColumn={showModelColumn}
                      colCount={colCount}
                      wasteInfo={wasteInfo}
                      groupWasteSum={groupWasteSum}
                      onToggle={() => toggleGroup(group.key)}
                    />
                  );
                })}
                {pageRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={colCount}
                      className="py-6 text-center text-meta-foreground"
                    >
                      No traces on this page.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <PaginationRow
          firstRowIndex={pageStart + 1}
          lastRowIndex={pageStart + pageRows.length}
          totalRows={sortedTraces.length}
          currentPage={safePage}
          totalPages={pageCount}
          onPrev={() => setPage(safePage - 1)}
          onNext={() => setPage(safePage + 1)}
        />
      </section>
    </div>
  );
}

// ── Summary stat strip ────────────────────────────────────────────────────
//
// Uniform stacked anatomy: every stat is LABEL / value. Lead (Estimated Total)
// reads heavier; peers share weight. No separators between blocks. See:
//   docs/design/screens/job-detail-usage.wireframe.md §D9

const STAT_LABEL_CLASS =
  "text-meta font-normal uppercase tracking-wider text-meta-foreground";

function StatStrip({ usage }: { usage: JobUsage }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-6">
      <div className="flex flex-col gap-0.5">
        <span className={STAT_LABEL_CLASS}>Estimated Total</span>
        <span className="font-mono font-bold text-display text-foreground">
          {formatDollar(usage.total)}
        </span>
      </div>

      <div className="flex flex-col gap-0.5">
        <span className={STAT_LABEL_CLASS}>Inference</span>
        <span className="font-mono font-medium text-sm text-foreground">
          {formatDollar(usage.inference)}
        </span>
      </div>

      <div className="flex flex-col gap-0.5">
        <span className={STAT_LABEL_CLASS}>Environment</span>
        <span className="font-mono font-medium text-sm text-foreground">
          {formatDollar(usage.environment)}
        </span>
      </div>

      <div className="flex flex-col gap-0.5">
        <span className={STAT_LABEL_CLASS}>Avg/Trace</span>
        <span className="flex items-baseline gap-1.5">
          <span className="font-mono font-medium text-sm text-foreground">
            {formatDollar(usage.avgPerTrace)}
          </span>
          <span className="text-sm text-meta-foreground">
            ({usage.tracesCount} traces)
          </span>
        </span>
      </div>
    </div>
  );
}

// ── Pagination row ────────────────────────────────────────────────────────

function PaginationRow({
  firstRowIndex,
  lastRowIndex,
  totalRows,
  currentPage,
  totalPages,
  onPrev,
  onNext,
}: {
  firstRowIndex: number;
  lastRowIndex: number;
  totalRows: number;
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-meta text-meta-foreground tabular-nums">
        Showing {firstRowIndex}–{lastRowIndex} of {totalRows}
      </span>
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          type="button"
          aria-label="Previous page"
          disabled={currentPage <= 1}
          onClick={onPrev}
        >
          <ArrowLeft aria-hidden="true" />
          Prev
        </Button>
        <span className="text-meta text-meta-foreground tabular-nums">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="ghost"
          type="button"
          aria-label="Next page"
          disabled={currentPage >= totalPages}
          onClick={onNext}
        >
          Next
          <ArrowRight aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

// ── Per-trace table ───────────────────────────────────────────────────────

function GroupRows({
  group,
  collapsed,
  showHeaderRow,
  showTaskColumn,
  showModelColumn,
  colCount,
  wasteInfo,
  groupWasteSum,
  onToggle,
}: {
  group: UsageGroup;
  collapsed: boolean;
  showHeaderRow: boolean;
  showTaskColumn: boolean;
  showModelColumn: boolean;
  colCount: number;
  wasteInfo: WasteInfo;
  groupWasteSum: number;
  onToggle: () => void;
}) {
  return (
    <>
      {showHeaderRow && (
        <tr className="bg-muted-surface/40">
          <td
            colSpan={colCount}
            className="border-b border-border py-2 pl-4 pr-4"
          >
            <button
              type="button"
              onClick={onToggle}
              className="flex w-full items-center gap-2"
              aria-expanded={!collapsed}
            >
              <ChevronDown
                aria-hidden="true"
                className={cn(
                  "size-3.5 text-meta-foreground transition-transform",
                  collapsed && "-rotate-90",
                )}
              />
              <span className="font-mono text-label font-semibold text-foreground">
                {group.label}
              </span>
              {group.sublabel && (
                <span className="min-w-0 flex-1 truncate text-label text-muted-foreground">
                  {group.sublabel}
                </span>
              )}
              <span
                className={cn(
                  "text-meta text-meta-foreground",
                  !group.sublabel && "ml-auto",
                )}
              >
                {group.rows.length}{" "}
                {group.rows.length === 1 ? "trace" : "traces"}
                {" · avg "}
                {formatDollar(group.avgPerTrace)}
                {group.successfulCount + group.erroredCount > 0 && (
                  <>
                    {" · "}
                    <span className="text-state-scored-text">
                      {group.successfulCount}✓
                    </span>
                    {" / "}
                    <span className="text-state-errored-text">
                      {group.erroredCount}✕
                    </span>
                  </>
                )}
                {groupWasteSum > 0 && (
                  <>
                    {" · "}
                    <span className="text-state-warning-text">
                      {formatDollar(groupWasteSum)} waste
                    </span>
                  </>
                )}
              </span>
              <span className="font-mono text-label font-semibold text-foreground">
                {formatDollar(group.total)}
              </span>
            </button>
          </td>
        </tr>
      )}
      {!collapsed &&
        group.rows.map((row) => (
          <TraceRow
            key={row.traceId}
            row={row}
            showTaskColumn={showTaskColumn}
            showModelColumn={showModelColumn}
            isWaste={wasteInfo.flagged.has(row.traceId)}
            wasteMultiplier={wasteInfo.multipliers.get(row.traceId)}
          />
        ))}
    </>
  );
}

function TraceTh({
  children,
  align,
}: {
  children: React.ReactNode;
  align?: "right";
}) {
  return (
    <th
      className={cn(
        // DS `tableHeadVariants` would force uppercase + wide tracking; this
        // table reads as small-cap data — override at the call site per spec.
        "py-2 text-left font-medium text-muted-foreground text-label",
        "normal-case tracking-normal whitespace-nowrap",
        "border-b border-border",
        // Right-aligned numeric columns get +8px horizontal padding so adjacent
        // right-aligned cells (Inference / Environment / Total) read with
        // visible breathing room — 12px between cells is cramped at glyph edge.
        align === "right" ? "px-5 text-right" : "px-3",
        // Edge-cell breathing room: first/last cell get +4px so right-aligned
        // numerics never sit flush against the card border. Per
        // docs/conventions/table.md → "First and last column edge padding".
        "first:pl-4 last:pr-4",
      )}
    >
      {children}
    </th>
  );
}

function TraceRow({
  row,
  showTaskColumn,
  showModelColumn,
  isWaste,
  wasteMultiplier,
}: {
  row: JobUsageTrace;
  showTaskColumn: boolean;
  showModelColumn: boolean;
  isWaste: boolean;
  wasteMultiplier: number | undefined;
}) {
  // `group` class on <tr> lets the hover affordance (ArrowUpRight) fade in
  // when the row — not just the link — is hovered. No instructional copy: the
  // icon alone signals "row navigates into the trace".
  return (
    <tr className="group transition-colors hover:bg-hover-surface">
      <td className="py-2 pl-4 pr-3 border-b border-border">
        <Link
          href={`/traces/${row.traceId}`}
          className="flex items-center gap-2 font-mono text-xs text-meta-foreground group-hover:text-primary group-hover:underline group-focus-within:text-primary group-focus-within:underline"
        >
          <span>{truncateTraceId(row.traceId)}</span>
          <ArrowUpRight
            aria-hidden="true"
            className="size-3.5 shrink-0 text-primary opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
          />
        </Link>
      </td>
      {showTaskColumn && (
        <td className="py-2 px-3 border-b border-border font-mono text-label text-meta-foreground">
          {row.taskId}
        </td>
      )}
      {showModelColumn && (
        <td className="py-2 px-3 border-b border-border font-mono text-body text-foreground">
          {row.modelId}
        </td>
      )}
      <td className="py-2 px-3 border-b border-border">
        <StatusPill status={row.status} />
      </td>
      <td className="py-2 px-5 text-right border-b border-border font-mono text-label">
        <span className="inline-flex items-center justify-end gap-1.5">
          {isWaste && (
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertTriangle
                  aria-label={`Waste warning — ran ${row.turns} turns before failing`}
                  className="size-3.5 shrink-0 text-state-warning-text"
                />
              </TooltipTrigger>
              <TooltipContent>
                Ran {row.turns} turns —{" "}
                {(wasteMultiplier ?? 0).toFixed(1)}× typical inference cost
                before failing
              </TooltipContent>
            </Tooltip>
          )}
          <span>
            {row.turns} ({formatTokenCount(row.totalTokens)})
          </span>
        </span>
      </td>
      <td className="py-2 px-5 text-right border-b border-border font-mono text-label">
        {formatDollar(row.inferenceCost)}
      </td>
      <td className="py-2 px-5 text-right border-b border-border font-mono text-label">
        {formatDollar(row.environmentCost)}
        <span className="mt-0.5 block font-mono text-meta text-meta-foreground">
          {row.environmentLabel}
        </span>
      </td>
      <td className="py-2 pl-5 pr-4 text-right border-b border-border font-mono text-label">
        {formatDollar(row.total)}
      </td>
    </tr>
  );
}

function StatusPill({ status }: { status: JobUsageTrace["status"] }) {
  const isErrored = status === "Errored";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-xs font-medium",
        isErrored
          ? "bg-state-errored-subtle text-state-errored-text"
          : "bg-state-scored-subtle text-state-scored-text",
      )}
    >
      <span
        aria-hidden="true"
        className="size-1.5 shrink-0 rounded-full bg-current"
      />
      {isErrored ? "Error" : "Scored"}
    </span>
  );
}

// ── Grouping ──────────────────────────────────────────────────────────────

interface UsageGroup {
  key: string;
  label: string;
  /** Right-of-label single-line text — used by Task groups to carry the prompt. */
  sublabel?: string;
  rows: ReadonlyArray<JobUsageTrace>;
  total: number;
  avgPerTrace: number;
  successfulCount: number;
  erroredCount: number;
}

function summarize(
  rows: ReadonlyArray<JobUsageTrace>,
): Pick<UsageGroup, "total" | "avgPerTrace" | "successfulCount" | "erroredCount"> {
  const total = rows.reduce((acc, t) => acc + t.total, 0);
  const avgPerTrace = rows.length > 0 ? total / rows.length : 0;
  let successfulCount = 0;
  let erroredCount = 0;
  for (const r of rows) {
    if (r.status === "Errored") erroredCount += 1;
    else successfulCount += 1;
  }
  return { total, avgPerTrace, successfulCount, erroredCount };
}

function buildGroups(
  traces: ReadonlyArray<JobUsageTrace>,
  groupBy: GroupKey,
): ReadonlyArray<UsageGroup> {
  if (groupBy === "None") {
    return [
      {
        key: "__ungrouped__",
        label: "",
        rows: traces,
        ...summarize(traces),
      },
    ];
  }

  const keyOf = (t: JobUsageTrace): string => {
    if (groupBy === "Model") return t.modelId;
    if (groupBy === "Status") return t.status;
    return t.taskId;
  };

  const groups = new Map<string, JobUsageTrace[]>();
  for (const t of traces) {
    const k = keyOf(t);
    const arr = groups.get(k);
    if (arr) arr.push(t);
    else groups.set(k, [t]);
  }

  return Array.from(groups.entries())
    .map(([key, rows]) => ({
      key,
      label: key,
      rows,
      ...summarize(rows),
    }))
    .sort((a, b) => b.total - a.total);
}

// ── Waste flag (dataset-wide) ─────────────────────────────────────────────

interface WasteInfo {
  flagged: ReadonlySet<string>;
  multipliers: ReadonlyMap<string, number>;
}

function buildWasteInfo(
  traces: ReadonlyArray<JobUsageTrace>,
): WasteInfo {
  const scoredInf = traces
    .filter((t) => t.status === "Scored")
    .map((t) => t.inferenceCost)
    .sort((a, b) => a - b);
  const flagged = new Set<string>();
  const multipliers = new Map<string, number>();
  if (scoredInf.length === 0) {
    return { flagged, multipliers };
  }
  const mid = Math.floor(scoredInf.length / 2);
  const median =
    scoredInf.length % 2 === 0
      ? (scoredInf[mid - 1]! + scoredInf[mid]!) / 2
      : scoredInf[mid]!;
  if (median <= 0) {
    return { flagged, multipliers };
  }
  for (const t of traces) {
    if (t.status === "Errored" && t.inferenceCost >= 2 * median) {
      flagged.add(t.traceId);
      multipliers.set(t.traceId, t.inferenceCost / median);
    }
  }
  return { flagged, multipliers };
}

// ── Formatters ────────────────────────────────────────────────────────────

function formatDollar(n: number): string {
  return `$${n.toFixed(2)}`;
}

function truncateTraceId(id: string): string {
  return `${id.slice(0, 6)}…`;
}

function formatTokenCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}
