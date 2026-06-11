"use client";

import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/tabs";
import { cn } from "@repo/ui/lib/cn";
import type { HeatmapData, PerformanceConfig } from "@/lib/mock/performance";

interface PatternRewardMatrixProps {
  configs: ReadonlyArray<PerformanceConfig>;
  byConfig: Record<PerformanceConfig["id"], HeatmapData>;
}

export default function PatternRewardMatrix({
  configs,
  byConfig,
}: PatternRewardMatrixProps) {
  const firstId = configs[0]?.id ?? "A";
  const [activeId, setActiveId] = useState<string>(firstId);

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-body font-semibold text-foreground">
        Pattern / Reward matrix
      </h3>
      {configs.length > 1 ? (
        <Tabs value={activeId} onValueChange={setActiveId}>
          <TabsList variant="underline">
            {configs.map((c) => (
              <TabsTrigger key={c.id} value={c.id}>
                {c.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {configs.map((c) => (
            <TabsContent key={c.id} value={c.id} className="pt-4">
              <HeatmapPair data={byConfig[c.id]} />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <HeatmapPair data={byConfig[firstId]} />
      )}
    </section>
  );
}

function HeatmapPair({ data }: { data: HeatmapData | undefined }) {
  if (!data) return null;
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Heatmap
        title="Top Traces (highest reward)"
        data={data}
        matrix={data.topMatrix}
        tone="positive"
      />
      <Heatmap
        title="Bottom Traces (lowest reward)"
        data={data}
        matrix={data.bottomMatrix}
        tone="negative"
      />
    </div>
  );
}

function Heatmap({
  title,
  data,
  matrix,
  tone,
}: {
  title: string;
  data: HeatmapData;
  matrix: ReadonlyArray<ReadonlyArray<number | null>>;
  tone: "positive" | "negative";
}) {
  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-caption font-medium text-muted-foreground">{title}</h4>
      <div className="overflow-x-auto rounded-md border border-border bg-card p-3">
        <table className="border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="text-meta font-medium text-muted-foreground" />
              {data.traceLabels.map((t) => (
                <th
                  key={t}
                  scope="col"
                  className="text-meta font-mono font-medium text-muted-foreground"
                >
                  {t}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.patterns.map((p, pi) => (
              <tr key={p}>
                <th
                  scope="row"
                  className="pr-2 text-right text-meta font-mono font-medium text-muted-foreground"
                >
                  {p}
                </th>
                {data.traceLabels.map((_, ti) => {
                  const v = matrix[pi]?.[ti] ?? null;
                  return <HeatmapCell key={ti} value={v} tone={tone} />;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HeatmapCell({
  value,
  tone,
}: {
  value: number | null;
  tone: "positive" | "negative";
}) {
  if (value === null) {
    return (
      <td
        aria-hidden="true"
        className="h-7 w-12 rounded-sm border border-dashed border-border bg-muted-surface/20"
      />
    );
  }
  const intensity = Math.round(20 + value * 60);
  return (
    <td
      className={cn(
        "h-7 w-12 rounded-sm text-center font-mono text-meta tabular-nums",
        tone === "positive" ? "text-state-scored-text" : "text-state-errored-text",
      )}
      style={{
        backgroundColor:
          tone === "positive"
            ? `color-mix(in oklab, var(--color-state-scored) ${intensity}%, transparent)`
            : `color-mix(in oklab, var(--color-state-errored) ${intensity}%, transparent)`,
      }}
    >
      {(value * 100).toFixed(0)}
    </td>
  );
}
