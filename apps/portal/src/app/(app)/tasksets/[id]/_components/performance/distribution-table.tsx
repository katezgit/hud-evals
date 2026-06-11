import { cn } from "@repo/ui/lib/cn";
import type {
  DistributionRow,
  DistributionStats,
  PerformanceConfig,
} from "@/lib/mock/performance";
import { formatPct } from "@/lib/mock/performance";
import { configDotClass } from "./config-color-dot";

interface DistributionTableProps {
  configs: ReadonlyArray<PerformanceConfig>;
  rows: ReadonlyArray<DistributionRow>;
}

export default function DistributionTable({
  configs,
  rows,
}: DistributionTableProps) {
  const maxAvg = Math.max(
    0.001,
    ...rows.flatMap((r) => [
      r.configA.avgPerTrace,
      r.configB?.avgPerTrace ?? 0,
    ]),
  );
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-body font-semibold text-foreground">Distribution</h3>
      <div className="overflow-x-auto rounded-md border border-border bg-card">
        <table className="w-full text-body">
          <thead className="border-b border-border bg-muted/30">
            <tr>
              {[
                "TOOL",
                "",
                "AVG/TR",
                "PASS RATE",
                "R²",
                "EMPTY%",
                "AVG OUT",
              ].map((label, idx) => (
                <th
                  key={`${label}-${idx}`}
                  scope="col"
                  className={cn(
                    "whitespace-nowrap px-3 py-2 text-meta font-medium uppercase tracking-wider text-muted-foreground",
                    idx === 0 ? "text-left" : "text-right",
                    idx === 1 && "w-32",
                  )}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <ToolRows
                key={row.tool}
                row={row}
                configs={configs}
                maxAvg={maxAvg}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ToolRows({
  row,
  configs,
  maxAvg,
}: {
  row: DistributionRow;
  configs: ReadonlyArray<PerformanceConfig>;
  maxAvg: number;
}) {
  const a = configs[0];
  const b = configs[1];
  return (
    <>
      {a && (
        <ConfigStatsRow
          tool={row.tool}
          showTool
          configId={a.id}
          stats={row.configA}
          maxAvg={maxAvg}
        />
      )}
      {b && row.configB && (
        <ConfigStatsRow
          tool={row.tool}
          showTool={false}
          configId={b.id}
          stats={row.configB}
          maxAvg={maxAvg}
          isSecond
        />
      )}
    </>
  );
}

function ConfigStatsRow({
  tool,
  showTool,
  configId,
  stats,
  maxAvg,
  isSecond,
}: {
  tool: string;
  showTool: boolean;
  configId: PerformanceConfig["id"];
  stats: DistributionStats;
  maxAvg: number;
  isSecond?: boolean;
}) {
  const widthPct = Math.round((stats.avgPerTrace / maxAvg) * 100);
  return (
    <tr
      className={cn(
        "border-b border-border last:border-b-0",
        isSecond && "border-b-2",
      )}
    >
      <td className="px-3 py-1.5 font-mono text-foreground">
        {showTool ? tool : ""}
      </td>
      <td className="px-3 py-1.5">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={cn("inline-block size-2 rounded-full", configDotClass(configId))}
          />
          <div
            aria-hidden="true"
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
          >
            <div
              className={cn("h-full", configDotClass(configId))}
              style={{ width: `${widthPct}%` }}
            />
          </div>
        </div>
      </td>
      <td className="px-3 py-1.5 text-right font-mono tabular-nums text-foreground">
        {stats.avgPerTrace.toFixed(2)}
      </td>
      <td className="px-3 py-1.5 text-right font-mono tabular-nums text-foreground">
        {formatPct(stats.passRate)}
      </td>
      <td className="px-3 py-1.5 text-right font-mono tabular-nums text-foreground">
        {stats.rSquared === null
          ? "—"
          : `${stats.rSquared > 0 ? "+" : ""}${stats.rSquared.toFixed(2)}`}
      </td>
      <td className="px-3 py-1.5 text-right font-mono tabular-nums text-foreground">
        {stats.emptyPct}%
      </td>
      <td className="px-3 py-1.5 text-right font-mono tabular-nums text-foreground">
        {stats.avgOut === null ? "—" : stats.avgOut}
      </td>
    </tr>
  );
}
