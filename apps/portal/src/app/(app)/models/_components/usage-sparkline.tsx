interface UsageSparklineProps {
  /** Values normalized to 0..1. */
  data: ReadonlyArray<number>;
}

/** Compact 28×12 SVG bar chart. Each bar is one bucket. */
export default function UsageSparkline({ data }: UsageSparklineProps) {
  const width = 32;
  const height = 12;
  const gap = 1;
  const barWidth = (width - gap * (data.length - 1)) / data.length;

  return (
    <svg
      aria-hidden="true"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="shrink-0 text-muted-foreground"
    >
      {data.map((v, i) => {
        const h = Math.max(1, v * height);
        const x = i * (barWidth + gap);
        const y = height - h;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barWidth}
            height={h}
            fill="currentColor"
            opacity={0.55}
          />
        );
      })}
    </svg>
  );
}
