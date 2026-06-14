"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, LayoutGrid, List as ListIcon } from "lucide-react";
import { Checkbox } from "@repo/ui/components/checkbox";
import { Label } from "@repo/ui/components/label";
import { SearchInput } from "@repo/ui/components/search-input";
import {
  SegmentedControl,
} from "@repo/ui/components/segmented-control";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { TRACES, type TraceRow } from "@/lib/mock/library";
import { TraceCard } from "./trace-card";
import { TraceListTable } from "./trace-list-table";
import {
  MultiSelectChip,
  SingleSelectChip,
  type MultiSelectOption,
  type SingleSelectOption,
} from "./filter-chips";

// Status taxonomy mapped onto the four TraceStatus values the fixture exposes
// (`passed` → Scored, `partial` → Scored, etc.). "Errored" and "Not run" are
// reserved buckets — empty in the saved set today but kept for parity with the
// production filter.
const STATUS_OPTIONS: ReadonlyArray<MultiSelectOption> = [
  { value: "scored", label: "Scored" },
  { value: "failed", label: "Failed" },
  { value: "errored", label: "Errored" },
  { value: "running", label: "Running" },
  { value: "notrun", label: "Not run" },
];

const STATUS_TO_BUCKET: Record<TraceRow["status"], string> = {
  passed: "scored",
  partial: "scored",
  failed: "failed",
  running: "running",
};

const DATE_OPTIONS: ReadonlyArray<SingleSelectOption> = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
];

function isWithinDate(iso: string, key: string): boolean {
  const traceTime = new Date(iso).getTime();
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  switch (key) {
    case "today":
      return now - traceTime <= dayMs;
    case "7d":
      return now - traceTime <= 7 * dayMs;
    case "30d":
      return now - traceTime <= 30 * dayMs;
    default:
      return true;
  }
}

type SortKey =
  | "date-desc"
  | "reward-desc"
  | "views-desc"
  | "steps-desc"
  | "task-asc";

const SORT_OPTIONS: ReadonlyArray<{ value: SortKey; label: string }> = [
  { value: "date-desc", label: "Date (newest)" },
  { value: "reward-desc", label: "Reward (highest)" },
  { value: "views-desc", label: "Views" },
  { value: "steps-desc", label: "Steps" },
  { value: "task-asc", label: "Task Name" },
];

const SORT_DEFAULT: SortKey = "date-desc";
const SORT_CLEAR = "__sort_clear__";

type ViewMode = "grid" | "list";

export function LibraryTraces() {
  const [savedIds, setSavedIds] = useState<ReadonlySet<string>>(
    () => new Set(TRACES.filter((t) => t.starred).map((t) => t.id)),
  );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReadonlyArray<string>>([]);
  const [jobFilter, setJobFilter] = useState<ReadonlyArray<string>>([]);
  const [envFilter, setEnvFilter] = useState<ReadonlyArray<string>>([]);
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  const [hideAnalysis, setHideAnalysis] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>(SORT_DEFAULT);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const savedTraces = useMemo(
    () => TRACES.filter((t) => savedIds.has(t.id)),
    [savedIds],
  );

  // Job + Environment options derived from the saved set so the dropdowns
  // never show options that can't match anything visible.
  const jobOptions = useMemo<ReadonlyArray<MultiSelectOption>>(() => {
    const seen = new Map<string, string>();
    for (const trace of savedTraces) {
      if (seen.has(trace.jobId)) continue;
      // 4-char hex slug — `job_55a7c0` → `55a7` — matches the production
      // job disambiguation format.
      const slug = trace.jobId.replace(/^job_/, "").slice(0, 4);
      seen.set(trace.jobId, `${trace.jobName} (${slug})`);
    }
    return Array.from(seen, ([value, label]) => ({ value, label })).sort(
      (a, b) => a.label.localeCompare(b.label),
    );
  }, [savedTraces]);

  const envOptions = useMemo<ReadonlyArray<MultiSelectOption>>(() => {
    const seen = new Set<string>();
    for (const trace of savedTraces) seen.add(trace.environment);
    return Array.from(seen)
      .sort((a, b) => a.localeCompare(b))
      .map((env) => ({ value: env, label: env }));
  }, [savedTraces]);

  const filteredTraces = useMemo(() => {
    const q = search.trim().toLowerCase();
    return savedTraces.filter((trace) => {
      if (q) {
        const haystack = `${trace.taskSlug} ${trace.jobName} ${trace.model} ${trace.environment} ${trace.id}`;
        if (!haystack.toLowerCase().includes(q)) return false;
      }
      if (statusFilter.length > 0) {
        const bucket = STATUS_TO_BUCKET[trace.status];
        if (!statusFilter.includes(bucket)) return false;
      }
      if (jobFilter.length > 0 && !jobFilter.includes(trace.jobId)) return false;
      if (envFilter.length > 0 && !envFilter.includes(trace.environment))
        return false;
      if (dateFilter && !isWithinDate(trace.whenISO, dateFilter)) return false;
      return true;
    });
  }, [savedTraces, search, statusFilter, jobFilter, envFilter, dateFilter]);

  const sortedTraces = useMemo(() => {
    const copy = [...filteredTraces];
    switch (sortKey) {
      case "date-desc":
        copy.sort(
          (a, b) =>
            new Date(b.whenISO).getTime() - new Date(a.whenISO).getTime(),
        );
        break;
      case "reward-desc":
        copy.sort((a, b) => (b.reward ?? -1) - (a.reward ?? -1));
        break;
      case "views-desc":
        // Views aren't on the fixture — preserve stable order so the menu item
        // doesn't ghost-jump rows. Real API will carry a view counter.
        break;
      case "steps-desc":
        copy.sort((a, b) => b.steps - a.steps);
        break;
      case "task-asc":
        copy.sort((a, b) => a.taskSlug.localeCompare(b.taskSlug));
        break;
    }
    return copy;
  }, [filteredTraces, sortKey]);

  const hasActiveFilters =
    Boolean(search) ||
    statusFilter.length > 0 ||
    jobFilter.length > 0 ||
    envFilter.length > 0 ||
    Boolean(dateFilter);

  const clearAllFilters = () => {
    setSearch("");
    setStatusFilter([]);
    setJobFilter([]);
    setEnvFilter([]);
    setDateFilter(null);
  };

  const toggleStar = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  if (savedTraces.length === 0) {
    return <EmptyState />;
  }

  const renderContent = () => {
    if (sortedTraces.length === 0) {
      return <FilterEmpty onClear={clearAllFilters} hasFilters={hasActiveFilters} />;
    }
    if (viewMode === "list") {
      return <TraceListTable traces={sortedTraces} onToggleStar={toggleStar} />;
    }
    // Bounded inner scroll via flex chain. flex-1 + min-h-0 takes exactly
    // the remaining height — no calc() math. py-px reserves room for card
    // focus rings otherwise clipped by overflow.
    return (
      <div className="min-h-0 flex-1 overflow-auto">
        <div
          role="status"
          aria-live="polite"
          aria-label={`${sortedTraces.length} saved traces`}
          className="grid grid-cols-1 gap-4 py-px lg:grid-cols-2 xl:grid-cols-3"
        >
          {sortedTraces.map((trace) => (
            <TraceCard
              key={trace.id}
              trace={trace}
              starred
              onToggleStar={toggleStar}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div
        role="toolbar"
        aria-label="Library Traces filter bar"
        className="flex shrink-0 flex-wrap items-center gap-2"
      >
        <div className="min-w-48 flex-1">
          <SearchInput
            defaultValue={search}
            onValueChange={setSearch}
            placeholder="Search traces..."
            aria-label="Search saved traces"
          />
        </div>

        <MultiSelectChip
          label="Status"
          options={STATUS_OPTIONS}
          value={statusFilter}
          onValueChange={(next) => setStatusFilter(next)}
        />

        <MultiSelectChip
          label="Job"
          options={jobOptions}
          value={jobFilter}
          onValueChange={(next) => setJobFilter(next)}
          searchable
          searchPlaceholder="Search jobs…"
        />

        <MultiSelectChip
          label="Environment"
          options={envOptions}
          value={envFilter}
          onValueChange={(next) => setEnvFilter(next)}
          searchable
          searchPlaceholder="Search environments…"
        />

        <SingleSelectChip
          label="Date"
          options={DATE_OPTIONS}
          value={dateFilter}
          onValueChange={setDateFilter}
        />

        <div className="flex items-center gap-2 pl-1">
          <Checkbox
            id="hide-analysis"
            checked={hideAnalysis}
            onCheckedChange={(checked) => setHideAnalysis(checked === true)}
            size="sm"
          />
          <Label htmlFor="hide-analysis" className="cursor-pointer font-normal">
            Hide analysis
          </Label>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-label text-primary cursor-pointer hover:underline"
          >
            Clear filters
          </button>
        )}

        <Select
          value={sortKey}
          onValueChange={(v) => {
            if (v === SORT_CLEAR) {
              setSortKey(SORT_DEFAULT);
            } else {
              setSortKey(v as SortKey);
            }
          }}
        >
          <SelectTrigger aria-label="Sort traces" className="ml-auto w-44">
            <ArrowUpDown
              aria-hidden="true"
              className="size-3.5 text-muted-foreground"
            />
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
            <SelectSeparator />
            <SelectItem value={SORT_CLEAR}>Clear</SelectItem>
          </SelectContent>
        </Select>

        <SegmentedControl
          aria-label="View mode"
          value={viewMode}
          onValueChange={(v) => setViewMode(v as ViewMode)}
          className="shrink-0"
        >
          <SegmentedControl.Item value="grid" aria-label="Grid view">
            <LayoutGrid aria-hidden="true" className="size-3.5" />
          </SegmentedControl.Item>
          <SegmentedControl.Item value="list" aria-label="List view">
            <ListIcon aria-hidden="true" className="size-3.5" />
          </SegmentedControl.Item>
        </SegmentedControl>
      </div>

      {renderContent()}
    </div>
  );
}

function EmptyState() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto flex max-w-md flex-col items-center gap-2 py-12 text-center"
    >
      <p className="text-body font-medium text-foreground">
        No saved traces yet.
      </p>
      <p className="text-body text-muted-foreground">
        Star a trace to save it here.
      </p>
    </div>
  );
}

function FilterEmpty({
  hasFilters,
  onClear,
}: {
  hasFilters: boolean;
  onClear: () => void;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center gap-2 py-12 text-center"
    >
      <p className="text-body text-muted-foreground">
        No saved traces match the current filters.
      </p>
      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="text-label text-primary cursor-pointer hover:underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
