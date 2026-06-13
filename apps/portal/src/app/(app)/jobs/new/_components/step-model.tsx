"use client";

import { useId, useMemo, useState } from "react";
import { AlertCircleIcon, XIcon } from "lucide-react";
import { Alert, AlertDescription } from "@repo/ui/components/alert";
import { IconButton } from "@repo/ui/components/icon-button";
import { Label } from "@repo/ui/components/label";
import { SearchInput } from "@repo/ui/components/search-input";
import { SegmentedControl } from "@repo/ui/components/segmented-control";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@repo/ui/components/select";
import { cn } from "@repo/ui/lib/cn";
import { TRAINING_MODELS, getTrainingModel } from "@/lib/mock/job-create";
import { ModelPickerRow } from "./model-picker-row";

type ModelScope = "user" | "base";

export interface StepModelProps {
  selectedId: string | null;
  requestedId: string | null;
  onSelect: (id: string) => void;
  onClearSelection: () => void;
}

export function StepModel({
  selectedId,
  requestedId,
  onSelect,
  onClearSelection,
}: StepModelProps) {
  const searchId = useId();
  const labelId = useId();
  const [searchQuery, setSearchQuery] = useState<string>("");

  const allUserModels = useMemo(
    () => TRAINING_MODELS.filter((m) => m.kind === "user"),
    [],
  );
  const allBaseModels = useMemo(
    () => TRAINING_MODELS.filter((m) => m.kind === "base"),
    [],
  );

  // Default scope follows the user's likely intent: their own models if any
  // exist, otherwise the base catalog. If the prefilled selection lives in
  // the base catalog, jump there so the active row is visible.
  const initialScope: ModelScope =
    selectedId && allBaseModels.some((m) => m.id === selectedId)
      ? "base"
      : allUserModels.length > 0
        ? "user"
        : "base";
  const [scope, setScope] = useState<ModelScope>(initialScope);

  // Prefill error: URL had a modelId that didn't resolve. Shown until the user
  // makes any selection; re-shown on reload because requestedId comes from URL.
  const prefillUnresolved =
    requestedId !== null && getTrainingModel(requestedId) === undefined;
  const [showPrefillError, setShowPrefillError] =
    useState<boolean>(prefillUnresolved);

  const handleSelect = (id: string) => {
    if (showPrefillError) setShowPrefillError(false);
    onSelect(id);
  };

  const q = searchQuery.trim().toLowerCase();

  const activeAll = scope === "user" ? allUserModels : allBaseModels;
  const activeFiltered = useMemo(
    () =>
      activeAll.filter(
        (m) =>
          !q ||
          m.id.toLowerCase().includes(q) ||
          m.name.toLowerCase().includes(q),
      ),
    [activeAll, q],
  );

  const emptyLabel =
    scope === "user"
      ? "No matches in My Models"
      : "No matches in Public Models";

  const selectedModel = selectedId ? getTrainingModel(selectedId) : undefined;

  const jumpToSelectedSegment = () => {
    if (!selectedModel) return;
    const targetScope: ModelScope =
      selectedModel.kind === "user" ? "user" : "base";
    if (scope !== targetScope) setScope(targetScope);
  };

  return (
    <div className="h-full flex flex-col gap-3">
      {showPrefillError && requestedId && (
        <Alert variant="destructive" className="shrink-0">
          <AlertCircleIcon aria-hidden="true" />
          <AlertDescription>
            <p>
              Model{" "}
              <span className="font-mono">&lsquo;{requestedId}&rsquo;</span> not
              found. Pick a model below to continue.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {selectedModel && (
        <div className="shrink-0 flex items-center gap-2 rounded-md border border-border bg-elevated-surface px-3 py-2">
          <span className="text-meta text-meta-foreground uppercase tracking-wider">
            Selected
          </span>
          <button
            type="button"
            onClick={jumpToSelectedSegment}
            className="text-body font-medium text-foreground hover:underline cursor-pointer text-left"
          >
            {selectedModel.name}
          </button>
          <IconButton
            variant="ghost"
            size="sm"
            aria-label="Clear selection"
            onClick={onClearSelection}
            className="ml-auto"
          >
            <XIcon />
          </IconButton>
        </div>
      )}

      <div className="flex-1 min-h-0 flex flex-col gap-1.5">
        <Label id={labelId} htmlFor={searchId} className="sr-only">
          Models
        </Label>

        <div className="flex-1 min-h-0 overflow-y-auto rounded-md border border-border">
          <div className="sticky top-0 z-20 flex items-center gap-2 border-b border-border bg-elevated-surface p-2">
            <SearchInput
              id={searchId}
              placeholder="Search models…"
              aria-labelledby={labelId}
              defaultValue={searchQuery}
              onLiveChange={setSearchQuery}
              className="flex-1"
            />
            <SegmentedControl
              aria-label="Model source"
              value={scope}
              onValueChange={(v) => setScope(v as ModelScope)}
              className="hidden md:flex"
            >
              <SegmentedControl.Item value="user">
                My Models{" "}
                <span className="text-meta-foreground">
                  ({allUserModels.length})
                </span>
              </SegmentedControl.Item>
              <SegmentedControl.Item value="base">
                Public Models{" "}
                <span className="text-meta-foreground">
                  ({allBaseModels.length})
                </span>
              </SegmentedControl.Item>
            </SegmentedControl>
            <Select
              value={scope}
              onValueChange={(v) => setScope(v as ModelScope)}
            >
              <SelectTrigger
                aria-label="Model source"
                className="flex-1 md:hidden"
              >
                <span className="text-muted-foreground">
                  Models:{" "}
                  <span className="text-foreground">
                    {scope === "user" ? "My Models" : "Public Models"}
                  </span>
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">
                  My Models ({allUserModels.length})
                </SelectItem>
                <SelectItem value="base">
                  Public Models ({allBaseModels.length})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="p-3">
            {activeFiltered.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-body text-muted-foreground">
                {scope === "user" && allUserModels.length === 0 && !q
                  ? "No models trained yet. Switch to Public Models to start."
                  : emptyLabel}
              </div>
            ) : (
              <div
                className={cn("flex flex-col gap-2")}
                role="radiogroup"
                aria-label="Model"
              >
                {activeFiltered.map((model) => (
                  <ModelPickerRow
                    key={model.id}
                    model={model}
                    selected={selectedId === model.id}
                    onSelect={() => handleSelect(model.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
