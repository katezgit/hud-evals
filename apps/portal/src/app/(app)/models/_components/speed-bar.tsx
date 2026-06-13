import { cn } from "@repo/ui/lib/cn";

interface SpeedBarProps {
  /** Throughput in output tokens per second for this model. */
  tokensPerSecond: number;
  /** Dataset peak — scales the bar fill so this row reads relative to the rest. */
  max: number;
}

/**
 * Numeric `t/s` label paired with a proportional horizontal bar — the visual
 * grammar from the audit's prior reference. Bar height stays a thin 2px so the
 * cell still scans as text-first; the bar is the second-pass cue.
 */
export default function SpeedBar({ tokensPerSecond, max }: SpeedBarProps) {
  const ratio = max > 0 ? Math.min(1, tokensPerSecond / max) : 0;
  return (
    <div
      role="img"
      aria-label={`${tokensPerSecond} tokens per second`}
      className="flex w-24 flex-col gap-1"
    >
      <span className="font-mono text-label tabular-nums text-foreground">
        {tokensPerSecond}
        <span className="text-meta-foreground"> t/s</span>
      </span>
      <span
        aria-hidden="true"
        className="relative h-0.5 w-full overflow-hidden rounded-full bg-border"
      >
        <span
          className={cn("block h-full rounded-full bg-muted-foreground/30")}
          style={{ width: `${ratio * 100}%` }}
        />
      </span>
    </div>
  );
}
