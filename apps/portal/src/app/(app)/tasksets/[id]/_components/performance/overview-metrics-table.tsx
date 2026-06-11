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
  { key: "reward", label: "REWARD" },
  { key: "steps", label: "STEPS" },
  { key: "traces", label: "TRACES" },
  { key: "tasks", label: "TASKS" },
  { key: "duration", label: "DURATION" },
  { key: "cost", label: "COST" },
  { key: "llmCalls", label: "LLM CALLS" },
  { key: "thinkAct", label: "THINK/ACT" },
  { key: "errors", label: "ERRORS" },
  { key: "entropy", label: "ENTROPY" },
  { key: "topTool", label: "TOP TOOL" },
] as const;

export default function OverviewMetricsTable({
  rows,
}: OverviewMetricsTableProps) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-subtitle font-semibold text-foreground">Overview</h3>
      <div className="relative overflow-x-auto rounded-md border border-border bg-card">
        <table className="w-full text-body">
          <thead className="border-b border-border bg-muted/30">
            <tr>
              <th
                scope="col"
                className="sticky left-0 z-table-col bg-muted/30 px-3 py-2 text-left text-meta font-medium uppercase tracking-wider text-muted-foreground"
              >
                CONFIG
              </th>
              {COLUMNS.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className="whitespace-nowrap px-3 py-2 text-right text-meta font-medium uppercase tracking-wider text-muted-foreground"
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
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
    <tr className="border-b border-border last:border-b-0">
      <th
        scope="row"
        className="sticky left-0 z-table-col whitespace-nowrap bg-card px-3 py-2 text-left font-medium"
      >
        <span className="inline-flex items-center gap-1.5">
          <ConfigColorDot id={row.configId} />
          {row.configLabel}
        </span>
      </th>
      <td
        className={cn(
          "px-3 py-2 text-right font-mono tabular-nums",
          rewardLow && "text-destructive",
        )}
      >
        {formatPct(row.reward)}
      </td>
      <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground">
        {row.steps}
      </td>
      <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground">
        {row.traces}
      </td>
      <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground">
        {row.tasks.scored}/{row.tasks.total}
      </td>
      <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground">
        {formatDuration(row.durationMin)}
      </td>
      <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground">
        {formatCost(row.costUsd)}
      </td>
      <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground">
        {row.llmCalls}
      </td>
      <td
        className={cn(
          "px-3 py-2 text-right font-mono tabular-nums",
          thinkActFlag ? "text-state-warning-text" : "text-foreground",
        )}
      >
        {row.thinkAct.toFixed(1)}×
      </td>
      <td
        className={cn(
          "px-3 py-2 text-right font-mono tabular-nums",
          errorsHigh ? "text-destructive" : "text-foreground",
        )}
      >
        {formatPct(row.errorsRate, 0)}
      </td>
      <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground">
        {row.entropyObserved.toFixed(2)} / {row.entropyMax.toFixed(2)}
      </td>
      <td className="px-3 py-2 text-right font-mono text-foreground">
        <span className="rounded-sm bg-muted px-1.5 py-0.5 text-meta">
          {row.topTool.name} ({row.topTool.sharePct}%)
        </span>
      </td>
    </tr>
  );
}
