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

// Shared grid template — row + column header must use the same string so cell
// edges align. Tracks: identity | leaderboard (lg+) | star | tasks | models.
// 4.5rem widths are the worst-case fit for 3-digit counts at text-caption.
export const TASKSET_LIST_GRID =
  "grid grid-cols-[minmax(0,3fr)_4.5rem_4.5rem_4.5rem] lg:grid-cols-[minmax(0,3fr)_minmax(0,4fr)_4.5rem_4.5rem_4.5rem]";

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
      className={cn(
        TASKSET_LIST_GRID,
        "group items-center gap-6 rounded-lg border border-border bg-panel px-4 py-3 transition-colors duration-fast hover:border-border-strong hover:bg-hover",
      )}
    >
      {/* Identity track — lock sits inline after the name so it visually hugs
          the taskset name regardless of name length (no reserved slot). */}
      <div className="flex min-w-0 items-center gap-2">
        <span className="inline-flex size-6 shrink-0 items-center justify-center rounded bg-secondary text-muted-foreground">
          <ListChecks aria-hidden="true" className="size-3.5" />
        </span>
        <span className="flex min-w-0 items-baseline gap-1.5 font-mono text-body">
          <span className="truncate text-muted-foreground">
            {taskset.ownerName}
          </span>
          <span aria-hidden="true" className="text-muted-foreground">
            /
          </span>
          <span className="truncate font-semibold text-foreground">
            {taskset.name}
          </span>
        </span>
        {tab === "team" && isPrivate && <VisibilityIcon visibility="private" />}
      </div>

      {/* Leaderboard track — lg only */}
      <div className="hidden min-w-0 items-center gap-2 lg:flex">
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
                "shrink-0 font-mono text-caption tabular-nums",
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

      {/* Star track — fixed-width cell stabilizes the icon's x-position across
          rows. The count digit width varies inside StarCount, which is fine
          because nothing right of it depends on the count's right edge. */}
      <div className="flex items-center justify-start">
        <StarCount
          count={starCount}
          pressed={isStarred}
          onPressedChange={onToggleStar}
          label={taskset.name}
          size="sm"
          className={cn(
            "tabular-nums",
            tab === "team" && "text-meta-foreground",
          )}
        />
      </div>

      {/* Tasks track */}
      <span
        aria-label={`${taskset.taskCount} tasks`}
        className="flex items-center justify-end gap-1 text-caption tabular-nums text-muted-foreground"
      >
        <ClipboardList aria-hidden="true" className="size-3.5" />
        <span>{taskset.taskCount}</span>
      </span>

      {/* Models track */}
      <span
        aria-label={`${taskset.modelCount} models`}
        className="flex items-center justify-end gap-1 text-caption tabular-nums text-muted-foreground"
      >
        <Bot aria-hidden="true" className="size-3.5" />
        <span>{taskset.modelCount}</span>
      </span>
    </Link>
  );
}
