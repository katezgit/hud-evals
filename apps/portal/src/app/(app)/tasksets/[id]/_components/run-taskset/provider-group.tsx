"use client";

import { Checkbox } from "@repo/ui/components/checkbox";
import type { Model } from "@/lib/mock/model-registry";
import ModelRow from "./model-row";

interface ProviderGroupProps {
  provider: string;
  /** Models in this provider that pass the active search filter. */
  visibleModels: ReadonlyArray<Model>;
  /** Total models in this provider regardless of filter — drives the "{n} models" label and tri-state math. */
  totalModels: ReadonlyArray<Model>;
  selectedIds: ReadonlySet<string>;
  onToggleModel: (id: string) => void;
  onToggleProvider: (modelIds: ReadonlyArray<string>, nextChecked: boolean) => void;
}

export default function ProviderGroup({
  provider,
  visibleModels,
  totalModels,
  selectedIds,
  onToggleModel,
  onToggleProvider,
}: ProviderGroupProps) {
  const selectedInProvider = totalModels.filter((m) => selectedIds.has(m.id)).length;
  const allSelected = selectedInProvider === totalModels.length && totalModels.length > 0;
  const someSelected = selectedInProvider > 0 && !allSelected;
  // Radix Checkbox accepts boolean | "indeterminate"
  let checkedState: boolean | "indeterminate" = false;
  if (allSelected) checkedState = true;
  else if (someSelected) checkedState = "indeterminate";

  return (
    <div>
      <div
        className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-elevated py-1 pr-2.5 pl-2"
      >
        <Checkbox
          size="sm"
          checked={checkedState}
          // Tri-state click: any state → toggle to "select all" unless already fully selected, then deselect all.
          onCheckedChange={() =>
            onToggleProvider(
              totalModels.map((m) => m.id),
              !allSelected,
            )
          }
          aria-label={`Toggle all ${provider} models`}
        />
        <span className="text-label font-semibold text-foreground">{provider}</span>
        <span className="ml-auto font-mono text-meta text-meta-foreground">
          {totalModels.length} models
        </span>
      </div>
      {visibleModels.map((model) => (
        <ModelRow
          key={model.id}
          model={model}
          selected={selectedIds.has(model.id)}
          onToggle={onToggleModel}
        />
      ))}
    </div>
  );
}
