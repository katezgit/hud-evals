"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  GraduationCap,
  Play,
  Plus,
  Search,
} from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { Input } from "@repo/ui/components/input";
import { SegmentedControl } from "@repo/ui/components/segmented-control";
import { cn } from "@repo/ui/lib/cn";
import type { HomeJobRow } from "@/lib/mock/home-jobs";
import { GRID_COLS, JobsIndexRow } from "./jobs-index-row";

type Scope = "mine" | "team" | "org";
type Window = "24h" | "7d" | "30d";

interface JobsIndexProps {
  rows: ReadonlyArray<HomeJobRow>;
}

const SCOPE_LABEL: Record<Scope, string> = {
  mine: "My Jobs",
  team: "Team",
  org: "Org",
};

const WINDOW_LABEL: Record<Window, string> = {
  "24h": "Last 24h",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
};

export default function JobsIndex({ rows }: JobsIndexProps) {
  const [scope, setScope] = useState<Scope>("mine");
  const [window, setWindow] = useState<Window>("24h");
  const [search, setSearch] = useState("");

  // Mocked scope filter: in real life this is a server query. Owner-based proxy
  // here — "mine" surfaces self-owned, team includes team-scope, org shows all.
  const scopedRows = useMemo(() => {
    if (scope === "org") return rows;
    if (scope === "team") {
      return rows.filter(
        (r) => r.ownerScope === "self" || r.ownerScope === "team",
      );
    }
    return rows.filter((r) => r.ownerScope === "self");
  }, [rows, scope]);

  const searchedRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return scopedRows;
    return scopedRows.filter((r) => {
      return (
        r.id.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.modelName.toLowerCase().includes(q) ||
        r.tasksetName.toLowerCase().includes(q)
      );
    });
  }, [scopedRows, search]);

  // Telemetry derives from the scoped set so KPI numerals echo the active scope
  // (toggling My Jobs ↔ Org changes the counts in real-time). Window filter is
  // not yet wired to data — all mock rows fall inside 24h, so changing chips
  // only updates the descriptor strip.
  const telemetry = useMemo(() => {
    let running = 0;
    let queued = 0;
    let failed = 0;
    let completed = 0;
    let tokenSpend = 0;
    for (const r of scopedRows) {
      if (r.state === "running") running++;
      if (r.state === "queued") queued++;
      if (r.state === "failed" || r.state === "errored") failed++;
      if (r.state === "completed") completed++;
      const c = Number(r.cost.replace(/,/g, ""));
      if (Number.isFinite(c)) tokenSpend += c;
    }
    return {
      running,
      queued,
      failed,
      completed,
      tokenSpend,
      // GPU slots is a realtime gauge — sum of in-flight training runs as a stand-in.
      gpuSlots: scopedRows.filter(
        (r) => r.state === "running" && r.type === "train",
      ).length * 4,
    };
  }, [scopedRows]);

  return (
    <div className="page-shell block pt-2 pb-12">
      <div className="flex flex-col gap-5">
        <PageHeader
          totalCount={searchedRows.length}
          scope={scope}
          window={window}
          runningCount={telemetry.running}
        />

        <TelemetryStrip
          window={window}
          running={telemetry.running}
          queued={telemetry.queued}
          failed={telemetry.failed}
          completed={telemetry.completed}
          tokenSpend={telemetry.tokenSpend}
          gpuSlots={telemetry.gpuSlots}
        />

        <FilterBar
          scope={scope}
          onScopeChange={setScope}
          window={window}
          onWindowChange={setWindow}
          search={search}
          onSearchChange={setSearch}
        />

        <JobsTable rows={searchedRows} />
      </div>
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────

interface PageHeaderProps {
  totalCount: number;
  scope: Scope;
  window: Window;
  runningCount: number;
}

function PageHeader({
  totalCount,
  scope,
  window,
  runningCount,
}: PageHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-6">
      <div className="flex min-w-0 flex-col gap-1.5">
        <h1 className="text-display font-semibold text-foreground">Jobs</h1>
        <div className="flex flex-wrap items-center gap-1.5 text-body text-muted-foreground">
          <span>
            <span className="tabular-nums font-mono">{totalCount}</span> jobs
            total
          </span>
          <Separator />
          <span>
            {SCOPE_LABEL[scope]} · {WINDOW_LABEL[window].toLowerCase()}
          </span>
          <Separator />
          <span>
            <span className="tabular-nums font-mono">{runningCount}</span>{" "}
            running now
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <NewJobButton />
      </div>
    </header>
  );
}

function Separator() {
  return (
    <span aria-hidden="true" className="text-meta-foreground">
      ·
    </span>
  );
}

// Split-button New Job — same dropdown pattern as Run-on-taskset in the
// taskset-detail header. Primary click → /jobs/new (junction). Caret →
// typed shortcut to eval drawer / training full-page.
function NewJobButton() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="primary" size="sm" type="button">
          <Plus aria-hidden="true" />
          New Job
          <ChevronDown aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href="/jobs/new?type=eval">
            <Play aria-hidden="true" />
            Run Evaluation
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/jobs/new?type=training">
            <GraduationCap aria-hidden="true" />
            Run Training Sweep
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Telemetry strip ──────────────────────────────────────────────────────

interface TelemetryStripProps {
  window: Window;
  running: number;
  queued: number;
  failed: number;
  completed: number;
  tokenSpend: number;
  gpuSlots: number;
}

function TelemetryStrip({
  window,
  running,
  queued,
  failed,
  completed,
  tokenSpend,
  gpuSlots,
}: TelemetryStripProps) {
  // 6 tiles, telemetry-only (not filter shortcuts) per the design rationale in
  // .intermediate/design/jobs/section-1-header.html. Status numerals colored;
  // tiles themselves stay neutral so 6 don't fight each other visually.
  return (
    <section aria-label="Telemetry overview" className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="font-mono text-meta uppercase tracking-widest text-meta-foreground">
          Telemetry
        </span>
        <span className="text-label text-meta-foreground">
          {WINDOW_LABEL[window]}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-px rounded-sm border border-border bg-border overflow-hidden md:grid-cols-3 lg:grid-cols-6">
        <Tile label="Running" value={running} valueClassName="text-state-running-text" />
        <Tile label="Queued" value={queued} valueClassName="text-state-warning-text" />
        <Tile
          label="Failed"
          value={failed}
          valueClassName="text-state-errored-text"
        />
        <Tile
          label="Completed"
          value={completed}
          valueClassName="text-state-scored-text"
        />
        <Tile
          label="Token Spend"
          value={`$${tokenSpend.toLocaleString()}`}
        />
        <Tile
          label="GPU Slots Active"
          value={gpuSlots}
          valueClassName="text-state-running-text"
          meta="realtime"
        />
      </div>
    </section>
  );
}

interface TileProps {
  label: string;
  value: number | string;
  valueClassName?: string;
  meta?: string;
}

function Tile({ label, value, valueClassName, meta }: TileProps) {
  return (
    <div className="flex flex-col gap-1 bg-card p-3">
      <span className="font-mono text-meta uppercase tracking-widest text-meta-foreground">
        {label}
      </span>
      <span
        className={cn(
          "font-mono text-h2 font-semibold tabular-nums leading-none",
          valueClassName ?? "text-foreground",
        )}
      >
        {value}
      </span>
      {meta && (
        <span className="font-mono text-meta tracking-normal text-meta-foreground">
          {meta}
        </span>
      )}
    </div>
  );
}

// ─── Filter bar ───────────────────────────────────────────────────────────

interface FilterBarProps {
  scope: Scope;
  onScopeChange: (next: Scope) => void;
  window: Window;
  onWindowChange: (next: Window) => void;
  search: string;
  onSearchChange: (next: string) => void;
}

function FilterBar({
  scope,
  onScopeChange,
  window,
  onWindowChange,
  search,
  onSearchChange,
}: FilterBarProps) {
  return (
    <div
      role="toolbar"
      aria-label="Jobs filter bar"
      className="flex flex-wrap items-center gap-2"
    >
      <SegmentedControl
        aria-label="Scope"
        size="sm"
        value={scope}
        onValueChange={(v) => onScopeChange(v as Scope)}
        className="shrink-0"
      >
        <SegmentedControl.Item value="mine">My Jobs</SegmentedControl.Item>
        <SegmentedControl.Item value="team">Team</SegmentedControl.Item>
        <SegmentedControl.Item value="org">Org</SegmentedControl.Item>
      </SegmentedControl>

      <SegmentedControl
        aria-label="Time window"
        size="sm"
        value={window}
        onValueChange={(v) => onWindowChange(v as Window)}
        className="shrink-0"
      >
        <SegmentedControl.Item value="24h">24h</SegmentedControl.Item>
        <SegmentedControl.Item value="7d">7d</SegmentedControl.Item>
        <SegmentedControl.Item value="30d">30d</SegmentedControl.Item>
      </SegmentedControl>

      <div className="relative ml-auto w-full max-w-md">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-meta-foreground"
        />
        <Input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search jobs or paste a job ID (job_…)"
          aria-label="Search jobs"
          className="pl-8"
        />
      </div>
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────

interface JobsTableProps {
  rows: ReadonlyArray<HomeJobRow>;
}

function JobsTable({ rows }: JobsTableProps) {
  return (
    <div className="bg-panel border-border overflow-hidden rounded-md border">
      <div className="bg-elevated-surface border-border text-meta-foreground border-b px-4 py-2.5 font-mono text-meta uppercase">
        <div className={GRID_COLS}>
          <div>Status</div>
          <div>Job</div>
          <div>Taskset</div>
          <div>Model · Owner</div>
          <div>Reward</div>
          <div>Δ</div>
          <div>Cost</div>
          <div>When</div>
          <div />
        </div>
      </div>

      {rows.length === 0 ? (
        <JobsEmpty />
      ) : (
        <ul aria-label="Jobs" className="[&>li:last-child>a]:border-b-0">
          {rows.map((job) => (
            <li key={job.id}>
              <JobsIndexRow job={job} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function JobsEmpty() {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <p className="text-body text-muted-foreground">
        No jobs match the current filter.
      </p>
      <Button variant="primary" size="sm" asChild>
        <Link href="/jobs/new?type=eval">
          <Play aria-hidden="true" />
          Run Evaluation
        </Link>
      </Button>
    </div>
  );
}
