"use client";

import { useEffect, useRef } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/cn";
import type { JobRun, JobTask } from "@/lib/mock/job-detail";

interface JobCoverageGridProps {
  tasks: ReadonlyArray<JobTask>;
  runs: ReadonlyArray<JobRun>;
  selectedTaskId: string | null;
  onSelectTask: (taskId: string | null) => void;
}

interface TaskCellMeta {
  task: JobTask;
  runsForTask: ReadonlyArray<JobRun>;
  notRun: boolean;
  anyErrored: boolean;
}

function describeTask(task: JobTask, runsForTask: ReadonlyArray<JobRun>): TaskCellMeta {
  const notRun = runsForTask.length === 0;
  const anyErrored = runsForTask.some((r) => r.state === "error");
  return { task, runsForTask, notRun, anyErrored };
}

export function JobCoverageGrid({
  tasks,
  runs,
  selectedTaskId,
  onSelectTask,
}: JobCoverageGridProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Keyboard nav: j / k step through cells, Enter selects.
  // Bound to the container so it only fires while focus is in the grid.
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "j" && e.key !== "k" && e.key !== "Enter") return;
      const focused = document.activeElement as HTMLElement | null;
      if (!focused || !node.contains(focused)) return;
      const cells = Array.from(node.querySelectorAll<HTMLButtonElement>("[data-cell]"));
      if (cells.length === 0) return;
      const idx = cells.indexOf(focused as HTMLButtonElement);
      if (idx === -1) return;
      if (e.key === "j") {
        const next = cells[Math.min(cells.length - 1, idx + 1)];
        next?.focus();
        e.preventDefault();
      } else if (e.key === "k") {
        const prev = cells[Math.max(0, idx - 1)];
        prev?.focus();
        e.preventDefault();
      } else if (e.key === "Enter") {
        const taskId = focused.dataset.taskId;
        if (taskId) onSelectTask(taskId);
        e.preventDefault();
      }
    };
    node.addEventListener("keydown", onKey);
    return () => node.removeEventListener("keydown", onKey);
  }, [onSelectTask]);

  const cellMeta = tasks.map((task) =>
    describeTask(
      task,
      runs.filter((r) => r.taskId === task.id),
    ),
  );

  return (
    <div className="flex gap-1.5" ref={containerRef}>
      {cellMeta.map((meta) => (
        <CoverageCell
          key={meta.task.id}
          meta={meta}
          selected={meta.task.id === selectedTaskId}
          onClick={() => onSelectTask(meta.task.id)}
        />
      ))}
    </div>
  );
}

interface CoverageCellProps {
  meta: TaskCellMeta;
  selected: boolean;
  onClick: () => void;
}

function CoverageCell({ meta, selected, onClick }: CoverageCellProps) {
  const { task, runsForTask, notRun, anyErrored } = meta;
  const fillClass = notRun ? notRunFillClass : scoredFillClass;
  const tooltipBody = buildTooltipBody(meta);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          data-cell="true"
          data-task-id={task.id}
          aria-label={`Task ${task.id} — ${notRun ? "not run" : `${runsForTask.length} runs`}`}
          onClick={onClick}
          className={cn(
            "relative size-7 cursor-pointer rounded-sm border border-border-strong",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-background",
            selected && "ring-2 ring-primary ring-offset-1 ring-offset-background",
            fillClass,
          )}
        >
          {anyErrored ? (
            // Top-right triangle marker: any errored runs on this task.
            <span
              aria-hidden="true"
              className="absolute top-0 right-0 size-0"
              style={{
                borderTopRightRadius: 4,
                borderRightColor: "var(--color-state-warning)",
                borderRightStyle: "solid",
                borderRightWidth: 7,
                borderTopColor: "transparent",
                borderTopStyle: "solid",
                borderTopWidth: 0,
                borderBottomColor: "transparent",
                borderBottomStyle: "solid",
                borderBottomWidth: 7,
                borderLeftWidth: 0,
              }}
            />
          ) : null}
          <span
            className={cn(
              "absolute right-0 bottom-0.5 left-0 text-center font-mono text-meta font-semibold leading-none tracking-tight",
              notRun ? "text-meta-foreground" : "text-state-scored-text",
            )}
          >
            {task.id}
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent>{tooltipBody}</TooltipContent>
    </Tooltip>
  );
}

function buildTooltipBody(meta: TaskCellMeta): string {
  if (meta.notRun) return `${meta.task.id} — Not run`;
  const r = meta.runsForTask[0];
  if (!r) return meta.task.id;
  const validityLabel = meta.anyErrored ? "1 errored · counted as failure" : "valid · counted";
  return `${meta.task.id} · ${meta.runsForTask.length} run${meta.runsForTask.length === 1 ? "" : "s"} · reward ${r.reward ?? "—"} · ${validityLabel}`;
}

// Diagonal stripe fills — inline `bg-[...]` is the documented v4 exception for
// repeating-gradient backgrounds (no token covers gradient stops).
// We use chart color tokens via inline style fallback to stay token-aligned.
const scoredFillClass =
  "[background:repeating-linear-gradient(45deg,color-mix(in_srgb,var(--color-state-scored)_55%,#0a3a28)_0_3px,#0c2c20_3px_6px)]";
const notRunFillClass =
  "[background:repeating-linear-gradient(45deg,var(--color-state-not-run-subtle)_0_3px,var(--color-background)_3px_6px)]";

export function CoverageLegend() {
  return (
    <div className="flex items-center gap-4 font-mono text-label text-muted-foreground">
      <LegendChip
        label="Scored"
        swatchClass="[background:repeating-linear-gradient(45deg,var(--color-state-scored)_0_2px,#0c2c20_2px_4px)]"
      />
      <LegendChip label="No score" swatchClass="bg-meta-foreground" />
      <LegendChip
        label="Not run"
        swatchClass="[background:repeating-linear-gradient(45deg,var(--color-state-not-run-subtle)_0_2px,var(--color-background)_2px_4px)]"
      />
      <LegendChip label="Errored" swatchClass="bg-state-warning" />
    </div>
  );
}

function LegendChip({ label, swatchClass }: { label: string; swatchClass: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden="true"
        className={cn("inline-block size-2.5 rounded-sm border border-border", swatchClass)}
      />
      {label}
    </span>
  );
}
