"use client";

import { cn } from "@repo/ui/lib/cn";
import type {
  TasksetJobRow,
  TasksetJobTraceDistribution,
} from "@/lib/mock/tasksets";

const TRACE_CHAR_TO_STATE: Record<string, keyof TasksetJobTraceDistribution> = {
  s: "scored",
  f: "failed",
  e: "errored",
  r: "running",
  n: "notrun",
};

const STATE_TO_SWATCH: Record<keyof TasksetJobTraceDistribution, string> = {
  scored: "bg-state-scored",
  failed: "bg-state-warning",
  errored: "bg-state-errored",
  running: "bg-state-running animate-pulse",
  notrun: "",
};

const STATE_TO_BAR_TOKEN: Record<keyof TasksetJobTraceDistribution, string> = {
  scored: "var(--color-state-scored)",
  failed: "var(--color-state-warning)",
  errored: "var(--color-state-errored)",
  running: "var(--color-state-running)",
  notrun: "var(--color-state-not-run)",
};

export const NOT_RUN_HATCH_STYLE: React.CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(45deg, var(--color-border-strong) 0 1px, transparent 1px 3px)",
};

function tracesAsStates(
  traces: string,
): ReadonlyArray<keyof TasksetJobTraceDistribution> {
  return traces.split("").map((c) => TRACE_CHAR_TO_STATE[c] ?? "notrun");
}

export function distOf(job: TasksetJobRow): TasksetJobTraceDistribution {
  if (job.dist) return job.dist;
  const d: TasksetJobTraceDistribution = {
    scored: 0,
    failed: 0,
    errored: 0,
    notrun: 0,
    running: 0,
  };
  if (job.traces) {
    for (const s of tracesAsStates(job.traces)) d[s] = (d[s] ?? 0) + 1;
  }
  return d;
}

export function totalTraces(job: TasksetJobRow): number {
  return job.traces ? job.traces.length : job.traceCount;
}

interface SparklineProps {
  points: ReadonlyArray<number>;
}

export function Sparkline({ points }: SparklineProps) {
  const w = 128;
  const h = 16;
  const mx = Math.max(...points);
  const mn = Math.min(...points);
  const rg = mx - mn || 1;
  const last = points[points.length - 1]!;
  const prev = points[points.length - 2] ?? last;
  const trendingDown = last < prev;
  const color = trendingDown
    ? "var(--color-state-warning)"
    : "var(--color-chart-1)";

  const coords = points.map((v, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - 2 - ((v - mn) / rg) * (h - 4);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const lx = w;
  const ly = h - 2 - ((last - mn) / rg) * (h - 4);

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      className="h-4 w-32 shrink-0"
      aria-hidden="true"
    >
      <polyline
        points={coords.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lx} cy={ly} r={1.7} fill={color} />
    </svg>
  );
}

interface TraceGridProps {
  traces: string;
}

export function TraceGrid({ traces }: TraceGridProps) {
  const states = tracesAsStates(traces);
  return (
    <div
      className="flex max-w-44 flex-nowrap gap-0.5 overflow-hidden"
      aria-hidden="true"
    >
      {states.map((s, i) => {
        const isNotRun = s === "notrun";
        return (
          <span
            key={i}
            className={cn(
              "size-1.5 shrink-0 rounded-sm",
              !isNotRun && STATE_TO_SWATCH[s],
              isNotRun && "border border-border-strong",
            )}
            style={isNotRun ? NOT_RUN_HATCH_STYLE : undefined}
          />
        );
      })}
    </div>
  );
}

interface DistBarProps {
  dist: TasksetJobTraceDistribution;
  total: number;
}

export function DistBar({ dist, total }: DistBarProps) {
  const summary = [
    `${dist.scored} scored`,
    `${dist.failed} failed`,
    `${dist.errored} errored`,
    dist.notrun ? `${dist.notrun} not run` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const seg = (
    n: number,
    state: keyof TasksetJobTraceDistribution,
  ): React.ReactNode => {
    if (!n) return null;
    return (
      <span
        key={state}
        className="h-full"
        style={{
          width: `${((n / total) * 100).toFixed(2)}%`,
          background: STATE_TO_BAR_TOKEN[state],
        }}
      />
    );
  };

  return (
    <div
      className="bg-secondary-surface flex h-1.5 w-44 overflow-hidden rounded-sm"
      aria-label={summary}
    >
      {seg(dist.scored, "scored")}
      {seg(dist.failed, "failed")}
      {seg(dist.errored, "errored")}
      {seg(dist.running ?? 0, "running")}
      <span
        className="bg-state-not-run h-full flex-1 opacity-dim"
        aria-hidden="true"
      />
    </div>
  );
}
