"use client";

// Card view for the Job detail Traces tab.
// 3-col grid; each card = 16:10 preview + body (prompt as title, model line,
// id+time footer). Reward pill in preview corner uses the app-level reward bands.

import * as React from "react";
import { ArrowUpRight, MoreVertical, Timer, Wrench, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@repo/ui/components/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import { cn } from "@repo/ui/lib/cn";
import type { JobModelSummary, JobRun } from "@/lib/mock/job-detail";
import type { TraceRow } from "./job-run-table";

interface JobTraceCardsProps {
  jobId: string;
  modelId: string;
  /** Winner-first summaries. Pass an empty array for single-model jobs to skip dot rendering. */
  models: ReadonlyArray<JobModelSummary>;
  rows: ReadonlyArray<TraceRow>;
  selectedRunIds: ReadonlySet<string>;
  onToggleSelect: (runId: string) => void;
}

// ── Model dot color mapping ──────────────────────────────────────────────────
// APP-LEVEL composition of existing semantic tokens. Mirrors the mockup palette:
// winner → primary teal; second → state-scored green; third → state-warning amber;
// fourth+ → muted-foreground (the strip is text-only past 3 anyway).
function modelDotClass(modelId: string, models: ReadonlyArray<JobModelSummary>): string {
  const idx = models.findIndex((m) => m.modelId === modelId);
  if (idx === 0) return "bg-primary";
  if (idx === 1) return "bg-state-scored-text";
  if (idx === 2) return "bg-state-warning-text";
  return "bg-meta-foreground";
}

export function JobTraceCards({
  jobId,
  modelId,
  models,
  rows,
  selectedRunIds,
  onToggleSelect,
}: JobTraceCardsProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card px-3 py-12 text-center text-body text-muted-foreground">
        No traces match.
      </div>
    );
  }
  const isMultiModel = models.length >= 2;
  // pt-0.5 gives the selected-card `ring-2` 2px of clearance against the
  // parent scroll container's overflow-y-auto clip. Without it, the first row's
  // top ring edge is sliced off.
  return (
    <div className="grid grid-cols-1 gap-3 pt-0.5 md:grid-cols-2 lg:grid-cols-3">
      {rows.map((row) => (
        <TraceCard
          key={row.run.id}
          jobId={jobId}
          // Multi-model: each card surfaces its own trace's modelId; single-model
          // fixtures fall back to the panel-wide default.
          modelId={isMultiModel ? row.run.modelId : modelId}
          dotClass={isMultiModel ? modelDotClass(row.run.modelId, models) : null}
          row={row}
          selected={selectedRunIds.has(row.run.id)}
          onToggleSelect={() => onToggleSelect(row.run.id)}
        />
      ))}
    </div>
  );
}

// ── Single card ──────────────────────────────────────────────────────────────

interface TraceCardProps {
  jobId: string;
  modelId: string;
  /** Tailwind bg-* class for the model dot. null = single-model (dot hidden). */
  dotClass: string | null;
  row: TraceRow;
  selected: boolean;
  onToggleSelect: () => void;
}

function TraceCard({
  jobId,
  modelId,
  dotClass,
  row,
  selected,
  onToggleSelect,
}: TraceCardProps) {
  const { run, task } = row;
  const isNoScore = run.state === "no-score";

  const openTrace = () => {
    // TODO: confirm route — `/jobs/[id]/traces/[traceId]` doesn't exist yet.
    toast(`→ Trace ${jobId}/${run.id}`);
  };

  // Browser-task detection: all showcase tasks today are browser-prefixed.
  const isBrowserTask = (task.scenarioLabel ?? "").startsWith("browser:");

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openTrace}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openTrace();
        }
      }}
      aria-label={`Open trace ${run.id}`}
      className={cn(
        "group flex cursor-pointer flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors",
        "hover:border-border-strong hover:bg-hover-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        selected && "ring-2 ring-primary",
        isNoScore && "opacity-75",
      )}
    >
      {/* Preview pane — 16:10. Browser tasks render a tile-grid placeholder;
          non-browser fallback is a neutral muted surface. */}
      <div className="relative aspect-[16/10] overflow-hidden border-b border-border bg-muted-surface">
        {/* Browser chrome strip */}
        <div className="absolute inset-x-0 top-0 flex h-5 items-center gap-1.5 border-b border-border bg-secondary-surface px-2">
          <span aria-hidden="true" className="size-[7px] rounded-full bg-state-errored/80" />
          <span aria-hidden="true" className="size-[7px] rounded-full bg-state-warning/80" />
          <span aria-hidden="true" className="size-[7px] rounded-full bg-state-scored/80" />
        </div>
        {/* Canvas */}
        <div className="absolute inset-x-0 bottom-0 top-5 flex items-center justify-center">
          {isNoScore ? (
            <span className="font-mono text-meta text-meta-foreground">empty board</span>
          ) : isBrowserTask ? (
            <TilePreview taskId={task.id} runId={run.id} />
          ) : (
            <span className="font-mono text-meta text-meta-foreground">env preview</span>
          )}
        </div>
        {/* Kebab — top-right */}
        <div className="absolute right-1.5 top-6 z-10">
          <CardKebab runId={run.id} />
        </div>
        {/* Selection checkbox — top-left, only visible on hover or when selected.
            Wrapper is `inline-flex` (not block) to suppress the inline-flex
            descender baseline below the Checkbox, which otherwise inflates the
            container's bottom padding by ~4px. */}
        <div
          className={cn(
            "absolute left-1.5 top-6 z-10 inline-flex rounded-sm bg-card/70 p-0.5 backdrop-blur-sm transition-opacity",
            selected ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-within:opacity-100",
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            size="sm"
            checked={selected}
            onCheckedChange={onToggleSelect}
            aria-label={`Select trace ${run.id}`}
          />
        </div>
        {/* Meta badge — bottom-right.
            Surface uses the `code-bg` token (PINNED `--ink-900` in both themes),
            not `bg-black/X` — `--color-black` is intentionally not defined in
            the theme, so `bg-black/X` resolves to a transparent rgba and the
            badge reads as see-through in light mode. `code-bg` is the existing
            opaque-dark token in the design system. `text-code-fg` (PINNED
            `--ink-50`) gives ~14.5:1 contrast against the surface (WCAG AAA).
            No backdrop-blur — opaque surface doesn't need it. */}
        {!isNoScore && (
          <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1.5 rounded-md bg-code-bg px-2 py-1 font-mono text-meta font-medium text-code-fg">
            <RotateCcw aria-hidden="true" className="size-3" />
            <span>Turns {run.turns}</span>
            <span aria-hidden="true" className="text-code-muted">·</span>
            <Wrench aria-hidden="true" className="size-3" />
            <span>Tools {run.turns}</span>
            <span aria-hidden="true" className="text-code-muted">·</span>
            <Timer aria-hidden="true" className="size-3" />
            <span>{run.durationLabel}</span>
            <RewardPill run={run} />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col gap-1.5 px-3.5 py-3">
        <div
          className="line-clamp-2 text-body font-semibold text-foreground"
          title={task.promptLabel ?? task.scenarioLabel ?? ""}
        >
          {task.promptLabel ?? task.scenarioLabel ?? "—"}
        </div>
        <div className="flex items-center gap-1.5 text-label text-muted-foreground">
          {dotClass && (
            <span aria-hidden="true" className={cn("size-1.5 shrink-0 rounded-full", dotClass)} />
          )}
          <span>{modelId}</span>
        </div>
        <div className="flex items-baseline gap-1.5 font-mono text-meta text-meta-foreground">
          <span>task {task.id}</span>
          <span aria-hidden="true">·</span>
          <span>{run.id}</span>
          <span aria-hidden="true">·</span>
          <span>2h ago</span>
        </div>
      </div>
    </div>
  );
}

// ── Tile preview placeholder (2048-style grid for browser tasks) ─────────────
// Deterministic per-run pattern so cards don't reshuffle on re-render.
const TILE_PALETTE = [
  "bg-white/[0.04]",
  "bg-secondary-surface",
  "bg-state-running-subtle",
  "bg-state-scored-subtle",
  "bg-state-warning-subtle",
] as const;

function tileSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

function TilePreview({ taskId, runId }: { taskId: string; runId: string }) {
  const tiles = React.useMemo(() => {
    let seed = tileSeed(`${taskId}:${runId}`);
    const out: number[] = [];
    for (let i = 0; i < 16; i += 1) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      out.push(seed % TILE_PALETTE.length);
    }
    return out;
  }, [taskId, runId]);
  return (
    <div className="grid grid-cols-4 gap-1 rounded-sm bg-secondary-surface p-1.5">
      {tiles.map((t, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={cn("size-6 rounded-xs", TILE_PALETTE[t])}
        />
      ))}
    </div>
  );
}

// ── Reward pill (inside meta badge) ──────────────────────────────────────────

function RewardPill({ run }: { run: JobRun }) {
  const rewardNum = run.reward !== null ? Number(run.reward) : null;
  if (rewardNum === null) {
    return (
      <span className="ml-1 rounded-sm border border-border bg-muted-surface px-1.5 py-px font-mono text-meta font-semibold text-meta-foreground">
        no score
      </span>
    );
  }
  // Reuse app-level band mapping; pill tint comes from the same family.
  // `error` state lands in the destructive band here, same render path as `scored`.
  let tint: string;
  if (rewardNum >= 0.7) {
    tint = "bg-state-scored-subtle border-state-scored/35 text-state-scored-text";
  } else if (rewardNum >= 0.4) {
    tint = "bg-state-warning-subtle border-state-warning/35 text-state-warning-text";
  } else {
    tint = "bg-state-errored-subtle border-state-errored/35 text-state-errored-text";
  }
  return (
    <span
      className={cn(
        "ml-1 rounded-sm border px-1.5 py-px font-mono text-meta font-semibold",
        tint,
      )}
    >
      {run.reward}
    </span>
  );
}

// ── Kebab popover (Open in new tab) ──────────────────────────────────────────

interface CardKebabProps {
  runId: string;
}

function CardKebab({ runId }: CardKebabProps) {
  const [open, setOpen] = React.useState(false);
  const openInNewTab = () => {
    setOpen(false);
    toast(`→ Trace ${runId} (new tab)`);
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Actions for trace ${runId}`}
          onClick={(e) => e.stopPropagation()}
          // `bg-black/X` is broken — `--color-black` isn't a theme token; the
          // utility resolves to a transparent rgba. Use `code-bg` (PINNED dark
          // surface) to get the opaque-dark chrome the badge family expects.
          className="inline-flex size-6 items-center justify-center rounded-sm bg-code-bg text-code-muted transition-colors hover:text-code-fg"
        >
          <MoreVertical aria-hidden="true" className="size-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-44 p-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openInNewTab();
          }}
          className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-body text-foreground transition-colors hover:bg-hover-surface"
        >
          <ArrowUpRight aria-hidden="true" className="size-3.5 text-meta-foreground" />
          Open in new tab
        </button>
      </PopoverContent>
    </Popover>
  );
}
