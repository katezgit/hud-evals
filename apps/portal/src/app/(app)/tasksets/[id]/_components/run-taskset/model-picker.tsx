"use client";

import { useMemo } from "react";
import { Label } from "@repo/ui/components/label";
import { SearchInput } from "@repo/ui/components/search-input";
import { MODEL_REGISTRY, PROVIDER_ORDER, type Model } from "@/lib/mock/model-registry";
import ProviderGroup from "./provider-group";

interface ModelPickerProps {
  selectedIds: ReadonlySet<string>;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onToggleModel: (id: string) => void;
  onToggleProvider: (modelIds: ReadonlyArray<string>, nextChecked: boolean) => void;
}

const MODELS_BY_PROVIDER: ReadonlyMap<string, ReadonlyArray<Model>> = new Map(
  PROVIDER_ORDER.map((p) => [p, MODEL_REGISTRY.filter((m) => m.provider === p)]),
);

export default function ModelPicker({
  selectedIds,
  searchQuery,
  onSearchChange,
  onToggleModel,
  onToggleProvider,
}: ModelPickerProps) {
  const q = searchQuery.trim().toLowerCase();

  const filteredByProvider = useMemo(() => {
    const map = new Map<string, ReadonlyArray<Model>>();
    for (const provider of PROVIDER_ORDER) {
      const all = MODELS_BY_PROVIDER.get(provider) ?? [];
      const visible = q ? all.filter((m) => m.id.toLowerCase().includes(q)) : all;
      map.set(provider, visible);
    }
    return map;
  }, [q]);

  const totalVisible = Array.from(filteredByProvider.values()).reduce(
    (sum, list) => sum + list.length,
    0,
  );

  return (
    <div className="flex flex-col gap-1.5">
      <Label id="run-taskset-model-search-label" htmlFor="run-taskset-model-search">
        Models
      </Label>

      <div className="flex max-h-72 flex-col overflow-hidden rounded-md border border-border">
        <div className="sticky top-0 z-20 border-b border-border bg-elevated p-2">
          <SearchInput
            id="run-taskset-model-search"
            size="sm"
            placeholder="Search models…"
            aria-labelledby="run-taskset-model-search-label"
            defaultValue={searchQuery}
            onLiveChange={onSearchChange}
          />
        </div>
        <div className="flex-1 overflow-y-auto">
        {totalVisible === 0 ? (
          <div className="flex items-center justify-center py-8 text-body text-muted-foreground">
            No matches
          </div>
        ) : (
          PROVIDER_ORDER.map((provider) => {
            const visibleModels = filteredByProvider.get(provider) ?? [];
            if (visibleModels.length === 0) return null;
            return (
              <ProviderGroup
                key={provider}
                provider={provider}
                visibleModels={visibleModels}
                totalModels={MODELS_BY_PROVIDER.get(provider) ?? []}
                selectedIds={selectedIds}
                onToggleModel={onToggleModel}
                onToggleProvider={onToggleProvider}
              />
            );
          })
        )}
        </div>
      </div>
    </div>
  );
}
