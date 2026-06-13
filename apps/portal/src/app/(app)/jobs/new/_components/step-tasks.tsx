"use client";

import { useMemo, useState } from "react";
import { TriangleAlertIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { Checkbox } from "@repo/ui/components/checkbox";
import { FilterChip } from "@repo/ui/components/filter-chip";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import { SearchInput } from "@repo/ui/components/search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@repo/ui/components/select";
import { VisibilityIcon } from "@repo/ui/components/visibility-icon";
import { cn } from "@repo/ui/lib/cn";
import type { Taskset, TasksetTaskRow } from "@/lib/mock/tasksets";

export interface StepTasksProps {
  taskset: Taskset;
  selection: ReadonlySet<string>;
  onSelectionChange: (next: ReadonlySet<string>) => void;
  acknowledged: boolean;
  onAcknowledgedChange: (next: boolean) => void;
  /**
   * Whether this wizard requires the ≥10-tasks acknowledgment. Training: true
   * (RL needs minimum sample size). Eval: false (single trace is valid).
   * Default `true` preserves the training contract for existing callers.
   */
  requiresMinAck?: boolean;
}

const MIN_TASKS = 10;

// Reward source the per-row bar, per-row %, the right-column histogram, and
// the pinned "Avg Reward" stat all derive from. "This Model" = reward the
// model picked in Step 2 has scored on each task; "All Models" = mean across
// every model that has ever run the task.
type RewardSource = "this" | "all";

const REWARD_SOURCE_LABEL: Record<RewardSource, string> = {
  this: "This Model",
  all: "All Models",
};

function rewardFor(task: TasksetTaskRow, source: RewardSource): number {
  return source === "this" ? task.thisModelReward : task.allModelsReward;
}

// "menu:order-recovery" → "menu". Tasks without a colon collapse into the
// catch-all "Other" bucket so every task is reachable from a chip.
function prefixOf(scenario: string): string {
  const i = scenario.indexOf(":");
  return i === -1 ? "Other" : scenario.slice(0, i);
}

export function StepTasks({
  taskset,
  selection,
  onSelectionChange,
  acknowledged,
  onAcknowledgedChange,
  requiresMinAck = true,
}: StepTasksProps) {
  const tasks = taskset.tasks;
  const [rewardSource, setRewardSource] = useState<RewardSource>("this");
  const [query, setQuery] = useState("");
  const [prefixFilter, setPrefixFilter] = useState<string | null>(null);

  const prefixCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of tasks) {
      const p = prefixOf(t.scenario);
      map.set(p, (map.get(p) ?? 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter((t) => {
      if (prefixFilter !== null && prefixOf(t.scenario) !== prefixFilter) {
        return false;
      }
      if (q.length > 0 && !t.scenario.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [tasks, query, prefixFilter]);

  const selectedCount = selection.size;
  const filteredSelectedCount = useMemo(
    () => filteredTasks.reduce((n, t) => (selection.has(t.taskId) ? n + 1 : n), 0),
    [filteredTasks, selection],
  );
  const allFilteredSelected =
    filteredTasks.length > 0 && filteredSelectedCount === filteredTasks.length;

  const noneSelected = selectedCount === 0;
  const needsAck =
    requiresMinAck && selectedCount > 0 && selectedCount < MIN_TASKS;

  const avgRewardPct = useMemo(() => {
    if (selectedCount === 0) return null;
    let sum = 0;
    let n = 0;
    for (const t of tasks) {
      if (!selection.has(t.taskId)) continue;
      sum += rewardFor(t, rewardSource);
      n += 1;
    }
    if (n === 0) return null;
    return Math.round((sum / n) * 100);
  }, [tasks, selection, selectedCount, rewardSource]);

  const toggle = (taskId: string) => {
    const next = new Set(selection);
    if (next.has(taskId)) next.delete(taskId);
    else next.add(taskId);
    onSelectionChange(next);
  };
  // "Deselect all" applies within the current filter scope — toggling on a
  // filtered view should not silently drop selections outside the visible set.
  const toggleAllInView = () => {
    const next = new Set(selection);
    if (allFilteredSelected) {
      for (const t of filteredTasks) next.delete(t.taskId);
    } else {
      for (const t of filteredTasks) next.add(t.taskId);
    }
    onSelectionChange(next);
  };

  if (tasks.length === 0) {
    return (
      <div className="h-full flex flex-col gap-6">
        <TasksHeading taskset={taskset} />
        <div className="flex flex-col items-start gap-3 rounded-lg border border-border bg-card px-6 py-8">
          <p className="text-body text-foreground">
            No tasks available for this taskset.
          </p>
          <p className="text-caption text-muted-foreground">
            Pick a different taskset to continue.
          </p>
        </div>
      </div>
    );
  }

  const toolbar = (
    <Toolbar
      query={query}
      onQueryChange={setQuery}
      prefixFilter={prefixFilter}
      onPrefixFilterChange={setPrefixFilter}
      prefixCounts={prefixCounts}
      totalCount={tasks.length}
      rewardSource={rewardSource}
      onRewardSourceChange={setRewardSource}
      hasAnySelected={selectedCount > 0}
      onToggleAllInView={toggleAllInView}
    />
  );

  const stats = (
    <SelectionStats
      selectedCount={selectedCount}
      avgRewardPct={avgRewardPct}
    />
  );

  // Layout:
  //   <lg  — single column: heading, horizontal histogram strip, toolbar, list, stats, alerts.
  //   lg+  — toolbar spans full width above a 2-col grid. Left (1fr) holds the
  //          scrollable list card; right (280px) holds the vertical histogram card.
  //          Both cards' top edges align because the grid begins at the same row.
  //          TasksHeading names the step; toolbar acts as implicit header for both
  //          cards — no per-column titles.
  return (
    <div className="h-full flex flex-col gap-4">
      <TasksHeading taskset={taskset} />

      {/* <lg only: stacked horizontal histogram + toolbar above the list */}
      <div className="contents lg:hidden">
        <PerTaskAvgRewardHistogram
          tasks={tasks}
          selection={selection}
          rewardSource={rewardSource}
          orientation="horizontal"
        />
        {toolbar}
        <ScrollArea className="flex-1 min-h-0 rounded-lg border border-border bg-card">
          <ul className="flex flex-col gap-1">
            {filteredTasks.map((task) => (
              <TaskRow
                key={`${task.taskId}-${task.index}`}
                task={task}
                rewardSource={rewardSource}
                checked={selection.has(task.taskId)}
                onChange={() => toggle(task.taskId)}
              />
            ))}
            {filteredTasks.length === 0 && <NoMatchRow />}
          </ul>
        </ScrollArea>
      </div>

      {/* lg+ only: toolbar full-width above a two-column grid. The toolbar
          serves as the implicit header for both cards, so neither card carries
          its own title. Left card (1fr) is the scrollable task list; right card
          (280px) holds the vertical histogram. Both cards share the same top
          edge by being siblings in the same grid row. */}
      <div className="hidden lg:contents">
        {toolbar}
        <div className="grid flex-1 min-h-0 grid-cols-[1fr_280px] grid-rows-[1fr] gap-4">
          <ScrollArea className="rounded-lg border border-border bg-card min-h-0">
            <ul className="flex flex-col gap-1">
              {filteredTasks.map((task) => (
                <TaskRow
                  key={`${task.taskId}-${task.index}`}
                  task={task}
                  rewardSource={rewardSource}
                  checked={selection.has(task.taskId)}
                  onChange={() => toggle(task.taskId)}
                />
              ))}
              {filteredTasks.length === 0 && <NoMatchRow />}
            </ul>
          </ScrollArea>
          <PerTaskAvgRewardHistogram
            tasks={tasks}
            selection={selection}
            rewardSource={rewardSource}
            orientation="vertical"
          />
        </div>
      </div>

      {stats}

      {needsAck && (
        <Alert variant="warning" className="shrink-0">
          <TriangleAlertIcon aria-hidden="true" />
          <AlertTitle>Training requires at least {MIN_TASKS} tasks</AlertTitle>
          <AlertDescription>
            <p>
              You have selected {selectedCount}{" "}
              {selectedCount === 1 ? "task" : "tasks"}. Tasks will be duplicated
              to reach the minimum of {MIN_TASKS}.
            </p>
            <label className="flex items-center gap-2 text-body text-foreground">
              <Checkbox
                checked={acknowledged}
                onCheckedChange={(v) => onAcknowledgedChange(v === true)}
              />
              I understand that tasks will be duplicated to meet the minimum
              requirement
            </label>
          </AlertDescription>
        </Alert>
      )}

      {noneSelected && (
        <p className="shrink-0 text-caption text-state-warning-text">
          Select at least one task to continue.
        </p>
      )}
    </div>
  );
}

function TasksHeading({ taskset }: { taskset: Taskset }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border pb-4">
      <h2 className="text-body font-semibold text-foreground">
        Tasks in {taskset.name}
      </h2>
      <div className="flex items-center gap-2 text-caption text-muted-foreground">
        <span>{taskset.taskCount} tasks</span>
        <span aria-hidden="true">·</span>
        <span className="inline-flex items-center gap-1">
          <VisibilityIcon visibility={taskset.visibility} size="sm" />
          {taskset.visibility === "public" ? "public" : "private"}
        </span>
        <span aria-hidden="true">·</span>
        <span>by {taskset.ownerName}</span>
      </div>
    </div>
  );
}

function Toolbar({
  query,
  onQueryChange,
  prefixFilter,
  onPrefixFilterChange,
  prefixCounts,
  totalCount,
  rewardSource,
  onRewardSourceChange,
  hasAnySelected,
  onToggleAllInView,
}: {
  query: string;
  onQueryChange: (next: string) => void;
  prefixFilter: string | null;
  onPrefixFilterChange: (next: string | null) => void;
  prefixCounts: ReadonlyArray<[string, number]>;
  totalCount: number;
  rewardSource: RewardSource;
  onRewardSourceChange: (next: RewardSource) => void;
  hasAnySelected: boolean;
  onToggleAllInView: () => void;
}) {
  // Show prefix chips only when there is real grouping signal — a single
  // prefix collapses to noise.
  const showChips = prefixCounts.length > 1;

  return (
    <div
      role="toolbar"
      aria-label="Task list filters"
      className="flex flex-wrap items-center gap-2 shrink-0"
    >
      <SearchInput
        defaultValue=""
        onLiveChange={onQueryChange}
        placeholder="Search tasks…"
        aria-label="Search tasks"
        className="flex-1 min-w-48"
      />
      {showChips && (
        <div className="flex flex-wrap items-center gap-2">
          <FilterChip
            label="All"
            count={totalCount}
            selected={prefixFilter === null}
            onSelectedChange={() => onPrefixFilterChange(null)}
          />
          {prefixCounts.map(([prefix, count]) => (
            <FilterChip
              key={prefix}
              label={prefix}
              count={count}
              selected={prefixFilter === prefix}
              onSelectedChange={(next) =>
                onPrefixFilterChange(next ? prefix : null)
              }
            />
          ))}
        </div>
      )}
      <Select
        value={rewardSource}
        onValueChange={(v) => onRewardSourceChange(v as RewardSource)}
      >
        <SelectTrigger aria-label="Reward shown" size="sm">
          <span className="text-muted-foreground">
            Reward shown:{" "}
            <span className="text-foreground">
              {REWARD_SOURCE_LABEL[rewardSource]}
            </span>
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="this">This Model</SelectItem>
          <SelectItem value="all">All Models</SelectItem>
        </SelectContent>
      </Select>
      <button
        type="button"
        onClick={onToggleAllInView}
        className="ml-auto self-center text-body text-primary hover:underline outline-hidden focus-visible:shadow-focus-ring rounded-sm"
      >
        {hasAnySelected ? "Deselect all" : "Select all"}
      </button>
    </div>
  );
}

function TaskRow({
  task,
  rewardSource,
  checked,
  onChange,
}: {
  task: TasksetTaskRow;
  rewardSource: RewardSource;
  checked: boolean;
  onChange: () => void;
}) {
  const pct = Math.round(rewardFor(task, rewardSource) * 100);
  const hasArgs = typeof task.args === "string" && task.args.length > 0;
  return (
    <li>
      <label className="flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors duration-fast ease-out-standard hover:bg-hover-surface">
        <Checkbox checked={checked} onCheckedChange={onChange} />
        <span className="flex min-w-0 flex-col">
          <span className="font-mono text-caption text-foreground">
            {task.scenario}
          </span>
          <span
            className={cn(
              "truncate text-meta text-meta-foreground",
              hasArgs && "font-mono",
            )}
          >
            {hasArgs ? task.args : "No arguments"}
          </span>
        </span>
        <span className="ml-auto flex shrink-0 items-center gap-2">
          <RewardBar pct={pct} />
          <span className="font-mono text-caption tabular-nums text-muted-foreground">
            {pct}%
          </span>
        </span>
      </label>
    </li>
  );
}

function NoMatchRow() {
  return (
    <li className="px-3 py-6 text-center text-caption text-muted-foreground">
      No tasks match the current filter.
    </li>
  );
}

// 64×8 inline reward bar. Color thresholds follow the canonical reward palette:
// low → state-warning (amber), high → state-scored (green). Mirrors the
// score-distribution heatmap vocabulary, simplified to two bands since the row
// already shows the exact %.
function RewardBar({ pct }: { pct: number }) {
  const fill = pct >= 50 ? "bg-state-scored" : "bg-state-warning";
  return (
    <span
      aria-hidden="true"
      className="block h-2 w-16 overflow-hidden rounded-sm bg-secondary-surface"
    >
      <span
        className={cn("block h-full rounded-sm", fill)}
        style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
      />
    </span>
  );
}

// Pinned summary that sits between the scrolling list and the warning/ack
// section. Uses the same low/high reward palette as RewardBar so the per-row
// signal carries through to the aggregate.
function SelectionStats({
  selectedCount,
  avgRewardPct,
}: {
  selectedCount: number;
  avgRewardPct: number | null;
}) {
  const avgColor =
    avgRewardPct === null
      ? "text-muted-foreground"
      : avgRewardPct >= 50
        ? "text-state-scored"
        : "text-state-warning";
  return (
    <div
      role="status"
      aria-live="polite"
      className="shrink-0 flex flex-wrap items-center gap-2 text-caption text-muted-foreground"
    >
      <span>Selected</span>
      <span aria-hidden="true">·</span>
      <span className="font-mono tabular-nums text-foreground">
        {selectedCount} {selectedCount === 1 ? "task" : "tasks"}
      </span>
      <span aria-hidden="true">·</span>
      <span>Avg Reward</span>
      <span aria-hidden="true">·</span>
      <span className={cn("font-mono tabular-nums", avgColor)}>
        {avgRewardPct === null ? "—" : `${avgRewardPct}%`}
      </span>
    </div>
  );
}

// Reward distribution for the selected tasks, bucketed into 5 reward bands
// (0–20%, 20–40%, ..., 80–100%). Orientation is a leaf-primitive variant: the
// structural tree is the same (bars + axis labels), only the axis they live
// along changes.
//
//  - horizontal: shrink-0 strip, used <lg as chrome above the list.
//    Bars run vertically along an x-axis (0% → 100% left→right). Compact.
//  - vertical: fills its column height, used lg+ as left-column chart.
//    Bars run horizontally along a y-axis (100% top → 0% bottom — higher
//    reward reads up, matching reward-curve conventions). Bar length is
//    proportional to bucket count.
function PerTaskAvgRewardHistogram({
  tasks,
  selection,
  rewardSource,
  orientation,
}: {
  tasks: ReadonlyArray<TasksetTaskRow>;
  selection: ReadonlySet<string>;
  rewardSource: RewardSource;
  orientation: "horizontal" | "vertical";
}) {
  const buckets = useMemo(() => {
    const out = [0, 0, 0, 0, 0];
    for (const task of tasks) {
      if (!selection.has(task.taskId)) continue;
      const idx = Math.min(Math.floor(rewardFor(task, rewardSource) * 5), 4);
      out[idx] = (out[idx] ?? 0) + 1;
    }
    return out;
  }, [tasks, selection, rewardSource]);
  const max = Math.max(...buckets, 1);

  if (orientation === "vertical") {
    // Top bucket is 80–100% so reading top-to-bottom = high reward to low.
    const bucketsTopDown = [...buckets].reverse();
    return (
      <aside
        aria-label="Reward distribution of selected tasks"
        className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3 flex-1 min-h-0"
      >
        <h3 className="text-meta font-semibold uppercase tracking-wider text-muted-foreground">
          Per-task avg reward
        </h3>
        <div className="flex flex-1 min-h-0 gap-2">
          <div className="flex flex-col justify-between text-meta tabular-nums text-meta-foreground">
            <span>100%</span>
            <span>50%</span>
            <span>0%</span>
          </div>
          <div className="flex flex-1 flex-col gap-1 min-h-0">
            {bucketsTopDown.map((count, i) => (
              <div key={i} className="flex flex-1 items-center min-h-0">
                <div
                  className="h-full rounded-sm bg-brand/60"
                  style={{ width: `${Math.max((count / max) * 100, 4)}%` }}
                  title={`${count} task${count === 1 ? "" : "s"}`}
                  aria-hidden="true"
                />
              </div>
            ))}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Reward distribution of selected tasks"
      className="shrink-0 flex items-center gap-4 rounded-lg border border-border bg-card px-3 py-2"
    >
      <h3 className="text-meta font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
        Per-task avg reward
      </h3>
      <div className="flex flex-1 flex-col gap-0.5">
        <div className="flex h-7 items-end gap-1">
          {buckets.map((count, i) => (
            <div key={i} className="flex flex-1 items-end">
              <div
                className="w-full rounded-sm bg-brand/60"
                style={{ height: `${Math.max((count / max) * 100, 4)}%` }}
                title={`${count} task${count === 1 ? "" : "s"}`}
                aria-hidden="true"
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between text-meta tabular-nums text-meta-foreground">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>
    </aside>
  );
}
