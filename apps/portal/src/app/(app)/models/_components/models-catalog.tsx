"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CheckIcon } from "lucide-react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { EmptyState } from "@repo/ui/components/empty-state";
import { MultiSelect } from "@repo/ui/components/multi-select";
import { SearchInput } from "@repo/ui/components/search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/tabs";
import {
  tableBodyClass,
  tableCellVariants,
  tableClass,
  tableHeaderClass,
  tableHeadVariants,
  tableRowVariants,
} from "@repo/ui/components/table";
import { CopyButton } from "@repo/ui/components/copy-button";
import { StarCount } from "@repo/ui/components/star-count";
import { VisibilityIcon } from "@repo/ui/components/visibility-icon";
import { cn } from "@repo/ui/lib/cn";
import {
  catalogModels,
  maxTokensPerSecond,
  modelProviders,
  type CatalogModel,
  type ModelProvider,
} from "@/lib/mock/explore-models";
import ProviderIcon from "./provider-icon";
import SpeedBar from "./speed-bar";
import UnknownIndicator from "./unknown-indicator";
import UsageSparkline from "./usage-sparkline";

type SortKey =
  | "most-used"
  | "most-starred"
  | "most-recent"
  | "name-asc"
  | "provider"
  | "price-asc"
  | "price-desc";

const SORT_OPTIONS: ReadonlyArray<{ value: SortKey; label: string }> = [
  { value: "most-used", label: "Most used" },
  { value: "most-starred", label: "Most starred" },
  { value: "most-recent", label: "Most recent" },
  { value: "name-asc", label: "Name (A-Z)" },
  { value: "provider", label: "Provider" },
  { value: "price-asc", label: "Price (lowest)" },
  { value: "price-desc", label: "Price (highest)" },
];

// Two stacked <table>s (sticky header outside the scroll container, body
// inside) share widths via <colgroup>, so the percentages must match exactly
// between them. Tuned to the longest content in each column.
const COLUMN_WIDTHS = [
  "20%",
  "11%",
  "11%",
  "15%",
  "11%",
  "13%",
  "13%",
  "6%",
] as const;

interface Filters {
  providers: ReadonlySet<ModelProvider>;
  trainable: boolean;
  reasoning: boolean;
  favoritesOnly: boolean;
}

const INITIAL_FILTERS: Filters = {
  providers: new Set(),
  trainable: false,
  reasoning: false,
  favoritesOnly: false,
};

type TabKey = "all" | "mine";

function formatUsage(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return n.toString();
}

function formatPrice(n: number): string {
  if (Number.isInteger(n)) return `$${n}`;
  return `$${n.toFixed(n < 1 ? 2 : 1)}`;
}

// Shared between row filtering and the per-pill count probes (which call this
// with one toggle forced on) — kept at module scope so identity stays stable.
function matchesFilters(
  m: CatalogModel,
  f: Filters,
  q: string,
  favorites: ReadonlySet<string>,
): boolean {
  if (q && !m.name.toLowerCase().includes(q) && !m.modelId.toLowerCase().includes(q)) {
    return false;
  }
  if (f.providers.size > 0 && !f.providers.has(m.provider)) return false;
  if (f.trainable && !m.trainable) return false;
  if (f.reasoning && m.reasoning !== true) return false;
  if (f.favoritesOnly && !favorites.has(m.modelId)) return false;
  return true;
}

const columnHelper = createColumnHelper<CatalogModel>();

export default function ModelsCatalog() {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  // Split state: `inputQuery` mirrors the field synchronously so the box
  // never lags; `debouncedQuery` drives filtering + count probes.
  const [inputQuery, setInputQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const [sortKey, setSortKey] = useState<SortKey>("most-used");
  const [favorites, setFavorites] = useState<ReadonlySet<string>>(() => new Set());

  const tabScope = useMemo(() => {
    switch (activeTab) {
      case "mine":
        return catalogModels.filter((m) => m.isPrivate);
      case "all":
      default:
        return catalogModels;
    }
  }, [activeTab]);

  const visibleRows = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    const filtered = tabScope.filter((m) => matchesFilters(m, filters, q, favorites));

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      switch (sortKey) {
        case "most-used":
          return b.usage - a.usage;
        case "most-starred": {
          const aFav = favorites.has(a.modelId) ? 1 : 0;
          const bFav = favorites.has(b.modelId) ? 1 : 0;
          if (aFav !== bFav) return bFav - aFav;
          return b.usage - a.usage;
        }
        case "most-recent":
          // Fixture order doubles as recency — top of catalogModels is newest.
          return catalogModels.indexOf(a) - catalogModels.indexOf(b);
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "provider":
          return a.provider.localeCompare(b.provider) || a.name.localeCompare(b.name);
        case "price-asc":
          return a.priceIn - b.priceIn;
        case "price-desc":
          return b.priceIn - a.priceIn;
        default:
          return 0;
      }
    });

    return sorted;
  }, [debouncedQuery, filters, sortKey, favorites, tabScope]);

  const toggleFavorite = (modelId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(modelId)) {
        next.delete(modelId);
      } else {
        next.add(modelId);
      }
      return next;
    });
  };

  const updateFilters = (patch: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const clearAllFilters = () => {
    setInputQuery("");
    setFilters(INITIAL_FILTERS);
  };

  const handleTabChange = (next: TabKey) => {
    setActiveTab(next);
    setInputQuery("");
    setFilters(INITIAL_FILTERS);
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Model",
        cell: (info) => {
          const m = info.row.original;
          return (
            <div className="flex items-start gap-2">
              <ProviderIcon provider={m.provider} className="mt-0.5" />
              <div className="flex min-w-0 flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/models/${m.modelId}`}
                    className="text-body font-medium text-foreground hover:underline"
                  >
                    {m.name}
                  </Link>
                  {m.isPrivate ? <VisibilityIcon visibility="private" /> : null}
                </div>
                <div className="flex items-center gap-1">
                  <code className="font-mono text-caption text-muted-foreground">
                    {m.modelId}
                  </code>
                  <CopyButton value={m.modelId} ariaLabel="Copy model ID" />
                </div>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("provider", {
        header: "Provider",
        cell: (info) => (
          <span className="text-body text-muted-foreground">{info.getValue()}</span>
        ),
      }),
      columnHelper.display({
        id: "price",
        header: "Price / M",
        cell: (info) => (
          <span className="font-mono text-label tabular-nums text-foreground">
            {formatPrice(info.row.original.priceIn)}
            <span className="text-meta-foreground"> / </span>
            {formatPrice(info.row.original.priceOut)}
          </span>
        ),
        meta: { headerClassName: "text-right", cellClassName: "text-right" },
      }),
      columnHelper.accessor("tokensPerSecond", {
        header: "Speed",
        cell: (info) => {
          const v = info.getValue();
          return (
            <div className="flex items-center justify-start">
              {v === null ? (
                <UnknownIndicator label="Speed unknown" />
              ) : (
                <SpeedBar tokensPerSecond={v} max={maxTokensPerSecond} />
              )}
            </div>
          );
        },
        meta: { headerClassName: "text-left", cellClassName: "text-left" },
      }),
      columnHelper.accessor("reasoning", {
        header: "Reasoning",
        cell: (info) => {
          const v = info.getValue();
          let inner;
          if (v === "unknown") {
            inner = <UnknownIndicator label="Reasoning support unknown" />;
          } else if (v) {
            inner = (
              <CheckIcon
                aria-label="Reasoning: yes"
                role="img"
                className="size-3.5 text-state-scored-text"
              />
            );
          } else {
            inner = (
              <span aria-label="Reasoning: no" className="text-label text-muted-foreground">
                —
              </span>
            );
          }
          return <div className="flex items-center justify-center">{inner}</div>;
        },
        meta: { headerClassName: "text-center", cellClassName: "text-center" },
      }),
      columnHelper.accessor("trainable", {
        header: "Trainable",
        cell: (info) => (
          <div className="flex items-center justify-center">
            {info.getValue() ? (
              <CheckIcon
                aria-label="Trainable: yes"
                role="img"
                className="size-3.5 text-state-scored-text"
              />
            ) : (
              <span aria-label="Trainable: no" className="text-label text-muted-foreground">
                —
              </span>
            )}
          </div>
        ),
        meta: { headerClassName: "text-center", cellClassName: "text-center" },
      }),
      columnHelper.accessor("usage", {
        header: "Usage",
        cell: (info) => (
          <div className="flex items-center gap-2">
            <UsageSparkline data={info.row.original.usageSparkline} />
            <span className="font-mono text-label tabular-nums text-foreground">
              {formatUsage(info.getValue())}
            </span>
          </div>
        ),
      }),
      columnHelper.display({
        id: "favorite",
        header: () => <span className="sr-only">Favorite</span>,
        cell: (info) => {
          const m = info.row.original;
          const isFav = favorites.has(m.modelId);
          // Star count is synthesized from `usage` so the catalog fixture stays
          // untouched; favoriting bumps the visible count by 1 to match the
          // pressed/unpressed state.
          const stars = Math.max(1, Math.round(m.usage / 50_000)) + (isFav ? 1 : 0);
          return (
            <StarCount
              count={stars}
              pressed={isFav}
              onPressedChange={() => toggleFavorite(m.modelId)}
              label={m.name}
              size="sm"
            />
          );
        },
        meta: { cellClassName: "px-2" },
      }),
    ],
    [favorites],
  );

  const table = useReactTable({
    data: visibleRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Sticky-header shadow lifts once the body scrolls past the top edge —
  // mirrors the Dialog / Drawer convention from the design system.
  const scrollBodyRef = useRef<HTMLDivElement | null>(null);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const el = scrollBodyRef.current;
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 0);
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const activeFilterCount =
    (filters.providers.size > 0 ? 1 : 0) +
    (filters.trainable ? 1 : 0) +
    (filters.reasoning ? 1 : 0) +
    (filters.favoritesOnly ? 1 : 0);
  const hasActiveFilters = activeFilterCount > 0 || inputQuery.trim().length > 0;
  const resultCountLabel = hasActiveFilters
    ? `${visibleRows.length} of ${tabScope.length}`
    : `${tabScope.length} models`;

  // Probe counts shown on each toggle pill: "if I flip this filter on, how
  // many rows survive?" — forces the target filter on, keeps the rest intact.
  const toggleCounts = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    const countWith = (override: Partial<Filters>): number => {
      const probe = { ...filters, ...override };
      return tabScope.reduce(
        (n, m) => (matchesFilters(m, probe, q, favorites) ? n + 1 : n),
        0,
      );
    };
    return {
      trainable: countWith({ trainable: true }),
      reasoning: countWith({ reasoning: true }),
      favorites: countWith({ favoritesOnly: true }),
    };
  }, [filters, tabScope, debouncedQuery, favorites]);

  const providerArray = useMemo(() => Array.from(filters.providers), [filters.providers]);
  const providerOptions = useMemo<{ value: string; label: string }[]>(
    () => modelProviders.map((p) => ({ value: p, label: p })),
    [],
  );

  // Counts reflect each tab's universe BEFORE filter narrowing, so the badge
  // stays stable while filters change.
  const tabCounts = useMemo(
    () => ({
      all: catalogModels.length,
      mine: catalogModels.filter((m) => m.isPrivate).length,
    }),
    [],
  );

  return (
    <div className="flex flex-col gap-6">
      <Tabs
        value={activeTab}
        onValueChange={(v) => handleTabChange(v as TabKey)}
        className="gap-0"
      >
        <TabsList variant="underline">
          <TabsTrigger value="all">
            All models
            <Badge variant="neutral" size="sm" className="ml-1.5 tabular-nums">
              {tabCounts.all}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="mine">
            My models
            <Badge variant="neutral" size="sm" className="ml-1.5 tabular-nums">
              {tabCounts.mine}
            </Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Actionbar + table = one visual cluster (toolbar shapes its dataset). */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-64 flex-none">
            <SearchInput
              size="sm"
              defaultValue=""
              onLiveChange={setInputQuery}
              onValueChange={setDebouncedQuery}
              placeholder="Search models…"
              aria-label="Search models"
            />
          </div>

          <MultiSelect
            size="sm"
            options={providerOptions}
            value={providerArray}
            onValueChange={(v) =>
              updateFilters({ providers: new Set(v as ModelProvider[]) })
            }
            placeholder="Provider"
            searchPlaceholder="Search providers…"
            className="w-44"
          />

          <ToggleFilterChip
            label="Trainable"
            active={filters.trainable}
            count={toggleCounts.trainable}
            onToggle={() => updateFilters({ trainable: !filters.trainable })}
          />

          <ToggleFilterChip
            label="Reasoning"
            active={filters.reasoning}
            count={toggleCounts.reasoning}
            onToggle={() => updateFilters({ reasoning: !filters.reasoning })}
          />

          <ToggleFilterChip
            label="Favorites"
            active={filters.favoritesOnly}
            count={toggleCounts.favorites}
            onToggle={() =>
              updateFilters({ favoritesOnly: !filters.favoritesOnly })
            }
          />

          <div className="ml-auto flex items-center gap-2">
            <span className="text-label text-muted-foreground">
              {resultCountLabel}
            </span>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-label text-primary cursor-pointer hover:underline"
              >
                Clear all
              </button>
            ) : null}
            <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
              <SelectTrigger size="sm" aria-label="Sort by" className="w-44">
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
          </div>
        </div>

        {/* Header and body live in two stacked <table>s sharing widths via
            <colgroup>. Header sits outside the scroll container so the vertical
            scrollbar is bounded by the body region and never collides with the
            sticky <th>. */}
        <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className={cn(tableClass, "table-fixed")}>
          <colgroup>
            {COLUMN_WIDTHS.map((w, i) => (
              <col key={i} style={{ width: w }} />
            ))}
          </colgroup>
          <thead
            className={cn(
              tableHeaderClass,
              "relative z-sticky border-b transition-[border-color,box-shadow] prop-(--motion-state-change)",
              scrolled ? "border-border shadow-2" : "border-transparent shadow-none",
            )}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as
                    | { headerClassName?: string }
                    | undefined;
                  return (
                    <th
                      key={header.id}
                      className={cn(
                        tableHeadVariants({ density: "compact" }),
                        meta?.headerClassName,
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
        </table>
        <div
          ref={scrollBodyRef}
          className="max-h-[calc(100vh-18rem)] overflow-y-auto"
        >
          <table className={cn(tableClass, "table-fixed")}>
            <colgroup>
              {COLUMN_WIDTHS.map((w, i) => (
                <col key={i} style={{ width: w }} />
              ))}
            </colgroup>
            <tbody className={tableBodyClass}>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="p-0">
                    <EmptyState
                      variant="no-results"
                      title="No models match your filters"
                      subtitle="Try clearing the search or relaxing the provider filter."
                    />
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={tableRowVariants({ density: "compact" })}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const meta = cell.column.columnDef.meta as
                        | { cellClassName?: string }
                        | undefined;
                      return (
                        <td
                          key={cell.id}
                          className={cn(
                            tableCellVariants({ density: "compact" }),
                            meta?.cellClassName,
                          )}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        </div>
      </div>
    </div>
  );
}

function ToggleFilterChip({
  label,
  active,
  count,
  onToggle,
}: {
  label: string;
  active: boolean;
  count: number;
  onToggle: () => void;
}) {
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      aria-pressed={active}
      onClick={onToggle}
      className={cn(active && "bg-selected hover:bg-selected")}
    >
      {label}
      {count > 0 ? (
        <span
          className={cn(
            "font-mono text-meta tabular-nums",
            active ? "text-foreground" : "text-meta-foreground",
          )}
        >
          {count}
        </span>
      ) : null}
    </Button>
  );
}
