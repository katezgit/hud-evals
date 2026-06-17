"use client";

import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { CheckIcon, SlidersHorizontalIcon } from "lucide-react";
import {
  type Column,
  type ColumnPinningState,
  type VisibilityState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Checkbox } from "@repo/ui/components/checkbox";
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
import { FilterChip } from "@repo/ui/components/filter-chip";
import { MultiSelect } from "@repo/ui/components/multi-select";
import { SearchInput } from "@repo/ui/components/search-input";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/tabs";
import {
  tableBodyClass,
  tableCellVariants,
  tableClass,
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

// Single-source-of-truth breakpoint: below 1024px the catalog collapses to a
// one-column mobile list + bottom-sheet filters. Drives column visibility,
// the name-cell inline meta, the filter UI swap, and the (currently-disabled
// at this scope) pinning state — keep them in sync via this constant.
const MOBILE_MEDIA_QUERY = "(max-width: 1023px)";

// Pixel sizes feed TanStack's column-pinning math (`column.getStart`,
// `getSize`). table-layout:fixed + width:100% lets columns expand
// proportionally on wide viewports while keeping minWidth = sum-of-sizes so
// the sticky-pin behavior has real horizontal overflow to anchor against on
// narrow screens. Tuned to the longest content in each column.
const COLUMN_SIZES = {
  name: 220,
  provider: 110,
  price: 110,
  speed: 144,
  reasoning: 100,
  trainable: 110,
  usage: 130,
  favorite: 60,
  // Private-tab-only columns. Sized to longest realistic content per column.
  baseModel: 180,
  avg: 90,
  tasksetCount: 110,
  status: 110,
  lastEvaluated: 140,
  owner: 130,
} as const;

// Canonical TanStack sticky-pinning helper. Pinned columns set position +
// left + z-index inline; unpinned columns get only width.
//
// z-index is inline (not via z-table-col / z-table-corner utilities) because
// twMerge does not recognise custom @utility classes as a "z-index" group,
// so it leaves both class declarations in the DOM and the wrong one wins on
// the cascade. Inline `zIndex` sidesteps the cascade entirely:
//   - pinned body cell  → 2  (over sibling unpinned <td>s during h-scroll)
//   - pinned header cell → 4  (over sibling unpinned <th>s AND the sticky thead row)
function getPinningStyles(
  column: Column<CatalogModel>,
  isHeader: boolean,
): CSSProperties {
  const isPinned = column.getIsPinned();
  const isLastLeftPinned =
    isPinned === "left" && column.getIsLastColumn("left");
  let zIndex: number | undefined;
  if (isPinned) zIndex = isHeader ? 4 : 2;
  return {
    boxShadow: isLastLeftPinned
      ? "inset -4px 0 4px -4px var(--color-border)"
      : undefined,
    left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
    position: isPinned ? "sticky" : undefined,
    zIndex,
    width: column.getSize(),
  };
}

interface Filters {
  providers: ReadonlySet<ModelProvider>;
  // Private tab only — IDs of allowed base models. Empty = no base filter.
  baseModelIds: ReadonlySet<string>;
  trainable: boolean;
  reasoning: boolean;
  favoritesOnly: boolean;
}

const INITIAL_FILTERS: Filters = {
  providers: new Set(),
  baseModelIds: new Set(),
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

const RELATIVE_MINUTE = 60_000;
const RELATIVE_HOUR = 60 * RELATIVE_MINUTE;
const RELATIVE_DAY = 24 * RELATIVE_HOUR;
const RELATIVE_MONTH = 30 * RELATIVE_DAY;
const RELATIVE_YEAR = 365 * RELATIVE_DAY;

function formatRelative(iso: string): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return iso;
  const delta = Date.now() - then;
  if (delta < RELATIVE_MINUTE) return "just now";
  if (delta < RELATIVE_HOUR) return `${Math.floor(delta / RELATIVE_MINUTE)} min ago`;
  if (delta < RELATIVE_DAY) return `${Math.floor(delta / RELATIVE_HOUR)}h ago`;
  if (delta < RELATIVE_MONTH) return `${Math.floor(delta / RELATIVE_DAY)}d ago`;
  if (delta < RELATIVE_YEAR) return `${Math.floor(delta / RELATIVE_MONTH)}mo ago`;
  return `${Math.floor(delta / RELATIVE_YEAR)}y ago`;
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
  if (f.baseModelIds.size > 0) {
    if (!m.baseModelId || !f.baseModelIds.has(m.baseModelId)) return false;
  }
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
  const [favorites, setFavorites] = useState<ReadonlySet<string>>(() => new Set());
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Mobile viewport drives column visibility, the name-cell inline meta, and
  // the toolbar swap (chips + sort → bottom-sheet trigger). matchMedia lives
  // here once; downstream values derive.
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MEDIA_QUERY);
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

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
    return tabScope.filter((m) => matchesFilters(m, filters, q, favorites));
  }, [debouncedQuery, filters, favorites, tabScope]);

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

  const isPrivateTab = activeTab === "mine";

  const publicColumns = useMemo(
    () => [
      columnHelper.accessor("name", {
        id: "name",
        header: "Model",
        size: COLUMN_SIZES.name,
        cell: (info) => {
          const m = info.row.original;
          // Mobile: hide modelId + copy + lock, render provider label + price
          // inline + capability badges stacked under the name. Desktop: keep
          // the existing two-line name/id layout.
          if (isMobile) {
            return (
              <div className="flex items-start gap-2">
                <ProviderIcon provider={m.provider} className="mt-0.5 shrink-0" />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Link
                      href={`/models/${m.modelId}`}
                      className="text-body font-medium text-foreground hover:underline truncate"
                    >
                      {m.name}
                    </Link>
                    {m.isPrivate && <VisibilityIcon visibility="private" />}
                  </div>
                  <div className="text-caption text-muted-foreground">
                    {m.provider}
                  </div>
                  {(m.reasoning === true || m.trainable) && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {m.reasoning === true && (
                        <span className="inline-flex items-center gap-1 rounded-sm bg-muted-surface px-1.5 py-0.5 text-meta text-foreground">
                          <CheckIcon
                            aria-hidden="true"
                            className="size-3 text-state-scored-text"
                          />
                          Reasoning
                        </span>
                      )}
                      {m.trainable && (
                        <span className="inline-flex items-center gap-1 rounded-sm bg-muted-surface px-1.5 py-0.5 text-meta text-foreground">
                          <CheckIcon
                            aria-hidden="true"
                            className="size-3 text-state-scored-text"
                          />
                          Trainable
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          }
          return (
            <div className="flex items-start gap-2">
              <ProviderIcon provider={m.provider} className="mt-0.5 shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/models/${m.modelId}`}
                    className="text-body font-medium text-foreground hover:underline truncate"
                  >
                    {m.name}
                  </Link>
                  {m.isPrivate && <VisibilityIcon visibility="private" />}
                </div>
                <div className="flex items-center gap-0 -mt-1.5">
                  <code className="font-mono text-caption text-muted-foreground">
                    {m.modelId}
                  </code>
                  <CopyButton
                    value={m.modelId}
                    ariaLabel="Copy model ID"
                    className="row-action-reveal"
                  />
                </div>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("provider", {
        id: "provider",
        header: "Provider",
        size: COLUMN_SIZES.provider,
        cell: (info) => (
          <span className="text-body text-muted-foreground">{info.getValue()}</span>
        ),
      }),
      columnHelper.display({
        id: "price",
        header: "Price / M",
        size: COLUMN_SIZES.price,
        cell: (info) => (
          <span className="font-mono text-label tabular-nums text-foreground">
            {formatPrice(info.row.original.priceIn)}
            <span className="text-meta-foreground"> / </span>
            {formatPrice(info.row.original.priceOut)}
          </span>
        ),
        meta: {
          headerClassName: "text-right",
          cellClassName: "text-right",
        },
      }),
      columnHelper.accessor("tokensPerSecond", {
        id: "speed",
        header: "Speed",
        size: COLUMN_SIZES.speed,
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
        meta: {
          headerClassName: "text-left",
          cellClassName: "text-left",
        },
      }),
      columnHelper.accessor("reasoning", {
        id: "reasoning",
        header: "Reasoning",
        size: COLUMN_SIZES.reasoning,
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
        meta: {
          headerClassName: "text-center",
          cellClassName: "text-center",
        },
      }),
      columnHelper.accessor("trainable", {
        id: "trainable",
        header: "Trainable",
        size: COLUMN_SIZES.trainable,
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
        meta: {
          headerClassName: "text-center",
          cellClassName: "text-center",
        },
      }),
      columnHelper.accessor("usage", {
        id: "usage",
        header: "Usage",
        size: COLUMN_SIZES.usage,
        cell: (info) => (
          <div className="flex items-center justify-end gap-2">
            <UsageSparkline data={info.row.original.usageSparkline} />
            <span className="font-mono text-label tabular-nums text-foreground">
              {formatUsage(info.getValue())}
            </span>
          </div>
        ),
        meta: {
          headerClassName: "text-right",
        },
      }),
      columnHelper.display({
        id: "favorite",
        size: COLUMN_SIZES.favorite,
        header: "Stars",
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
        meta: {
          cellClassName: "px-2",
        },
      }),
    ],
    [favorites, isMobile],
  );

  // Private-tab column set. Base-foundation axes (price / speed / reasoning /
  // usage / stars) don't apply to user-trained Models — replace with eval-axis
  // columns (avg score, taskset count, status, last evaluated, owner).
  const privateColumns = useMemo(
    () => [
      columnHelper.accessor("name", {
        id: "name",
        header: "Model",
        size: COLUMN_SIZES.name,
        cell: (info) => {
          const m = info.row.original;
          return (
            <div className="flex items-start gap-2">
              <ProviderIcon provider={m.provider} className="mt-0.5 shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/models/${m.modelId}`}
                    className="text-body font-medium text-foreground hover:underline truncate"
                  >
                    {m.name}
                  </Link>
                  <VisibilityIcon visibility="private" />
                </div>
                <div className="flex items-center gap-0 -mt-1.5">
                  <code className="font-mono text-caption text-muted-foreground">
                    {m.modelId}
                  </code>
                  <CopyButton
                    value={m.modelId}
                    ariaLabel="Copy model ID"
                    className="row-action-reveal"
                  />
                </div>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("baseModelId", {
        id: "baseModel",
        header: "Base model",
        size: COLUMN_SIZES.baseModel,
        cell: (info) => {
          const baseId = info.getValue();
          if (baseId === undefined) {
            return <span className="text-meta-foreground">—</span>;
          }
          const base = catalogModels.find((m) => m.modelId === baseId);
          const label = base?.name ?? baseId;
          return (
            <Link
              href={`/models/${baseId}`}
              className="text-body text-muted-foreground hover:text-foreground hover:underline"
            >
              {label}
            </Link>
          );
        },
      }),
      columnHelper.accessor("avgScore", {
        id: "avg",
        header: "Avg",
        size: COLUMN_SIZES.avg,
        cell: (info) => {
          const v = info.getValue();
          if (v === undefined) {
            return (
              <span aria-label="No data" className="text-meta-foreground">
                —
              </span>
            );
          }
          return (
            <span className="font-mono tabular-nums text-foreground">
              {v.toFixed(1)}%
            </span>
          );
        },
        meta: {
          headerClassName: "text-right",
          cellClassName: "text-right",
        },
      }),
      columnHelper.accessor("tasksetCount", {
        id: "tasksetCount",
        header: "Tasksets",
        size: COLUMN_SIZES.tasksetCount,
        cell: (info) => {
          const v = info.getValue();
          if (v === undefined) {
            return (
              <span aria-label="No data" className="text-meta-foreground">
                —
              </span>
            );
          }
          return (
            <span className="font-mono tabular-nums text-foreground">{v}</span>
          );
        },
        meta: {
          headerClassName: "text-right",
          cellClassName: "text-right",
        },
      }),
      columnHelper.accessor("status", {
        id: "status",
        header: "Status",
        size: COLUMN_SIZES.status,
        cell: (info) => {
          const s = info.getValue();
          if (s === undefined) {
            return <span className="text-meta-foreground">—</span>;
          }
          const variant: "success" | "warning" | "destructive" =
            s === "ready" ? "success" : s === "pending" ? "warning" : "destructive";
          const label = s === "ready" ? "Ready" : s === "pending" ? "Pending" : "Failed";
          return (
            <Badge variant={variant} showDot>
              {label}
            </Badge>
          );
        },
      }),
      columnHelper.accessor("lastEvaluatedAt", {
        id: "lastEvaluated",
        header: "Last evaluated",
        size: COLUMN_SIZES.lastEvaluated,
        cell: (info) => {
          const iso = info.getValue();
          if (iso === undefined) {
            return <span className="text-meta-foreground">—</span>;
          }
          return (
            <span className="text-muted-foreground" title={iso}>
              {formatRelative(iso)}
            </span>
          );
        },
      }),
      columnHelper.accessor("ownerName", {
        id: "owner",
        header: "Owner",
        size: COLUMN_SIZES.owner,
        cell: (info) => {
          const name = info.getValue();
          if (name === undefined) {
            return <span className="text-meta-foreground">—</span>;
          }
          return <span className="text-muted-foreground">{name}</span>;
        },
      }),
    ],
    [],
  );

  const columns = isPrivateTab ? privateColumns : publicColumns;

  // Below 1024px the Price column stays visible alongside Model — the row
  // overflows the viewport horizontally, so pin Model left so users can
  // identify the row while scrolling to the price.
  const columnPinning: ColumnPinningState = isMobile
    ? { left: ["name"], right: [] }
    : { left: [], right: [] };
  const columnVisibility = useMemo<VisibilityState>(() => {
    if (!isMobile) return {};
    // Mobile keeps Model + the most-load-bearing decision column visible; the
    // rest hide and the row stays single-line. Private tab keeps Avg (score is
    // the decision axis for a trained model); All tab keeps Price.
    const hidden: VisibilityState = isPrivateTab
      ? {
          baseModel: false,
          tasksetCount: false,
          status: false,
          lastEvaluated: false,
          owner: false,
        }
      : {
          provider: false,
          speed: false,
          reasoning: false,
          trainable: false,
          usage: false,
          favorite: false,
        };
    return hidden;
  }, [isMobile, isPrivateTab]);

  const table = useReactTable({
    data: visibleRows,
    columns,
    state: { columnPinning, columnVisibility },
    getCoreRowModel: getCoreRowModel(),
  });

  const activeFilterCount =
    (filters.providers.size > 0 ? 1 : 0) +
    (filters.baseModelIds.size > 0 ? 1 : 0) +
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

  // Base model options derive from the distinct `baseModelId` values present on
  // private rows — Anthropic/OpenAI/Tinker/Bedrock fine-tunes the org has run.
  // Labels prefer the human-readable name from the catalog if the base also
  // exists as a public row; falls back to the raw ID otherwise.
  const baseModelOptions = useMemo<{ value: string; label: string }[]>(() => {
    const ids = new Set<string>();
    for (const m of catalogModels) {
      if (m.isPrivate && m.baseModelId) ids.add(m.baseModelId);
    }
    const nameById = new Map(catalogModels.map((m) => [m.modelId, m.name]));
    return Array.from(ids)
      .map((id) => ({ value: id, label: nameById.get(id) ?? id }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, []);
  const baseModelArray = useMemo(
    () => Array.from(filters.baseModelIds),
    [filters.baseModelIds],
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
            <span className="ml-1.5 font-mono text-meta tabular-nums text-meta-foreground">
              {tabCounts.all}
            </span>
          </TabsTrigger>
          <TabsTrigger value="mine">
            Private models
            <span className="ml-1.5 font-mono text-meta tabular-nums text-meta-foreground">
              {tabCounts.mine}
            </span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Actionbar + table = one visual cluster (toolbar shapes its dataset). */}
      <div className="flex flex-col gap-4">
        {/* Search row — always full-width on its own line below xl
            (xl:w-64 puts it back inline alongside the desktop chip cluster
            once there's room for both). */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-full flex-none xl:w-64">
            <SearchInput
              defaultValue=""
              onLiveChange={setInputQuery}
              onValueChange={setDebouncedQuery}
              placeholder="Search models…"
              aria-label="Search models"
            />
          </div>

          {/* Desktop-only chip cluster + sort. Hidden below xl — at lg the
              cluster wrapped into a broken 2-row layout (search + 3 chips
              then favorites + count + sort). Mobile/tablet use the bottom
              sheet below.

              Chip order on All tab (spec §3): Trainable → Reasoning →
              Provider → Favorites. Private tab swaps Trainable out (private
              models are training output — chip is degenerate) and Provider
              for Base model (all private are provider=HUD; lineage is the
              meaningful axis). */}
          <div className="hidden flex-1 flex-wrap items-center gap-2 xl:flex">
            {!isPrivateTab && (
              <FilterChip
                label="Trainable"
                selected={filters.trainable}
                count={toggleCounts.trainable}
                onSelectedChange={(next) => updateFilters({ trainable: next })}
              />
            )}

            <FilterChip
              label="Reasoning"
              selected={filters.reasoning}
              count={toggleCounts.reasoning}
              onSelectedChange={(next) => updateFilters({ reasoning: next })}
            />

            {isPrivateTab ? (
              <MultiSelect
                options={baseModelOptions}
                value={baseModelArray}
                onValueChange={(v) => {
                  const all = v.length === baseModelOptions.length;
                  updateFilters({
                    baseModelIds: all ? new Set() : new Set(v),
                  });
                }}
                placeholder="All Base models"
                searchPlaceholder="Search base models…"
                className="w-48"
              />
            ) : (
              <MultiSelect
                options={providerOptions}
                value={providerArray}
                // Treat full selection as "no filter" → keeps state lean and
                // collapses trigger label back to "All Providers".
                onValueChange={(v) => {
                  const all = v.length === providerOptions.length;
                  updateFilters({
                    providers: all ? new Set() : new Set(v as ModelProvider[]),
                  });
                }}
                placeholder="All Providers"
                searchPlaceholder="Search providers…"
                className="w-44"
              />
            )}

            <FilterChip
              label="Favorites"
              selected={filters.favoritesOnly}
              count={toggleCounts.favorites}
              onSelectedChange={(next) => updateFilters({ favoritesOnly: next })}
            />

            <div className="ml-auto flex items-center gap-2">
              <span className="text-label text-muted-foreground">
                {resultCountLabel}
              </span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-label text-primary cursor-pointer hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Mobile + tablet filter trigger. Result count + Clear all live
              inside the sheet header, not inline — keeps this row minimal. */}
          <div className="flex w-full items-center justify-between gap-2 xl:hidden">
            <Drawer
              direction="bottom"
              open={mobileFiltersOpen}
              onOpenChange={setMobileFiltersOpen}
            >
              <DrawerTrigger asChild>
                <Button type="button" variant="secondary">
                  <SlidersHorizontalIcon aria-hidden="true" className="size-3.5" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="font-mono text-meta tabular-nums text-foreground">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </DrawerTrigger>
              <DrawerContent size="md">
                <DrawerHeader>
                  <div className="flex flex-col gap-1">
                    <DrawerTitle>Filters</DrawerTitle>
                    <span className="text-label text-muted-foreground">
                      {resultCountLabel}
                    </span>
                  </div>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="text-label text-primary cursor-pointer hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                </DrawerHeader>
                <DrawerBody>
                  <div className="flex flex-col gap-6">
                    {/* Capability first — Trainable + Reasoning are the
                        decision-relevant filters for Alex; same precedence
                        as the desktop chip cluster (spec §3). Trainable
                        hides on Private tab (degenerate — all output of
                        training). */}
                    <FilterGroup label="Capability">
                      {!isPrivateTab && (
                        <CapabilityCheckbox
                          id="mfilter-trainable"
                          label="Trainable"
                          count={toggleCounts.trainable}
                          checked={filters.trainable}
                          onCheckedChange={(v) => updateFilters({ trainable: v })}
                        />
                      )}
                      <CapabilityCheckbox
                        id="mfilter-reasoning"
                        label="Reasoning"
                        count={toggleCounts.reasoning}
                        checked={filters.reasoning}
                        onCheckedChange={(v) => updateFilters({ reasoning: v })}
                      />
                    </FilterGroup>

                    {isPrivateTab ? (
                      <FilterGroup label="Base model">
                        {baseModelOptions.map((opt) => {
                          const id = `mfilter-base-${opt.value}`;
                          const checked = filters.baseModelIds.has(opt.value);
                          return (
                            <label
                              key={opt.value}
                              htmlFor={id}
                              className="flex cursor-pointer items-center gap-3 py-1"
                            >
                              <Checkbox
                                id={id}
                                size="sm"
                                checked={checked}
                                onCheckedChange={(next) => {
                                  const nextSet = new Set(filters.baseModelIds);
                                  if (next === true) {
                                    nextSet.add(opt.value);
                                  } else {
                                    nextSet.delete(opt.value);
                                  }
                                  updateFilters({ baseModelIds: nextSet });
                                }}
                              />
                              <span className="text-body text-foreground">
                                {opt.label}
                              </span>
                            </label>
                          );
                        })}
                      </FilterGroup>
                    ) : (
                      <FilterGroup label="Provider">
                        {providerOptions.map((opt) => {
                          const id = `mfilter-provider-${opt.value}`;
                          const checked = filters.providers.has(
                            opt.value as ModelProvider,
                          );
                          return (
                            <label
                              key={opt.value}
                              htmlFor={id}
                              className="flex cursor-pointer items-center gap-3 py-1"
                            >
                              <Checkbox
                                id={id}
                                size="sm"
                                checked={checked}
                                onCheckedChange={(next) => {
                                  const nextSet = new Set(filters.providers);
                                  if (next === true) {
                                    nextSet.add(opt.value as ModelProvider);
                                  } else {
                                    nextSet.delete(opt.value as ModelProvider);
                                  }
                                  updateFilters({ providers: nextSet });
                                }}
                              />
                              <span className="text-body text-foreground">{opt.label}</span>
                            </label>
                          );
                        })}
                      </FilterGroup>
                    )}

                    <FilterGroup label="Favorites">
                      <CapabilityCheckbox
                        id="mfilter-favorites"
                        label="Show favorites only"
                        count={toggleCounts.favorites}
                        checked={filters.favoritesOnly}
                        onCheckedChange={(v) =>
                          updateFilters({ favoritesOnly: v })
                        }
                      />
                    </FilterGroup>
                  </div>
                </DrawerBody>
                <DrawerFooter>
                  <DrawerClose asChild>
                    <Button type="button" variant="primary" className="w-full">
                      Done
                    </Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>
        </div>

        {/* Single <table> in one overflow-auto wrapper — TanStack pinning needs
            both tbody and thead to share a horizontal scroll ancestor for
            `position: sticky; left: 0` to anchor correctly. `border-separate`
            is mandatory: collapsed borders break box-shadow + sticky together.
            Sticky lives on <thead> (not each <th>) so the entire header row
            anchors as one block — per-<th> sticky was visibly jittering
            during vertical scroll in this layout. */}
        <div className="overflow-hidden rounded-md border border-border bg-card">
          <div className="max-h-[calc(100vh-18rem)] overflow-auto">
            <table
              className={cn(
                tableClass,
                "table-fixed border-separate border-spacing-0",
              )}
              style={{ minWidth: table.getTotalSize() }}
            >
              <thead className="sticky top-0 z-table-header bg-field-rest">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      const meta = header.column.columnDef.meta as
                        | { headerClassName?: string }
                        | undefined;
                      return (
                        <th
                          key={header.id}
                          style={getPinningStyles(header.column, true)}
                          className={cn(
                            tableHeadVariants(),
                            // Cancel per-<th> sticky — sticky lives on <thead>
                            // now. `static` overrides `sticky` via twMerge's
                            // position group.
                            "static",
                            // Override design-system's `uppercase` — operator
                            // wants sentence case ("Model", not "MODEL").
                            "normal-case",
                            meta?.headerClassName,
                          )}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
              <tbody
                className={cn(
                  tableBodyClass,
                  // border-separate kills <tr> borders; restore the row
                  // separator by drawing border-bottom on cells instead.
                  "[&_tr_td]:border-b [&_tr_td]:border-border",
                  "[&_tr:last-child_td]:border-b-0",
                )}
              >
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={table.getVisibleLeafColumns().length}
                      className="p-0"
                    >
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
                      className={cn(tableRowVariants(), "group/row")}
                    >
                      {row.getVisibleCells().map((cell) => {
                        const meta = cell.column.columnDef.meta as
                          | { cellClassName?: string }
                          | undefined;
                        const isPinned = cell.column.getIsPinned();
                        return (
                          <td
                            key={cell.id}
                            style={getPinningStyles(cell.column, false)}
                            className={cn(
                              tableCellVariants(),
                              "py-2",
                              // bg only when actually pinned — keeps row hover
                              // visible on desktop where the column isn't sticky.
                              isPinned ? "bg-card" : undefined,
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

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-label font-medium text-foreground">{label}</h3>
      <div className="flex flex-col gap-1">{children}</div>
    </section>
  );
}

function CapabilityCheckbox({
  id,
  label,
  count,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  count: number;
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-3 py-1">
      <Checkbox
        id={id}
        size="sm"
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(v === true)}
      />
      <span className="flex-1 text-body text-foreground">{label}</span>
      {count > 0 && (
        <span className="font-mono text-meta tabular-nums text-meta-foreground">
          {count}
        </span>
      )}
    </label>
  );
}
