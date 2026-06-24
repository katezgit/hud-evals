"use client";

// Task-tree table for the Job detail Traces tab.
//
// Single-model (models.length < 2): parent rows = tasks, children = traces.
//   One-level expansion (existing shape). Reward column = single avg.
//
// Multi-model + Group by Task: parent rows = tasks, level-2 = per-model sub-row,
//   level-3 = traces. Reward column on the collapsed task parent renders a
//   per-model reward strip (color-banded at consumer call site).
//
// Multi-model + Group by Model: top-level rows = model section headers,
//   level-2 = task rows under that model (current parent shape, single-model
//   lens), level-3 = traces.
//
// Why a tree: at N tasks × M attempts the flat layout repeats the task prompt
// once per child, burying the task-level signal. The tree matches the user's
// mental model (they remember task prompts, not trace hashes) and matches the
// production HUD grouping convention. The multi-model lens adds "which model
// won this task?" as the first question Alex needs answered.
//
// Column order: [cb] · Task / Trace · Reward · Attempts · Turns · Duration · Cost · (actions)
// Reward color bands are app-level (eval product business rule), not DS primitives.

import * as React from "react";
import { ArrowUpRight, ChevronDown, ChevronRight, X } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@repo/ui/components/checkbox";
import { IconButton } from "@repo/ui/components/icon-button";
import { cn } from "@repo/ui/lib/cn";
import type { JobModelSummary, JobRun, JobTask } from "@/lib/mock/job-detail";

export type GroupByMode = "task" | "model";

interface JobRunTableProps {
  jobId: string;
  rows: ReadonlyArray<TraceRow>;
  /** Winner-first sorted summaries. Pass `[]` when caller has no notion of models (Overview drilldown). */
  models?: ReadonlyArray<JobModelSummary>;
  /** Active group-by mode. Ignored when `models.length < 2`. */
  groupBy?: GroupByMode;
  selectedRunIds: ReadonlySet<string>;
  onToggleSelect: (runId: string) => void;
  onToggleSelectAll: (rows: ReadonlyArray<TraceRow>) => void;
}

export interface TraceRow {
  run: JobRun;
  task: JobTask;
}

// ── Reward color bands (APP-LEVEL — eval product business rule). ─────────────
// Threshold + tier mapping are NOT a DS primitive — keep them next to the
// consumer so changes don't cascade across surfaces.
export function rewardBandClass(reward: number): string {
  if (reward >= 0.7) return "text-state-scored-text";
  if (reward >= 0.4) return "text-state-warning-text";
  return "text-state-errored-text";
}

interface TaskGroup {
  task: JobTask;
  traces: ReadonlyArray<TraceRow>;
}

function groupRowsByTask(rows: ReadonlyArray<TraceRow>): ReadonlyArray<TaskGroup> {
  const order: string[] = [];
  const map = new Map<string, TaskGroup>();
  for (const row of rows) {
    const existing = map.get(row.task.id);
    if (existing) {
      (existing.traces as TraceRow[]).push(row);
    } else {
      order.push(row.task.id);
      map.set(row.task.id, { task: row.task, traces: [row] });
    }
  }
  return order.map((id) => map.get(id)!);
}

export function JobRunTable({
  jobId,
  rows,
  models = [],
  groupBy = "task",
  selectedRunIds,
  onToggleSelect,
  onToggleSelectAll,
}: JobRunTableProps) {
  const isMultiModel = models.length >= 2;

  const allSelected =
    rows.length > 0 && rows.every((r) => selectedRunIds.has(r.run.id));
  const someSelected =
    !allSelected && rows.some((r) => selectedRunIds.has(r.run.id));
  let headerChecked: boolean | "indeterminate" = false;
  if (allSelected) headerChecked = true;
  else if (someSelected) headerChecked = "indeterminate";

  // Column widths: multi-model reward column needs ~220px to fit per-model strip.
  const isStripMode = isMultiModel && groupBy === "task";

  return (
    // Content-height card matching the Job-detail Tool Usage reference: the
    // bordered chrome ends with the last row and the page (<main>) handles
    // overflow when the row count exceeds the viewport. No max-h, no inner
    // vertical scroll, no blank space below.
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full border-collapse table-fixed">
        <colgroup>
          <col className="w-9" />
          <col />
          <col className={isStripMode ? "w-56" : "w-32"} />
          <col className="w-32" />
          <col className="w-20" />
          <col className="w-28" />
          <col className="w-24" />
          <col className="w-44" />
        </colgroup>
        <thead className="bg-field-rest">
            <tr className="border-b border-border">
              <th className="px-3 py-2 align-middle">
                <div className="flex items-center">
                  <Checkbox
                    size="sm"
                    checked={headerChecked}
                    onCheckedChange={() => onToggleSelectAll(rows)}
                    aria-label="Select all traces"
                  />
                </div>
              </th>
              <th className="px-3 py-2 align-middle text-left text-label font-medium text-meta-foreground">
                {isMultiModel && groupBy === "model" ? "Model / Task / Trace" : "Task / Trace"}
              </th>
              <th className="px-3 py-2 align-middle text-right text-label font-medium text-meta-foreground">
                Reward
              </th>
              <th className="px-3 py-2 align-middle text-right text-label font-medium text-meta-foreground">
                {isMultiModel && groupBy === "model" ? "Traces" : "Attempts"}
              </th>
              <th className="px-3 py-2 align-middle text-right text-label font-medium text-meta-foreground">
                Turns
              </th>
              <th className="px-3 py-2 align-middle text-right text-label font-medium text-meta-foreground">
                Duration
              </th>
              <th className="px-3 py-2 align-middle text-right text-label font-medium text-meta-foreground">
                Cost
              </th>
              <th className="px-3 py-2 align-middle">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-3 py-8 text-center text-body text-muted-foreground"
                >
                  No traces match.
                </td>
              </tr>
            )}
            {rows.length > 0 && isMultiModel && groupBy === "model" && (
              <ModelGroupedBody
                jobId={jobId}
                rows={rows}
                models={models}
                selectedRunIds={selectedRunIds}
                onToggleSelect={onToggleSelect}
                onToggleSelectAll={onToggleSelectAll}
              />
            )}
          {rows.length > 0 && !(isMultiModel && groupBy === "model") && (
            <TaskGroupedBody
              jobId={jobId}
              rows={rows}
              models={models}
              isMultiModel={isMultiModel}
              selectedRunIds={selectedRunIds}
              onToggleSelect={onToggleSelect}
              onToggleSelectAll={onToggleSelectAll}
            />
          )}
        </tbody>
      </table>
    </div>
  );
}

// ── Aggregate helpers ────────────────────────────────────────────────────────
// Avg reward: mean over scored attempts only (excludes error + no-score) — the
// reward distribution number Alex actually cares about for a task.
// Avg turns / duration: mean over attempts that have a value (everything except
// no-score).
// Cost: sum across ALL attempts including errors — money spent is total.

interface TaskAggregates {
  avgReward: number | null;
  completedCount: number;
  totalCount: number;
  errorCount: number;
  avgTurns: number | null;
  avgDurationSec: number | null;
  totalCost: number;
}

function parseDurationSec(label: string): number | null {
  const match = label.match(/^(\d+)m\s+(\d+)s$/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function formatDurationLabel(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec - m * 60);
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

function computeAggregates(traces: ReadonlyArray<TraceRow>): TaskAggregates {
  const scoredRewards: number[] = [];
  const turnsValues: number[] = [];
  const durationValues: number[] = [];
  let totalCost = 0;
  let completedCount = 0;
  let errorCount = 0;

  for (const { run } of traces) {
    if (run.state !== "no-score") {
      completedCount += 1;
      const dur = parseDurationSec(run.durationLabel);
      if (dur !== null) durationValues.push(dur);
      turnsValues.push(run.turns);
    }
    if (run.state === "error") errorCount += 1;
    if (run.state === "scored" && run.reward !== null) {
      scoredRewards.push(Number(run.reward));
    }
    const cost = Number(run.costLabel);
    if (!Number.isNaN(cost)) totalCost += cost;
  }

  const mean = (xs: ReadonlyArray<number>) =>
    xs.length === 0 ? null : xs.reduce((a, b) => a + b, 0) / xs.length;

  return {
    avgReward: mean(scoredRewards),
    completedCount,
    totalCount: traces.length,
    errorCount,
    avgTurns: mean(turnsValues),
    avgDurationSec: mean(durationValues),
    totalCost,
  };
}

// ── Task-grouped body (single-model OR multi-model Group by Task) ────────────

interface TaskGroupedBodyProps {
  jobId: string;
  rows: ReadonlyArray<TraceRow>;
  models: ReadonlyArray<JobModelSummary>;
  isMultiModel: boolean;
  selectedRunIds: ReadonlySet<string>;
  onToggleSelect: (runId: string) => void;
  onToggleSelectAll: (rows: ReadonlyArray<TraceRow>) => void;
}

function TaskGroupedBody({
  jobId,
  rows,
  models,
  isMultiModel,
  selectedRunIds,
  onToggleSelect,
  onToggleSelectAll,
}: TaskGroupedBodyProps) {
  const groups = React.useMemo(() => groupRowsByTask(rows), [rows]);

  // Default expansion: first 2 task ids seen at mount, so the tree structure
  // is visible immediately for the demo. After mount, expansion is fully
  // user-controlled — filter changes don't clobber it.
  const [expandedTasks, setExpandedTasks] = React.useState<ReadonlySet<string>>(() => {
    return new Set(groups.slice(0, 2).map((g) => g.task.id));
  });
  // Multi-model: which `taskId::modelId` pairs are expanded at level 2.
  // Default: open the winner model on each task that's open at level 1.
  const [expandedTaskModels, setExpandedTaskModels] = React.useState<ReadonlySet<string>>(() => {
    if (!isMultiModel || models.length === 0) return new Set();
    const winner = models[0]!.modelId;
    return new Set(groups.slice(0, 2).map((g) => `${g.task.id}::${winner}`));
  });

  const toggleExpandTask = (taskId: string) => {
    setExpandedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };
  const toggleExpandTaskModel = (key: string) => {
    setExpandedTaskModels((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <>
      {groups.map((group) => {
        const isExpanded = expandedTasks.has(group.task.id);
        const childRows = group.traces;
        const childSelectedCount = childRows.reduce(
          (acc, r) => acc + (selectedRunIds.has(r.run.id) ? 1 : 0),
          0,
        );
        let parentChecked: boolean | "indeterminate" = false;
        if (childSelectedCount === childRows.length) parentChecked = true;
        else if (childSelectedCount > 0) parentChecked = "indeterminate";

        return (
          <React.Fragment key={group.task.id}>
            <TaskParentRow
              group={group}
              models={models}
              isMultiModel={isMultiModel}
              expanded={isExpanded}
              onToggleExpand={() => toggleExpandTask(group.task.id)}
              parentChecked={parentChecked}
              onToggleSelectGroup={() => onToggleSelectAll(childRows)}
            />
            {isExpanded && !isMultiModel &&
              childRows.map((row) => (
                <TraceChildRow
                  key={row.run.id}
                  jobId={jobId}
                  row={row}
                  indent="single"
                  selected={selectedRunIds.has(row.run.id)}
                  onToggleSelect={() => onToggleSelect(row.run.id)}
                />
              ))}
            {isExpanded && isMultiModel &&
              models.map((m) => {
                // Per-model sub-rows are gated to models that actually have at least
                // one trace under this task. The strip already shows "—" for models
                // with no scored trace, so the sub-row would just be empty noise.
                const tracesForModel = childRows.filter((r) => r.run.modelId === m.modelId);
                if (tracesForModel.length === 0) return null;
                const key = `${group.task.id}::${m.modelId}`;
                const subExpanded = expandedTaskModels.has(key);
                const selCount = tracesForModel.reduce(
                  (acc, r) => acc + (selectedRunIds.has(r.run.id) ? 1 : 0),
                  0,
                );
                let subChecked: boolean | "indeterminate" = false;
                if (selCount === tracesForModel.length) subChecked = true;
                else if (selCount > 0) subChecked = "indeterminate";
                return (
                  <React.Fragment key={key}>
                    <PerModelSubRow
                      modelId={m.modelId}
                      traces={tracesForModel}
                      expanded={subExpanded}
                      onToggleExpand={() => toggleExpandTaskModel(key)}
                      checked={subChecked}
                      onToggleSelect={() => onToggleSelectAll(tracesForModel)}
                    />
                    {subExpanded &&
                      tracesForModel.map((row) => (
                        <TraceChildRow
                          key={row.run.id}
                          jobId={jobId}
                          row={row}
                          indent="double"
                          selected={selectedRunIds.has(row.run.id)}
                          onToggleSelect={() => onToggleSelect(row.run.id)}
                        />
                      ))}
                  </React.Fragment>
                );
              })}
          </React.Fragment>
        );
      })}
    </>
  );
}

// ── Parent task row ──────────────────────────────────────────────────────────

interface TaskParentRowProps {
  group: TaskGroup;
  models: ReadonlyArray<JobModelSummary>;
  isMultiModel: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  parentChecked: boolean | "indeterminate";
  onToggleSelectGroup: () => void;
}

function TaskParentRow({
  group,
  models,
  isMultiModel,
  expanded,
  onToggleExpand,
  parentChecked,
  onToggleSelectGroup,
}: TaskParentRowProps) {
  const { task, traces } = group;
  const agg = React.useMemo(() => computeAggregates(traces), [traces]);
  const rewardCls =
    agg.avgReward !== null ? rewardBandClass(agg.avgReward) : "text-meta-foreground";

  return (
    <tr
      onClick={onToggleExpand}
      aria-expanded={expanded}
      className={cn(
        "cursor-pointer border-b border-border transition-colors",
        expanded ? "bg-selected-surface" : "bg-card hover:bg-hover-surface",
        "last:border-b-0",
      )}
    >
      <td className="px-3 py-2.5 align-middle" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center">
          <Checkbox
            size="sm"
            checked={parentChecked}
            onCheckedChange={onToggleSelectGroup}
            aria-label={`Select all traces of task ${task.id}`}
          />
        </div>
      </td>
      <td className="min-w-0 px-3 py-2.5 align-middle">
        <div className="flex min-w-0 items-center gap-2">
          {expanded ? (
            <ChevronDown
              aria-hidden="true"
              className="size-3.5 shrink-0 text-meta-foreground"
            />
          ) : (
            <ChevronRight
              aria-hidden="true"
              className="size-3.5 shrink-0 text-meta-foreground"
            />
          )}
          <span className="shrink-0 font-mono text-code text-meta-foreground">
            {task.id}
          </span>
          <span className="shrink-0 font-mono text-label text-meta-foreground">
            {traces.length} traces
          </span>
          <span className="min-w-0 flex-1 truncate text-body font-semibold text-foreground">
            {task.promptLabel ?? task.scenarioLabel ?? "—"}
          </span>
        </div>
      </td>
      <td className="px-3 py-2.5 text-right align-middle">
        {isMultiModel ? (
          <PerModelRewardStrip traces={traces} models={models} />
        ) : agg.avgReward !== null ? (
          <span
            className={cn(
              "font-mono text-code font-semibold tabular-nums",
              rewardCls,
            )}
          >
            {agg.avgReward.toFixed(4)}
            <MetricSuffix>avg</MetricSuffix>
          </span>
        ) : (
          <span className="font-mono text-code tabular-nums text-meta-foreground">
            —
          </span>
        )}
      </td>
      <td className="whitespace-nowrap px-3 py-2.5 text-right align-middle font-mono text-code tabular-nums text-muted-foreground">
        {agg.completedCount} / {agg.totalCount}
        {agg.errorCount > 0 && (
          <span className="ml-1 text-state-errored-text">
            ({agg.errorCount} err)
          </span>
        )}
      </td>
      <td className="px-3 py-2.5 text-right align-middle font-mono text-code tabular-nums text-foreground">
        {agg.avgTurns !== null ? (
          <>
            {agg.avgTurns.toFixed(1)}
            <MetricSuffix>avg</MetricSuffix>
          </>
        ) : (
          "—"
        )}
      </td>
      <td className="px-3 py-2.5 text-right align-middle font-mono text-code tabular-nums text-muted-foreground">
        {agg.avgDurationSec !== null ? (
          <>
            {formatDurationLabel(agg.avgDurationSec)}
            <MetricSuffix>avg</MetricSuffix>
          </>
        ) : (
          "—"
        )}
      </td>
      <td className="px-3 py-2.5 text-right align-middle font-mono text-code tabular-nums text-foreground">
        ${agg.totalCost.toFixed(4)}
        <MetricSuffix>total</MetricSuffix>
      </td>
      <td className="px-3 py-2.5 align-middle" />
    </tr>
  );
}

// ── Per-model reward strip ───────────────────────────────────────────────────
// Multi-model collapsed parent row Reward cell. APP-LEVEL color mapping at the
// call site — strips sit on the consumer's product business rule.
// Sort order matches the header chip cluster (winner first by `models`).

function PerModelRewardStrip({
  traces,
  models,
}: {
  traces: ReadonlyArray<TraceRow>;
  models: ReadonlyArray<JobModelSummary>;
}) {
  // Compact label: drop the version suffix for narrow strip readability.
  // gpt-4o → gpt-4o · qwen2.5-14b → qwen · llama-3.1-8b → llama
  const stripModelLabel = (id: string) => {
    if (id.startsWith("qwen")) return "qwen";
    if (id.startsWith("llama")) return "llama";
    return id;
  };

  return (
    <div className="flex flex-wrap items-baseline justify-end font-mono text-label">
      {models.map((m, idx) => {
        const scored = traces.filter(
          (r) => r.run.modelId === m.modelId && r.run.state === "scored" && r.run.reward !== null,
        );
        const avg =
          scored.length === 0
            ? null
            : scored.reduce((a, r) => a + Number(r.run.reward), 0) / scored.length;
        const rewardCls = avg !== null ? rewardBandClass(avg) : "text-meta-foreground";
        return (
          <React.Fragment key={m.modelId}>
            {idx > 0 && <span className="mx-1.5 text-meta-foreground">·</span>}
            <span className="inline-flex items-baseline gap-1">
              <span className="font-normal text-meta-foreground">{stripModelLabel(m.modelId)}</span>
              <span className={cn("font-semibold tabular-nums", rewardCls)}>
                {avg !== null ? avg.toFixed(2) : "—"}
              </span>
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Per-model sub-row (multi-model, level 2 under task parent) ───────────────

interface PerModelSubRowProps {
  modelId: string;
  traces: ReadonlyArray<TraceRow>;
  expanded: boolean;
  onToggleExpand: () => void;
  checked: boolean | "indeterminate";
  onToggleSelect: () => void;
}

function PerModelSubRow({
  modelId,
  traces,
  expanded,
  onToggleExpand,
  checked,
  onToggleSelect,
}: PerModelSubRowProps) {
  const agg = React.useMemo(() => computeAggregates(traces), [traces]);
  const rewardCls =
    agg.avgReward !== null ? rewardBandClass(agg.avgReward) : "text-meta-foreground";

  return (
    <tr
      onClick={onToggleExpand}
      aria-expanded={expanded}
      className={cn(
        "cursor-pointer border-b border-border transition-colors",
        expanded ? "bg-selected-surface" : "bg-elevated-surface hover:bg-hover-surface",
        "last:border-b-0",
      )}
    >
      <td className="px-3 py-1.5 align-middle" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center">
          <Checkbox
            size="sm"
            checked={checked}
            onCheckedChange={onToggleSelect}
            aria-label={`Select all ${modelId} traces`}
          />
        </div>
      </td>
      <td className="min-w-0 px-3 py-1.5 align-middle">
        <div className="flex min-w-0 items-center gap-2 pl-6">
          {expanded ? (
            <ChevronDown
              aria-hidden="true"
              className="size-3 shrink-0 text-meta-foreground"
            />
          ) : (
            <ChevronRight
              aria-hidden="true"
              className="size-3 shrink-0 text-meta-foreground"
            />
          )}
          <span className="font-mono text-label font-medium text-muted-foreground">
            {modelId}
          </span>
        </div>
      </td>
      <td className="px-3 py-1.5 text-right align-middle">
        {agg.avgReward !== null ? (
          <span className={cn("font-mono text-label font-semibold tabular-nums", rewardCls)}>
            {agg.avgReward.toFixed(4)}
            <MetricSuffix>avg</MetricSuffix>
          </span>
        ) : (
          <span className="font-mono text-label tabular-nums text-meta-foreground">—</span>
        )}
      </td>
      <td className="px-3 py-1.5 text-right align-middle font-mono text-label tabular-nums text-muted-foreground">
        {agg.completedCount} / {agg.totalCount}
      </td>
      <td className="px-3 py-1.5 text-right align-middle font-mono text-label tabular-nums text-foreground">
        {agg.avgTurns !== null ? (
          <>
            {agg.avgTurns.toFixed(1)}
            <MetricSuffix>avg</MetricSuffix>
          </>
        ) : (
          "—"
        )}
      </td>
      <td className="px-3 py-1.5 text-right align-middle font-mono text-label tabular-nums text-muted-foreground">
        {agg.avgDurationSec !== null ? (
          <>
            {formatDurationLabel(agg.avgDurationSec)}
            <MetricSuffix>avg</MetricSuffix>
          </>
        ) : (
          "—"
        )}
      </td>
      <td className="px-3 py-1.5 text-right align-middle font-mono text-label tabular-nums text-foreground">
        ${agg.totalCost.toFixed(4)}
        <MetricSuffix>total</MetricSuffix>
      </td>
      <td className="px-3 py-1.5 align-middle" />
    </tr>
  );
}

function MetricSuffix({ children }: { children: React.ReactNode }) {
  return (
    <span className="ml-1 font-sans text-label font-normal normal-case tracking-normal text-meta-foreground">
      {children}
    </span>
  );
}

// ── Child trace row ──────────────────────────────────────────────────────────

interface TraceChildRowProps {
  jobId: string;
  row: TraceRow;
  /** "single" = one level under task (single-model). "double" = under per-model sub-row. */
  indent: "single" | "double";
  selected: boolean;
  onToggleSelect: () => void;
}

function TraceChildRow({
  jobId,
  row,
  indent,
  selected,
  onToggleSelect,
}: TraceChildRowProps) {
  const { run } = row;
  const isNoScore = run.state === "no-score";
  const attemptIndex = parseAttemptIndex(run.id);
  const traceLabel = truncateTraceId(run.traceId);

  const openTrace = () => {
    // TODO: confirm route — `/jobs/[id]/traces/[traceId]` doesn't exist yet.
    toast(`→ Trace ${jobId}/${run.traceId}`);
  };

  return (
    <tr
      className={cn(
        "group border-b border-border bg-background transition-colors hover:bg-hover-surface",
        "last:border-b-0",
        selected && "bg-primary-soft hover:bg-primary-soft",
      )}
    >
      <td className="px-3 py-1.5 align-middle" />
      <td className="min-w-0 px-3 py-1.5 align-middle">
        <div
          className={cn(
            "flex min-w-0 items-center gap-2",
            indent === "double" && "pl-5",
          )}
        >
          <Checkbox
            size="sm"
            checked={selected}
            onCheckedChange={onToggleSelect}
            aria-label={`Select trace ${run.traceId}`}
          />
          <button
            type="button"
            onClick={openTrace}
            className={cn(
              "-mx-1 flex min-w-0 items-center gap-2 rounded-sm px-1 py-0.5 text-left",
              "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
            )}
            aria-label={`Open trace ${run.traceId}`}
          >
            <span
              className={cn(
                "font-mono text-code text-meta-foreground",
                "group-hover:text-primary group-hover:underline",
                "group-focus-within:text-primary group-focus-within:underline",
              )}
            >
              {traceLabel}
            </span>
            {attemptIndex !== null && (
              <span className="font-mono text-meta text-meta-foreground">
                attempt {attemptIndex}
              </span>
            )}
            <ArrowUpRight
              aria-hidden="true"
              className="size-3.5 shrink-0 text-primary opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
            />
          </button>
        </div>
      </td>
      <td className="px-3 py-1.5 text-right align-middle">
        <TraceRewardCell run={run} />
      </td>
      <td className="px-3 py-1.5 text-right align-middle font-mono text-code tabular-nums text-meta-foreground">
        —
      </td>
      <td
        className={cn(
          "px-3 py-1.5 text-right align-middle font-mono text-code tabular-nums",
          isNoScore ? "text-meta-foreground" : "text-foreground",
        )}
      >
        {isNoScore ? "0" : run.turns}
      </td>
      <td
        className={cn(
          "px-3 py-1.5 text-right align-middle font-mono text-code tabular-nums",
          isNoScore ? "text-meta-foreground" : "text-muted-foreground",
        )}
      >
        {isNoScore ? "—" : run.durationLabel}
      </td>
      <td
        className={cn(
          "px-3 py-1.5 text-right align-middle font-mono text-code tabular-nums",
          isNoScore ? "text-meta-foreground" : "text-foreground",
        )}
      >
        {isNoScore ? "—" : `$${run.costLabel}`}
      </td>
      <td className="px-3 py-1.5 align-middle" />
    </tr>
  );
}

// `run_07` → 7. Used to label attempts inline on the trace row per the mockup.
function parseAttemptIndex(runId: string): number | null {
  const m = runId.match(/run_(\d+)/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

// Matches `truncateTraceId` in `job-usage-panel.tsx` — 6 chars + ellipsis. Two
// callsites, so a one-liner per file is simpler than a shared helper.
function truncateTraceId(id: string): string {
  return `${id.slice(0, 6)}…`;
}

// ── Reward cell ──────────────────────────────────────────────────────────────
// Two branches: no-score (neutral chip, no number) and graded (number colored
// by reward band — covers both `scored` and `error`, since `error` is just a
// scored run in the destructive band).

function TraceRewardCell({ run }: { run: JobRun }) {
  if (run.state === "no-score") {
    return (
      <span className="inline-flex items-center justify-end gap-1.5">
        <span className="rounded-sm border border-border bg-muted-surface px-1.5 py-0.5 font-sans text-label font-medium text-meta-foreground">
          no score
        </span>
      </span>
    );
  }
  const rewardNum = run.reward !== null ? Number(run.reward) : null;
  const cls = rewardNum !== null ? rewardBandClass(rewardNum) : "text-meta-foreground";
  return (
    <span
      className={cn(
        "font-mono text-code font-semibold tabular-nums",
        cls,
      )}
    >
      {run.reward ?? "—"}
    </span>
  );
}

// ── Group by Model body (multi-model only) ───────────────────────────────────
// Model section header → task rows scoped to that model → individual trace rows.
// Task row visual = current parent row shape (single-model lens, no per-model
// strip). Trace row indent = single (one level under the task row).

interface ModelGroupedBodyProps {
  jobId: string;
  rows: ReadonlyArray<TraceRow>;
  models: ReadonlyArray<JobModelSummary>;
  selectedRunIds: ReadonlySet<string>;
  onToggleSelect: (runId: string) => void;
  onToggleSelectAll: (rows: ReadonlyArray<TraceRow>) => void;
}

function ModelGroupedBody({
  jobId,
  rows,
  models,
  selectedRunIds,
  onToggleSelect,
  onToggleSelectAll,
}: ModelGroupedBodyProps) {
  const [expandedModels, setExpandedModels] = React.useState<ReadonlySet<string>>(() => {
    // Default: winner expanded.
    const winner = models[0]?.modelId;
    return winner ? new Set([winner]) : new Set();
  });
  const [expandedModelTasks, setExpandedModelTasks] = React.useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const toggleModel = (modelId: string) => {
    setExpandedModels((prev) => {
      const next = new Set(prev);
      if (next.has(modelId)) next.delete(modelId);
      else next.add(modelId);
      return next;
    });
  };
  const toggleModelTask = (key: string) => {
    setExpandedModelTasks((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <>
      {models.map((m) => {
        const modelRows = rows.filter((r) => r.run.modelId === m.modelId);
        if (modelRows.length === 0) return null;
        const expanded = expandedModels.has(m.modelId);
        const groups = groupRowsByTask(modelRows);
        const selCount = modelRows.reduce(
          (acc, r) => acc + (selectedRunIds.has(r.run.id) ? 1 : 0),
          0,
        );
        let modelChecked: boolean | "indeterminate" = false;
        if (selCount === modelRows.length) modelChecked = true;
        else if (selCount > 0) modelChecked = "indeterminate";

        return (
          <React.Fragment key={m.modelId}>
            <ModelSectionHeader
              model={m}
              checked={modelChecked}
              expanded={expanded}
              onToggleExpand={() => toggleModel(m.modelId)}
              onToggleSelect={() => onToggleSelectAll(modelRows)}
            />
            {expanded &&
              groups.map((group) => {
                const key = `${m.modelId}::${group.task.id}`;
                const taskExpanded = expandedModelTasks.has(key);
                const childRows = group.traces;
                const childSelCount = childRows.reduce(
                  (acc, r) => acc + (selectedRunIds.has(r.run.id) ? 1 : 0),
                  0,
                );
                let parentChecked: boolean | "indeterminate" = false;
                if (childSelCount === childRows.length) parentChecked = true;
                else if (childSelCount > 0) parentChecked = "indeterminate";
                return (
                  <React.Fragment key={key}>
                    <TaskParentRow
                      group={group}
                      models={[]}
                      isMultiModel={false}
                      expanded={taskExpanded}
                      onToggleExpand={() => toggleModelTask(key)}
                      parentChecked={parentChecked}
                      onToggleSelectGroup={() => onToggleSelectAll(childRows)}
                    />
                    {taskExpanded &&
                      childRows.map((row) => (
                        <TraceChildRow
                          key={row.run.id}
                          jobId={jobId}
                          row={row}
                          indent="single"
                          selected={selectedRunIds.has(row.run.id)}
                          onToggleSelect={() => onToggleSelect(row.run.id)}
                        />
                      ))}
                  </React.Fragment>
                );
              })}
          </React.Fragment>
        );
      })}
    </>
  );
}

interface ModelSectionHeaderProps {
  model: JobModelSummary;
  checked: boolean | "indeterminate";
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleSelect: () => void;
}

function ModelSectionHeader({
  model,
  checked,
  expanded,
  onToggleExpand,
  onToggleSelect,
}: ModelSectionHeaderProps) {
  const rewardCls =
    model.overallReward !== null ? rewardBandClass(model.overallReward) : "text-meta-foreground";
  return (
    <tr
      onClick={onToggleExpand}
      aria-expanded={expanded}
      className="cursor-pointer border-b border-border bg-card transition-colors hover:bg-hover-surface"
    >
      <td className="px-3 py-2.5 align-middle" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center">
          <Checkbox
            size="sm"
            checked={checked}
            onCheckedChange={onToggleSelect}
            aria-label={`Select all ${model.modelId} traces`}
          />
        </div>
      </td>
      <td className="min-w-0 px-3 py-2.5 align-middle" colSpan={7}>
        <div className="flex min-w-0 items-center gap-3">
          {expanded ? (
            <ChevronDown aria-hidden="true" className="size-3.5 shrink-0 text-meta-foreground" />
          ) : (
            <ChevronRight aria-hidden="true" className="size-3.5 shrink-0 text-meta-foreground" />
          )}
          <span className="font-mono text-code font-semibold text-foreground">
            {model.modelId}
          </span>
          <span className={cn("font-mono text-label font-semibold tabular-nums", rewardCls)}>
            {model.overallReward !== null ? model.overallReward.toFixed(2) : "—"}
          </span>
          <span className="font-mono text-label text-meta-foreground">
            {model.traceCount} traces
          </span>
          <span className="font-mono text-label text-meta-foreground">
            ${model.costTotal.toFixed(3)} total
          </span>
          {model.winRate !== null && (
            <span className="rounded-sm border border-primary-border bg-primary-soft px-2 py-0.5 font-mono text-label font-medium text-primary">
              win-rate {Math.round(model.winRate * 100)}%
            </span>
          )}
        </div>
      </td>
    </tr>
  );
}

// ── Bulk action bar ──────────────────────────────────────────────────────────

interface BulkActionBarProps {
  count: number;
  runQaTrigger: React.ReactNode;
  onClear: () => void;
}

export function BulkActionBar({
  count,
  runQaTrigger,
  onClear,
}: BulkActionBarProps) {
  return (
    <div
      role="toolbar"
      aria-label="Bulk actions"
      className="flex items-center gap-2 rounded-md border border-border bg-secondary-surface px-3 py-1.5"
    >
      <span className="rounded-sm border border-primary/25 bg-primary-soft px-2 py-0.5 font-mono text-label font-semibold text-primary">
        {count} selected
      </span>
      <span className="ml-auto">{runQaTrigger}</span>
      <IconButton
        variant="ghost"
        size="sm"
        aria-label="Clear selection"
        onClick={onClear}
      >
        <X />
      </IconButton>
    </div>
  );
}
