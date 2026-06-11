import { cn } from "@repo/ui/lib/cn";
import { NOT_RUN_HATCH_STYLE } from "./jobs-tab-viz";

interface LegendItemProps {
  className?: string;
  style?: React.CSSProperties;
  label: string;
}

function LegendItem({ className, style, label }: LegendItemProps) {
  return (
    <span className="text-muted-foreground flex items-center gap-1.5 font-mono text-caption">
      <span
        className={cn("size-2 rounded-sm", className)}
        style={style}
      />
      {label}
    </span>
  );
}

export function JobsTabLegend() {
  return (
    <div
      aria-hidden="true"
      className="grid grid-cols-3 gap-x-3 gap-y-1"
    >
      <LegendItem className="bg-state-scored" label="scored" />
      <LegendItem className="bg-state-warning" label="failed" />
      <LegendItem className="bg-state-errored" label="errored" />
      <LegendItem className="bg-state-running" label="running" />
      <LegendItem
        className="border-border-strong border"
        style={NOT_RUN_HATCH_STYLE}
        label="not run"
      />
    </div>
  );
}
