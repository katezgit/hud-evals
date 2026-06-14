interface DistBarsProps {
  /** Aggregate score 0..1. */
  value: number;
  width?: number;
  height?: number;
}

export function DistBars({ value, width = 40, height = 14 }: DistBarsProps) {
  const bars = 5;
  // Active count grows with value; ≥1 lights everything.
  const active = Math.max(0, Math.min(bars, Math.round(value * bars)));
  const gap = 1.5;
  const barWidth = (width - gap * (bars - 1)) / bars;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label={`Distribution ${Math.round(value * 100)}%`}
    >
      {Array.from({ length: bars }).map((_, i) => {
        const x = i * (barWidth + gap);
        const isActive = i < active;
        const barHeight = height * (0.4 + ((i + 1) / bars) * 0.6);
        const y = height - barHeight;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barWidth}
            height={barHeight}
            className={isActive ? distBarClass(value) : "fill-muted-surface"}
            rx={0.5}
          />
        );
      })}
    </svg>
  );
}

export function distBarClass(value: number): string {
  if (value >= 0.66) return "fill-state-scored";
  if (value >= 0.33) return "fill-state-warning";
  return "fill-state-errored";
}
