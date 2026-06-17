"use client";

import { useEffect, useState } from "react";
import { FilterIcon } from "lucide-react";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverSeparator,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import {
  SegmentedControl,
} from "@repo/ui/components/segmented-control";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Switch } from "@repo/ui/components/switch";

import { EVAL_MODEL_GROUPS } from "@/lib/mock/eval-models";

import {
  countActiveStatsFilters,
  DEFAULT_STATS_FILTERS,
  ENV_VERSION_OPTIONS,
  PASS_AT_K_OPTIONS,
  type TasksetStatsFilters,
} from "./tasks-tab-filters";

interface TasksTabFiltersPopoverProps {
  applied: TasksetStatsFilters;
  /** Distinct scenario prefixes derived from this taskset's tasks (e.g. `browser`, `swe-bench`). */
  environments: ReadonlyArray<string>;
  onApply: (next: TasksetStatsFilters) => void;
}

export function TasksTabFiltersPopover({
  applied,
  environments,
  onApply,
}: TasksTabFiltersPopoverProps) {
  const [open, setOpen] = useState(false);
  // Draft mirrors applied while the popover is closed; on open the user mutates
  // draft freely. Apply commits draft -> applied; Cancel / click-outside / ESC
  // discards draft by re-seeding from applied on next open.
  const [draft, setDraft] = useState<TasksetStatsFilters>(applied);

  // Re-seed draft when popover opens so prior cancelled edits don't persist.
  useEffect(() => {
    if (open) setDraft(applied);
  }, [open, applied]);

  const activeCount = countActiveStatsFilters(applied);

  function update<K extends keyof TasksetStatsFilters>(
    key: K,
    value: TasksetStatsFilters[K],
  ) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function handleApply() {
    onApply(draft);
    setOpen(false);
  }

  function handleClear() {
    setDraft(DEFAULT_STATS_FILTERS);
  }

  function handleCancel() {
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="secondary">
          <FilterIcon aria-hidden="true" />
          Filters
          {activeCount > 0 && (
            <Badge variant="brand-soft" className="ml-1">
              {activeCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        variant="filter"
        align="end"
        sideOffset={8}
        className="w-80 max-w-none"
      >
        <div className="flex flex-col gap-4">
          <span className="text-label font-medium uppercase text-muted-foreground">
            Stats scope
          </span>

          <FilterFieldStack label="Model">
            <Select
              value={draft.modelId ?? "__all__"}
              onValueChange={(v) => update("modelId", v === "__all__" ? null : v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All models" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All models</SelectItem>
                {EVAL_MODEL_GROUPS.map((group) => (
                  <SelectGroup key={group.provider}>
                    <SelectLabel>{group.provider}</SelectLabel>
                    {group.models.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </FilterFieldStack>

          <FilterFieldStack label="Environment">
            <Select
              value={draft.environment ?? "__all__"}
              onValueChange={(v) =>
                update("environment", v === "__all__" ? null : v)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All environments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All environments</SelectItem>
                {environments.map((env) => (
                  <SelectItem key={env} value={env}>
                    {env}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterFieldStack>

          <FilterFieldStack label="Earliest env version">
            <Select
              value={draft.earliestEnvVersion ?? "__any__"}
              onValueChange={(v) =>
                update("earliestEnvVersion", v === "__any__" ? null : v)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Any version" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__any__">Any version</SelectItem>
                {ENV_VERSION_OPTIONS.map((v) => (
                  <SelectItem key={v} value={v}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterFieldStack>

          <FilterFieldStack label="Trace display">
            <Select
              value={draft.traceDisplay}
              onValueChange={(v) =>
                update("traceDisplay", v as TasksetStatsFilters["traceDisplay"])
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All jobs</SelectItem>
                <SelectItem value="latest">Latest job only</SelectItem>
              </SelectContent>
            </Select>
          </FilterFieldStack>

          <FilterFieldStack label="Traces per task (pass@K)">
            <SegmentedControl
              aria-label="Traces per task (pass@K)"
              value={String(draft.passAtK)}
              onValueChange={(v) =>
                update("passAtK", Number(v) as TasksetStatsFilters["passAtK"])
              }
              className="w-full"
            >
              {PASS_AT_K_OPTIONS.map((k) => (
                <SegmentedControl.Item
                  key={k}
                  value={String(k)}
                  className="flex-1 px-2"
                >
                  {k}
                </SegmentedControl.Item>
              ))}
            </SegmentedControl>
          </FilterFieldStack>

          <FilterFieldRow label="Include training runs">
            <Switch
              checked={draft.includeTrainingRuns}
              onCheckedChange={(checked) =>
                update("includeTrainingRuns", checked)
              }
              aria-label="Include training runs"
            />
          </FilterFieldRow>

          <PopoverSeparator />

          <div className="flex items-center justify-between gap-2">
            <Button type="button" variant="ghost" onClick={handleClear}>
              Clear
            </Button>
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="button" variant="primary" onClick={handleApply}>
                Apply
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function FilterFieldStack({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-label font-medium text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}

function FilterFieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-label font-medium text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}
