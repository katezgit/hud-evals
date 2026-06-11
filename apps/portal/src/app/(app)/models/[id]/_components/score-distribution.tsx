import { cn } from "@repo/ui/lib/cn";

/**
 * Per-task score-distribution heatmap. Each task is a small colored cell;
 * color encodes the threshold band it cleared:
 *   - ≥99%  → state-scored (green)
 *   - ≥75%  → state-running (teal/blue)
 *   - ≥40%  → state-warning (amber)
 *   - <40%  → state-errored (red)
 */
export function ScoreDistribution({ scores }: { scores: ReadonlyArray<number> }) {
  return (
    <div
      className="flex h-4 w-full min-w-[80px] gap-px"
      role="img"
      aria-label={`${scores.length} task scores`}
    >
      {scores.map((score, idx) => (
        <span
          key={idx}
          className={cn("h-full flex-1 rounded-[1px]", colorFor(score))} // eslint-disable-line no-restricted-syntax -- 1px radius is intentional pixel-level heatmap detail; no token between radius-none(0) and radius-sm(4px)
          title={`${score}%`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

function colorFor(score: number): string {
  if (score >= 99) return "bg-state-scored";
  if (score >= 75) return "bg-state-running";
  if (score >= 40) return "bg-state-warning";
  return "bg-state-errored";
}
