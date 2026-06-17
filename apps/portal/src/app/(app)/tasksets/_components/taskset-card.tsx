import Link from "next/link";
import { Bot, ClipboardList, ListChecks } from "lucide-react";
import { StarCount } from "@repo/ui/components/star-count";
import { VisibilityIcon } from "@repo/ui/components/visibility-icon";
import { cn } from "@repo/ui/lib/cn";
import type { Taskset } from "@/lib/mock/tasksets";
import LeaderboardPreview from "./leaderboard-preview";

interface TasksetCardProps {
  taskset: Taskset;
  isStarred: boolean;
  starCount: number;
  onToggleStar: () => void;
  /**
   * Which tab the card is rendered under. Drives the tab-conditional footer
   * (wireframe §4.1): Public surfaces community star prominence; My Team
   * surfaces owner prominence + visibility pill and demotes the star.
   *
   * Per task brief: for this pass we omit a separate footer star and instead
   * differentiate header-star prominence by tab (Public = primary tone, My
   * Team = muted). Keeps the wireframe's intent without doubling the control.
   */
  tab: "public" | "team";
}

export default function TasksetCard({
  taskset,
  isStarred,
  starCount,
  onToggleStar,
  tab,
}: TasksetCardProps) {
  const isPrivate = taskset.visibility === "private";
  return (
    <Link
      href={`/tasksets/${taskset.id}`}
      className="group flex h-full flex-col gap-3 rounded-lg border border-border bg-panel p-4 transition-colors duration-fast hover:border-border-strong hover:bg-hover-surface"
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex size-6 shrink-0 items-center justify-center rounded bg-muted-surface text-muted-foreground">
          <ListChecks aria-hidden="true" className="size-3.5" />
        </span>
        <span className="flex min-w-0 items-baseline gap-0.5 font-mono text-body">
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
        <StarCount
          count={starCount}
          pressed={isStarred}
          onPressedChange={onToggleStar}
          label={taskset.name}
          size="sm"
          className={cn("ml-auto", tab === "team" && "text-meta-foreground")}
        />
      </div>

      <div className="flex-1">
        <LeaderboardPreview rows={taskset.leaderboard} />
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border pt-3 font-mono text-meta text-meta-foreground">
        <span className="inline-flex items-center gap-1 tabular-nums">
          <ClipboardList aria-hidden="true" className="size-3.5" />
          <span>{taskset.taskCount}</span>
          <span>tasks</span>
        </span>
        <span className="inline-flex items-center gap-1 tabular-nums">
          <Bot aria-hidden="true" className="size-3.5" />
          <span>{taskset.modelCount}</span>
          <span>models</span>
        </span>
      </div>
    </Link>
  );
}
