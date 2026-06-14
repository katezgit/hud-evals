"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown } from "lucide-react";
import { SearchInput } from "@repo/ui/components/search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { LIBRARY_JOBS, type LibraryJobRow } from "@/lib/mock/library";
import { LibraryJobRowItem } from "./library-job-row";
import {
  MultiSelectChip,
  SingleSelectChip,
  type MultiSelectOption,
  type SingleSelectOption,
} from "./filter-chips";

// Status filter buckets — collapses the six TasksetJobState values into the
// three operator-visible labels.
const STATUS_OPTIONS: ReadonlyArray<MultiSelectOption> = [
  { value: "successful", label: "Successful" },
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
            placeholder="Search jobs..."
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
        <div
          role="list"
          aria-label={`${sortedJobs.length} saved jobs`}
          className="min-h-0 flex-1 overflow-auto rounded-md border border-border bg-panel [&>div:last-child]:border-b-0"
        >
          {sortedJobs.map((job) => (
            <div role="listitem" key={job.id}>
              <LibraryJobRowItem job={job} onToggleStar={toggleStar} />
            </div>
          ))}
        </div>
      )}
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
