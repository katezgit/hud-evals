"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchInput } from "@repo/ui/components/search-input";
import { SegmentedControl } from "@repo/ui/components/segmented-control";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Switch } from "@repo/ui/components/switch";
import type { Taskset } from "@/lib/mock/tasksets";
import {
  JobsEmptyFiltered,
  JobsEmptyNoRuns,
  JobsEmptyNoTasks,
} from "./jobs-tab-footer";
import {
  filterJobs,
  sortJobs,
  type SortMode,
  type TypeFilter,
} from "./jobs-tab-filters";
import { JobsTabLegend } from "./jobs-tab-legend";
import {
  PAGE_SIZE_OPTIONS,
  PaginationRow,
  type PageSize,
} from "./jobs-tab-pagination";
import { GRID_COLS, JobRow } from "./jobs-tab-row";

interface JobsTabProps {
  taskset: Taskset;
}

const DEFAULT_PAGE_SIZE: PageSize = 25;

function parsePageSize(raw: string | null): PageSize {
  const n = Number(raw);
  return (PAGE_SIZE_OPTIONS as ReadonlyArray<number>).includes(n)
    ? (n as PageSize)
    : DEFAULT_PAGE_SIZE;
}

function parsePage(raw: string | null): number {
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

export default function JobsTab({ taskset }: JobsTabProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [showInvalidated, setShowInvalidated] = useState(false);
  const [search, setSearch] = useState("");
  // SearchInput is uncontrolled — bumping this key on filter-reset remounts it
  // with an empty defaultValue, the simplest way to clear it from outside.
  const [searchInputKey, setSearchInputKey] = useState(0);
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [focusIdx, setFocusIdx] = useState(-1);
  const [toast, setToast] = useState<string | null>(null);

  const filtersActive =
    typeFilter !== "all" ||
    showInvalidated ||
    search.length > 0 ||
    sortMode !== "newest";

  const clearFilters = () => {
    setTypeFilter("all");
    setShowInvalidated(false);
    setSearch("");
    setSortMode("newest");
    setSearchInputKey((k) => k + 1);
  };

  // Pagination state is URL-synced so it survives reload + sharing.
  const page = parsePage(searchParams.get("page"));
  const pageSize = parsePageSize(searchParams.get("size"));

  const searchInputRef = useRef<HTMLInputElement>(null);
  const rowRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filteredAndSorted = useMemo(
    () =>
      sortJobs(
        filterJobs(taskset.jobs, typeFilter, showInvalidated, search),
        sortMode,
      ),
    [taskset.jobs, typeFilter, showInvalidated, search, sortMode],
  );

  const totalCount = filteredAndSorted.length;
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));
  // Page can drift out of range when filters shrink the set — clamp at render time.
  const safePage = Math.min(Math.max(page, 1), pageCount);
  const visibleJobs = useMemo(
    () => filteredAndSorted.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filteredAndSorted, safePage, pageSize],
  );

  const writeParams = useCallback(
    (updates: { page?: number | null; size?: PageSize | null }) => {
      const params = new URLSearchParams(searchParams.toString());
      if ("page" in updates) {
        if (updates.page == null || updates.page === 1) params.delete("page");
        else params.set("page", String(updates.page));
      }
      if ("size" in updates) {
        if (updates.size == null || updates.size === DEFAULT_PAGE_SIZE)
          params.delete("size");
        else params.set("size", String(updates.size));
      }
      const qs = params.toString();
      router.replace(
        qs ? `/tasksets/${taskset.id}?${qs}` : `/tasksets/${taskset.id}`,
        { scroll: false },
      );
    },
    [router, searchParams, taskset.id],
  );

  const handlePageChange = useCallback(
    (next: number) => {
      writeParams({ page: next });
    },
    [writeParams],
  );

  const handlePageSizeChange = useCallback(
    (next: PageSize) => {
      // Switching page size resets to page 1 — keeps "Showing 1–N" honest.
      writeParams({ size: next, page: 1 });
    },
    [writeParams],
  );

  // Reset focus + page when filter/sort/search changes — index must stay valid against visibleJobs.
  useEffect(() => {
    setFocusIdx(-1);
    if (page !== 1) writeParams({ page: 1 });
    // Intentionally excluding `page` + `writeParams` from deps — only filter inputs should fire this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, showInvalidated, search, sortMode]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 1600);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // Keyboard nav — bound to document because the focused row is a Link visual indicator,
  // not a focusable element (the row click navigates; keyboard cursor is separate from DOM focus).
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const active = document.activeElement;
      const inInput =
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement;

      if (event.key === "/" && !inInput) {
        event.preventDefault();
        searchInputRef.current?.focus();
        return;
      }
      if (event.key === "Escape" && active === searchInputRef.current) {
        searchInputRef.current?.blur();
        return;
      }
      if (inInput) return;
      if (visibleJobs.length === 0) return;

      if (event.key === "j") {
        event.preventDefault();
        setFocusIdx((prev) => Math.min(prev + 1, visibleJobs.length - 1));
        return;
      }
      if (event.key === "k") {
        event.preventDefault();
        setFocusIdx((prev) => Math.max(prev - 1, 0));
        return;
      }
      if (event.key === "Enter" && focusIdx >= 0) {
        const job = visibleJobs[focusIdx];
        if (job) {
          event.preventDefault();
          rowRefs.current[focusIdx]?.click();
        }
        return;
      }
      if (event.key === "c" && focusIdx >= 0) {
        const job = visibleJobs[focusIdx];
        if (job) {
          event.preventDefault();
          const url = `https://hud.ai/jobs/${job.id}`;
          void navigator.clipboard?.writeText(url);
          showToast(`Copied · ${url}`);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [visibleJobs, focusIdx, showToast]);

  useEffect(() => {
    if (focusIdx < 0) return;
    rowRefs.current[focusIdx]?.scrollIntoView({ block: "nearest" });
  }, [focusIdx]);

  const showPagination = totalCount > pageSize;

  return (
    <div className="flex flex-col gap-3 pb-4">
      <div className="flex flex-wrap items-center gap-3 py-1">
        <SearchInput
          key={searchInputKey}
          ref={searchInputRef}
          aria-label="Search jobs"
          placeholder="Search jobs, models, ids…"
          className="w-72 shrink-0"
          onLiveChange={setSearch}
          trailing={
            <kbd className="text-meta-foreground bg-elevated-surface border-border rounded border px-1.5 font-mono text-meta">
              /
            </kbd>
          }
        />

        <SegmentedControl
          aria-label="Filter by job type"
          value={typeFilter}
          onValueChange={(v) => setTypeFilter(v as TypeFilter)}
          className="shrink-0"
        >
          <SegmentedControl.Item value="all">All</SegmentedControl.Item>
          <SegmentedControl.Item value="eval">Eval</SegmentedControl.Item>
          <SegmentedControl.Item value="train">Training</SegmentedControl.Item>
        </SegmentedControl>

        <Select
          value={sortMode}
          onValueChange={(v) => setSortMode(v as SortMode)}
        >
          <SelectTrigger
            size="sm"
            aria-label="Sort jobs"
            className="w-auto min-w-0 shrink-0 font-mono"
          >
            <span className="text-meta-foreground">Sort:</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="reward">Reward</SelectItem>
            <SelectItem value="attention">Attention</SelectItem>
          </SelectContent>
        </Select>

        <label className="text-muted-foreground ml-auto flex shrink-0 items-center gap-2 font-mono text-caption">
          <Switch
            size="sm"
            checked={showInvalidated}
            onCheckedChange={(v) => setShowInvalidated(Boolean(v))}
            aria-label="Show invalidated jobs"
          />
          Show invalidated
        </label>

        {visibleJobs.length > 0 ? (
          <>
            <span
              aria-hidden="true"
              className="text-meta-foreground font-mono text-caption select-none"
            >
              ⋯
            </span>
            <JobsTabLegend />
          </>
        ) : null}
      </div>

      <div className="bg-panel border-border rounded-xl border">
        <div>
          <div className="bg-elevated-surface border-border text-meta-foreground rounded-t-xl border-b px-4 py-2.5 font-mono text-meta uppercase">
            <div className={GRID_COLS}>
              <div>Status</div>
              <div>Job</div>
              <div>Reward · Runs</div>
              <div>Model · Owner</div>
              <div className="justify-self-end text-right">Cost</div>
              <div />
            </div>
          </div>

            {visibleJobs.length === 0 ? (
              <JobsEmpty
                tasksetId={taskset.id}
                hasTasks={taskset.tasks.length > 0}
                hasJobs={taskset.jobs.length > 0}
                filtersActive={filtersActive}
                onClearFilters={clearFilters}
              />
            ) : (
              // Strip the last row's bottom border via parent selector — `:last-child` on the
              // inner Link always matches (it's the only child of its <li>), so the row itself
              // can't gate on `last:`.
              <ul
                aria-label="Jobs"
                className="[&>li:last-child>a]:rounded-b-xl [&>li:last-child>a]:border-b-0"
              >
                {visibleJobs.map((job, i) => (
                  <li key={job.id}>
                    <JobRow
                      ref={(el) => {
                        rowRefs.current[i] = el;
                      }}
                      job={job}
                      tasksetId={taskset.id}
                      focused={i === focusIdx}
                    />
                  </li>
                ))}
              </ul>
            )}
        </div>
      </div>

      {showPagination ? (
        <PaginationRow
          page={safePage}
          pageSize={pageSize}
          total={totalCount}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      ) : null}

      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className="bg-foreground text-background fixed bottom-6 left-1/2 z-toast -translate-x-1/2 rounded-lg px-4 py-2 font-mono text-caption shadow-(--shadow-popover)"
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
}

// Three zero-states for the jobs table area. Order matters:
//   1. 0 tasks       → upstream dependency missing; redirect to Tasks tab
//   2. tasks, 0 jobs → true zero-state; show the canonical first CLI command
//   3. jobs filtered → user is hiding their own data; give a clear path back
function JobsEmpty({
  tasksetId,
  hasTasks,
  hasJobs,
  filtersActive,
  onClearFilters,
}: {
  tasksetId: string;
  hasTasks: boolean;
  hasJobs: boolean;
  filtersActive: boolean;
  onClearFilters: () => void;
}) {
  if (!hasTasks) return <JobsEmptyNoTasks tasksetId={tasksetId} />;
  if (!hasJobs) return <JobsEmptyNoRuns tasksetId={tasksetId} />;
  if (filtersActive)
    return <JobsEmptyFiltered onClearFilters={onClearFilters} />;
  return <JobsEmptyNoRuns tasksetId={tasksetId} />;
}
