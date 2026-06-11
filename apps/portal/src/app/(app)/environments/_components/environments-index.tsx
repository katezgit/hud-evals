"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  BookOpen,
  LayoutGrid,
  List,
  Plus,
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
import { IconButton } from "@repo/ui/components/icon-button";
import { MultiSelect } from "@repo/ui/components/multi-select";
import { SearchInput } from "@repo/ui/components/search-input";
import { SegmentedControl } from "@repo/ui/components/segmented-control";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { cn } from "@repo/ui/lib/cn";
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

const SORT_OPTIONS: ReadonlyArray<{ value: SortKey; label: string }> = [
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
  const [sortKey, setSortKey] = useState<SortKey>("starred-first");
  const [groupKey, setGroupKey] = useState<GroupKey>("none");
  const [typeFilter, setTypeFilter] =
    useState<ReadonlyArray<EnvType>>(ALL_TYPE_VALUES);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [filtersSheetOpen, setFiltersSheetOpen] = useState(false);

  // matchMedia-driven mobile flag. Justified despite the no-single-use-hook
  // rule because the forced-list branch at mobile drives different JSX (no
  // EnvCard subtree at mobile) and the filters trigger replaces the desktop
  // control cluster — CSS-only would duplicate the entire results landmark
  // and break `aria-label="Environments"` uniqueness.
  const isMobile = useIsMobileViewport();

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
    let rows = tabScope.filter((env) => {
      if (q) {
        const haystack =
          `${env.name} ${env.organization} ${env.description}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (typeSet.size > 0 && !typeSet.has(env.type)) return false;
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
  }, [tabScope, debouncedQuery, typeFilter, sortKey]);

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
      : "Search team Environments…";

  const sortLabel =
    SORT_OPTIONS.find((opt) => opt.value === sortKey)?.label ?? "Sort";
  const groupLabel =
    GROUP_OPTIONS.find((opt) => opt.value === groupKey)?.label ?? "None";
  const typeFilterLabel = formatTypeFilterLabel(typeFilter);

  // Mobile-only badge count: non-default control states. Owner filter not
  // implemented yet (spec §13 + brief: "skip until owner filter exists").
  const mobileFiltersActiveCount =
    (typeFilter.length !== ALL_TYPE_VALUES.length ? 1 : 0) +
    (sortKey !== "starred-first" ? 1 : 0) +
    (groupKey !== "none" ? 1 : 0);

  // List view is forced at mobile. Spec §13: the toggle is not a preference
  // the user adjusts on mobile; storage is preserved so resizing up restores
  // their last-chosen view.
  const effectiveView: ViewKey = isMobile ? "list" : view;

  return (
    <div className="isolate flex flex-col px-4 pb-10 md:px-8">
      {/* Sticky chrome — pt-10 lives inside the sticky element so its natural
          top sits at scroll y=0. The single sticky container holds page header
          + activity bar + tab strip so they pin as one band (no second offset
          to compute). The TabsList's own `w-fit` underline (variant=underline)
          carries the lower-edge separation with the active-tab indicator
          painting on top. z-page-chrome (=20) matches env-detail-shell so the
          pinned chrome paints above tab-content stickies (z-sticky=10) and any
          raw z-10/z-20 inside scrolling siblings; body-portaled popovers /
          dialogs / toasts use higher tiers (z-overlay=50) and still win. */}
      {/* `will-change:transform` promotes the sticky band to its own
          compositor layer in Chromium, eliminating the subpixel jitter that
          can appear when scrolling causes the sticky element to repaint
          against the cards underneath. */}
      <div className="sticky top-0 z-page-chrome bg-background pt-6 md:pt-10 will-change-transform">
        {/* Header row holds ONLY H1 + docs icon + CTA (mobile icon-only or
            desktop labeled). `items-center` aligns the `+` button vertically
            with the H1 row — never with the composite header block. The
            activity bar below is a sibling, not a child of this flex row. */}
        <header className="flex items-center justify-between gap-3 md:gap-6">
          <div className="flex items-center gap-2">
            <h1 className="text-display font-semibold text-foreground">
              Environments
            </h1>
            <Link
              href="https://docs.hud.ai/platform/environments"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Environments documentation, opens in new tab"
              className="inline-flex items-center justify-center rounded-sm text-muted-foreground hover:text-foreground focus-visible:shadow-focus-ring outline-hidden"
            >
              <BookOpen aria-hidden="true" className="size-3.5" />
            </Link>
          </div>
          {/* Mobile: icon-only `+` (spec §13 decision 1). Tablet+ keeps the
              full-label primary button. Two elements with CSS visibility —
              IconButton requires `aria-label` at the type level. */}
          <IconButton
            asChild
            variant="primary"
            aria-label="New Environment"
            className="md:hidden"
          >
            <Link href="/environments/new">
              <Plus aria-hidden="true" />
            </Link>
          </IconButton>
          <Button asChild variant="primary" className="hidden md:inline-flex">
            <Link href="/environments/new">
              <Plus aria-hidden="true" className="size-3.5" />
              New Environment
            </Link>
          </Button>
        </header>

        <ActivityBar runs={visibleRuns} activeNow={activity.activeNow} />

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as TabKey)}
          className="mt-4 gap-0"
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

      {/* Mobile filter row — search (row A) + `[⚙ Filters]` trigger (row B).
          Stacks full-width, scrolls with content per spec §13. */}
      <div className="mt-4 flex flex-col gap-2 md:hidden">
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
            mobileFiltersActiveCount > 0 && "bg-selected",
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

      {/* Desktop / tablet filter row. View toggle, type filter, sort, group by
          all visible here. Hidden at mobile in favor of the bottom-sheet
          trigger above. */}
      <div className="isolate mt-6 hidden flex-wrap items-center gap-3 md:flex">
        <div className="min-w-40 flex-1">
          <SearchInput
            defaultValue=""
            onValueChange={setDebouncedQuery}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="w-40">
            <MultiSelect
              options={TYPE_OPTIONS.map((o) => ({
                value: o.value,
                label: o.label,
              }))}
              value={[...typeFilter]}
              onValueChange={(v) =>
                setTypeFilter(v as ReadonlyArray<EnvType>)
              }
              placeholder={typeFilterLabel}
              searchPlaceholder="Filter types…"
              selectAllLabel="All types"
              clearLabel="Clear"
            />
          </div>

          <SegmentedControl
            aria-label="View"
            value={view}
            onValueChange={(v) => updateView(v as ViewKey)}
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
                onValueChange={(v) => setSortKey(v as SortKey)}
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
                onValueChange={(v) => setGroupKey(v as GroupKey)}
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

      <div className="mt-4 md:mt-6">
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
