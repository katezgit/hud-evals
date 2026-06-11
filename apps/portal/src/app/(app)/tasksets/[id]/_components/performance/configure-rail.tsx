"use client";

import { Play, Plus } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import type { PerformanceConfig } from "@/lib/mock/performance";
import ConfigCard from "./config-card";
import SingleConfigPlaceholder from "./single-config-placeholder";

interface ConfigureRailProps {
  configs: ReadonlyArray<PerformanceConfig>;
  singleConfig: boolean;
  hasJobs: boolean;
  isStale: boolean;
  isRunning: boolean;
  taskOptions: ReadonlyArray<{ value: string; label: string }>;
  modelOptions: ReadonlyArray<{ value: string; label: string }>;
  onConfigChange: (id: PerformanceConfig["id"], next: PerformanceConfig) => void;
  onAddConfig: () => void;
  onRemoveConfig: (id: PerformanceConfig["id"]) => void;
  onReRun: () => void;
}

export default function ConfigureRail({
  configs,
  singleConfig,
  hasJobs,
  isStale,
  isRunning,
  taskOptions,
  modelOptions,
  onConfigChange,
  onAddConfig,
  onRemoveConfig,
  onReRun,
}: ConfigureRailProps) {
  const disabled = !hasJobs || isRunning;
  const capped = configs.length >= 4;
  const canDismiss = configs.length > 1;

  return (
    <aside className="flex flex-col gap-4 md:sticky md:top-44 md:max-h-[calc(100vh-11rem)] md:self-start md:overflow-y-auto">
      <div className="flex flex-col gap-3">
        <h2 className="text-label font-medium uppercase tracking-wider text-muted-foreground">
          Configure
        </h2>
        <div className="flex flex-col gap-3">
          {configs.map((c) => (
            <ConfigCard
              key={c.id}
              config={c}
              taskOptions={taskOptions}
              modelOptions={modelOptions}
              canDismiss={canDismiss}
              disabled={disabled}
              onChange={(next) => onConfigChange(c.id, next)}
              onDismiss={() => onRemoveConfig(c.id)}
            />
          ))}
          {singleConfig && hasJobs && <SingleConfigPlaceholder />}
        </div>
        {!singleConfig && (
          <button
            type="button"
            onClick={onAddConfig}
            disabled={capped || disabled}
            className="flex w-fit items-center gap-1.5 text-caption text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50 disabled:hover:text-muted-foreground"
          >
            <Plus aria-hidden="true" className="size-3.5" />
            Add comparison
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-4">
        <h2 className="text-label font-medium uppercase tracking-wider text-muted-foreground">
          Run
        </h2>
        {hasJobs ? (
          <Button
            type="button"
            variant={isStale ? "primary" : "secondary"}
            onClick={onReRun}
            disabled={isRunning || !isStale}
            aria-label="Re-run Analysis"
          >
            <Play aria-hidden="true" />
            {isRunning ? "Running…" : "Re-run Analysis"}
          </Button>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <Button
                  type="button"
                  variant="secondary"
                  disabled
                  aria-disabled="true"
                  aria-label="Re-run Analysis"
                >
                  <Play aria-hidden="true" />
                  Re-run Analysis
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>No Job data available</TooltipContent>
          </Tooltip>
        )}
      </div>
    </aside>
  );
}
