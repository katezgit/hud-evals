"use client";

import { Label } from "@repo/ui/components/label";
import { SegmentedControl } from "@repo/ui/components/segmented-control";

const GROUP_SIZES = [1, 3, 4, 5, 8, 10, 12, 16, 20, 40] as const;

// ±X% confidence at sample size n — locked table; do not extrapolate.
export const CONFIDENCE_BY_N: Record<number, number> = {
  1: 70,
  3: 37,
  4: 31,
  5: 28,
  8: 22,
  10: 20,
  12: 18,
  16: 15,
  20: 13,
  40: 9,
};

interface GroupSizeControlProps {
  value: number;
  onValueChange: (n: number) => void;
}

export default function GroupSizeControl({ value, onValueChange }: GroupSizeControlProps) {
  const confidence = CONFIDENCE_BY_N[value] ?? 70;
  // Bar fill: 100% → 0%, i.e. lower confidence interval → fuller bar.
  // Anchor: ±70% (n=1) is empty (0% fill); ±9% (n=40) is full (100% fill).
  const fillPct = Math.round(((70 - confidence) / (70 - 9)) * 100);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label id="run-taskset-group-size-label">Group Size (n)</Label>
        <SegmentedControl
          size="sm"
          value={String(value)}
          onValueChange={(v) => onValueChange(Number(v))}
          aria-labelledby="run-taskset-group-size-label"
          className="w-fit"
        >
          {GROUP_SIZES.map((n) => (
            <SegmentedControl.Item key={n} value={String(n)} className="font-mono">
              {n}
            </SegmentedControl.Item>
          ))}
        </SegmentedControl>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-label font-medium text-muted-foreground">
          Margin of error
        </span>
        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary-surface">
            <div
              className="h-full rounded-full bg-state-warning"
              style={{ width: `${fillPct}%` }}
            />
          </div>
          <span className="whitespace-nowrap font-mono text-label font-medium text-state-warning-text">
            ±{confidence}%
          </span>
        </div>
        <span className="font-mono text-meta text-meta-foreground">
          at n={value} · 95% CI · p̂≈0.5
        </span>
      </div>
    </div>
  );
}
