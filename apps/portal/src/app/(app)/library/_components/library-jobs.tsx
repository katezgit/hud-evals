"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpDown, ChevronRight, Star } from "lucide-react";
import { SearchInput } from "@repo/ui/components/search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/cn";
import {
  JobCell,
  ModelOwnerCell,
  StatusCell,
  TasksetCell,
} from "@/app/(app)/jobs/_components/jobs-index-cells";
import {
  DistBar,
  TraceGrid,
  distOf,
  totalTraces,
} from "@/app/(app)/tasksets/[id]/_components/jobs-tab-viz";
import { LIBRARY_JOBS, type LibraryJobRow } from "@/lib/mock/library";
import {
  MultiSelectChip,
  SingleSelectChip,
  type MultiSelectOption,
  type SingleSelectOption,
} from "./filter-chips";

// Grid: Status (lead) · Job (flex) · Taskset · Model·Owner · Reward·Tasks · Unstar (trailing).
// Mirrors the Tasksets-Jobs grid with: +Taskset column (from Jobs index), −Cost column,
// trailing chevron column replaced by hover-reveal unstar button.
//
// Inline style (not a Tailwind arbitrary utility) because the previous
// `grid-cols-[112px_minmax(220px,1fr)_168px_168px_220px_28px]` class went missing
// from the served CSS chunk while the source string was intact — header + rows
// collapsed to stacked blocks. Bypassing the JIT extractor pins the layout to
// the markup; both header and body rows share this single object.
const GRID_STYLE = {
  display: "grid",
  gridTemplateColumns: "112px minmax(220px,1fr) 168px 168px 220px 28px",
  alignItems: "center",
  gap: "1rem",
} as const;

// Status filter buckets — collapses the six TasksetJobState values into the
// three operator-visible labels.
const STATUS_OPTIONS: ReadonlyArray<MultiSelectOption> = [
  { value: "successful", label: "Completed" },
  { value: "failed", label: "Failed" },
  { value: "running", label: "Running" },
];

const STATE_TO_STATUS_BUCKET: Record<LibraryJobRow["state"], string> = {
  completed: "successful",
  running: "running",
  queued: "running",
  failed: "failed",
  errored: "failed",
  invalidated: "failed",
};

const DATE_OPTIONS: ReadonlyArray<SingleSelectOption> = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
];

const DATE_TO_MINUTES: Record<string, number> = {
  today: 60 * 24,
  "7d": 60 * 24 * 7,
  "30d": 60 * 24 * 30,
};

type SortKey =
  | "date-desc"
  | "reward-desc"
  | "tasks-desc"
  | "name-asc";

const SORT_OPTIONS: ReadonlyArray<{ value: SortKey; label: string }> = [
  { value: "date-desc", label: "Date (newest)" },
  { value: "reward-desc", label: "Reward (highest)" },
  { value: "tasks-desc", label: "Tasks Completed" },
  { value: "name-asc", label: "Name (A–Z)" },
];

const SORT_DEFAULT: SortKey = "date-desc";
const SORT_CLEAR = "__sort_clear__";

const CURRENT_USER = "Aman";

export function LibraryJobs() {
  // Single source of truth for the saved set — unstarring removes the row.
  // Seeded from the fixture; the page treats this as session state (no persist).
  const [savedIds, setSavedIds] = useState<ReadonlySet<string>>(
    () => new Set(LIBRARY_JOBS.map((j) => j.id)),
  );
  const [search, setSearch] = useState("");
  const [userFilter, setUserFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ReadonlyArray<string>>([]);
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>(SORT_DEFAULT);

  const savedJobs = useMemo(
    () => LIBRARY_JOBS.filter((j) => savedIds.has(j.id)),
    [savedIds],
  );

  // User options are derived from the saved set so the dropdown only shows
  // owners that actually appear — `(me)` suffix marks the current user.
  const userOptions = useMemo<ReadonlyArray<SingleSelectOption>>(() => {
    const owners = new Set<string>();
    for (const job of savedJobs) owners.add(job.ownerName);
    const meFirst = Array.from(owners).sort((a, b) => {
      if (a === CURRENT_USER) return -1;
      if (b === CURRENT_USER) return 1;
      return a.localeCompare(b);
    });
    return meFirst.map((name) => ({
      value: name,
      label: name === CURRENT_USER ? `${name} (me)` : name,
    }));
  }, [savedJobs]);

  const filteredJobs = useMemo(() => {
    const q = search.trim().toLowerCase();
    const dateLimit =
      dateFilter && dateFilter in DATE_TO_MINUTES
        ? DATE_TO_MINUTES[dateFilter]
        : null;
    return savedJobs.filter((job) => {
      if (q) {
        const haystack = `${job.title} ${job.modelName} ${job.tasksetName} ${job.id}`;
        if (!haystack.toLowerCase().includes(q)) return false;
      }
      if (userFilter && job.ownerName !== userFilter) return false;
      if (statusFilter.length > 0) {
        const bucket = STATE_TO_STATUS_BUCKET[job.state];
        if (!statusFilter.includes(bucket)) return false;
      }
      if (dateLimit != null && job.whenSort > dateLimit) return false;
      return true;
    });
  }, [savedJobs, search, userFilter, statusFilter, dateFilter]);

  const sortedJobs = useMemo(() => {
    const copy = [...filteredJobs];
    switch (sortKey) {
      case "date-desc":
        copy.sort((a, b) => a.whenSort - b.whenSort);
        break;
      case "reward-desc":
        copy.sort((a, b) => (b.reward ?? -1) - (a.reward ?? -1));
        break;
      case "tasks-desc":
        copy.sort((a, b) => b.traceCount - a.traceCount);
        break;
      case "name-asc":
        copy.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }
    return copy;
  }, [filteredJobs, sortKey]);

  const hasActiveFilters =
    Boolean(search) ||
    Boolean(userFilter) ||
    statusFilter.length > 0 ||
    Boolean(dateFilter);

  const clearAllFilters = () => {
    setSearch("");
    setUserFilter(null);
    setStatusFilter([]);
    setDateFilter(null);
  };

  const toggleStar = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  if (savedJobs.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div
        role="toolbar"
        aria-label="Library Jobs filter bar"
        className="flex shrink-0 flex-wrap items-center gap-2"
      >
        <div className="min-w-48 flex-1">
          <SearchInput
            defaultValue={search}
            onValueChange={setSearch}
            placeholder="Search saved jobs..."
            aria-label="Search saved jobs"
          />
        </div>

        <SingleSelectChip
          label="User"
          options={userOptions}
          value={userFilter}
          onValueChange={setUserFilter}
        />

        <MultiSelectChip
          label="Status"
          options={STATUS_OPTIONS}
          value={statusFilter}
          onValueChange={(next) => setStatusFilter(next)}
        />

        <SingleSelectChip
          label="Date"
          options={DATE_OPTIONS}
          value={dateFilter}
          onValueChange={setDateFilter}
        />

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
          <SelectTrigger aria-label="Sort jobs" className="ml-auto w-48">
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
      </div>

      {sortedJobs.length === 0 ? (
        <FilterEmpty onClear={clearAllFilters} hasFilters={hasActiveFilters} />
      ) : (
        // Bounded inner scroll via flex chain. flex-1 + min-h-0 takes exactly
        // the remaining height inside TabsContent (which is itself sized by
        // page-shell h-full → Tabs flex-1) — no calc() math, the scroll region
        // ends at the bottom of <main>'s content area regardless of viewport.
        <div className="bg-card border-border flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border">
          <div
            role="rowgroup"
            className="bg-field-rest border-border text-muted-foreground shrink-0 border-b py-2.5 text-label font-medium"
          >
            <div role="row" style={GRID_STYLE}>
              <div role="columnheader" className="px-3 pl-4">Status</div>
              <div role="columnheader" className="px-3">Job</div>
              <div role="columnheader" className="px-3">Taskset</div>
              <div role="columnheader" className="px-3">Model · Owner</div>
              <div role="columnheader" className="px-3">Reward · Tasks</div>
              <div role="columnheader" aria-label="Unstar" className="px-3 pr-4" />
            </div>
          </div>

          <div
            role="list"
            aria-label={`${sortedJobs.length} saved jobs`}
            className="min-h-0 flex-1 overflow-auto [&>div:last-child>div]:border-b-0"
          >
            {sortedJobs.map((job) => (
              <div role="listitem" key={job.id}>
                <LibraryJobRow job={job} onUnstar={toggleStar} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface LibraryJobRowProps {
  job: LibraryJobRow;
  onUnstar: (id: string) => void;
}

// Row is a div with role="link" (not <a>) so the trailing Unstar button can
// mutate state without triggering navigation — `e.stopPropagation()` on the
// button is enough only when the outer element is not a Link (Link would still
// navigate on inner clicks unless every child stops propagation).
function LibraryJobRow({ job, onUnstar }: LibraryJobRowProps) {
  const router = useRouter();
  const href = `/jobs/${job.id}`;
  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => router.push(href)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(href);
        }
      }}
      className="group border-border hover:bg-hover-surface focus-visible:bg-hover-surface relative block cursor-pointer border-b py-2 outline-hidden transition-colors focus-visible:before:absolute focus-visible:before:inset-y-0 focus-visible:before:left-0 focus-visible:before:w-0.5 focus-visible:before:bg-primary"
    >
      <div style={GRID_STYLE}>
        <div className="px-3 pl-4">
          <StatusCell state={job.state} />
        </div>
        <div className="px-3">
          <JobCell job={job} />
        </div>
        <div className="px-3">
          <TasksetCell job={job} />
        </div>
        <div className="px-3">
          <ModelOwnerCell job={job} />
        </div>
        <div className="px-3">
          <LibraryRewardCell job={job} />
        </div>
        <div className="flex items-center justify-self-end px-3 pr-4">
          <ChevronRight
            aria-hidden="true"
            className="text-meta-foreground size-3.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
          />
          <button
            type="button"
            aria-pressed={true}
            aria-label={`Unstar ${job.title}`}
            onClick={(e) => {
              e.stopPropagation();
              onUnstar(job.id);
            }}
            className="text-brand hover:bg-foreground/5 focus-visible:shadow-focus-ring inline-flex size-6 shrink-0 items-center justify-center rounded-sm opacity-0 outline-hidden transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 focus-visible:opacity-100"
          >
            <Star aria-hidden="true" className="size-3.5 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Library-specific Reward cell — subset of Tasksets-Jobs RewardCell.
// Inlined per single-caller no-over-abstract rule.
//
// Differences from the Tasksets-Jobs version (wireframe §6, §10):
//   • Training jobs show scalar only — NO Sparkline, NO Runs label.
//     Cross-taskset shelf has no defined trend axis (operator-resolved §11 Q2).
//   • Eval jobs show scalar + frac + trace grid/bar (unchanged).
//   • Running state renders "—" (live step subtitle lives in the Job cell already).
function LibraryRewardCell({ job }: { job: LibraryJobRow }) {
  if (
    job.state === "errored" ||
    job.state === "queued" ||
    job.state === "running"
  ) {
    return (
      <div className="min-w-0 font-mono">
        <span className="text-text-disabled text-body">—</span>
      </div>
    );
  }

  if (job.type === "train") {
    return (
      <div className="min-w-0 font-mono">
        <span className="text-foreground text-body font-medium tabular-nums tracking-tight">
          {job.reward!.toFixed(4)}
        </span>
      </div>
    );
  }

  const total = totalTraces(job);
  const useGrid = total <= 40 && Boolean(job.traces);
  return (
    <div className="min-w-0">
      <div className="flex items-baseline gap-2 font-mono">
        <span className="text-foreground text-body font-medium tabular-nums tracking-tight">
          {job.reward!.toFixed(4)}
        </span>
        {job.frac && (
          <span className="text-meta-foreground text-meta tracking-normal">
            {job.frac}
          </span>
        )}
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <div tabIndex={0} className="mt-1 flex w-fit items-center gap-2">
            {useGrid ? (
              <TraceGrid traces={job.traces!} />
            ) : (
              <DistBar dist={distOf(job)} total={total} />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-none">
          <TraceStateLegend />
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

const LEGEND_ROWS = [
  { label: "scored", swatch: "bg-state-scored" },
  { label: "failed", swatch: "bg-state-warning" },
  { label: "errored", swatch: "bg-state-errored" },
  { label: "running", swatch: "bg-state-running" },
  { label: "not run", swatch: null },
] as const;

function TraceStateLegend() {
  return (
    <ul className="flex flex-col gap-1">
      {LEGEND_ROWS.map((row) => (
        <li key={row.label} className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={cn(
              "size-2 shrink-0 rounded-full",
              row.swatch ?? "border border-background",
            )}
          />
          <span>{row.label}</span>
        </li>
      ))}
    </ul>
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
        No saved jobs yet.
      </p>
      <p className="text-body text-muted-foreground">
        Star a job to save it here.
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
        No saved jobs match the current filters.
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
