"use client";

import { ChevronDown, ChevronRight, Copy, Server } from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { CodeBlock } from "@repo/ui/components/code-block";
import { EmptyState } from "@repo/ui/components/empty-state";
import { IconButton } from "@repo/ui/components/icon-button";
import { SearchInput } from "@repo/ui/components/search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import {
  tableBodyClass,
  tableClass,
  tableHeaderClass,
  tableHeadVariants,
} from "@repo/ui/components/table";
import { cn } from "@repo/ui/lib/cn";
import { ENVIRONMENTS_MOCK_NOW_MS } from "../_data/environments";
import type { Instance, InstanceStatus } from "../_data/types";

// ── Top-of-page controls ────────────────────────────────────────────────────

type TimeRangeKey = "24h" | "7d" | "30d" | "all";

const TIME_RANGES: ReadonlyArray<{ value: TimeRangeKey; label: string; ms: number | null }> = [
  { value: "24h", label: "Last 24h", ms: 24 * 60 * 60 * 1000 },
  { value: "7d", label: "Last 7 days", ms: 7 * 24 * 60 * 60 * 1000 },
  { value: "30d", label: "Last 30 days", ms: 30 * 24 * 60 * 60 * 1000 },
  { value: "all", label: "All time", ms: null },
];

const STATUS_LABEL: Record<InstanceStatus, string> = {
  completed: "Completed",
  failed: "Failed",
  running: "Running",
  idle: "Idle",
};

// ── Public API ──────────────────────────────────────────────────────────────

export interface InstancesTabProps {
  envId: string;
  instances: ReadonlyArray<Instance>;
}

export function InstancesTab({ envId, instances }: InstancesTabProps) {
  const [timeRange, setTimeRange] = useState<TimeRangeKey>("7d");
  const [search, setSearch] = useState("");

  const trulyEmpty = instances.length === 0;

  // Time-range filter first, then search.
  const rangeFiltered = useMemo(() => {
    const range = TIME_RANGES.find((r) => r.value === timeRange);
    if (!range || range.ms === null) return instances;
    const cutoff = ENVIRONMENTS_MOCK_NOW_MS - range.ms;
    return instances.filter((i) => i.startedAtMs >= cutoff);
  }, [instances, timeRange]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rangeFiltered;
    return rangeFiltered.filter((i) =>
      `${i.taskDescription} ${i.id}`.toLowerCase().includes(query),
    );
  }, [rangeFiltered, search]);

  function resetToAllTime() {
    setTimeRange("all");
    setSearch("");
  }

  if (trulyEmpty) return <InstancesEmptyState envId={envId} />;

  return (
    <div className="flex flex-col gap-4">
      <ControlsBar
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        search={search}
        onSearchChange={setSearch}
        instances={filtered}
      />

      {filtered.length === 0 ? (
        <FilteredEmptyState onReset={resetToAllTime} />
      ) : (
        <InstancesList instances={filtered} />
      )}
    </div>
  );
}

// ── Controls bar ────────────────────────────────────────────────────────────

interface ControlsBarProps {
  timeRange: TimeRangeKey;
  onTimeRangeChange: (next: TimeRangeKey) => void;
  search: string;
  onSearchChange: (next: string) => void;
  instances: ReadonlyArray<Instance>;
}

function ControlsBar({
  timeRange,
  onTimeRangeChange,
  search,
  onSearchChange,
  instances,
}: ControlsBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="w-72 max-w-full">
        <SearchInput
          aria-label="Search by task or ID"
          placeholder="Search by task or ID…"
          defaultValue={search}
          onLiveChange={onSearchChange}
        />
      </div>

      <Select value={timeRange} onValueChange={(v) => onTimeRangeChange(v as TimeRangeKey)}>
        <SelectTrigger aria-label="Time range" className="w-fit">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TIME_RANGES.map((r) => (
            <SelectItem key={r.value} value={r.value}>
              {r.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <StatsStrip instances={instances} className="ml-auto" />
    </div>
  );
}

// ── Stats strip ─────────────────────────────────────────────────────────────

function StatsStrip({
  instances,
  className,
}: {
  instances: ReadonlyArray<Instance>;
  className?: string;
}) {
  const total = instances.length;
  const completed = instances.filter((i) => i.status === "completed").length;
  const failed = instances.filter((i) => i.status === "failed").length;
  const finished = completed + failed;
  const successPct =
    finished === 0 ? null : Math.round((completed / finished) * 100);

  const totalCost = instances.reduce((acc, i) => acc + parseUsd(i.cost), 0);
  const avgDurationSec =
    total === 0
      ? 0
      : Math.round(
          instances.reduce((acc, i) => acc + parseDurationSec(i.duration), 0) /
            total,
        );

  return (
    <div className={cn("flex flex-wrap items-center gap-x-2 gap-y-1 text-label", className)}>
      <StatItem
        value={total.toString()}
        unit={total === 1 ? "run" : "runs"}
      />
      <StatSep />
      <StatItem
        value={successPct === null ? "—" : `${successPct}%`}
        unit="success"
      />
      <StatSep />
      <StatItem value={formatUsd(totalCost)} unit="total" />
      <StatSep />
      <StatItem
        value={total === 0 ? "—" : formatDuration(avgDurationSec)}
        unit="avg"
      />
    </div>
  );
}

function StatItem({ value, unit }: { value: string; unit: string }) {
  return (
    <span className="inline-flex items-baseline gap-1">
      <span className="font-medium text-foreground tabular-nums">{value}</span>
      <span className="text-muted-foreground">{unit}</span>
    </span>
  );
}

function StatSep() {
  return <span aria-hidden="true" className="text-muted-foreground">·</span>;
}

// ── Instances list (grouped by date) ────────────────────────────────────────

interface DateGroup {
  key: string;
  label: string;
  instances: ReadonlyArray<Instance>;
}

function InstancesList({
  instances,
}: {
  instances: ReadonlyArray<Instance>;
}) {
  const groups = useMemo(() => groupByDate(instances), [instances]);

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="max-h-[calc(100vh-22rem)] overflow-auto">
        <table className={tableClass}>
          <thead className={cn(tableHeaderClass, "sticky top-0 z-table-header bg-field-rest")}>
            <tr>
              <th
                scope="col"
                className={cn(tableHeadVariants({ density: "compact" }), "w-8")}
              >
                <span className="sr-only">Expand</span>
              </th>
              <th scope="col" className={tableHeadVariants({ density: "compact" })}>
                Status
              </th>
              <th scope="col" className={tableHeadVariants({ density: "compact" })}>
                Time
              </th>
              <th scope="col" className={tableHeadVariants({ density: "compact" })}>
                Task
              </th>
              <th scope="col" className={tableHeadVariants({ density: "compact" })}>
                Duration
              </th>
              <th scope="col" className={tableHeadVariants({ density: "compact" })}>
                Cost
              </th>
              <th scope="col" className={tableHeadVariants({ density: "compact" })}>
                User
              </th>
              <th scope="col" className={tableHeadVariants({ density: "compact" })}>
                Instance ID
              </th>
            </tr>
          </thead>
          {groups.map((g) => (
            <DateGroupBody key={g.key} group={g} />
          ))}
        </table>
      </div>
    </div>
  );
}

function DateGroupBody({ group }: { group: DateGroup }) {
  const [open, setOpen] = useState(true);
  const failedCount = group.instances.filter((i) => i.status === "failed").length;
  const totalCount = group.instances.length;

  return (
    <tbody className={tableBodyClass}>
      <tr className="border-b border-border bg-field-rest">
        <td colSpan={8} className="px-6 py-2">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="flex items-center gap-2 text-label font-medium text-foreground"
          >
            <ChevronDown
              aria-hidden="true"
              className={cn(
                "size-3.5 text-muted-foreground transition-transform duration-fast ease-out-standard",
                !open && "-rotate-90",
              )}
            />
            <span>{group.label}</span>
            <span className="font-mono text-meta text-muted-foreground">
              · {totalCount} {totalCount === 1 ? "run" : "runs"}
              {failedCount > 0 && (
                <>
                  {" · "}
                  <span className="text-state-errored-text">
                    {failedCount} failed
                  </span>
                </>
              )}
            </span>
          </button>
        </td>
      </tr>
      {open &&
        group.instances.map((inst) => (
          <InstanceRow key={inst.id} instance={inst} />
        ))}
    </tbody>
  );
}

function InstanceRow({ instance }: { instance: Instance }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        className={cn(
          "border-b border-border transition-[background-color] duration-fast ease-out-standard",
          "hover:bg-hover-surface cursor-pointer",
          expanded && "bg-selected-surface",
        )}
        onClick={() => setExpanded((v) => !v)}
      >
        <td className={cn("pl-6 pr-2", "py-1.5")}>
          <ChevronRight
            aria-hidden="true"
            className={cn(
              "size-3.5 text-muted-foreground transition-transform duration-fast ease-out-standard",
              expanded && "rotate-90",
            )}
          />
        </td>
        <td className={cn("px-3", "py-1.5")}>
          <InstanceStatusBadge status={instance.status} />
        </td>
        <td
          className={cn("px-3 whitespace-nowrap text-label text-muted-foreground", "py-1.5")}
          title={formatRelative(instance.startedAtMs)}
        >
          {formatDateTime(instance.startedAtMs)}
        </td>
        <td className={cn("px-3 w-full max-w-0", "py-1.5")}>
          <div className="truncate text-body font-medium text-foreground">
            {instance.taskDescription}
          </div>
        </td>
        <td
          className={cn(
            "px-3 whitespace-nowrap font-mono text-label text-muted-foreground tabular-nums",
            "py-1.5",
          )}
        >
          {instance.duration}
        </td>
        <td
          className={cn(
            "px-3 whitespace-nowrap font-mono text-label text-muted-foreground tabular-nums",
            "py-1.5",
          )}
        >
          {instance.cost}
        </td>
        <td className={cn("px-3 whitespace-nowrap", "py-1.5")}>
          <UserCell name={instance.user.name} />
        </td>
        <td
          className={cn("pl-3 pr-6 whitespace-nowrap", "py-1.5")}
          onClick={(e) => e.stopPropagation()}
        >
          <InstanceIdCell id={instance.id} />
        </td>
      </tr>
      {expanded && <ExpandRow instance={instance} />}
    </>
  );
}

function ExpandRow({ instance }: { instance: Instance }) {
  return (
    <tr className="border-b border-border bg-selected-surface">
      <td colSpan={8} className="px-6 py-4">
        <div className="flex flex-col gap-3 border-l-2 border-primary pl-4">
          <p className="text-body text-foreground">{instance.taskDescription}</p>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
            <ExpandField label="Scenario" value={instance.scenarioName} mono />
            <ExpandField label="Model" value={instance.modelOrAgent} mono />
            {instance.status === "completed" && instance.score !== undefined && (
              <ExpandField
                label="Score"
                value={instance.score.toFixed(2)}
                mono
              />
            )}
            <ExpandField
              label="Resources"
              value={`${instance.resourceTier} · ${instance.sessionDuration} max session`}
              mono
            />
          </dl>
          <div className="flex justify-end">
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="text-label text-muted-foreground hover:text-foreground transition-colors duration-fast ease-out-standard"
            >
              View trace <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </td>
    </tr>
  );
}

function ExpandField({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-2">
      <dt className="font-mono text-meta uppercase tracking-wider text-meta-foreground">
        {label}
      </dt>
      <dd
        className={cn(
          "text-body text-foreground",
          mono && "font-mono text-code",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

// ── Cell partials ───────────────────────────────────────────────────────────

function InstanceStatusBadge({ status }: { status: InstanceStatus }) {
  const variant: Record<InstanceStatus, "success" | "destructive" | "running" | "warning"> = {
    completed: "success",
    failed: "destructive",
    running: "running",
    idle: "warning",
  };
  return (
    <Badge variant={variant[status]} showDot className="normal-case tracking-normal">
      {STATUS_LABEL[status]}
    </Badge>
  );
}

function UserCell({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2">
      <Avatar size="xs">
        <AvatarFallback>{initials(name)}</AvatarFallback>
      </Avatar>
      <span className="text-label text-muted-foreground">{name}</span>
    </div>
  );
}

function InstanceIdCell({ id }: { id: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <code className="font-mono text-code text-muted-foreground">{id}</code>
      <IconButton
        variant="ghost"
        size="sm"
        aria-label={`Copy instance id ${id}`}
        type="button"
        onClick={() => {
          if (typeof navigator !== "undefined" && navigator.clipboard) {
            navigator.clipboard.writeText(id).catch(() => {});
          }
        }}
      >
        <Copy aria-hidden="true" />
      </IconButton>
    </div>
  );
}

// ── Empty states ────────────────────────────────────────────────────────────

function FilteredEmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card py-12">
      <p className="text-body text-muted-foreground">No instances in this range.</p>
      <Button variant="secondary" onClick={onReset}>
        Expand to all time
      </Button>
    </div>
  );
}

function InstancesEmptyState({ envId }: { envId: string }) {
  return (
    <div className="flex flex-col items-center gap-6 py-16">
      <EmptyState
        variant="zero-state"
        icon={Server}
        title="No instances yet"
        subtitle="Spin up an instance via the CLI:"
      />
      <div className="w-full max-w-md">
        <CodeBlock
          variant="block"
          language="bash"
          code={`hud env run ${envId}`}
        />
      </div>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────

const DATE_TIME_FMT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const RELATIVE_DAY_FMT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

function formatDateTime(ms: number): string {
  return DATE_TIME_FMT.format(new Date(ms));
}

function formatRelative(ms: number): string {
  const diff = ENVIRONMENTS_MOCK_NOW_MS - ms;
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function dateKey(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function dateGroupLabel(ms: number): string {
  const d = new Date(ms);
  const now = new Date(ENVIRONMENTS_MOCK_NOW_MS);
  const sameYMD = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  const yesterday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 1,
  );
  if (sameYMD(d, now)) return "Today";
  if (sameYMD(d, yesterday)) return "Yesterday";
  return RELATIVE_DAY_FMT.format(d);
}

function groupByDate(instances: ReadonlyArray<Instance>): ReadonlyArray<DateGroup> {
  // Instances are pre-sorted newest-first by the consumer ordering of the
  // fixture; we group preserving that order so the rendered list stays newest-
  // first within and across groups.
  const sorted = [...instances].sort((a, b) => b.startedAtMs - a.startedAtMs);
  const groups: DateGroup[] = [];
  let current: DateGroup | null = null;
  for (const inst of sorted) {
    const key = dateKey(inst.startedAtMs);
    if (!current || current.key !== key) {
      current = {
        key,
        label: dateGroupLabel(inst.startedAtMs),
        instances: [],
      };
      groups.push(current);
    }
    (current.instances as Instance[]).push(inst);
  }
  return groups;
}

function parseUsd(s: string): number {
  const n = Number.parseFloat(s.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function formatUsd(n: number): string {
  if (n === 0) return "$0.00";
  return n < 10 ? `$${n.toFixed(2)}` : `$${n.toFixed(2)}`;
}

function parseDurationSec(s: string): number {
  // Accepts "Nm Ns", "Nm", "Ns".
  let total = 0;
  const minMatch = s.match(/(\d+)m/);
  const secMatch = s.match(/(\d+)s/);
  if (minMatch) total += Number.parseInt(minMatch[1]!, 10) * 60;
  if (secMatch) total += Number.parseInt(secMatch[1]!, 10);
  return total;
}

function formatDuration(totalSec: number): string {
  if (totalSec <= 0) return "0s";
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m}m`;
  return `${m}m ${s}s`;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}
