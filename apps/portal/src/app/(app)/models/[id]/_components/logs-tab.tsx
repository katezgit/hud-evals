"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronRight, ScrollText } from "lucide-react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { EmptyState } from "@repo/ui/components/empty-state";
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
  tableCellVariants,
  tableClass,
  tableHeaderClass,
  tableHeadVariants,
  tableRowVariants,
} from "@repo/ui/components/table";
import { cn } from "@repo/ui/lib/cn";
import type { Log, Model, Viewer } from "../_data/types";
import { getLogs } from "../_data/models";
import { LogExpandPanel } from "./logs-expand-panel";
import { formatRelativeTime } from "./relative-time";

// Range filter buckets — labels and bounds. `null` upper bound = "no upper limit"
// (the `all` option). Bounds expressed in milliseconds so the filter pass stays
// a single integer comparison per row.
const RANGE_OPTIONS = [
  { value: "24h", label: "Last 24 hours", windowMs: 24 * 60 * 60 * 1000 },
  { value: "7d", label: "Last 7 days", windowMs: 7 * 24 * 60 * 60 * 1000 },
  { value: "30d", label: "Last 30 days", windowMs: 30 * 24 * 60 * 60 * 1000 },
  { value: "all", label: "All time", windowMs: null as number | null },
] as const;

type RangeValue = (typeof RANGE_OPTIONS)[number]["value"];

const ALL_USERS = "__all__";
const ALL_CHECKPOINTS = "__all__";

export function LogsTab({
  model,
  viewer,
}: {
  model: Model;
  viewer: Viewer;
}) {
  void viewer; // persona gating handled upstream; no inline branch needed here

  const [logs, setLogs] = useState<ReadonlyArray<Log> | null>(null);

  useEffect(() => {
    let cancelled = false;
    getLogs(model.id).then((rows) => {
      if (!cancelled) setLogs(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [model.id]);

  if (logs === null) {
    return (
      <div className="py-12 text-body text-muted-foreground" aria-live="polite">
        Loading logs…
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="py-12">
        <EmptyState
          variant="zero-state"
          icon={ScrollText}
          title="No logs yet."
          subtitle="Inference requests on this model will appear here."
        />
      </div>
    );
  }

  return <LogsView logs={logs} />;
}

function LogsView({ logs }: { logs: ReadonlyArray<Log> }) {
  // SearchInput keeps its own input value internally; we only consume the
  // deferred value via `onValueChange`. No mirrored state needed.
  const [query, setQuery] = useState("");
  const [checkpoint, setCheckpoint] = useState<string>(ALL_CHECKPOINTS);
  const [user, setUser] = useState<string>(ALL_USERS);
  const [range, setRange] = useState<RangeValue>("7d");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Snapshot `now` once per render so every row computes its relative label
  // against the same clock — keeps `3 min ago` and `4 min ago` ordering
  // coherent within a single paint. Recomputes on each state change, which is
  // fine for minute-grain displays.
  const now = Date.now();

  const checkpointOptions = useMemo(() => {
    const seen = new Set<string>();
    for (const log of logs) {
      if (log.checkpointId !== null) seen.add(log.checkpointId);
    }
    return Array.from(seen).sort();
  }, [logs]);

  const userOptions = useMemo(() => {
    const seen = new Set<string>();
    for (const log of logs) seen.add(log.userName);
    return Array.from(seen).sort();
  }, [logs]);

  const filtered = useMemo(() => {
    const windowMs =
      RANGE_OPTIONS.find((opt) => opt.value === range)?.windowMs ?? null;
    const cutoff = windowMs === null ? null : now - windowMs;
    const q = query.trim().toLowerCase();
    return logs.filter((log) => {
      if (q) {
        const matches =
          log.id.toLowerCase().includes(q) ||
          log.userName.toLowerCase().includes(q) ||
          (log.checkpointId !== null &&
            log.checkpointId.toLowerCase().includes(q));
        if (!matches) return false;
      }
      if (checkpoint !== ALL_CHECKPOINTS && log.checkpointId !== checkpoint) {
        return false;
      }
      if (user !== ALL_USERS && log.userName !== user) return false;
      if (cutoff !== null && Date.parse(log.createdAt) < cutoff) return false;
      return true;
    });
  }, [logs, query, checkpoint, user, range, now]);

  const showCheckpointFilter = checkpointOptions.length > 0;

  return (
    <div className="py-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full flex-none sm:w-64">
          <SearchInput
            defaultValue=""
            onValueChange={setQuery}
            placeholder="Search by model, ID, or user…"
            aria-label="Search logs"
          />
        </div>

        {showCheckpointFilter && (
          <Select value={checkpoint} onValueChange={setCheckpoint}>
            <SelectTrigger size="sm" aria-label="Checkpoint" className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_CHECKPOINTS}>All checkpoints</SelectItem>
              {checkpointOptions.map((id) => (
                <SelectItem key={id} value={id}>
                  {id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={user} onValueChange={setUser}>
          <SelectTrigger size="sm" aria-label="User" className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_USERS}>All users</SelectItem>
            {userOptions.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={range} onValueChange={(v) => setRange(v as RangeValue)}>
          <SelectTrigger size="sm" aria-label="Time range" className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RANGE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-4 overflow-hidden rounded-md border border-border bg-card">
        <div className="overflow-x-auto">
          <LogsTable
            rows={filtered}
            now={now}
            expandedId={expandedId}
            onToggle={(id) => setExpandedId((curr) => (curr === id ? null : id))}
          />
        </div>
      </div>
    </div>
  );
}

const columnHelper = createColumnHelper<Log>();

function LogsTable({
  rows,
  now,
  expandedId,
  onToggle,
}: {
  rows: ReadonlyArray<Log>;
  now: number;
  expandedId: string | null;
  onToggle: (id: string) => void;
}) {
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "expand",
        header: () => <span className="sr-only">Expand row</span>,
        cell: (info) => (
          <ExpandChevronCell
            isExpanded={info.row.original.id === expandedId}
            onToggle={() => onToggle(info.row.original.id)}
            logId={info.row.original.id}
          />
        ),
      }),
      columnHelper.accessor("id", {
        id: "id",
        header: () => <span>ID</span>,
        cell: (info) => (
          <span className="font-mono text-code text-foreground">
            {info.row.original.id}
          </span>
        ),
      }),
      columnHelper.display({
        id: "input",
        header: () => <span>Input</span>,
        cell: (info) => <InputCell log={info.row.original} />,
      }),
      columnHelper.display({
        id: "output",
        header: () => <span>Output</span>,
        cell: (info) => <OutputCell log={info.row.original} />,
      }),
      columnHelper.accessor("tokens", {
        id: "tokens",
        header: () => <span className="block text-right">Tokens</span>,
        cell: (info) => (
          <span className="block text-right font-mono tabular-nums text-foreground">
            {info.row.original.tokens.toLocaleString()}
          </span>
        ),
      }),
      columnHelper.accessor("cost", {
        id: "cost",
        header: () => <span className="block text-right">Cost</span>,
        cell: (info) => (
          <span className="block text-right font-mono tabular-nums text-foreground">
            ${info.row.original.cost.toFixed(4)}
          </span>
        ),
      }),
      columnHelper.display({
        id: "created",
        header: () => <span>Created</span>,
        cell: (info) => <CreatedCell iso={info.row.original.createdAt} now={now} />,
      }),
    ],
    [now, expandedId, onToggle],
  );

  const table = useReactTable({
    data: rows as Log[],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const headerCount = table.getAllLeafColumns().length;

  if (rows.length === 0) {
    return (
      <EmptyState
        variant="no-results"
        title="No logs match the current filters."
        subtitle="Widen the time range or clear a filter."
      />
    );
  }

  return (
    <table className={tableClass}>
      <thead className={tableHeaderClass}>
        {table.getHeaderGroups().map((group) => (
          <tr key={group.id}>
            {group.headers.map((header) => (
              <th
                key={header.id}
                className={cn(tableHeadVariants({ density: "compact" }), "normal-case")}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody className={tableBodyClass}>
        {table.getRowModel().rows.map((row) => {
          const log = row.original;
          const isExpanded = expandedId === log.id;
          return (
            <LogRowFragment
              key={log.id}
              log={log}
              cells={row.getVisibleCells().map((cell) => ({
                id: cell.id,
                node: flexRender(cell.column.columnDef.cell, cell.getContext()),
              }))}
              isExpanded={isExpanded}
              colSpan={headerCount}
            />
          );
        })}
      </tbody>
    </table>
  );
}

// The collapsed row and the expanded panel are two distinct `<tr>` elements
// (the expand panel spans every column). Keeping them as separate JSX trees
// inside one fragment — rather than gating one component with an `isExpanded`
// shape switch — keeps each block local and readable.
function LogRowFragment({
  log,
  cells,
  isExpanded,
  colSpan,
}: {
  log: Log;
  cells: ReadonlyArray<{ id: string; node: React.ReactNode }>;
  isExpanded: boolean;
  colSpan: number;
}) {
  const expandPanelId = `log-${log.id}-expand`;
  return (
    <>
      <tr
        className={cn(tableRowVariants({ density: "compact" }), isExpanded && "bg-hover-surface")}
      >
        {cells.map((cell) => (
          <td key={cell.id} className={tableCellVariants({ density: "compact" })}>
            {cell.node}
          </td>
        ))}
      </tr>
      {isExpanded && (
        <tr id={expandPanelId} className="border-b border-border bg-muted-surface/40">
          <td colSpan={colSpan} className="px-4 py-4">
            <LogExpandPanel log={log} />
          </td>
        </tr>
      )}
    </>
  );
}

function ExpandChevronCell({
  isExpanded,
  onToggle,
  logId,
}: {
  isExpanded: boolean;
  onToggle: () => void;
  logId: string;
}) {
  const expandPanelId = `log-${logId}-expand`;
  return (
    <button
      type="button"
      aria-label={isExpanded ? `Collapse log ${logId}` : `Expand log ${logId}`}
      aria-expanded={isExpanded}
      aria-controls={expandPanelId}
      onClick={onToggle}
      className={cn(
        "inline-flex size-5 items-center justify-center rounded-sm",
        "text-meta-foreground hover:text-foreground",
        "transition-transform duration-fast",
        isExpanded && "rotate-90",
      )}
    >
      <ChevronRight aria-hidden="true" className="size-3.5" />
    </button>
  );
}

// Wireframe legend: `Input (60 char)`. We cap the data at 60 chars (a single
// substring slice with an ellipsis) and let the cell shrink with the column
// via `truncate` — at narrow viewports the CSS ellipsis kicks in, at wide
// viewports the row collapses to a single line of 60-char content.
const TRUNCATE_AT = 60;

function truncate(text: string): string {
  return text.length <= TRUNCATE_AT ? text : `${text.slice(0, TRUNCATE_AT)}…`;
}

function InputCell({ log }: { log: Log }) {
  const text = truncate(log.input);
  return (
    <span
      className="block max-w-[20rem] truncate font-mono text-code text-foreground"
      title={log.input}
    >
      {text}
    </span>
  );
}

function OutputCell({ log }: { log: Log }) {
  if (log.output === null) {
    return <span className="italic text-muted-foreground">empty</span>;
  }
  const text = truncate(log.output);
  return (
    <span
      className="block max-w-[20rem] truncate font-mono text-code text-foreground"
      title={log.output}
    >
      {text}
    </span>
  );
}

function CreatedCell({ iso, now }: { iso: string; now: number }) {
  return (
    <span title={iso} className="text-muted-foreground">
      {formatRelativeTime(iso, now)}
    </span>
  );
}
