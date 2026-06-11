"use client";

import { useMemo, useState } from "react";
import { Info } from "lucide-react";
import { cn } from "@repo/ui/lib/cn";
import type {
  HeatmapData,
  PerformanceConfig,
} from "@/lib/mock/performance";
import {
  computeDistribution,
  computeHeatmap,
  computeOverviewRow,
  computePacing,
  computePatterns,
  computePhaseDistribution,
  computeTopWorkflows,
  computeUsage,
  defaultConfigs,
  modelOptionsFromTaskset,
  nextConfig,
  taskOptionsFromTaskset,
} from "@/lib/mock/performance";
import type { Taskset } from "@/lib/mock/tasksets";
import CommonPatternsTable from "./performance/common-patterns-table";
import ConfigureRail from "./performance/configure-rail";
import DistributionTable from "./performance/distribution-table";
import LoadingSkeleton from "./performance/loading-skeleton";
import MobileInterstitial from "./performance/mobile-interstitial";
import OverviewMetricsTable from "./performance/overview-metrics-table";
import PatternRewardMatrix from "./performance/pattern-reward-matrix";
import PerformanceEmpty from "./performance/performance-empty";
import PhaseDistribution from "./performance/phase-distribution";
import TopWorkflows from "./performance/top-workflows";
import TraceDynamicsCharts from "./performance/trace-dynamics-charts";

interface PerformanceTabProps {
  taskset: Taskset;
}

export default function PerformanceTab({ taskset }: PerformanceTabProps) {
  const hasJobs = taskset.jobs.length > 0;
  const { configs: initialConfigs, singleConfig } = useMemo(
    () => defaultConfigs(taskset),
    [taskset],
  );

  const [configs, setConfigs] =
    useState<ReadonlyArray<PerformanceConfig>>(initialConfigs);
  const [lastRunConfigs, setLastRunConfigs] =
    useState<ReadonlyArray<PerformanceConfig>>(initialConfigs);
  const [isRunning, setIsRunning] = useState(false);

  const taskOptions = useMemo(() => taskOptionsFromTaskset(taskset), [taskset]);
  const modelOptions = useMemo(
    () => modelOptionsFromTaskset(taskset),
    [taskset],
  );

  const isStale = useMemo(() => {
    if (configs.length !== lastRunConfigs.length) return true;
    return configs.some((c, i) => {
      const prev = lastRunConfigs[i];
      if (!prev) return true;
      return (
        c.id !== prev.id ||
        c.taskFilter !== prev.taskFilter ||
        c.modelFilter !== prev.modelFilter ||
        c.checkpointFilter !== prev.checkpointFilter ||
        c.includeInvalidated !== prev.includeInvalidated
      );
    });
  }, [configs, lastRunConfigs]);

  const onConfigChange = (
    id: PerformanceConfig["id"],
    next: PerformanceConfig,
  ) => {
    setConfigs((prev) => prev.map((c) => (c.id === id ? next : c)));
  };

  const onAddConfig = () => {
    const next = nextConfig(configs);
    if (!next) return;
    setConfigs((prev) => [...prev, next]);
  };

  const onRemoveConfig = (id: PerformanceConfig["id"]) => {
    setConfigs((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((c) => c.id !== id);
    });
  };

  const onReRun = async () => {
    setIsRunning(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setLastRunConfigs(configs);
    setIsRunning(false);
  };

  return (
    <>
      <MobileInterstitial tasksetId={taskset.id} />
      <div className="hidden gap-6 pb-10 md:grid md:grid-cols-[280px_1fr]">
        <ConfigureRail
          configs={configs}
          singleConfig={singleConfig}
          hasJobs={hasJobs}
          isStale={isStale}
          isRunning={isRunning}
          taskOptions={taskOptions}
          modelOptions={modelOptions}
          onConfigChange={onConfigChange}
          onAddConfig={onAddConfig}
          onRemoveConfig={onRemoveConfig}
          onReRun={onReRun}
        />
        <RightContent
          taskset={taskset}
          configs={lastRunConfigs}
          isRunning={isRunning}
          isStale={isStale}
          hasJobs={hasJobs}
        />
      </div>
    </>
  );
}

function RightContent({
  taskset,
  configs,
  isRunning,
  isStale,
  hasJobs,
}: {
  taskset: Taskset;
  configs: ReadonlyArray<PerformanceConfig>;
  isRunning: boolean;
  isStale: boolean;
  hasJobs: boolean;
}) {
  if (!hasJobs) return <PerformanceEmpty tasksetId={taskset.id} />;
  if (isRunning) return <LoadingSkeleton />;

  const overviewRows = configs.map((c) => computeOverviewRow(taskset, c));
  const workflows = configs.map((c) => computeTopWorkflows(taskset, c));
  const distribution = computeDistribution(taskset, configs);
  const patterns = computePatterns(taskset, configs);
  const heatmaps: Record<string, HeatmapData> = {};
  for (const c of configs) heatmaps[c.id] = computeHeatmap(taskset, c);
  const pacing = computePacing(taskset, configs);
  const usage = computeUsage(taskset, configs);
  const phase = computePhaseDistribution(taskset, configs);

  return (
    <div className="flex flex-col gap-6">
      {isStale && <StaleNotice />}
      <div
        className={cn(
          "flex flex-col gap-8",
          isStale && "opacity-60 transition-opacity",
        )}
        aria-hidden={isStale ? "true" : undefined}
      >
        <OverviewMetricsTable rows={overviewRows} />
      <TopWorkflows configs={configs} workflows={workflows} />
      <section className="flex flex-col gap-4" aria-label="Tool usage">
        <div className="flex flex-col gap-1">
          <h2 className="text-subtitle font-semibold text-foreground">
            Tool Usage
          </h2>
          <p className="text-caption text-muted-foreground">
            How the agent uses available tools across Traces.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <DistributionTable configs={configs} rows={distribution} />
          <CommonPatternsTable configs={configs} rows={patterns} />
        </div>
        <PatternRewardMatrix
          configs={configs}
          byConfig={heatmaps as Record<PerformanceConfig["id"], HeatmapData>}
        />
      </section>
      <section className="flex flex-col gap-4" aria-label="Trace Dynamics">
        <div className="flex flex-col gap-1">
          <h2 className="text-subtitle font-semibold text-foreground">
            Trace Dynamics
          </h2>
          <p className="text-caption text-muted-foreground">
            How agent behavior evolves over the course of a Trace.
          </p>
        </div>
        <TraceDynamicsCharts configs={configs} pacing={pacing} usage={usage} />
        <PhaseDistribution configs={configs} data={phase} />
      </section>
      </div>
    </div>
  );
}

function StaleNotice() {
  return (
    <div
      role="status"
      className="flex items-center gap-2 rounded-md border border-state-warning/40 bg-state-warning-subtle px-3 py-2 text-caption text-state-warning-text"
    >
      <Info aria-hidden="true" className="size-4" />
      Configuration changed — click Re-run Analysis to update.
    </div>
  );
}
