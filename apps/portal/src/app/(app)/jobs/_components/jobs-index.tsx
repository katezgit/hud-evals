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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@repo/ui/components/select";
import type { HomeJobRow } from "@/lib/mock/home-jobs";
import { GRID_COLS, JobsIndexRow } from "./jobs-index-row";

type Scope = "mine" | "team" | "org";
type Window = "24h" | "7d" | "30d";

const SCOPE_LABEL: Record<Scope, string> = {
  mine: "My Jobs",
  team: "Team",
  org: "Org",
};

const WINDOW_LABEL: Record<Window, string> = {
  "24h": "24h",
  "7d": "7d",
  "30d": "30d",
};

interface JobsIndexProps {
  rows: ReadonlyArray<HomeJobRow>;
}

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

  return (
    <div className="flex flex-col gap-5">
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
  );
}

// Split-button New Job — same dropdown pattern as Run-on-taskset in the
// taskset-detail header. Primary click → /jobs/new (junction). Caret →
// typed shortcut to eval drawer / training full-page.
export function NewJobButton() {
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
      className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center"
    >
      <div className="relative w-full md:flex-1">
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

      <SegmentedControl
        aria-label="Scope"
        size="sm"
        value={scope}
        onValueChange={(v) => onScopeChange(v as Scope)}
        className="hidden md:ml-auto md:flex md:shrink-0"
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
        className="hidden md:flex md:shrink-0"
      >
        <SegmentedControl.Item value="24h">24h</SegmentedControl.Item>
        <SegmentedControl.Item value="7d">7d</SegmentedControl.Item>
        <SegmentedControl.Item value="30d">30d</SegmentedControl.Item>
      </SegmentedControl>

      <div className="flex gap-2 md:hidden">
        <Select
          value={scope}
          onValueChange={(v) => onScopeChange(v as Scope)}
        >
          <SelectTrigger aria-label="Scope" className="flex-1">
            <span className="text-muted-foreground">
              Scope:{" "}
              <span className="text-foreground">{SCOPE_LABEL[scope]}</span>
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mine">My Jobs</SelectItem>
            <SelectItem value="team">Team</SelectItem>
            <SelectItem value="org">Org</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={window}
          onValueChange={(v) => onWindowChange(v as Window)}
        >
          <SelectTrigger aria-label="Time window" className="flex-1">
            <span className="text-muted-foreground">
              Time:{" "}
              <span className="text-foreground">{WINDOW_LABEL[window]}</span>
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">24h</SelectItem>
            <SelectItem value="7d">7d</SelectItem>
            <SelectItem value="30d">30d</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

interface JobsTableProps {
  rows: ReadonlyArray<HomeJobRow>;
}

function JobsTable({ rows }: JobsTableProps) {
  return (
    <div className="bg-panel border-border overflow-hidden rounded-md border">
      <div className="bg-elevated-surface border-border text-meta-foreground border-b px-4 py-2.5 font-mono text-meta">
        <div className={GRID_COLS}>
          <div>Status</div>
          <div>Job</div>
          <div>Taskset</div>
          <div>Model · Owner</div>
          <div>Reward</div>
          <div>Δ</div>
          <div>Cost</div>
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
