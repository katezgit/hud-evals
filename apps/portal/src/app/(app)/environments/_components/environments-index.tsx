"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  List,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { EmptyState } from "@repo/ui/components/empty-state";
import { MultiSelect } from "@repo/ui/components/multi-select";
import { SearchInput } from "@repo/ui/components/search-input";
import { SegmentedControl } from "@repo/ui/components/segmented-control";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { cn } from "@repo/ui/lib/cn";
import { usePageScrolled } from "@repo/libs/hooks";
import type {
  EnvActivity,
  EnvType,
  Environment,
} from "../[id]/_data/types";
import { EnvCard } from "./env-card";
import { EnvRow } from "./env-row";
import type {
  GroupKey,
  SortKey,
  TabKey,
  ViewKey,
} from "./environments-index-types";
import { MobileFiltersSheet } from "./mobile-filters-sheet";

// My Team default sort. "Last active" is timestamp-based (lastActiveAt) and
// communicates operational state at team scale; sortable as a control alongside
// the rest. Explore has no sort control surface — it sorts runsLast24h
// descending by default ("last-activity") with no user-facing dropdown.
const SORT_OPTIONS: ReadonlyArray<{ value: SortKey; label: string }> = [
  { value: "last-active", label: "Last active" },
  { value: "starred-first", label: "Starred first" },
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "last-activity", label: "Last activity" },
  { value: "name-asc", label: "Name (A–Z)" },
  { value: "name-desc", label: "Name (Z–A)" },
  { value: "most-scenarios", label: "Most scenarios" },
  { value: "most-tools", label: "Most tools" },
];

const GROUP_OPTIONS: ReadonlyArray<{ value: GroupKey; label: string }> = [
  { value: "none", label: "None" },
  { value: "type", label: "Type" },
  { value: "owner", label: "Owner" },
];

const TYPE_OPTIONS: ReadonlyArray<{ value: EnvType; label: string }> = [
  { value: "browser", label: "Browser" },
  { value: "code-swe", label: "Code / SWE" },
  { value: "os-desktop", label: "OS / Desktop" },
  { value: "domain", label: "Domain-specific" },
  { value: "custom", label: "Custom" },
];

const ALL_TYPE_VALUES: ReadonlyArray<EnvType> = TYPE_OPTIONS.map((o) => o.value);

const VIEW_STORAGE_KEY = "hud.environments.view";

// Per-tab default sort. Explore has no surface for the user to change sort,
// so its key maps onto the existing runsLast24h-descending behaviour
// ("last-activity"). My Team defaults to timestamp-based "last-active"
// (the new key).
const DEFAULT_SORT_BY_TAB: Record<TabKey, SortKey> = {
  explore: "last-activity",
  team: "last-active",
};

// Owner values come from the team-tab scope only; deduped + first-seen order.
// Used both for the initial ownerFilter state (lazy init) and the dropdown
// options so the "all selected" default and the option list stay aligned.
function deriveTeamOwnerValues(
  environments: ReadonlyArray<Environment>,
): ReadonlyArray<string> {
  const seen = new Set<string>();
  const ordered: Array<string> = [];
  for (const env of environments) {
    if (env.visibility !== "team") continue;
    if (seen.has(env.owner)) continue;
    seen.add(env.owner);
    ordered.push(env.owner);
  }
  return ordered;
}

interface EnvironmentsIndexProps {
  environments: ReadonlyArray<Environment>;
  activity: EnvActivity;
}

export function EnvironmentsIndex({
  environments,
  activity,
}: EnvironmentsIndexProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("explore");
  // View defaults to grid for SSR parity, then hydrates from localStorage on
  // the client so a returning user lands on their last choice without a
  // hydration mismatch warning.
  const [view, setView] = useState<ViewKey>("grid");
  const [sortKey, setSortKey] = useState<SortKey>(
    DEFAULT_SORT_BY_TAB.explore,
  );
  const [groupKey, setGroupKey] = useState<GroupKey>("none");
  const [typeFilter, setTypeFilter] =
    useState<ReadonlyArray<EnvType>>(ALL_TYPE_VALUES);
  // Default = all team owners selected (mirrors typeFilter's full-set
  // convention). Empty array is the user's explicit "clear" state, not the
  // initial state. Lazy init so the derivation runs once per mount.
  const [ownerFilter, setOwnerFilter] = useState<ReadonlyArray<string>>(
    () => deriveTeamOwnerValues(environments),
  );
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [filtersSheetOpen, setFiltersSheetOpen] = useState(false);

  // Tab-aware filter bar: state does not survive a tab switch (Explore has no
  // Type/Owner controls, so carrying Team selections onto Explore would mean
  // the user sees a filtered set with no UI to clear it). Reset to the
  // per-tab defaults whenever activeTab changes; the search query is shared
  // (both bars expose it) so it survives.
  const handleTabChange = (next: TabKey) => {
    setActiveTab(next);
    setSortKey(DEFAULT_SORT_BY_TAB[next]);
    setGroupKey("none");
    setTypeFilter(ALL_TYPE_VALUES);
    setOwnerFilter(allOwnerValues);
  };

  // matchMedia-driven mobile flag. Justified despite the no-single-use-hook
  // rule because the forced-list branch at mobile drives different JSX (no
  // EnvCard subtree at mobile) and the filters trigger replaces the desktop
  // control cluster — CSS-only would duplicate the entire results landmark
  // and break `aria-label="Environments"` uniqueness.
  const isMobile = useIsMobileViewport();

  const stickyRef = useRef<HTMLDivElement>(null);
  const scrolled = usePageScrolled({ ref: stickyRef });

  useEffect(() => {
    const stored = window.localStorage.getItem(VIEW_STORAGE_KEY);
    if (stored === "list" || stored === "grid") setView(stored);
  }, []);

  const updateView = (next: ViewKey) => {
    setView(next);
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, next);
    } catch {
      // localStorage may be unavailable (private mode, quota); the state has
      // already updated above, so we degrade to session-only persistence.
    }
  };

  const toggleGroup = (key: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const tabCounts = useMemo(
    () => ({
      explore: environments.filter((e) => e.visibility === "public").length,
      team: environments.filter((e) => e.visibility === "team").length,
    }),
    [environments],
  );

  const tabScope = useMemo(
    () =>
      environments.filter((env) =>
        activeTab === "explore"
          ? env.visibility === "public"
          : env.visibility === "team",
      ),
    [environments, activeTab],
  );

  const visible = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    const typeSet = new Set(typeFilter);
    // Owner filter only applies on Team — Explore envs have owners outside
    // the team-owner set, so the default "all team owners selected" state
    // would hide every public env. Empty selection on Team = user explicitly
    // cleared; surface that via the muted "All owners" placeholder and treat
    // it as "no owner filter applied" (parity with the Type-filter all-set
    // convention).
    const ownerSet = new Set(ownerFilter);
    const ownerFilterActive =
      activeTab === "team" && ownerSet.size > 0;
    let rows = tabScope.filter((env) => {
      if (q) {
        const haystack =
          `${env.name} ${env.organization} ${env.description}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (typeSet.size > 0 && !typeSet.has(env.type)) return false;
      if (ownerFilterActive && !ownerSet.has(env.owner)) return false;
      return true;
    });

    rows = [...rows].sort((a, b) => {
      switch (sortKey) {
        case "starred-first": {
          const aStar = a.isStarred ? 1 : 0;
          const bStar = b.isStarred ? 1 : 0;
          if (aStar !== bStar) return bStar - aStar;
          return b.starCount - a.starCount;
        }
        case "newest":
          return b.name.localeCompare(a.name);
        case "oldest":
          return a.name.localeCompare(b.name);
        case "last-active":
          return b.lastActiveAt - a.lastActiveAt;
        case "last-activity":
          return b.runsLast24h - a.runsLast24h;
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "most-scenarios":
          return b.scenarios.length - a.scenarios.length;
        case "most-tools":
          return b.tools.length - a.tools.length;
        default:
          return 0;
      }
    });

    return rows;
  }, [tabScope, debouncedQuery, typeFilter, ownerFilter, sortKey, activeTab]);

  // Owner options come from the team-tab scope so the dropdown only lists
  // owners that actually have envs in the visible catalog. Deduped + ordered
  // by appearance to match the canonical TEAM_OWNERS ordering when present.
  const allOwnerValues = useMemo(
    () => deriveTeamOwnerValues(environments),
    [environments],
  );

  const ownerOptions = useMemo(
    () => allOwnerValues.map((value) => ({ value, label: value })),
    [allOwnerValues],
  );

  // Activity total reflects the currently-visible set so the header bar
  // narrows alongside the user's filters (Alex monitoring "Browser envs"
  // expects 'X runs/24 hours' to mean exactly that slice). `activeNow` is
  // sourced from the page-level fixture for now — when a real live counter
  // lands it will replace `activity.activeNow` directly.
  const visibleRuns = useMemo(
    () => visible.reduce((sum, env) => sum + env.runsLast24h, 0),
    [visible],
  );

  const searchPlaceholder =
    activeTab === "explore"
      ? "Search public Environments…"
      : "Search your team's Environments…";

  const sortLabel =
    SORT_OPTIONS.find((opt) => opt.value === sortKey)?.label ?? "Sort";
  const groupLabel =
    GROUP_OPTIONS.find((opt) => opt.value === groupKey)?.label ?? "None";
  const typeFilterLabel = formatTypeFilterLabel(typeFilter);

  // Mobile-only badge count: non-default control states. Compared to the
  // per-tab default sort because My Team now defaults to last-active rather
  // than starred-first. Owner filter is reflected on the team tab only.
  const tabDefaultSort = DEFAULT_SORT_BY_TAB[activeTab];
  const mobileFiltersActiveCount =
    (typeFilter.length !== ALL_TYPE_VALUES.length ? 1 : 0) +
    (sortKey !== tabDefaultSort ? 1 : 0) +
    (groupKey !== "none" ? 1 : 0) +
    (activeTab === "team" && ownerFilter.length !== allOwnerValues.length
      ? 1
      : 0);

  // List view is forced at mobile. Spec §13: the toggle is not a preference
  // the user adjusts on mobile; storage is preserved so resizing up restores
  // their last-chosen view.
  const effectiveView: ViewKey = isMobile ? "list" : view;

  return (
    <div className="isolate flex flex-col pb-10">
      {/* Activity bar — meta strip subordinate to the page H1 (which lives in
          page.tsx). Sits OUTSIDE the sticky band so the H1 + stats read as
          one title block at scroll-top; only the tab strip pins. */}
      <div className="page-shell block py-0">
        <ActivityBar runs={visibleRuns} activeNow={activity.activeNow} />
      </div>

      {/* Sticky chrome — tab strip only. The page H1 + CTA live in the route's
          page.tsx and the activity meta strip sits above; both scroll away.
          The TabsList's own `w-fit` underline (variant=underline) carries the
          lower-edge separation with the active-tab indicator painting on top.
          z-page-chrome (=20) matches env-detail-shell so the pinned chrome
          paints above tab-content stickies (z-sticky=10) and any raw z-10/z-20
          inside scrolling siblings; body-portaled popovers / dialogs / toasts
          use higher tiers (z-overlay=50) and still win.

          Chrome (bg + border + shadow) is FULL-BLEED across <main>; only the
          visible header content is capped at 1536 via the inner wrapper. See
          docs/design/guidelines/app-shell-layout.md §2.

          `will-change:transform` promotes the sticky band to its own
          compositor layer in Chromium, eliminating the subpixel jitter that
          can appear when scrolling causes the sticky element to repaint
          against the cards underneath. */}
      <div
        ref={stickyRef}
        className={cn(
          "sticky top-0 z-page-chrome bg-panel mt-4 pt-2 will-change-transform",
          // Scroll-cue: border slot is always occupied (border-b) so flipping
          // border-color does not shift layout. Mirrors DialogHeader.
          "border-b",
          scrolled ? "border-border" : "border-transparent",
          scrolled ? "shadow-scroll-cue" : "shadow-none",
          "transition-[border-color,box-shadow] prop-(--motion-state-change)",
        )}
      >
        <div className="page-shell block py-0">
          <Tabs
            value={activeTab}
            onValueChange={(v) => handleTabChange(v as TabKey)}
            className="gap-0"
          >
            <TabsList variant="underline">
              <TabsTrigger value="explore">
                Explore
                <span className="ml-1.5 font-mono text-caption tabular-nums text-muted-foreground">
                  {tabCounts.explore}
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

      {/* Mobile filter row — search (row A) + `[⚙ Filters]` trigger (row B).
          Stacks full-width, scrolls with content per spec §13. */}
      <div className="page-shell py-0 gap-2 mt-4 md:hidden">
        <SearchInput
          defaultValue=""
          onValueChange={setDebouncedQuery}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
        />
        <Button
          variant="secondary"
          className={cn(
            "w-full justify-between",
            mobileFiltersActiveCount > 0 && "bg-selected-surface",
          )}
          aria-label={
            mobileFiltersActiveCount > 0
              ? `Filters, ${mobileFiltersActiveCount} active`
              : "Filters"
          }
          aria-haspopup="dialog"
          aria-expanded={filtersSheetOpen}
          onClick={() => setFiltersSheetOpen(true)}
        >
          <span className="inline-flex items-center gap-2">
            <SlidersHorizontal aria-hidden="true" className="size-3.5" />
            Filters
            {mobileFiltersActiveCount > 0 && (
              <span
                aria-hidden="true"
                className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 font-mono text-meta tabular-nums text-primary-foreground"
              >
                {mobileFiltersActiveCount}
              </span>
            )}
          </span>
          <ChevronDown aria-hidden="true" className="size-3.5" />
        </Button>
      </div>

      {/* Desktop / tablet filter row — tab-aware. Each tab gets its own bar:
          Explore renders search + view toggle (no type/group/sort dropdowns —
          see refinement HTML, n=9 makes them noise). My Team renders the full
          control set including the Owner filter, with the default sort flipped
          to "Last active". State is parent-owned so the bar components stay
          presentational. */}
      <div className="page-shell block py-0">
      {activeTab === "explore" ? (
        <ExploreFilterBar
          searchPlaceholder={searchPlaceholder}
          onSearchChange={setDebouncedQuery}
          view={view}
          onViewChange={updateView}
        />
      ) : (
        <TeamFilterBar
          searchPlaceholder={searchPlaceholder}
          onSearchChange={setDebouncedQuery}
          view={view}
          onViewChange={updateView}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          typeFilterLabel={typeFilterLabel}
          ownerOptions={ownerOptions}
          ownerFilter={ownerFilter}
          onOwnerFilterChange={setOwnerFilter}
          ownerFilterLabel={formatOwnerFilterLabel(
            ownerFilter,
            allOwnerValues.length,
          )}
          sortKey={sortKey}
          onSortKeyChange={setSortKey}
          sortLabel={sortLabel}
          groupKey={groupKey}
          onGroupKeyChange={setGroupKey}
          groupLabel={groupLabel}
        />
      )}
      </div>

      <div className="page-shell block py-0 mt-4 md:mt-6">
        <Results
          visible={visible}
          view={effectiveView}
          groupKey={groupKey}
          collapsedGroups={collapsedGroups}
          onToggleGroup={toggleGroup}
          query={debouncedQuery}
          hasTypeFilter={typeFilter.length !== ALL_TYPE_VALUES.length}
          onClearSearch={() => setDebouncedQuery("")}
          onClearTypeFilter={() => setTypeFilter(ALL_TYPE_VALUES)}
        />
      </div>

      <MobileFiltersSheet
        open={filtersSheetOpen}
        onOpenChange={setFiltersSheetOpen}
        typeOptions={TYPE_OPTIONS}
        sortOptions={SORT_OPTIONS}
        groupOptions={GROUP_OPTIONS}
        typeFilter={typeFilter}
        sortKey={sortKey}
        groupKey={groupKey}
        onApply={({ typeFilter: t, sortKey: s, groupKey: g }) => {
          setTypeFilter(t);
          setSortKey(s);
          setGroupKey(g);
        }}
      />
    </div>
  );
}

// SSR-safe via useSyncExternalStore: server snapshot returns false so the
// server HTML and the client first paint agree; flips on the first client
// commit if the viewport is actually below md.
function useIsMobileViewport(): boolean {
  return useSyncExternalStore(
    subscribeMobileMedia,
    getMobileMediaSnapshot,
    getMobileMediaServerSnapshot,
  );
}

const MOBILE_MEDIA_QUERY = "(max-width: 767.98px)";

function subscribeMobileMedia(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const mql = window.matchMedia(MOBILE_MEDIA_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getMobileMediaSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
}

function getMobileMediaServerSnapshot(): boolean {
  return false;
}

function formatTypeFilterLabel(types: ReadonlyArray<EnvType>): string {
  if (types.length === ALL_TYPE_VALUES.length) return "All types";
  if (types.length === 0) return "No types";
  if (types.length === 1) {
    const opt = TYPE_OPTIONS.find((o) => o.value === types[0]);
    return opt ? opt.label : "1 type";
  }
  return `${types.length} types`;
}

function formatOwnerFilterLabel(
  owners: ReadonlyArray<string>,
  totalOwners: number,
): string {
  if (owners.length === 0 || owners.length === totalOwners) return "All owners";
  if (owners.length === 1) return owners[0] ?? "1 owner";
  return `${owners.length} owners`;
}

// ── Tab-aware desktop filter bars ───────────────────────────────────────────
// Two flavours of the same control row, split by composition rather than
// configuration. State lives in the parent — these are presentational shells.

interface CommonBarProps {
  searchPlaceholder: string;
  onSearchChange: (q: string) => void;
  view: ViewKey;
  onViewChange: (v: ViewKey) => void;
}

function ExploreFilterBar({
  searchPlaceholder,
  onSearchChange,
  view,
  onViewChange,
}: CommonBarProps) {
  return (
    <div className="isolate mt-6 hidden flex-wrap items-center gap-4 md:flex">
      <div className="min-w-40 flex-1 md:max-w-xs">
        <SearchInput
          defaultValue=""
          onValueChange={onSearchChange}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <SegmentedControl
          aria-label="View"
          value={view}
          onValueChange={(v) => onViewChange(v as ViewKey)}
        >
          <SegmentedControl.Item value="grid" aria-label="Grid view">
            <LayoutGrid aria-hidden="true" className="size-3.5" />
          </SegmentedControl.Item>
          <SegmentedControl.Item value="list" aria-label="List view">
            <List aria-hidden="true" className="size-3.5" />
          </SegmentedControl.Item>
        </SegmentedControl>
      </div>
    </div>
  );
}

interface TeamFilterBarProps extends CommonBarProps {
  typeFilter: ReadonlyArray<EnvType>;
  onTypeFilterChange: (v: ReadonlyArray<EnvType>) => void;
  typeFilterLabel: string;
  ownerOptions: ReadonlyArray<{ value: string; label: string }>;
  ownerFilter: ReadonlyArray<string>;
  onOwnerFilterChange: (v: ReadonlyArray<string>) => void;
  ownerFilterLabel: string;
  sortKey: SortKey;
  onSortKeyChange: (v: SortKey) => void;
  sortLabel: string;
  groupKey: GroupKey;
  onGroupKeyChange: (v: GroupKey) => void;
  groupLabel: string;
}

function TeamFilterBar({
  searchPlaceholder,
  onSearchChange,
  view,
  onViewChange,
  typeFilter,
  onTypeFilterChange,
  typeFilterLabel,
  ownerOptions,
  ownerFilter,
  onOwnerFilterChange,
  ownerFilterLabel,
  sortKey,
  onSortKeyChange,
  sortLabel,
  groupKey,
  onGroupKeyChange,
  groupLabel,
}: TeamFilterBarProps) {
  return (
    <div className="isolate mt-6 hidden flex-wrap items-center gap-4 md:flex">
      <div className="min-w-40 flex-1 md:max-w-xs">
        <SearchInput
          defaultValue=""
          onValueChange={onSearchChange}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="w-40">
          <MultiSelect
            options={TYPE_OPTIONS.map((o) => ({
              value: o.value,
              label: o.label,
            }))}
            value={[...typeFilter]}
            onValueChange={(v) =>
              onTypeFilterChange(v as ReadonlyArray<EnvType>)
            }
            placeholder={typeFilterLabel}
            searchPlaceholder="Filter types…"
            selectAllLabel="All types"
            clearLabel="Clear"
          />
        </div>

        <div className="w-44">
          <MultiSelect
            options={ownerOptions.map((o) => ({ value: o.value, label: o.label }))}
            value={[...ownerFilter]}
            onValueChange={(v) =>
              onOwnerFilterChange(v as ReadonlyArray<string>)
            }
            placeholder={ownerFilterLabel}
            searchPlaceholder="Filter owners…"
            selectAllLabel="All owners"
            clearLabel="Clear"
          />
        </div>

        <SegmentedControl
          aria-label="View"
          value={view}
          onValueChange={(v) => onViewChange(v as ViewKey)}
        >
          <SegmentedControl.Item value="grid" aria-label="Grid view">
            <LayoutGrid aria-hidden="true" className="size-3.5" />
          </SegmentedControl.Item>
          <SegmentedControl.Item value="list" aria-label="List view">
            <List aria-hidden="true" className="size-3.5" />
          </SegmentedControl.Item>
        </SegmentedControl>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" aria-label="Sort">
              <SortGlyph />
              {sortLabel}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup
              value={sortKey}
              onValueChange={(v) => onSortKeyChange(v as SortKey)}
            >
              {SORT_OPTIONS.map((opt) => (
                <DropdownMenuRadioItem key={opt.value} value={opt.value}>
                  {opt.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              aria-label="Group by"
              className={cn(groupKey !== "none" && "bg-selected")}
            >
              Group by {groupLabel}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup
              value={groupKey}
              onValueChange={(v) => onGroupKeyChange(v as GroupKey)}
            >
              {GROUP_OPTIONS.map((opt) => (
                <DropdownMenuRadioItem key={opt.value} value={opt.value}>
                  {opt.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function ActivityBar({
  runs,
  activeNow,
}: {
  runs: number;
  activeNow: number;
}) {
  if (runs === 0 && activeNow === 0) {
    return (
      <p className="mt-2 font-mono text-meta text-muted-foreground">
        No runs/24 hours
      </p>
    );
  }
  const runsLabel = runs > 0 ? `${runs} runs/24 hours` : "No runs/24 hours";
  return (
    <p className="mt-2 font-mono text-meta text-muted-foreground tabular-nums">
      <span>{runsLabel}</span>
      <span aria-hidden="true" className="mx-1.5">
        &middot;
      </span>
      <span aria-live="polite">{activeNow} active now</span>
    </p>
  );
}

interface ResultsProps {
  visible: ReadonlyArray<Environment>;
  view: ViewKey;
  groupKey: GroupKey;
  collapsedGroups: ReadonlySet<string>;
  onToggleGroup: (key: string) => void;
  query: string;
  hasTypeFilter: boolean;
  onClearSearch: () => void;
  onClearTypeFilter: () => void;
}

function Results({
  visible,
  view,
  groupKey,
  collapsedGroups,
  onToggleGroup,
  query,
  hasTypeFilter,
  onClearSearch,
  onClearTypeFilter,
}: ResultsProps) {
  if (visible.length === 0) {
    const trimmed = query.trim();
    if (trimmed.length > 0) {
      return (
        <EmptyState
          variant="no-results"
          title={`No Environments match "${trimmed}"`}
          cta={
            <Button variant="secondary" onClick={onClearSearch}>
              Clear search
            </Button>
          }
        />
      );
    }
    if (hasTypeFilter) {
      return (
        <EmptyState
          variant="no-results"
          title="No Environments match the selected types."
          cta={
            <Button
              variant="secondary"
              onClick={onClearTypeFilter}
            >
              Clear type filter
            </Button>
          }
        />
      );
    }
    return (
      <EmptyState
        variant="no-results"
        title="No Environments match your filters"
        subtitle="Try clearing filters or switching tabs."
      />
    );
  }

  if (groupKey === "none") {
    return <ResultsBody visible={visible} view={view} />;
  }

  const groups = groupEnvironments(visible, groupKey);
  return (
    <div className="flex flex-col gap-6">
      {groups.map(({ key, label, rows }) => {
        const collapsed = collapsedGroups.has(key);
        return (
          <section
            key={key}
            aria-label={`${label}, ${rows.length} Environments`}
          >
            <button
              type="button"
              aria-expanded={!collapsed}
              onClick={() => onToggleGroup(key)}
              className="mb-3 inline-flex w-full items-center gap-2 rounded-md py-1 text-left text-subtitle font-semibold text-foreground transition-colors duration-fast hover:text-foreground/90"
            >
              {collapsed ? (
                <ChevronRight
                  aria-hidden="true"
                  className="size-4 text-muted-foreground"
                />
              ) : (
                <ChevronDown
                  aria-hidden="true"
                  className="size-4 text-muted-foreground"
                />
              )}
              <span>{label}</span>
              <span className="font-mono text-meta tabular-nums text-muted-foreground">
                ({rows.length})
              </span>
            </button>
            {!collapsed && <ResultsBody visible={rows} view={view} />}
          </section>
        );
      })}
    </div>
  );
}

function ResultsBody({
  visible,
  view,
}: {
  visible: ReadonlyArray<Environment>;
  view: ViewKey;
}) {
  if (view === "list") {
    return (
      <ul aria-label="Environments" className="flex flex-col gap-4">
        {visible.map((env) => (
          <li key={env.id}>
            <EnvRow
              env={env}
              isStarred={env.isStarred}
              starCount={env.starCount}
            />
          </li>
        ))}
      </ul>
    );
  }
  return (
    <ul
      aria-label="Environments"
      className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
    >
      {visible.map((env) => (
        <li key={env.id}>
          <EnvCard
            env={env}
            isStarred={env.isStarred}
            starCount={env.starCount}
          />
        </li>
      ))}
    </ul>
  );
}

function groupEnvironments(
  rows: ReadonlyArray<Environment>,
  key: GroupKey,
): ReadonlyArray<{
  key: string;
  label: string;
  rows: ReadonlyArray<Environment>;
}> {
  if (key === "type") {
    const buckets = new Map<EnvType, Array<Environment>>();
    for (const env of rows) {
      const bucket = buckets.get(env.type) ?? [];
      bucket.push(env);
      buckets.set(env.type, bucket);
    }
    return TYPE_OPTIONS.filter((opt) => buckets.has(opt.value)).map((opt) => ({
      key: `type:${opt.value}`,
      label: opt.label,
      rows: buckets.get(opt.value) ?? [],
    }));
  }
  // Owner grouping — preserve first-seen order so familiar orgs stay near
  // the top of the list rather than being alphabetised away.
  const order: Array<string> = [];
  const buckets = new Map<string, Array<Environment>>();
  for (const env of rows) {
    if (!buckets.has(env.organization)) {
      buckets.set(env.organization, []);
      order.push(env.organization);
    }
    buckets.get(env.organization)?.push(env);
  }
  return order.map((org) => ({
    key: `owner:${org}`,
    label: org,
    rows: buckets.get(org) ?? [],
  }));
}

function SortGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="size-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 3v10" />
      <path d="M2 11l2 2 2-2" />
      <path d="M12 13V3" />
      <path d="M10 5l2-2 2 2" />
    </svg>
  );
}
