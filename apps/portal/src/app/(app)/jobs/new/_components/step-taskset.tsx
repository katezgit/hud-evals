"use client";

import * as React from "react";
import { LockIcon } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  Combobox,
  ComboboxTwoLineOption,
  type ComboboxGroup,
  type ComboboxOption,
} from "@repo/ui/components/combobox";
import { VisibilityIcon } from "@repo/ui/components/visibility-icon";
import type { Taskset } from "@/lib/mock/tasksets";
import { getTaskset } from "@/lib/mock/tasksets";
import { getBaselineCoverage } from "@/lib/mock/job-create";
import { BaselineHintCard } from "./baseline-hint-card";

export interface StepTasksetProps {
  selectedId: string | null;
  locked: boolean;
  modelId: string | null;
  tasksets: ReadonlyArray<Taskset>;
  onSelect: (id: string) => void;
  onUnlock: () => void;
  /** Click handler for the "Run baseline eval →" CTA on the no-baseline advisory. */
  onRunBaseline?: () => void;
}

export function StepTaskset({
  selectedId,
  locked,
  modelId,
  tasksets,
  onSelect,
  onUnlock,
  onRunBaseline,
}: StepTasksetProps) {
  const taskset = selectedId ? (getTaskset(selectedId) ?? null) : null;
  const lockedTaskset = locked ? taskset : null;
  // One-shot signal: Change-click unlocks AND asks the picker to open + focus
  // on its first mount. Incremented each unlock so a single change re-arms it.
  const [autoOpenToken, setAutoOpenToken] = React.useState(0);

  const handleUnlock = React.useCallback(() => {
    setAutoOpenToken((n) => n + 1);
    onUnlock();
  }, [onUnlock]);

  return (
    <div className="h-full flex flex-col gap-6">
      {lockedTaskset ? (
        <LockedTaskset taskset={lockedTaskset} onUnlock={handleUnlock} />
      ) : (
        <label className="flex flex-col gap-1.5">
          <span className="font-medium text-foreground">
            Taskset
          </span>
          <TasksetPicker
            tasksets={tasksets}
            value={selectedId}
            onValueChange={onSelect}
            autoOpenToken={autoOpenToken}
          />
        </label>
      )}

      {taskset && (
        <>
          {!lockedTaskset && <TasksetMetaLine taskset={taskset} />}
          {modelId && (
            <BaselineHintCard
              coverage={getBaselineCoverage(
                modelId,
                taskset.id,
                taskset.taskCount,
              )}
              onRunBaseline={onRunBaseline}
            />
          )}
        </>
      )}
    </div>
  );
}

function LockedTaskset({
  taskset,
  onUnlock,
}: {
  taskset: Taskset;
  onUnlock: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-primary bg-primary-glow px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <LockIcon
            aria-hidden="true"
            className="size-3.5 text-muted-foreground"
          />
          <span className="text-body font-medium text-primary">
            {taskset.name}
          </span>
          <span className="sr-only">Prefilled from URL — read-only.</span>
        </div>
        <Button variant="link" onClick={onUnlock} className="h-auto px-0">
          Change
        </Button>
      </div>
      <TasksetMetaLine taskset={taskset} />
    </div>
  );
}

function TasksetMetaLine({ taskset }: { taskset: Taskset }) {
  return (
    <div className="flex items-center gap-2 text-caption text-muted-foreground">
      <span>{taskset.taskCount} tasks</span>
      <span aria-hidden="true">·</span>
      <span className="inline-flex items-center gap-1">
        <VisibilityIcon visibility={taskset.visibility} size="sm" />
        {taskset.visibility === "public" ? "public" : "private"}
      </span>
      <span aria-hidden="true">·</span>
      <span>by {taskset.ownerName}</span>
    </div>
  );
}

// ── Taskset picker ────────────────────────────────────────────────────────────
// Grouped, two-line combobox built on the shared @repo/ui Combobox (renderOption
// + groups, shipped in PR #47). Filtering matches against taskset name only
// (Combobox runs match-sorter on label + value); owner-name search is not
// supported here — accepted minor regression vs the previous local impl.
//
// Grouping predicate matches the Tasksets index (tasksets-index.tsx):
//   • My Tasksets    → ownership === "team" || ownership === "user"
//   • Public Tasksets → visibility === "public" AND not in My Tasksets

interface TasksetPickerProps {
  tasksets: ReadonlyArray<Taskset>;
  value: string | null;
  onValueChange: (id: string) => void;
  // Bumped by parent on unlock — picker focuses the trigger input on the
  // matching render. The shared Combobox opens on focus.
  autoOpenToken?: number;
}

function isMine(t: Taskset): boolean {
  return t.ownership === "team" || t.ownership === "user";
}

function TasksetPicker({
  tasksets,
  value,
  onValueChange,
  autoOpenToken,
}: TasksetPickerProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Auto-focus on token bump — shared Combobox opens on focus. RAF defers
  // focus until after mount so the popover stays open through the first paint.
  React.useEffect(() => {
    if (autoOpenToken === undefined || autoOpenToken === 0) return;
    const raf = requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    return () => cancelAnimationFrame(raf);
  }, [autoOpenToken]);

  const tasksetById = React.useMemo(
    () => new Map(tasksets.map((t) => [t.id, t])),
    [tasksets],
  );

  const groups = React.useMemo<ComboboxGroup[]>(() => {
    const mine = tasksets.filter(isMine);
    const publicTs = tasksets.filter(
      (t) => !isMine(t) && t.visibility === "public",
    );
    const toOption = (t: Taskset): ComboboxOption => ({
      value: t.id,
      label: t.name,
    });
    const out: ComboboxGroup[] = [];
    if (mine.length > 0)
      out.push({ heading: "My Tasksets", options: mine.map(toOption) });
    if (publicTs.length > 0)
      out.push({
        heading: "Public Tasksets",
        options: publicTs.map(toOption),
      });
    return out;
  }, [tasksets]);

  const renderOption = React.useCallback(
    (option: ComboboxOption) => {
      const t = tasksetById.get(option.value);
      const secondary = t
        ? `${t.taskCount} tasks · ${t.visibility} · by ${t.ownerName}`
        : "";
      return (
        <ComboboxTwoLineOption primary={option.label} secondary={secondary} />
      );
    },
    [tasksetById],
  );

  return (
    <Combobox
      ref={inputRef}
      groups={groups}
      value={value}
      onValueChange={(id) => id && onValueChange(id)}
      placeholder="Pick a taskset"
      emptyText="No tasksets match."
      renderOption={renderOption}
    />
  );
}
