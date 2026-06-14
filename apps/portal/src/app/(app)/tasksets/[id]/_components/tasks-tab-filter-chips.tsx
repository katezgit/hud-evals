"use client";

import { XIcon } from "lucide-react";

import { cn } from "@repo/ui/lib/cn";

import { EVAL_MODELS } from "@/lib/mock/eval-models";

import {
  countActiveStatsFilters,
  DEFAULT_STATS_FILTERS,
  type TasksetStatsFilters,
} from "./tasks-tab-filters";

interface ChipDef {
  key: keyof TasksetStatsFilters;
  label: string;
}

interface TasksTabFilterChipsProps {
  applied: TasksetStatsFilters;
  onChange: (next: TasksetStatsFilters) => void;
}

function modelLabel(id: string | null): string {
  if (!id) return "All models";
  const m = EVAL_MODELS.find((x) => x.id === id);
  return m?.name ?? id;
}

function buildChips(f: TasksetStatsFilters): Array<ChipDef> {
  const chips: Array<ChipDef> = [];
  if (f.modelId !== DEFAULT_STATS_FILTERS.modelId) {
    chips.push({ key: "modelId", label: `Model: ${modelLabel(f.modelId)}` });
  }
  if (f.environment !== DEFAULT_STATS_FILTERS.environment) {
    chips.push({
      key: "environment",
      label: `Env: ${f.environment}`,
    });
  }
  if (f.earliestEnvVersion !== DEFAULT_STATS_FILTERS.earliestEnvVersion) {
    chips.push({
      key: "earliestEnvVersion",
      label: `Env ≥ ${f.earliestEnvVersion}`,
    });
  }
  if (f.traceDisplay !== DEFAULT_STATS_FILTERS.traceDisplay) {
    chips.push({ key: "traceDisplay", label: "Latest job only" });
  }
  if (f.passAtK !== DEFAULT_STATS_FILTERS.passAtK) {
    chips.push({ key: "passAtK", label: `pass@${f.passAtK}` });
  }
  if (f.includeTrainingRuns !== DEFAULT_STATS_FILTERS.includeTrainingRuns) {
    chips.push({ key: "includeTrainingRuns", label: "Inc. training runs" });
  }
  return chips;
}

export function TasksTabFilterChips({
  applied,
  onChange,
}: TasksTabFilterChipsProps) {
  if (countActiveStatsFilters(applied) === 0) return null;
  const chips = buildChips(applied);

  function removeChip(key: keyof TasksetStatsFilters) {
    onChange({ ...applied, [key]: DEFAULT_STATS_FILTERS[key] });
  }

  return (
    <div
      role="region"
      aria-label="Active stats filters"
      className="flex flex-wrap items-center gap-1.5"
    >
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => removeChip(chip.key)}
          className={cn(
            "inline-flex items-center gap-1",
            "rounded-full border border-border bg-muted-surface",
            "px-2 py-1",
            "text-label text-foreground",
            "transition-colors duration-fast ease-out-standard",
            "hover:bg-hover-surface",
          )}
          aria-label={`Remove filter ${chip.label}`}
        >
          <span>{chip.label}</span>
          <XIcon aria-hidden="true" className="size-3" />
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange(DEFAULT_STATS_FILTERS)}
        className="text-label text-primary cursor-pointer hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}
