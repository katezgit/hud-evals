import type {
  PacingPoint,
  PerformanceConfig,
  UsagePoint,
} from "@/lib/mock/performance";
import ConfigColorDot, {
  configStrokeClass,
} from "./config-color-dot";

interface TraceDynamicsChartsProps {
  configs: ReadonlyArray<PerformanceConfig>;
  pacing: ReadonlyArray<PacingPoint>;
  usage: ReadonlyArray<UsagePoint>;
}

export default function TraceDynamicsCharts({
  configs,
  pacing,
  usage,
}: TraceDynamicsChartsProps) {
  return (
    <section className="flex flex-col gap-4" aria-label="Trace Dynamics">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <PacingChart configs={configs} data={pacing} />
        <UsageChart configs={configs} data={usage} />
      </div>
      <Legend configs={configs} />
    </section>
  );
}

function PacingChart({
  configs,
  data,
}: {
  configs: ReadonlyArray<PerformanceConfig>;
  data: ReadonlyArray<PacingPoint>;
}) {
  return (
    <ChartCard
      title="Pacing"
      caption="Average action duration over trace progress. Dashed = LLM inference."
    >
      <LineChartSvg
        data={data}
        ariaLabel="Pacing chart"
        accessors={configs.flatMap((c, i) => [
          {
            key: `tool-${c.id}`,
            getValue: (p: PacingPoint) =>
              i === 0 ? p.toolCallA : (p.toolCallB ?? null),
            colorClass: configStrokeClass(c.id),
            dashed: false,
          },
          {
            key: `llm-${c.id}`,
            getValue: (p: PacingPoint) =>
              i === 0 ? p.llmA : (p.llmB ?? null),
            colorClass: configStrokeClass(c.id),
            dashed: true,
          },
        ])}
        yLabel="s"
      />
    </ChartCard>
  );
}

function UsageChart({
  configs,
  data,
}: {
  configs: ReadonlyArray<PerformanceConfig>;
  data: ReadonlyArray<UsagePoint>;
}) {
  return (
    <ChartCard
      title="Usage"
      caption="Average tool response size (chars) over trace progress."
    >
      <LineChartSvg
        data={data}
        ariaLabel="Usage chart"
        accessors={configs.map((c, i) => ({
          key: `usage-${c.id}`,
          getValue: (p: UsagePoint) =>
            i === 0 ? p.configA : (p.configB ?? null),
          colorClass: configStrokeClass(c.id),
          dashed: false,
        }))}
        yLabel="chars"
      />
    </ChartCard>
  );
}

function ChartCard({
  title,
  caption,
  children,
}: {
  title: string;
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-card p-4">
      <h4 className="text-body font-semibold text-foreground">{title}</h4>
      <p className="text-caption text-muted-foreground">{caption}</p>
      <div className="pt-1">{children}</div>
    </div>
  );
}

interface LineAccessor<T> {
  key: string;
  getValue: (p: T) => number | null;
  colorClass: string;
  dashed: boolean;
}

function LineChartSvg<T extends { progress: number }>({
  data,
  accessors,
  ariaLabel,
  yLabel,
}: {
  data: ReadonlyArray<T>;
  accessors: ReadonlyArray<LineAccessor<T>>;
  ariaLabel: string;
  yLabel: string;
}) {
  const W = 320;
  const H = 160;
  const padL = 28;
  const padR = 8;
  const padT = 8;
  const padB = 24;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const allValues = accessors.flatMap((a) =>
    data.map((p) => a.getValue(p)).filter((v): v is number => v !== null),
  );
  const yMax = Math.max(1, ...allValues);

  const xFor = (progress: number) => padL + progress * plotW;
  const yFor = (v: number) => padT + plotH - (v / yMax) * plotH;

  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
    >
      {[0, 0.5, 1].map((t) => {
        const y = padT + plotH - t * plotH;
        return (
          <g key={t}>
            <line
              x1={padL}
              x2={W - padR}
              y1={y}
              y2={y}
              className="stroke-border"
              strokeWidth={1}
            />
            <text
              x={padL - 4}
              y={y + 3}
              textAnchor="end"
              className="fill-meta-foreground text-meta font-mono"
            >
              {(yMax * t).toFixed(0)}
              {t === 1 ? yLabel : ""}
            </text>
          </g>
        );
      })}

      {[0, 0.33, 0.66, 1].map((p) => (
        <text
          key={p}
          x={xFor(p)}
          y={H - 6}
          textAnchor="middle"
          className="fill-meta-foreground text-meta font-mono"
        >
          {Math.round(p * 100)}%
        </text>
      ))}

      {accessors.map((a) => {
        const path = data
          .map((p, i) => {
            const v = a.getValue(p);
            if (v === null) return "";
            return `${i === 0 ? "M" : "L"}${xFor(p.progress).toFixed(2)},${yFor(v).toFixed(2)}`;
          })
          .join(" ");
        return (
          <path
            key={a.key}
            d={path}
            fill="none"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeDasharray={a.dashed ? "4 3" : undefined}
            className={a.colorClass}
          />
        );
      })}
    </svg>
  );
}

function Legend({
  configs,
}: {
  configs: ReadonlyArray<PerformanceConfig>;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-caption text-muted-foreground">
      {configs.map((c) => (
        <span key={c.id} className="inline-flex items-center gap-1.5">
          <ConfigColorDot id={c.id} />
          {c.label}
        </span>
      ))}
      <span className="inline-flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className="inline-block h-px w-4 bg-foreground"
        />
        Tool calls
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className="inline-block h-px w-4 border-t border-dashed border-foreground"
        />
        LLM inference
      </span>
    </div>
  );
}
