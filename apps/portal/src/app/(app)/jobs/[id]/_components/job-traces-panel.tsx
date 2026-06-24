"use client";

import * as React from "react";
import { AlertTriangle, ArrowUpRight, ChevronDown, LayoutGrid, List, Search } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { Button } from "@repo/ui/components/button";
import { FilterChip } from "@repo/ui/components/filter-chip";
import { Input } from "@repo/ui/components/input";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/components/popover";
import { SegmentedControl } from "@repo/ui/components/segmented-control";
import { Checkbox } from "@repo/ui/components/checkbox";
import type { JobModelSummary, JobQaAgent, JobRun, JobTask } from "@/lib/mock/job-detail";
import { BulkActionBar, JobRunTable, type GroupByMode, type TraceRow } from "./job-run-table";
import { JobTraceCards } from "./job-trace-cards";
import { QaAgentMainButton, QaAgentPopover } from "./qa-agent-popover";

interface JobTracesPanelProps {
  jobId: string;
  modelId: string;
  runs: ReadonlyArray<JobRun>;
  tasks: ReadonlyArray<JobTask>;
  qaAgents: ReadonlyArray<JobQaAgent>;
  /** Winner-first sorted list. Single-model jobs degenerate to a one-entry array. */
  models: ReadonlyArray<JobModelSummary>;
  failedByModel: Record<string, number>;
}

type StateFilter = "all" | "scored" | "error" | "no-score";
type ViewMode = "table" | "card";

export function JobTracesPanel({
  jobId,
  modelId,
  runs,
  tasks,
  qaAgents,
  models,
  failedByModel,
}: JobTracesPanelProps) {
  const isMultiModel = models.length >= 2;

  const [search, setSearch] = React.useState("");
  const [stateFilter, setStateFilter] = React.useState<StateFilter>("all");
  const [view, setView] = React.useState<ViewMode>("table");
  const [groupBy, setGroupBy] = React.useState<GroupByMode>("task");
  const [modelFilter, setModelFilter] = React.useState<ReadonlySet<string>>(
    () => new Set(models.map((m) => m.modelId)),
  );
  const [selectedRunIds, setSelectedRunIds] = React.useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const taskById = React.useMemo(() => {
    const map = new Map<string, JobTask>();
    for (const t of tasks) map.set(t.id, t);
    return map;
  }, [tasks]);

  // Pre-join runs with their tasks. Runs without a known task are dropped — the
  // mock data guarantees a 1:1 mapping, this is defensive only.
  const allRows = React.useMemo<ReadonlyArray<TraceRow>>(() => {
    const out: TraceRow[] = [];
    for (const run of runs) {
      const task = taskById.get(run.taskId);
      if (!task) continue;
      out.push({ run, task });
    }
    return out;
  }, [runs, taskById]);

  const counts = React.useMemo(() => {
    let scored = 0;
    let error = 0;
    let noScore = 0;
    for (const { run } of allRows) {
      if (run.state === "scored") scored += 1;
      else if (run.state === "error") error += 1;
      else noScore += 1;
    }
    return {
      all: allRows.length,
      scored,
      error,
      "no-score": noScore,
    } satisfies Record<StateFilter, number>;
  }, [allRows]);

  const searchLower = search.trim().toLowerCase();
  const visibleRows = React.useMemo(() => {
    return allRows.filter(({ run, task }) => {
      if (stateFilter !== "all" && run.state !== stateFilter) return false;
      if (isMultiModel && !modelFilter.has(run.modelId)) return false;
      if (searchLower) {
        const prompt = task.promptLabel?.toLowerCase() ?? "";
        const id = task.id.toLowerCase();
        if (!prompt.includes(searchLower) && !id.includes(searchLower)) return false;
      }
      return true;
    });
  }, [allRows, stateFilter, searchLower, isMultiModel, modelFilter]);

  // ── Failed-trace banner. Driven by the first errored run with a failure
  // string. The mock doesn't carry error strings today; we synthesize one when
  // any errored run with reward < 0.4 exists, since those are the practical
  // failure cases Alex would jump to. If no such run, the banner is hidden.
  const failedRun = React.useMemo(() => {
    return allRows.find(
      ({ run }) =>
        run.state === "error" && run.reward !== null && Number(run.reward) < 0.4,
    );
  }, [allRows]);
  const failedCount = React.useMemo(
    () =>
      allRows.filter(
        ({ run }) =>
          run.state === "error" && run.reward !== null && Number(run.reward) < 0.4,
      ).length,
    [allRows],
  );

  const toggleSelect = (runId: string) => {
    setSelectedRunIds((prev) => {
      const next = new Set(prev);
      if (next.has(runId)) next.delete(runId);
      else next.add(runId);
      return next;
    });
  };

  const toggleSelectAll = (rows: ReadonlyArray<TraceRow>) => {
    setSelectedRunIds((prev) => {
      const next = new Set(prev);
      const allSelected = rows.every((r) => next.has(r.run.id));
      if (allSelected) {
        for (const r of rows) next.delete(r.run.id);
      } else {
        for (const r of rows) next.add(r.run.id);
      }
      return next;
    });
  };

  const clearSelection = () => setSelectedRunIds(new Set());
  const selectedCount = selectedRunIds.size;

  // Filter-stats line — mirrors the models page (`X of Y` muted + green `Clear
  // all`). Group by / view toggle are navigation/density, not narrowing, so
  // they're excluded from both the "active" check and the reset.
  const hasNarrowingActive =
    search.trim().length > 0 ||
    stateFilter !== "all" ||
    (isMultiModel && modelFilter.size < models.length);
  const clearAllFilters = () => {
    setSearch("");
    setStateFilter("all");
    setModelFilter(new Set(models.map((m) => m.modelId)));
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      {failedRun && (
        <div className="shrink-0">
          <FailedTraceBanner
            count={isMultiModel ? failedCount : 1}
            isMultiModel={isMultiModel}
            models={models}
            failedByModel={failedByModel}
            onJump={() => toast(`→ Trace ${jobId}/${failedRun.run.id}`)}
          />
        </div>
      )}

      {/* Header line — count + scope · Run Analysis.
          Multi-model: "<N> Traces · across <K> Tasks · <M> models"
          Single-model: "<N> Traces · across <K> Tasks · <modelId>" (mono) */}
      <div className="flex shrink-0 items-start justify-between gap-4">
        <p className="flex items-baseline gap-2 text-body text-muted-foreground">
          <span className="font-semibold text-foreground">{allRows.length} Traces</span>
          <span aria-hidden="true" className="text-meta-foreground">·</span>
          <span>across {tasks.length} Tasks</span>
          <span aria-hidden="true" className="text-meta-foreground">·</span>
          {isMultiModel ? (
            <span>{models.length} models</span>
          ) : (
            <span className="font-mono text-label">{modelId}</span>
          )}
        </p>
        <QaAgentMainButton
          scope={`all ${allRows.length} Traces`}
          agents={qaAgents}
        />
      </div>

      {/* Filter row — search + state pills + Model filter (N≥2) | Group by (N≥2, list-only) + view toggle */}
      <div className="flex shrink-0 items-center gap-2">
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks…"
          aria-label="Search tasks"
          leading={<Search aria-hidden="true" className="size-3.5 text-meta-foreground" />}
          className="w-56"
        />
        <div className="flex items-center gap-1.5">
          <FilterChip
            label="All"
            selected={stateFilter === "all"}
            onSelectedChange={() => setStateFilter("all")}
            count={counts.all}
          />
          <FilterChip
            label="Scored"
            selected={stateFilter === "scored"}
            onSelectedChange={() => setStateFilter("scored")}
            count={counts.scored}
          />
          <FilterChip
            label="Error"
            selected={stateFilter === "error"}
            onSelectedChange={() => setStateFilter("error")}
            count={counts.error}
          />
          <FilterChip
            label="No score"
            selected={stateFilter === "no-score"}
            onSelectedChange={() => setStateFilter("no-score")}
            count={counts["no-score"]}
          />
        </div>
        {isMultiModel && (
          <ModelFilterDropdown
            models={models}
            selected={modelFilter}
            onChange={setModelFilter}
          />
        )}
        <span className="flex-1" />
        {/* Group by is LIST-view-only — card view has no group-rendering
            mechanism. Switching back to list restores the previous selection. */}
        {isMultiModel && view === "table" && (
          <SegmentedControl
            aria-label="Group by"
            value={groupBy}
            onValueChange={(v) => setGroupBy(v as GroupByMode)}
          >
            <SegmentedControl.Item value="task">Task</SegmentedControl.Item>
            <SegmentedControl.Item value="model">Model</SegmentedControl.Item>
          </SegmentedControl>
        )}
        <SegmentedControl
          aria-label="View mode"
          value={view}
          onValueChange={(v) => setView(v as ViewMode)}
        >
          <SegmentedControl.Item value="table" aria-label="List view">
            <List aria-hidden="true" className="size-3.5" />
          </SegmentedControl.Item>
          <SegmentedControl.Item value="card" aria-label="Card view">
            <LayoutGrid aria-hidden="true" className="size-3.5" />
          </SegmentedControl.Item>
        </SegmentedControl>
      </div>

      {hasNarrowingActive && (
        <div className="-mt-2 flex shrink-0 items-center justify-end gap-2">
          <span className="text-label text-muted-foreground">
            {visibleRows.length} of {allRows.length}
          </span>
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-label text-primary cursor-pointer hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      {selectedCount > 0 && (
        <div className="shrink-0">
          <BulkActionBar
            count={selectedCount}
            runQaTrigger={
              <QaAgentPopover
                scope={`${selectedCount} selected Trace${selectedCount === 1 ? "" : "s"}`}
                agents={qaAgents}
                trigger={<Button variant="ghost">Run Analysis</Button>}
              />
            }
            onClear={clearSelection}
          />
        </div>
      )}

      {view === "table" && (
        <JobRunTable
          jobId={jobId}
          rows={visibleRows}
          models={models}
          groupBy={groupBy}
          selectedRunIds={selectedRunIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
        />
      )}
      {view === "card" && (
        <JobTraceCards
          jobId={jobId}
          modelId={modelId}
          models={models}
          rows={visibleRows}
          selectedRunIds={selectedRunIds}
          onToggleSelect={toggleSelect}
        />
      )}
    </div>
  );
}

// ── Model filter dropdown (N≥2 only) ─────────────────────────────────────────

interface ModelFilterDropdownProps {
  models: ReadonlyArray<JobModelSummary>;
  selected: ReadonlySet<string>;
  onChange: (next: ReadonlySet<string>) => void;
}

function ModelFilterDropdown({ models, selected, onChange }: ModelFilterDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const toggle = (modelId: string) => {
    const next = new Set(selected);
    if (next.has(modelId)) next.delete(modelId);
    else next.add(modelId);
    if (next.size === 0) return;
    onChange(next);
  };
  const label =
    selected.size === models.length
      ? `Model: all ${models.length}`
      : `Model: ${selected.size}/${models.length}`;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          aria-haspopup="listbox"
          aria-expanded={open}
          className="font-normal"
        >
          {label}
          <ChevronDown aria-hidden="true" className="text-meta-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-1">
        {models.map((m) => {
          const isSel = selected.has(m.modelId);
          return (
            <button
              key={m.modelId}
              type="button"
              onClick={() => toggle(m.modelId)}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-body transition-colors hover:bg-hover-surface"
            >
              <Checkbox size="sm" checked={isSel} aria-hidden="true" />
              <span className="font-mono text-label text-foreground">{m.modelId}</span>
              <span className="ml-auto font-mono text-label text-meta-foreground">
                {m.overallReward !== null ? m.overallReward.toFixed(2) : "—"}
              </span>
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}

// ── Failed-trace banner ──────────────────────────────────────────────────────
// Wraps the shared destructive Alert. AlertDescription carries an inline code
// block with the failure string; "Jump to trace" sits on the title row, right-
// aligned, as an external-link affordance (↗) since it navigates to a different
// route. Header copy goes singular/plural by count.
//
// Multi-model variant adds an inline per-model breakdown after the count line.

interface FailedTraceBannerProps {
  count: number;
  isMultiModel: boolean;
  models: ReadonlyArray<JobModelSummary>;
  failedByModel: Record<string, number>;
  onJump: () => void;
}

function FailedTraceBanner({
  count,
  isMultiModel,
  models,
  failedByModel,
  onJump,
}: FailedTraceBannerProps) {
  const label = count === 1 ? "1 failed trace" : `${count} failed traces`;
  const jumpLabel = count > 1 ? `Jump to ${count} traces` : "Jump to trace";
  return (
    <Alert variant="destructive">
      <AlertTriangle aria-hidden="true" />
      <AlertTitle className="flex items-center justify-between gap-3">
        <span className="flex items-baseline gap-2 flex-wrap">
          <span>{label}</span>
          {isMultiModel && (
            <span className="font-mono text-meta font-normal text-state-errored-text/70">
              ·{" "}
              {models
                .map((m) => `${m.modelId} ${failedByModel[m.modelId] ?? 0}`)
                .join(" · ")}
            </span>
          )}
        </span>
        <Button
          variant="ghost"
          onClick={onJump}
          className="-my-1 h-7 shrink-0 px-2 text-meta"
        >
          {jumpLabel}
          <ArrowUpRight aria-hidden="true" />
        </Button>
      </AlertTitle>
      <AlertDescription>
        <code className="font-mono">
          Client is not connected. Use the &apos;async with client:&apos; context manager first.
        </code>
      </AlertDescription>
    </Alert>
  );
}
