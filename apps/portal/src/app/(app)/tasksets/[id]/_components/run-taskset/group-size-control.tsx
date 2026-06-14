"use client";

import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Progress } from "@repo/ui/components/progress";
import { Slider } from "@repo/ui/components/slider";
import { cn } from "@repo/ui/lib/cn";

interface GroupSizeControlProps {
  value: number;
  onValueChange: (n: number) => void;
}

const MIN = 1;
const MAX = 40;
const TICKS = [1, 10, 20, 40] as const;
// Amber above this MoE %; neutral fill once we drop to/under it.
const MOE_AMBER_THRESHOLD_PCT = 20;

// 95% CI, p̂=0.5 (worst-case) → MoE = 1.96 * sqrt(0.25 / n)
function marginOfErrorPct(n: number): number {
  if (n <= 0) return 0;
  return Math.round(1.96 * Math.sqrt(0.25 / n) * 100);
}

function clamp(n: number): number {
  if (Number.isNaN(n)) return MIN;
  return Math.max(MIN, Math.min(MAX, Math.round(n)));
}

export default function GroupSizeControl({ value, onValueChange }: GroupSizeControlProps) {
  const moePct = marginOfErrorPct(value);
  // Bar length encodes magnitude: ±~98% (n=1) → ~100% full; lower n→lower fill.
  const fillPct = Math.min(100, Math.round((moePct / 98) * 100));
  const isAmber = moePct > MOE_AMBER_THRESHOLD_PCT;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="run-taskset-group-size">Group Size (n)</Label>
        <p className="text-caption text-muted-foreground">
          Trials per task. Higher n shrinks the margin of error.
        </p>
        <div className="flex items-center gap-2">
          <Input
            id="run-taskset-group-size"
            type="number"
            min={MIN}
            max={MAX}
            value={value}
            onChange={(e) => onValueChange(clamp(e.target.valueAsNumber))}
            className="h-7 w-14 rounded-md px-2 text-right text-label font-mono tabular-nums"
          />
          <div className="flex h-7 flex-1 flex-col justify-between">
            <Slider
              className="h-4"
              value={value}
              onValueChange={onValueChange}
              min={MIN}
              max={MAX}
              step={1}
              aria-label="Group size slider"
            />
            <div className="flex justify-between font-mono text-meta leading-none text-meta-foreground">
              {TICKS.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-label font-medium text-muted-foreground">
          Margin of error
        </span>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Progress
              value={fillPct}
              state={isAmber ? "warning" : "neutral"}
              size="md"
              aria-label="Margin of error"
            />
          </div>
          <span
            className={cn(
              "whitespace-nowrap font-mono text-label font-medium tabular-nums",
              isAmber ? "text-state-warning-text" : "text-muted-foreground",
            )}
          >
            ±{moePct}%
          </span>
        </div>
        <span className="font-mono text-caption text-meta-foreground">
          at n={value} · 95% CI · p̂≈0.5
        </span>
      </div>
    </div>
  );
}
