import { cn } from "@repo/ui/lib/cn";
import type { TasksetLeaderboardRow } from "@/lib/mock/tasksets";

interface LeaderboardPreviewProps {
  rows: ReadonlyArray<TasksetLeaderboardRow>;
  /** Limit visible rows. Defaults to 3 (card preview). */
  limit?: number;
  className?: string;
}

const RANK_TINT: Record<number, string> = {
  1: "bg-state-warning-subtle text-state-warning-text",
  2: "bg-secondary text-secondary-foreground",
  3: "bg-state-scored-subtle text-state-scored-text",
};

function formatPct(value: number | null): string {
  if (value === null) return "—";
  return `${Math.round(value * 100)}%`;
}

// Magnitude-to-tone mapping per wireframe §4 "Score signal". Thresholds line up
// with the calibrated semantic tokens already defined in packages/ui/styles/theme.css.
function tone(value: number | null): string {
  if (value === null) return "text-meta-foreground";
  if (value >= 0.6) return "text-state-scored-text";
  if (value >= 0.35) return "text-state-warning-text";
  return "text-state-errored-text";
}

export default function LeaderboardPreview({
  rows,
  limit = 3,
  className,
}: LeaderboardPreviewProps) {
  if (rows.length === 0) {
    return (
      <p className={cn("py-3 text-caption text-meta-foreground", className)}>
        No models run yet.
      </p>
    );
  }

  const visible = rows.slice(0, limit);

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-3 pb-1 font-mono text-meta uppercase tracking-[0.16em] text-meta-foreground">
        <span>Agent</span>
        <span className="text-right">Avg</span>
        <span className="text-right">B@3</span>
        <span className="text-right">B@5</span>
      </div>
      <ul className="flex flex-col">
        {visible.map((row) => {
          const tint = RANK_TINT[row.rank] ?? "bg-muted text-muted-foreground";
          return (
            <li
              key={row.rank}
              className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-3 border-t border-border py-1 first:border-t-0"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  aria-label={`Rank ${row.rank}`}
                  className={cn(
                    "inline-flex size-5 shrink-0 items-center justify-center rounded font-mono text-meta tabular-nums",
                    tint,
                  )}
                >
                  {row.rank}
                </span>
                <span className="truncate text-caption text-foreground">
                  {row.agentName}
                </span>
              </div>
              <span
                className={cn(
                  "text-right font-mono text-caption tabular-nums",
                  tone(row.average),
                )}
              >
                {formatPct(row.average)}
              </span>
              <span
                className={cn(
                  "text-right font-mono text-caption tabular-nums",
                  tone(row.best3),
                )}
              >
                {formatPct(row.best3)}
              </span>
              <span
                className={cn(
                  "text-right font-mono text-caption tabular-nums",
                  tone(row.best5),
                )}
              >
                {formatPct(row.best5)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
