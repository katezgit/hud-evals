"use client";

import { useId, useMemo, useState } from "react";
import { Checkbox } from "@repo/ui/components/checkbox";
import { Label } from "@repo/ui/components/label";
import { SearchInput } from "@repo/ui/components/search-input";
import { cn } from "@repo/ui/lib/cn";
import {
  EVAL_MODEL_GROUPS,
  type EvalModelGroup,
  type EvalModelRow,
} from "@/lib/mock/eval-models";

export interface StepEvalModelsProps {
  selection: ReadonlySet<string>;
  onSelectionChange: (next: ReadonlySet<string>) => void;
  tasksetName: string | null;
}

export function StepEvalModels({
  selection,
  onSelectionChange,
  tasksetName,
}: StepEvalModelsProps) {
  const searchId = useId();
  const labelId = useId();
  const [searchQuery, setSearchQuery] = useState<string>("");

  const q = searchQuery.trim().toLowerCase();

  const filteredGroups = useMemo<ReadonlyArray<EvalModelGroup>>(() => {
    if (!q) return EVAL_MODEL_GROUPS;
    return EVAL_MODEL_GROUPS.map((g) => ({
      provider: g.provider,
      models: g.models.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q) ||
          m.provider.toLowerCase().includes(q),
      ),
    })).filter((g) => g.models.length > 0);
  }, [q]);

  const toggleModel = (id: string) => {
    const next = new Set(selection);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  };

  const toggleGroup = (group: EvalModelGroup) => {
    const groupIds = group.models.map((m) => m.id);
    const allChecked = groupIds.every((id) => selection.has(id));
    const next = new Set(selection);
    if (allChecked) {
      for (const id of groupIds) next.delete(id);
    } else {
      for (const id of groupIds) next.add(id);
    }
    onSelectionChange(next);
  };

  const totalCount = selection.size;

  return (
    <div className="h-full flex flex-col gap-3">
      {totalCount > 0 && (
        <SelectionSummary selection={selection} onClear={() => onSelectionChange(new Set())} />
      )}

      <div className="flex-1 min-h-0 flex flex-col gap-1.5">
        <div className="flex flex-col gap-1">
          <Label id={labelId} htmlFor={searchId}>
            Models
          </Label>
          <p className="text-body text-muted-foreground">
            {tasksetName
              ? `Select one or more models to run on ${tasksetName}.`
              : "Select one or more models to run."}
          </p>
        </div>

        <div className="flex-1 min-h-0 flex flex-col overflow-hidden rounded-md border border-border">
          <div className="shrink-0 flex items-center gap-2 border-b border-border bg-elevated-surface p-2">
            <SearchInput
              id={searchId}
              placeholder="Search models…"
              aria-labelledby={labelId}
              defaultValue={searchQuery}
              onLiveChange={setSearchQuery}
              className="flex-1"
            />
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto">
            {filteredGroups.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-body text-muted-foreground">
                No models match.
              </div>
            ) : (
              filteredGroups.map((group) => (
                <ModelGroupSection
                  key={group.provider}
                  group={group}
                  selection={selection}
                  onToggleModel={toggleModel}
                  onToggleGroup={() => toggleGroup(group)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SelectionSummary({
  selection,
  onClear,
}: {
  selection: ReadonlySet<string>;
  onClear: () => void;
}) {
  const total = selection.size;
  const allSelected = useMemo<ReadonlyArray<EvalModelRow>>(() => {
    const out: EvalModelRow[] = [];
    for (const group of EVAL_MODEL_GROUPS) {
      for (const model of group.models) {
        if (selection.has(model.id)) out.push(model);
      }
    }
    return out;
  }, [selection]);

  const preview = allSelected.slice(0, 3);
  const extra = total - preview.length;

  return (
    <div className="shrink-0 flex items-center gap-2 rounded-md border border-border bg-elevated-surface px-3 py-2">
      <span className="text-meta text-meta-foreground uppercase tracking-wider">
        Selected
      </span>
      <span className="text-body font-medium text-foreground">
        {total} {total === 1 ? "model" : "models"}
      </span>
      <div className="flex items-center gap-1.5">
        {preview.map((m) => (
          <span
            key={m.id}
            className="inline-flex items-center rounded-sm border border-border-strong bg-background px-1.5 py-0.5 font-mono text-meta text-foreground"
          >
            {m.name}
          </span>
        ))}
        {extra > 0 && (
          <span className="text-meta text-meta-foreground">+{extra} more</span>
        )}
      </div>
      <button
        type="button"
        onClick={onClear}
        className="ml-auto text-caption text-primary hover:underline outline-hidden focus-visible:shadow-focus-ring rounded-sm"
      >
        Clear
      </button>
    </div>
  );
}

function ModelGroupSection({
  group,
  selection,
  onToggleModel,
  onToggleGroup,
}: {
  group: EvalModelGroup;
  selection: ReadonlySet<string>;
  onToggleModel: (id: string) => void;
  onToggleGroup: () => void;
}) {
  const groupIds = group.models.map((m) => m.id);
  const selectedInGroup = groupIds.filter((id) => selection.has(id)).length;
  const allChecked = selectedInGroup === groupIds.length && groupIds.length > 0;
  const someChecked = selectedInGroup > 0 && !allChecked;
  let checkedState: boolean | "indeterminate" = false;
  if (allChecked) checkedState = true;
  else if (someChecked) checkedState = "indeterminate";

  return (
    <div>
      <label
        className={cn(
          "sticky top-0 z-10 flex cursor-pointer items-center gap-3 border-b border-border bg-secondary-surface px-3 py-2",
          "transition-colors duration-fast ease-out-standard hover:bg-hover-surface",
        )}
      >
        <Checkbox checked={checkedState} onCheckedChange={onToggleGroup} />
        <span className="text-body font-semibold text-foreground">
          {group.provider}
        </span>
        <span className="ml-auto font-mono text-meta tabular-nums text-muted-foreground">
          {group.models.length}{" "}
          {group.models.length === 1 ? "model" : "models"}
        </span>
      </label>
      <ul className="flex flex-col">
        {group.models.map((model) => (
          <ModelRow
            key={model.id}
            model={model}
            checked={selection.has(model.id)}
            onToggle={() => onToggleModel(model.id)}
          />
        ))}
      </ul>
    </div>
  );
}

function ModelRow({
  model,
  checked,
  onToggle,
}: {
  model: EvalModelRow;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <li>
      <label className="flex cursor-pointer items-center gap-3 pl-9 pr-3 py-2 transition-colors duration-fast ease-out-standard hover:bg-hover-surface">
        <Checkbox checked={checked} onCheckedChange={onToggle} />
        <span className="font-mono text-caption text-foreground">
          {model.name}
        </span>
        <span className="ml-auto font-mono text-meta tabular-nums text-muted-foreground">
          {model.context} ctx
        </span>
      </label>
    </li>
  );
}
