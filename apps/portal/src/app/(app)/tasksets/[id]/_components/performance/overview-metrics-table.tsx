import {
  tableBodyClass,
  tableCellVariants,
  tableClass,
  tableHeaderClass,
  tableHeadVariants,
  tableRowVariants,
} from "@repo/ui/components/table";
import { cn } from "@repo/ui/lib/cn";
import type { OverviewRow } from "@/lib/mock/performance";
import {
  formatCost,
  formatDuration,
  formatPct,
} from "@/lib/mock/performance";
import ConfigColorDot from "./config-color-dot";

const REWARD_RED_BAND = 0.6;
const ERROR_RED_BAND = 0.3;
const THINK_ACT_FLAG = 3;

interface OverviewMetricsTableProps {
  rows: ReadonlyArray<OverviewRow>;
}

const COLUMNS = [
  { key: "reward", label: "Reward" },
  { key: "steps", label: "Steps" },
  { key: "traces", label: "Traces" },
  { key: "tasks", label: "Tasks" },
  { key: "duration", label: "Duration" },
  { key: "cost", label: "Cost" },
  { key: "llmCalls", label: "LLM calls" },
  { key: "thinkAct", label: "Think/act" },
  { key: "errors", label: "Errors" },
  { key: "entropy", label: "Entropy" },
  { key: "topTool", label: "Top tool" },
] as const;

export default function OverviewMetricsTable({
  rows,
}: OverviewMetricsTableProps) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-subtitle font-semibold text-foreground">Overview</h3>
      <div className="relative overflow-x-auto rounded-md border border-border bg-card">
        <table className={tableClass}>
          <thead className={tableHeaderClass}>
            <tr>
              <th
                scope="col"
                className={cn(
                  tableHeadVariants({ density: "compact" }),
                  "sticky left-0 z-table-col",
                )}
              >
                Config
              </th>
              {COLUMNS.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className={tableHeadVariants({ density: "compact", numeric: true })}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={tableBodyClass}>
            {rows.map((row) => (
              <OverviewRowComponent key={row.configId} row={row} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function OverviewRowComponent({ row }: { row: OverviewRow }) {
  const rewardLow = row.reward < REWARD_RED_BAND;
  const errorsHigh = row.errorsRate > ERROR_RED_BAND;
  const thinkActFlag = row.thinkAct > THINK_ACT_FLAG;

  return (
    <tr className={tableRowVariants({ density: "compact" })}>
      <th
        scope="row"
        className={cn(
          tableCellVariants({ density: "compact" }),
          "sticky left-0 z-table-col bg-card text-left font-medium",
        )}
      >
        <span className="inline-flex items-center gap-1.5">
          <ConfigColorDot id={row.configId} />
          {row.configLabel}
        </span>
      </th>
      <td
        className={cn(
          tableCellVariants({ density: "compact", variant: "mono" }),
          "text-right",
          rewardLow && "text-destructive",
        )}
      >
        {formatPct(row.reward)}
      </td>
      <td className={cn(tableCellVariants({ density: "compact", variant: "mono" }), "text-right")}>
        {row.steps}
      </td>
      <td className={cn(tableCellVariants({ density: "compact", variant: "mono" }), "text-right")}>
        {row.traces}
      </td>
      <td className={cn(tableCellVariants({ density: "compact", variant: "mono" }), "text-right")}>
        {row.tasks.scored}/{row.tasks.total}
      </td>
      <td className={cn(tableCellVariants({ density: "compact", variant: "mono" }), "text-right")}>
        {formatDuration(row.durationMin)}
      </td>
      <td className={cn(tableCellVariants({ density: "compact", variant: "mono" }), "text-right")}>
        {formatCost(row.costUsd)}
      </td>
      <td className={cn(tableCellVariants({ density: "compact", variant: "mono" }), "text-right")}>
        {row.llmCalls}
      </td>
      <td
        className={cn(
          tableCellVariants({ density: "compact", variant: "mono" }),
          "text-right",
          thinkActFlag ? "text-state-warning-text" : "text-foreground",
        )}
      >
        {row.thinkAct.toFixed(1)}×
      </td>
      <td
        className={cn(
          tableCellVariants({ density: "compact", variant: "mono" }),
          "text-right",
          errorsHigh ? "text-destructive" : "text-foreground",
        )}
      >
        {formatPct(row.errorsRate, 0)}
      </td>
      <td className={cn(tableCellVariants({ density: "compact", variant: "mono" }), "text-right")}>
        {row.entropyObserved.toFixed(2)} / {row.entropyMax.toFixed(2)}
      </td>
      <td className={cn(tableCellVariants({ density: "compact", variant: "mono" }), "text-right")}>
        <span className="rounded-sm bg-muted-surface px-1.5 py-0.5 text-meta">
          {row.topTool.name} ({row.topTool.sharePct}%)
        </span>
      </td>
    </tr>
  );
}
