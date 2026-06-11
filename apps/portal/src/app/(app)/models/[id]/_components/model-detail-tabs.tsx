"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import type {
  Checkpoint,
  Model,
  OwnershipClass,
  TasksetResult,
  Viewer,
} from "../_data/types";
import { CheckpointsTab } from "./checkpoints-tab";
import { LogsTab } from "./logs-tab";
import { ResultsTab } from "./results-tab";
import { SettingsTab } from "./settings-tab";
import { TracesTab } from "./traces-tab";

export function ModelDetailTabs({
  model,
  viewer,
  ownershipClass,
  tasksetResults,
  checkpoints,
}: {
  model: Model;
  viewer: Viewer;
  ownershipClass: OwnershipClass;
  tasksetResults: ReadonlyArray<TasksetResult>;
  checkpoints: ReadonlyArray<Checkpoint>;
}) {
  const showCheckpointsTab =
    model.checkpointCount >= 1 && viewer.persona === "rl-researcher";

  return (
    // `Tabs` primitive defaults to `gap-6` between TabsList and TabsContent.
    // Each tab body owns its own 24px top padding (`py-6`) as the
    // TabsList-bottom → first-content-row gap, so neutralize the primitive's
    // gap here to avoid double-stacking.
    <Tabs defaultValue="results" className="flex-1 min-w-0 gap-0">
      <TabsList variant="underline">
        <TabsTrigger value="results">Results</TabsTrigger>
        <TabsTrigger value="traces">Traces</TabsTrigger>
        <TabsTrigger value="logs">Logs</TabsTrigger>
        {showCheckpointsTab && (
          <TabsTrigger value="checkpoints">Checkpoints</TabsTrigger>
        )}
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>

      <TabsContent value="results">
        <ResultsTab modelId={model.id} rows={tasksetResults} />
      </TabsContent>
      <TabsContent value="traces">
        <TracesTab model={model} viewer={viewer} />
      </TabsContent>
      <TabsContent value="logs">
        <LogsTab model={model} viewer={viewer} />
      </TabsContent>
      {showCheckpointsTab && (
        <TabsContent value="checkpoints">
          <CheckpointsTab
            model={model}
            viewer={viewer}
            ownershipClass={ownershipClass}
            checkpoints={checkpoints}
          />
        </TabsContent>
      )}
      <TabsContent value="settings">
        <SettingsTab model={model} viewer={viewer} ownershipClass={ownershipClass} />
      </TabsContent>
    </Tabs>
  );
}
