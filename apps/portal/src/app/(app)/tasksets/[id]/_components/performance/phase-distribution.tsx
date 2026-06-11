import { cn } from "@repo/ui/lib/cn";
import type {
  PerformanceConfig,
  PhaseBar,
  PhaseDistribution as PhaseDistributionData,
} from "@/lib/mock/performance";
import ConfigColorDot from "./config-color-dot";

interface PhaseDistributionProps {
  configs: ReadonlyArray<PerformanceConfig>;
  data: PhaseDistributionData;
}

const TOOL_COLORS: Record<string, string> = {
  computer: "bg-chart-1",
  click: "bg-chart-2",
  screenshot: "bg-chart-3",
  type: "bg-chart-4",
  launch_app: "bg-chart-5",
  submit: "bg-state-scored",
  hud_submit: "bg-state-warning",
};

export default function PhaseDistribution({
  configs,
  data,
}: PhaseDistributionProps) {
  const tools = new Set<string>();
  for (const phase of [data.configA, data.configB ?? null]) {
    if (!phase) continue;
    for (const segs of [phase.start, phase.middle, phase.end]) {
      for (const s of segs.segments) tools.add(s.tool);
    }
  }
  return (
    <section className="flex flex-col gap-3" aria-label="Phase distribution">
      <div className="flex flex-col gap-1">
        <h3 className="text-body font-semibold text-foreground">
          Phase distribution
        </h3>
        <p className="text-caption text-muted-foreground">
          Each Trace&apos;s tool calls split by call order: Start (first ⅓),
          Middle (middle ⅓), End (last ⅓). Bar width shows call volume; colors
          show tool mix.
        </p>
      </div>
      <div className="flex flex-col gap-4 rounded-md border border-border bg-card p-4">
        {configs.map((c) => {
          const phase = c.id === "A" ? data.configA : data.configB;
          if (!phase) return null;
          return <ConfigPhaseRow key={c.id} config={c} phase={phase} />;
        })}
      </div>
      <ToolLegend tools={Array.from(tools)} />
    </section>
  );
}

function ConfigPhaseRow({
  config,
  phase,
}: {
  config: PerformanceConfig;
  phase: { start: PhaseBar; middle: PhaseBar; end: PhaseBar };
}) {
  return (
    <div className="flex flex-col gap-2">
      <h4 className="flex items-center gap-2 text-caption font-medium text-foreground">
        <ConfigColorDot id={config.id} />
        {config.label}
      </h4>
      <div className="grid grid-cols-[80px_1fr] gap-2">
        <BarLabel label="Start" />
        <PhaseBarRow bar={phase.start} />
        <BarLabel label="Middle" />
        <PhaseBarRow bar={phase.middle} />
        <BarLabel label="End" />
        <PhaseBarRow bar={phase.end} />
      </div>
    </div>
  );
}

function BarLabel({ label }: { label: string }) {
  return (
    <span className="text-caption text-muted-foreground">{label}</span>
  );
}

function PhaseBarRow({ bar }: { bar: PhaseBar }) {
  const total = bar.segments.reduce((s, x) => s + x.count, 0);
  if (total === 0) {
    return (
      <div
        aria-hidden="true"
        className="h-5 rounded-sm border border-dashed border-border"
      />
    );
  }
  return (
    <div className="flex h-5 overflow-hidden rounded-sm">
      {bar.segments.map((seg, i) => {
        const widthPct = (seg.count / total) * 100;
        if (widthPct === 0) return null;
        const color = TOOL_COLORS[seg.tool] ?? "bg-muted";
        return (
          <div
            key={`${seg.tool}-${i}`}
            className={cn(color)}
            style={{ width: `${widthPct}%` }}
            title={`${seg.tool}: ${seg.count}`}
          />
        );
      })}
    </div>
  );
}

function ToolLegend({ tools }: { tools: ReadonlyArray<string> }) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-caption text-muted-foreground">
      {tools.map((t) => {
        const color = TOOL_COLORS[t] ?? "bg-muted";
        return (
          <span key={t} className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className={cn("inline-block size-2 rounded-sm", color)}
            />
            <code className="font-mono">{t}</code>
          </span>
        );
      })}
    </div>
  );
}
