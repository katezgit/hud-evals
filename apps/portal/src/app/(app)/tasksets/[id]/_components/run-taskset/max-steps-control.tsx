"use client";

import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Slider } from "@repo/ui/components/slider";

interface MaxStepsControlProps {
  value: number;
  onValueChange: (next: number) => void;
}

const MIN = 1;
const MAX = 200;
const TICKS = [1, 10, 50, 200] as const;

function clamp(n: number): number {
  if (Number.isNaN(n)) return MIN;
  return Math.max(MIN, Math.min(MAX, Math.round(n)));
}

export default function MaxStepsControl({ value, onValueChange }: MaxStepsControlProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="run-taskset-max-steps">Max Steps</Label>
      <div className="flex items-center gap-2">
        <Input
          id="run-taskset-max-steps"
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
            aria-label="Max steps slider"
          />
          <div className="flex justify-between font-mono text-meta leading-none text-meta-foreground">
            {TICKS.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
