import Link from "next/link";
import { Bot, ClipboardList, ListChecks } from "lucide-react";
import { StarCount } from "@repo/ui/components/star-count";
import { VisibilityIcon } from "@repo/ui/components/visibility-icon";
import { cn } from "@repo/ui/lib/cn";
import type { Taskset } from "@/lib/mock/tasksets";

interface TasksetListRowProps {
  taskset: Taskset;
  isStarred: boolean;
  starCount: number;
  onToggleStar: () => void;
  /** Tab-conditional rendering — see wireframe §4.1 / §5. */
  tab: "public" | "team";
}

const RANK_TINT = "bg-state-warning-subtle text-state-warning-text";

function formatPct(value: number | null): string {
  if (value === null) return "—";
  return `${Math.round(value * 100)}%`;
}

// Same magnitude → tone mapping as LeaderboardPreview. Kept locally so list row
// stays a leaf (no shared util for two callsites).
function tone(value: number | null): string {
  if (value === null) return "text-meta-foreground";
  if (value >= 0.6) return "text-state-scored-text";
  if (value >= 0.35) return "text-state-warning-text";
  return "text-state-errored-text";
}

export default function TasksetListRow({
  taskset,
  isStarred,
  starCount,
  onToggleStar,
  tab,
}: TasksetListRowProps) {
  const isPrivate = taskset.visibility === "private";
  const leader = taskset.leaderboard[0];

  return (
    <Link
      href={`/tasksets/${taskset.id}`}
      className="group flex flex-row items-center gap-6 rounded-lg border border-border bg-panel px-4 py-3 transition-colors duration-fast hover:border-border-strong hover:bg-hover"
    >
      {/* Identity ~30% */}
      <div className="flex min-w-0 flex-[3] items-center gap-2">
        <span className="inline-flex size-6 shrink-0 items-center justify-center rounded bg-secondary text-muted-foreground">
          <ListChecks aria-hidden="true" className="size-3.5" />
        </span>
        <span className="min-w-0 truncate text-body font-medium text-foreground">
          {taskset.name}
        </span>
        <StarCount
          count={starCount}
          pressed={isStarred}
          onPressedChange={onToggleStar}
          label={taskset.name}
          size="sm"
          className={cn(tab === "team" && "text-meta-foreground")}
        />
      </div>

      {/* Leader-only leaderboard ~45% */}
      <div className="hidden min-w-0 flex-[4] items-center gap-2 lg:flex">
        {leader ? (
          <>
            <span
              aria-label={`Rank ${leader.rank}`}
              className={cn(
                "inline-flex size-5 shrink-0 items-center justify-center rounded font-mono text-meta tabular-nums",
                RANK_TINT,
              )}
            >
              {leader.rank}
            </span>
            <span className="min-w-0 truncate text-caption text-foreground">
              {leader.agentName}
            </span>
            <span
              className={cn(
                "ml-auto font-mono text-caption tabular-nums",
                tone(leader.average),
              )}
            >
              {formatPct(leader.average)}
            </span>
          </>
        ) : (
          <span className="text-caption text-meta-foreground">
            No models run yet.
          </span>
        )}
      </div>

      {/* Meta block ~25% */}
      <div className="flex shrink-0 items-center gap-3 text-caption text-muted-foreground">
        <span
          aria-label={`${taskset.taskCount} tasks`}
          className="inline-flex items-center gap-1 tabular-nums"
        >
          <ClipboardList aria-hidden="true" className="size-3.5" />
          <span>{taskset.taskCount}</span>
        </span>
        <span
          aria-label={`${taskset.modelCount} models`}
          className="inline-flex items-center gap-1 tabular-nums"
        >
          <Bot aria-hidden="true" className="size-3.5" />
          <span>{taskset.modelCount}</span>
        </span>
      </div>
      <div className="hidden w-40 shrink-0 items-center justify-end gap-2 text-caption md:flex">
        <span
          className={cn(
            "truncate",
            tab === "team" ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {taskset.ownerName}
        </span>
        {tab === "team" && isPrivate && <VisibilityIcon visibility="private" />}
      </div>
    </Link>
  );
}
