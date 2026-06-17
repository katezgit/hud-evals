"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  List,
  ListChecks,
  Plus,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { CodeBlock } from "@repo/ui/components/code-block";
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@repo/ui/components/drawer";
import { EmptyState } from "@repo/ui/components/empty-state";
import { IconButton } from "@repo/ui/components/icon-button";
import { MultiSelect } from "@repo/ui/components/multi-select";
import { SearchInput } from "@repo/ui/components/search-input";
import { SegmentedControl } from "@repo/ui/components/segmented-control";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { cn } from "@repo/ui/lib/cn";
import { usePageScrolled } from "@repo/libs/hooks";
import type { Taskset } from "@/lib/mock/tasksets";
import CreateTasksetDialog from "./create-taskset-dialog";
import TasksetCard from "./taskset-card";
import TasksetListRow, { TASKSET_LIST_GRID } from "./taskset-list-row";

// Tailwind `md:` breakpoint = 768px. Below this we force card view + collapse
// the filter row controls into a bottom sheet (wireframe §12 mobile).
const MOBILE_MEDIA_QUERY = "(max-width: 767px)";

type TabKey = "team" | "public";
type ViewKey = "cards" | "list";
type SortKey =
  | "starred-first"
  | "newest"
  | "oldest"
  | "last-activity"
  | "name-asc"
  | "name-desc"
  | "most-tasks";
type GroupKey = "none" | "owner" | "environment";

const SORT_OPTIONS: ReadonlyArray<{ value: SortKey; label: string }> = [
  { value: "starred-first", label: "Starred first" },
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  // Mock-equivalent of "last activity" per wireframe §7: no Job-run timestamp
  // on Taskset; treat as alias for "Newest first" until real activity lands.
  { value: "last-activity", label: "Last activity" },
  { value: "name-asc", label: "Name (A–Z)" },
  { value: "name-desc", label: "Name (Z–A)" },
  { value: "most-tasks", label: "Most tasks" },
];

const GROUP_OPTIONS: ReadonlyArray<{ value: GroupKey; label: string }> = [
  { value: "none", label: "None" },
  // Environment grouping is wireframed but Taskset has no env reference in mock;
  // fall back to Owner-only grouping. TODO: per-Environment grouping when the
  // Environment relation lands on Taskset.
  { value: "environment", label: "Environment" },
  { value: "owner", label: "Owner" },
];

const OWNER_FILTER_THRESHOLD = 10;

function parseView(v: string | null): ViewKey {
  return v === "list" ? "list" : "cards";
}

function parseSort(v: string | null): SortKey {
  const match = SORT_OPTIONS.find((opt) => opt.value === v);
  return match ? match.value : "starred-first";
}

function parseTab(v: string | null): TabKey {
  return v === "public" ? "public" : "team";
}

function parseGroup(v: string | null): GroupKey {
  const match = GROUP_OPTIONS.find((opt) => opt.value === v);
  return match ? match.value : "none";
}

interface TasksetsIndexProps {
  tasksets: ReadonlyArray<Taskset>;
}

export default function TasksetsIndex({ tasksets }: TasksetsIndexProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeTab = parseTab(searchParams.get("tab"));
  const view = parseView(searchParams.get("view"));
  const sortKey = parseSort(searchParams.get("sort"));
  const groupKey = parseGroup(searchParams.get("group"));

  const [query, setQuery] = useState("");
  const [searchInputKey, setSearchInputKey] = useState(0);
  const [ownerFilter, setOwnerFilter] = useState<ReadonlyArray<string>>([]);
  const [toggledStars, setToggledStars] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [collapsedGroups, setCollapsedGroups] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Drives the mobile branches below (forced cards, hidden inline controls,
  // bottom-sheet filter trigger, icon-only create CTA). matchMedia avoids
  // window resize-listener noise; the listener fires only on threshold cross.
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MEDIA_QUERY);
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const stickyRef = useRef<HTMLDivElement>(null);
  const scrolled = usePageScrolled({ ref: stickyRef });

  const toggleStar = (id: string) => {
    setToggledStars((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleGroupCollapsed = (key: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const starStateFor = (t: Taskset) => {
    const flipped = toggledStars.has(t.id);
    const isStarred = flipped ? !t.isStarred : t.isStarred;
    let delta = 0;
    if (isStarred && !t.isStarred) delta = 1;
    else if (!isStarred && t.isStarred) delta = -1;
    return { isStarred, count: t.starCount + delta };
  };

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value === null) next.delete(key);
    else next.set(key, value);
    const qs = next.toString();
    router.replace(qs ? `/tasksets?${qs}` : "/tasksets", { scroll: false });
  };

  const tabScope = useMemo(
    () =>
      tasksets.filter((t) =>
        activeTab === "public"
          ? t.visibility === "public"
          : t.ownership === "team" || t.ownership === "user",
      ),
    [tasksets, activeTab],
  );

  const distinctOwners = useMemo(() => {
    const set = new Set<string>();
    for (const t of tabScope) set.add(t.ownerName);
    return [...set].sort();
  }, [tabScope]);

  const showOwnerFilter =
    activeTab === "team" && distinctOwners.length >= OWNER_FILTER_THRESHOLD;

  // List view is forbidden below md; URL `?view=list` is preserved so the
  // selection survives rotation back to desktop. See wireframe §12.
  const effectiveView: ViewKey = isMobile ? "cards" : view;

  // Mobile filter trigger badge — count of non-default controls in the sheet.
  // (View toggle is excluded; it does not appear in the sheet.)
  const activeFilterCount =
    (sortKey === "starred-first" ? 0 : 1) +
    (groupKey === "none" ? 0 : 1) +
    (showOwnerFilter && ownerFilter.length > 0 ? 1 : 0);

  const visible = useMemo(() => {
    // When the owner filter would be hidden but selections exist, ignore them
    // so collapsing the control doesn't silently filter the list.
    const effective = showOwnerFilter ? ownerFilter : [];
    const q = query.trim().toLowerCase();
    let rows = tabScope.filter((t) => {
      if (q && !t.name.toLowerCase().includes(q)) return false;
      if (effective.length > 0 && !effective.includes(t.ownerName)) {
        return false;
      }
      return true;
    });

    rows = [...rows].sort((a, b) => {
      switch (sortKey) {
        case "starred-first": {
          const aStar = a.isStarred ? 1 : 0;
          const bStar = b.isStarred ? 1 : 0;
          if (aStar !== bStar) return bStar - aStar;
          return a.createdOrder - b.createdOrder;
        }
        case "newest":
        case "last-activity":
          return a.createdOrder - b.createdOrder;
        case "oldest":
          return b.createdOrder - a.createdOrder;
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "most-tasks":
          return b.taskCount - a.taskCount;
        default:
          return 0;
      }
    });

    return rows;
  }, [tabScope, query, ownerFilter, showOwnerFilter, sortKey]);

  const tabCounts = useMemo(
    () => ({
      team: tasksets.filter(
        (t) => t.ownership === "team" || t.ownership === "user",
      ).length,
      public: tasksets.filter((t) => t.visibility === "public").length,
    }),
    [tasksets],
  );

  if (tasksets.length === 0) {
    return <EmptyTeamState />;
  }

  const searchPlaceholder =
    activeTab === "team"
      ? "Search team Tasksets…"
      : "Search public Tasksets…";

  const ownerOptions = distinctOwners.map((name) => ({
    value: name,
    label: name,
  }));

  return (
    // --chrome-h is the rendered height of the sticky chrome below
    // (pt-6 24 + h1 32 + tabs mt-4 16 + tabs 37 + border-b 1 = 110px = 6.875rem).
    // Drives the list-view column header's pinned top so the two stickies sit
    // flush with no overlap/gap jump. Update both together if chrome shape changes.
    <div
      className="isolate flex flex-col pb-10 [--chrome-h:6.875rem]"
    >
      <div
        ref={stickyRef}
        // Sticky chrome — page header + tab bar pin to the top of the (app)
        // scroll container. pt-* lives INSIDE the sticky element so its top
        // edge sits at scroll y=0; outer padding would push it down and cause
        // visible creep before pin. z-page-chrome (=20) lifts above in-page
        // siblings (filter row + SegmentedControl + grouped cards) whose
        // nested utilities can raise effective stacking; safe because outer
        // wrap has `isolate` so body-portaled overlays (Dialog, Select Popper,
        // MultiSelect Popover) still paint above. See
        // docs/conventions/position-sticky.md.
        //
        // Chrome (bg + border + shadow) is FULL-BLEED across <main>; only the
        // visible header content is capped at 1536 via the inner wrapper. See
        // docs/design/guidelines/app-shell-layout.md §2.
        className={cn(
          "sticky top-0 z-page-chrome bg-panel pt-6",
          // Scroll-cue: border slot is always occupied (border-b) so flipping
          // border-color does not shift layout. Mirrors DialogHeader.
          "border-b",
          scrolled ? "border-border" : "border-transparent",
          scrolled ? "shadow-scroll-cue" : "shadow-none",
          "transition-[border-color,box-shadow] prop-(--motion-state-change)",
        )}
      >
        <div className="page-shell block py-0">
          <header className="flex items-center justify-between gap-3 md:gap-6">
            <h1 className="text-display font-semibold text-foreground">
              {/* TODO: docs icon `[?]` per wireframe §2 — URL contract unconfirmed. */}
              Tasksets
            </h1>
            <CreateTasksetDialog
              trigger={
                isMobile ? (
                  <IconButton aria-label="New Taskset">
                    <Plus aria-hidden="true" />
                  </IconButton>
                ) : undefined
              }
            />
          </header>

          <Tabs
            value={activeTab}
            onValueChange={(v) => updateParam("tab", v === "team" ? null : v)}
            className="mt-4 gap-0"
          >
            <TabsList variant="underline">
              <TabsTrigger value="public">
                Public
                <span className="ml-1.5 font-mono text-caption tabular-nums text-muted-foreground">
                  {tabCounts.public}
                </span>
                <span className="sr-only"> items</span>
              </TabsTrigger>
              <TabsTrigger value="team">
                My Team
                <span className="ml-1.5 font-mono text-caption tabular-nums text-muted-foreground">
                  {tabCounts.team}
                </span>
                <span className="sr-only"> items</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Mobile (<md): search takes its own full-width row, then a single
        bottom-sheet trigger below. Desktop (md+): inline filter row matching
        the original layout. Selections written via updateParam in both modes
        — the sheet is a presentation switch, not a separate data flow. */}
      <div className="page-shell py-0 gap-4 mt-6 md:flex-row md:flex-wrap md:items-center">
        <div className="w-full md:min-w-40 md:flex-1 md:max-w-xs">
          <SearchInput
            key={searchInputKey}
            defaultValue=""
            onValueChange={setQuery}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
          />
        </div>

        <span className="hidden text-label text-muted-foreground sm:inline">
          {visible.length} of {tabScope.length}
        </span>

        {isMobile ? (
          <Drawer
            direction="bottom"
            open={mobileFiltersOpen}
            onOpenChange={setMobileFiltersOpen}
          >
            <DrawerTrigger asChild>
              <Button variant="secondary" className="w-fit">
                <SlidersHorizontal aria-hidden="true" className="size-3.5" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="font-mono tabular-nums text-meta text-foreground">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </DrawerTrigger>
            <DrawerContent size="md">
              <DrawerHeader>
                <DrawerTitle>Filters</DrawerTitle>
              </DrawerHeader>
              <DrawerBody>
                <MobileFiltersSheetBody
                  sortKey={sortKey}
                  groupKey={groupKey}
                  showOwnerFilter={showOwnerFilter}
                  ownerOptions={ownerOptions}
                  ownerFilter={ownerFilter}
                  onSortChange={(v) =>
                    updateParam("sort", v === "starred-first" ? null : v)
                  }
                  onGroupChange={(v) =>
                    updateParam("group", v === "none" ? null : v)
                  }
                  onOwnerChange={setOwnerFilter}
                />
              </DrawerBody>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button variant="primary" className="w-full">
                    Done
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        ) : (
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {showOwnerFilter && (
              <div className="min-w-40">
                <MultiSelect
                  options={ownerOptions}
                  value={[...ownerFilter]}
                  onValueChange={(v) => setOwnerFilter(v)}
                  placeholder="Owner: Anyone"
                  searchPlaceholder="Search owners…"
                  maxChips={1}
                />
              </div>
            )}
            <SegmentedControl
              aria-label="View"
              value={view}
              onValueChange={(v) =>
                updateParam("view", v === "cards" ? null : v)
              }
            >
              <SegmentedControl.Item value="cards" aria-label="Card view">
                <LayoutGrid aria-hidden="true" className="size-3.5" />
              </SegmentedControl.Item>
              <SegmentedControl.Item value="list" aria-label="List view">
                <List aria-hidden="true" className="size-3.5" />
              </SegmentedControl.Item>
            </SegmentedControl>
            <Select
              value={sortKey}
              onValueChange={(v) =>
                updateParam("sort", v === "starred-first" ? null : v)
              }
            >
              <SelectTrigger aria-label="Sort tasksets" className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={groupKey}
              onValueChange={(v) =>
                updateParam("group", v === "none" ? null : v)
              }
            >
              <SelectTrigger aria-label="Group by" className="w-36">
                <SelectValue placeholder="Group by" />
              </SelectTrigger>
              <SelectContent align="end">
                {GROUP_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {`Group by ${opt.label}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* TODO: pagination per wireframe §9 — mock data fits in one page. */}
      <div className="page-shell block py-0 mt-4">
        <Results
          visible={visible}
          view={effectiveView}
          groupKey={groupKey}
          query={query}
          tab={activeTab}
          starStateFor={starStateFor}
          onToggleStar={toggleStar}
          collapsedGroups={collapsedGroups}
          onToggleGroup={toggleGroupCollapsed}
          onClearSearch={() => {
            setQuery("");
            // SearchInput is uncontrolled — remount so the input field also clears.
            setSearchInputKey((k) => k + 1);
          }}
        />
      </div>
    </div>
  );
}

interface ResultsProps {
  visible: ReadonlyArray<Taskset>;
  view: ViewKey;
  groupKey: GroupKey;
  query: string;
  tab: TabKey;
  starStateFor: (t: Taskset) => { isStarred: boolean; count: number };
  onToggleStar: (id: string) => void;
  collapsedGroups: ReadonlySet<string>;
  onToggleGroup: (key: string) => void;
  onClearSearch: () => void;
}

function Results({
  visible,
  view,
  groupKey,
  query,
  tab,
  starStateFor,
  onToggleStar,
  collapsedGroups,
  onToggleGroup,
  onClearSearch,
}: ResultsProps) {
  if (visible.length === 0) {
    const trimmed = query.trim();
    if (trimmed.length > 0) {
      return (
        <EmptyState
          variant="no-results"
          title={`No Tasksets match "${trimmed}"`}
          cta={
            <Button type="button" variant="secondary" onClick={onClearSearch}>
              Clear search
            </Button>
          }
        />
      );
    }
    return (
      <EmptyState
        variant="no-results"
        title="No Tasksets match your filters"
        subtitle="Try clearing the owner filter or switching tabs."
      />
    );
  }

  // Environment grouping falls back to Owner grouping for now — no env data
  // exists on Taskset in the mock. TODO: real Environment relation.
  const effectiveGroup: GroupKey = groupKey === "environment" ? "owner" : groupKey;

  if (effectiveGroup === "none") {
    return (
      <ResultsBody
        visible={visible}
        view={view}
        tab={tab}
        starStateFor={starStateFor}
        onToggleStar={onToggleStar}
      />
    );
  }

  const groups = groupBy(visible, (t) => t.ownerName);

  return (
    <div className="flex flex-col gap-6">
      {groups.map(({ key, items }) => {
        const collapsed = collapsedGroups.has(key);
        return (
          <section key={key} className="flex flex-col gap-3">
            <button
              type="button"
              aria-expanded={!collapsed}
              onClick={() => onToggleGroup(key)}
              className="flex items-center gap-2 border-b border-border pb-2 text-left text-body font-medium text-foreground hover:text-foreground"
            >
              {collapsed ? (
                <ChevronRight aria-hidden="true" className="size-4" />
              ) : (
                <ChevronDown aria-hidden="true" className="size-4" />
              )}
              <span>{key}</span>
              <span className="font-mono text-meta tabular-nums text-muted-foreground">
                ({items.length})
              </span>
            </button>
            {!collapsed && (
              <ResultsBody
                visible={items}
                view={view}
                tab={tab}
                starStateFor={starStateFor}
                onToggleStar={onToggleStar}
              />
            )}
          </section>
        );
      })}
    </div>
  );
}

function ResultsBody({
  visible,
  view,
  tab,
  starStateFor,
  onToggleStar,
}: {
  visible: ReadonlyArray<Taskset>;
  view: ViewKey;
  tab: TabKey;
  starStateFor: (t: Taskset) => { isStarred: boolean; count: number };
  onToggleStar: (id: string) => void;
}) {
  if (view === "cards") {
    return (
      <ul
        aria-label="Tasksets"
        className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        {visible.map((t) => {
          const star = starStateFor(t);
          return (
            <li key={t.id}>
              <TasksetCard
                taskset={t}
                tab={tab}
                isStarred={star.isStarred}
                starCount={star.count}
                onToggleStar={() => onToggleStar(t.id)}
              />
            </li>
          );
        })}
      </ul>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      {/* Sticky column header (wireframe §6) — sits just below the sticky
        tab-bar block. Pinned top derives from --chrome-h (set on the outer
        wrap) so the two stickies stay flush regardless of which one we tune
        next. */}
      <div
        role="row"
        className={cn(
          TASKSET_LIST_GRID,
          "sticky top-(--chrome-h) z-[5] items-center gap-6 bg-field-rest px-4 py-2 text-label text-muted-foreground",
        )}
      >
        <div className="min-w-0 truncate">Taskset</div>
        <div className="hidden min-w-0 truncate lg:block">
          Top models (Avg)
        </div>
        <div className="justify-self-start">Star</div>
        <div className="justify-self-end">Tasks</div>
        <div className="justify-self-end">Models</div>
      </div>
      <ul aria-label="Tasksets" className="flex flex-col gap-4">
        {visible.map((t) => {
          const star = starStateFor(t);
          return (
            <li key={t.id}>
              <TasksetListRow
                taskset={t}
                tab={tab}
                isStarred={star.isStarred}
                starCount={star.count}
                onToggleStar={() => onToggleStar(t.id)}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function groupBy(
  items: ReadonlyArray<Taskset>,
  key: (t: Taskset) => string,
): ReadonlyArray<{ key: string; items: ReadonlyArray<Taskset> }> {
  const map = new Map<string, Array<Taskset>>();
  for (const t of items) {
    const k = key(t);
    const arr = map.get(k);
    if (arr) arr.push(t);
    else map.set(k, [t]);
  }
  return [...map.entries()]
    .map(([k, v]) => ({ key: k, items: v }))
    .sort((a, b) => a.key.localeCompare(b.key));
}

interface MobileFiltersSheetBodyProps {
  sortKey: SortKey;
  groupKey: GroupKey;
  showOwnerFilter: boolean;
  ownerOptions: ReadonlyArray<{ value: string; label: string }>;
  ownerFilter: ReadonlyArray<string>;
  onSortChange: (next: SortKey) => void;
  onGroupChange: (next: GroupKey) => void;
  onOwnerChange: (next: ReadonlyArray<string>) => void;
}

function MobileFiltersSheetBody({
  sortKey,
  groupKey,
  showOwnerFilter,
  ownerOptions,
  ownerFilter,
  onSortChange,
  onGroupChange,
  onOwnerChange,
}: MobileFiltersSheetBodyProps) {
  return (
    <div className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-label text-muted-foreground">Sort</legend>
        <div role="radiogroup" aria-label="Sort tasksets" className="flex flex-col gap-1">
          {SORT_OPTIONS.map((opt) => {
            const id = `mfilter-sort-${opt.value}`;
            const checked = sortKey === opt.value;
            return (
              <label
                key={opt.value}
                htmlFor={id}
                className="flex cursor-pointer items-center gap-3 py-1"
              >
                <input
                  id={id}
                  type="radio"
                  name="mfilter-sort"
                  value={opt.value}
                  checked={checked}
                  onChange={() => onSortChange(opt.value)}
                  className="size-4 accent-primary"
                />
                <span className="text-body text-foreground">{opt.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-label text-muted-foreground">Group by</legend>
        <div role="radiogroup" aria-label="Group tasksets" className="flex flex-col gap-1">
          {GROUP_OPTIONS.map((opt) => {
            const id = `mfilter-group-${opt.value}`;
            const checked = groupKey === opt.value;
            return (
              <label
                key={opt.value}
                htmlFor={id}
                className="flex cursor-pointer items-center gap-3 py-1"
              >
                <input
                  id={id}
                  type="radio"
                  name="mfilter-group"
                  value={opt.value}
                  checked={checked}
                  onChange={() => onGroupChange(opt.value)}
                  className="size-4 accent-primary"
                />
                <span className="text-body text-foreground">{opt.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {showOwnerFilter && (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-label text-muted-foreground">Owner</legend>
          <MultiSelect
            options={[...ownerOptions]}
            value={[...ownerFilter]}
            onValueChange={(v) => onOwnerChange(v)}
            placeholder="Anyone"
            searchPlaceholder="Search owners…"
          />
        </fieldset>
      )}
    </div>
  );
}

function EmptyTeamState() {
  return (
    <div className="flex flex-col items-center px-8 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-secondary-surface text-muted-foreground">
        <ListChecks aria-hidden="true" className="size-6" />
      </div>
      <h2 className="mt-4 text-subtitle font-semibold text-foreground">
        Create your first Taskset
      </h2>
      <div className="mt-4 w-full max-w-md">
        {/* TBD: exact CLI command per wireframe §17 item 1; placeholder. */}
        <CodeBlock variant="inline" code="hud taskset new" />
      </div>
      <div className="mt-4 flex flex-col items-center gap-3">
        <CreateTasksetDialog />
        <Link
          href="https://docs.hud.ai/concepts/tasksets"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-label text-muted-foreground hover:text-foreground"
        >
          Read the docs
          <ArrowUpRight aria-hidden="true" className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
