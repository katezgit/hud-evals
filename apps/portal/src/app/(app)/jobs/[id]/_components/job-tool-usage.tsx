"use client";

import { Fragment } from "react";
import { toast } from "sonner";
import { CodeBlock } from "@repo/ui/components/code-block";
import { SegmentedControl } from "@repo/ui/components/segmented-control";
import {
  tableBodyClass,
  tableCellVariants,
  tableClass,
  tableHeaderClass,
  tableHeadVariants,
  tableRowVariants,
} from "@repo/ui/components/table";
import { cn } from "@repo/ui/lib/cn";
import type {
  JobDetail,
  JobTask,
  JobToolPattern,
  JobToolScope,
  JobToolStat,
} from "@/lib/mock/job-detail";

interface JobToolUsageProps {
  detail: JobDetail;
  /** Active task filter — "all" or a task id. */
  filter: string;
  onFilterChange: (next: string) => void;
}

export function JobToolUsage({ detail, filter, onFilterChange }: JobToolUsageProps) {
  const scope = detail.toolScopes[filter] ?? detail.toolScopes.all;
  if (!scope) return null;

  return (
    <section
      aria-labelledby="job-overview-tool-usage"
      className="flex flex-col gap-4"
    >
      <header className="flex items-baseline justify-between gap-3">
        <h2
          id="job-overview-tool-usage"
          className="text-subtitle font-semibold text-foreground"
        >
          Tool Usage
        </h2>
        <span className="text-label text-muted-foreground">
          {scope.totals.calls} calls · {scope.totals.avgPerRun} avg/Run · {scope.totals.toolsUsed} of {scope.totals.totalTools} tools used
        </span>
      </header>
      <FilterBar
        tasks={detail.tasks}
        filter={filter}
        onFilterChange={onFilterChange}
      />
      <div className="grid grid-cols-[1.35fr_1fr] gap-10">
        <ToolUsageTable scope={scope} filter={filter} />
        <div className="flex flex-col gap-6">
          <CommonPatterns patterns={scope.patterns} />
          <PatternMatrix
            patterns={scope.patterns}
            matrix={scope.matrix}
            columns={scope.matrixColumns}
          />
          <CommandNote command={detail.rerunCommand} />
        </div>
      </div>
    </section>
  );
}

function SectionLabel({ label, free }: { label: string; free?: string }) {
  return (
    <p className="flex items-baseline gap-2.5 font-mono text-meta uppercase tracking-wider text-meta-foreground">
      <span>{label}</span>
      {free ? (
        <span className="text-meta normal-case tracking-normal text-muted-foreground">
          {free}
        </span>
      ) : null}
    </p>
  );
}

interface FilterBarProps {
  tasks: ReadonlyArray<JobTask>;
  filter: string;
  onFilterChange: (next: string) => void;
}

function FilterBar({ tasks, filter, onFilterChange }: FilterBarProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="mr-1 font-mono text-meta uppercase tracking-wider text-meta-foreground">
        Filter by Task
      </span>
      <SegmentedControl
        aria-label="Filter tool usage by task"
        value={filter}
        onValueChange={onFilterChange}
      >
        <SegmentedControl.Item value="all">All Runs</SegmentedControl.Item>
        {tasks.map((t) => (
          <SegmentedControl.Item key={t.id} value={t.id}>
            <span className="font-mono">{t.id}</span>
          </SegmentedControl.Item>
        ))}
      </SegmentedControl>
    </div>
  );
}

interface ToolUsageTableProps {
  scope: JobToolScope;
  filter: string;
}

function ToolUsageTable({ scope, filter }: ToolUsageTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className={tableClass}>
        <thead className={tableHeaderClass}>
          <tr>
            <th scope="col" className={tableHeadVariants({ density: "compact" })}>
              Tool
            </th>
            <th scope="col" className={tableHeadVariants({ density: "compact" })}>
              Share
            </th>
            <th scope="col" className={cn(tableHeadVariants({ density: "compact" }), "text-right")}>
              Avg/Run
            </th>
            <th scope="col" className={cn(tableHeadVariants({ density: "compact" }), "text-right")}>
              Time p50
            </th>
            <th scope="col" className={cn(tableHeadVariants({ density: "compact" }), "text-right")}>
              Reward
            </th>
            <th scope="col" className={cn(tableHeadVariants({ density: "compact" }), "text-right")}>
              Empty%
            </th>
            <th scope="col" className={cn(tableHeadVariants({ density: "compact" }), "text-right")}>
              Avg Out
            </th>
          </tr>
        </thead>
        <tbody className={tableBodyClass}>
          {scope.toolStats.map((stat) =>
            "unused" in stat ? (
              <UnusedToolRow key={stat.name} name={stat.name} />
            ) : (
              <UsedToolRow key={stat.name} stat={stat} filter={filter} />
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}

function UsedToolRow({ stat, filter }: { stat: JobToolStat; filter: string }) {
  const handleClick = () => {
    const taskQual = filter === "all" ? "" : ` · task=${filter}`;
    toast(`→ Traces · tool=${stat.name}${taskQual}`);
  };

  // Color map by tool name — only `anthropic_computer` and `launch_app` ship a tint,
  // matching the prototype. Anything else falls back to the chart-1 (primary) shade.
  const barFillClass = TOOL_BAR_TINTS[stat.name] ?? "bg-chart-1";
  const sharePct = Math.round(stat.share * 100);

  return (
    <tr
      className={cn(tableRowVariants({ density: "compact" }), "cursor-pointer")}
      onClick={handleClick}
    >
      <td className={cn(tableCellVariants({ density: "compact", variant: "mono" }))}>
        {stat.name}
      </td>
      <td className={tableCellVariants({ density: "compact" })}>
        <ShareBar pct={sharePct} fillClass={barFillClass} />
      </td>
      <td className={cn(tableCellVariants({ density: "compact", variant: "mono" }), "text-right")}>
        {stat.avgPerRun}
      </td>
      <td className={cn(tableCellVariants({ density: "compact", variant: "mono" }), "text-right text-muted-foreground")}>
        {stat.timeP50}
      </td>
      <td className={cn(tableCellVariants({ density: "compact", variant: "mono" }), "text-right text-state-scored-text")}>
        {stat.reward}
      </td>
      <td
        className={cn(
          tableCellVariants({ density: "compact", variant: "mono" }),
          "text-right",
          stat.emptyRate === "100%" ? "text-state-errored-text" : "text-muted-foreground",
        )}
      >
        {stat.emptyRate}
      </td>
      <td className={cn(tableCellVariants({ density: "compact", variant: "mono" }), "text-right text-muted-foreground")}>
        {stat.avgOut}
      </td>
    </tr>
  );
}

function UnusedToolRow({ name }: { name: string }) {
  return (
    <tr className={tableRowVariants({ density: "compact" })}>
      <td
        className={cn(
          tableCellVariants({ density: "compact", variant: "mono" }),
          "italic text-meta-foreground",
        )}
      >
        {name}
      </td>
      <td
        className={cn(
          tableCellVariants({ density: "compact" }),
          "text-label text-meta-foreground",
        )}
      >
        not used
      </td>
      <td className={cn(tableCellVariants({ density: "compact", variant: "mono" }), "text-right text-meta-foreground")}>
        0
      </td>
      <td className={cn(tableCellVariants({ density: "compact", variant: "mono" }), "text-right text-meta-foreground")}>
        —
      </td>
      <td className={cn(tableCellVariants({ density: "compact", variant: "mono" }), "text-right text-meta-foreground")}>
        —
      </td>
      <td className={cn(tableCellVariants({ density: "compact", variant: "mono" }), "text-right text-meta-foreground")}>
        —
      </td>
      <td className={cn(tableCellVariants({ density: "compact", variant: "mono" }), "text-right text-meta-foreground")}>
        —
      </td>
    </tr>
  );
}

const TOOL_BAR_TINTS: Record<string, string> = {
  // Prototype uses purple/yellow; chart-4 and chart-2 are the closest tokens.
  anthropic_computer: "bg-chart-4",
  launch_app: "bg-chart-2",
};

function ShareBar({ pct, fillClass }: { pct: number; fillClass: string }) {
  return (
    <span
      className="inline-block h-1.5 w-32 overflow-hidden rounded-full bg-muted align-middle"
      role="presentation"
    >
      <span
        className={cn("block h-full rounded-full", fillClass)}
        style={{ width: `${pct}%` }}
      />
    </span>
  );
}

function CommonPatterns({ patterns }: { patterns: ReadonlyArray<JobToolPattern> }) {
  return (
    <div className="flex flex-col gap-2">
      <SectionLabel label="Common Patterns" />
      <div className="grid grid-cols-[28px_1fr_36px_60px] gap-x-3 gap-y-1">
        <div className="font-mono text-meta uppercase tracking-wider text-meta-foreground">
          #
        </div>
        <div className="font-mono text-meta uppercase tracking-wider text-meta-foreground">
          Pattern
        </div>
        <div className="text-right font-mono text-meta uppercase tracking-wider text-meta-foreground">
          N
        </div>
        <div className="text-right font-mono text-meta uppercase tracking-wider text-meta-foreground">
          Reward
        </div>
        {patterns.map((p) => (
          <Fragment key={p.id}>
            <button
              type="button"
              onClick={() => toast(`→ Traces matching ${p.id}`)}
              className="contents cursor-pointer"
            >
              <span className="self-center border-t border-border pt-2 font-mono text-label text-meta-foreground">
                {p.id}
              </span>
              <span className="flex items-center gap-1.5 border-t border-border pt-2">
                {p.steps.map((step, idx) => (
                  <Fragment key={`${p.id}-${step}-${idx.toString()}`}>
                    <PatternChip step={step} />
                    {idx < p.steps.length - 1 ? (
                      <span className="text-meta-foreground">→</span>
                    ) : null}
                  </Fragment>
                ))}
              </span>
              <span className="self-center border-t border-border pt-2 text-right font-mono text-label">
                {p.n}
              </span>
              <span className="self-center border-t border-border pt-2 text-right font-mono text-label text-state-scored-text">
                {p.reward}
              </span>
            </button>
          </Fragment>
        ))}
      </div>
    </div>
  );
}

const PATTERN_CHIP_TINTS: Record<string, string> = {
  anthropic_computer:
    "bg-chart-4/15 text-chart-4 border-chart-4/40",
  launch_app:
    "bg-chart-2/15 text-chart-2 border-chart-2/40",
};

function PatternChip({ step }: { step: string }) {
  const tint = PATTERN_CHIP_TINTS[step] ?? "bg-muted text-foreground border-border";
  return (
    <span
      className={cn(
        "inline-flex rounded-sm border px-1.5 py-0.5 font-mono text-meta",
        tint,
      )}
    >
      {step}
    </span>
  );
}

interface PatternMatrixProps {
  patterns: ReadonlyArray<JobToolPattern>;
  matrix: Record<string, Record<string, string | undefined>>;
  columns: ReadonlyArray<string>;
}

function PatternMatrix({ patterns, matrix, columns }: PatternMatrixProps) {
  return (
    <div className="flex flex-col gap-2">
      <SectionLabel label="Pattern / Trace Matrix" />
      <div className="flex flex-col gap-2">
        <div className="ml-9 flex gap-2.5 font-mono text-meta text-meta-foreground">
          {columns.map((c) => (
            <span key={c} className="w-8 text-center">
              {c}
            </span>
          ))}
        </div>
        {patterns.map((p) => (
          <div key={p.id} className="flex items-center gap-2.5">
            <span className="w-6 font-mono text-label text-meta-foreground">
              {p.id}
            </span>
            {columns.map((c) => {
              const r = matrix[p.id]?.[c];
              if (r) {
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toast(`→ Trace task ${c} · ${p.id}`)}
                    className="grid size-8 cursor-pointer place-items-center rounded-sm border border-border-strong bg-state-scored-subtle font-mono text-meta font-semibold leading-none tracking-tight text-state-scored-text hover:ring-2 hover:ring-primary"
                  >
                    {r.slice(0, 3)}
                  </button>
                );
              }
              return (
                <span
                  key={c}
                  aria-hidden="true"
                  className="grid size-8 place-items-center rounded-sm border border-border-strong bg-muted font-mono text-meta leading-none text-meta-foreground opacity-30"
                >
                  —
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function CommandNote({ command }: { command: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3 font-mono text-label text-muted-foreground">
      <span>Re-run this Taskset with the pinned seed:</span>
      <CodeBlock variant="block" code={command} />
    </div>
  );
}

// Keep tree-shaking happy — re-export the section label used by callers (none yet).
export type { JobDetail };
